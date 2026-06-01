import { spawn } from 'child_process'
import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

export interface WindowRect {
  x: number
  y: number
  w: number
  h: number
  name: string
}

// CFArrayRef requires explicit binding to return 'id' so JXA treats it as NSArray
const JXA = `
ObjC.import('CoreGraphics');
ObjC.import('Foundation');
ObjC.bindFunction('CGWindowListCopyWindowInfo', ['id', ['unsigned int', 'unsigned int']]);
var wins = $.CGWindowListCopyWindowInfo(1 | 16, 0);
if (!wins || typeof wins.count === 'undefined') {
  JSON.stringify([]);
} else {
  var r = [];
  for (var i = 0; i < wins.count; i++) {
    var w = wins.objectAtIndex(i);
    var layer = ObjC.unwrap(w.objectForKey('kCGWindowLayer'));
    if (layer !== 0) continue;
    var b = w.objectForKey('kCGWindowBounds');
    var bw = ObjC.unwrap(b.objectForKey('Width')) || 0;
    var bh = ObjC.unwrap(b.objectForKey('Height')) || 0;
    if (bw < 50 || bh < 50) continue;
    var name = ObjC.unwrap(w.objectForKey('kCGWindowOwnerName')) || '';
    r.push({ x: ObjC.unwrap(b.objectForKey('X')) || 0, y: ObjC.unwrap(b.objectForKey('Y')) || 0, w: bw, h: bh, name: name });
  }
  JSON.stringify(r);
}
`

let _jxaFile: string | null = null

function getJxaFile(): string {
  if (_jxaFile && existsSync(_jxaFile)) return _jxaFile
  const p = join(tmpdir(), `snapshot-winlist-${process.pid}.js`)
  writeFileSync(p, JXA)
  _jxaFile = p
  return p
}

export function listVisibleWindowsAsync(): Promise<WindowRect[]> {
  return new Promise((resolve) => {
    if (process.platform !== 'darwin') { resolve([]); return }
    let done = false
    const finish = (result: WindowRect[]): void => {
      if (done) return
      done = true
      resolve(result)
    }

    try {
      const file = getJxaFile()
      const proc = spawn('osascript', ['-l', 'JavaScript', file])
      let stdout = ''
      let stderr = ''
      proc.stdout.on('data', (d: Buffer) => { stdout += d.toString() })
      proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
      proc.on('close', (code) => {
        console.log('[window-list] osascript exit:', code, 'stdout:', stdout.slice(0, 200), 'stderr:', stderr.slice(0, 200))
        try {
          if (code === 0 && stdout.trim()) {
            const raw: WindowRect[] = JSON.parse(stdout.trim())
            finish(raw.filter(w => !!w.name && w.name !== 'Electron' && w.w > 50 && w.h > 50))
          } else {
            finish([])
          }
        } catch {
          finish([])
        }
      })
      proc.on('error', (err) => {
        console.log('[window-list] spawn error:', err.message)
        finish([])
      })
    } catch (err) {
      console.log('[window-list] setup error:', err)
      finish([])
    }

    // 4s safety timeout
    setTimeout(() => finish([]), 4000)
  })
}
