# Changelog — Snapshot Studio

## 2026-06-01

### Changed files
- `package.json`
- `src/main/index.ts`
- `src/main/window-list.ts` *(new)*
- `src/preload/index.ts`
- `src/renderer/editor/Editor.tsx`
- `src/renderer/overlay/Overlay.tsx`
- `src/renderer/overlay/overlay.css`
- `src/shared/types.ts`

---

### EN

**1. Auto-close editor after copy (`⌘C` / Copy button)**
After copying the screenshot to clipboard the editor window now closes automatically. Previously required a separate `Esc` press.

**2. Resize handles on selection**
After dragging a region the selection stays visible with 8 handles (4 corners + 4 edges). Drag any handle to resize that edge. Drag the selection body to move it. Confirm with `Enter` or double-click; `Esc` clears the selection back to crosshair mode.

**3. Window detection on hover**
When the overlay opens it starts detecting on-screen windows in the background via `osascript` / JXA (CoreGraphics `CGWindowListCopyWindowInfo`). While hovering in idle mode a blue frame highlights the window under the cursor with its app name. A single click snaps the selection to that window's bounds (then enters adjustable mode with handles).

**4. Fix: app wouldn't start (`ELECTRON_RUN_AS_NODE`)**
The env variable `ELECTRON_RUN_AS_NODE=1` was set in the shell, causing Electron to run as plain Node.js and making `require('electron').app` return `undefined`. Fixed by prepending `env -u ELECTRON_RUN_AS_NODE` to all npm scripts (`dev`, `build`, `start`).

---

### RU

**1. Автозакрытие редактора после копирования (`⌘C` / кнопка Copy)**
После копирования скриншота в буфер обмена окно редактора закрывается автоматически. Раньше требовалось дополнительное нажатие `Esc`.

**2. Ручки изменения размера выделения**
После выделения региона рамка остаётся с 8 ручками (4 угла + 4 грани). Тяни за ручку — меняется соответствующий край. Тяни за тело рамки — перемещает всю рамку. Подтверждение: `Enter` или двойной клик; `Esc` сбрасывает выделение в режим crosshair.

**3. Определение окон при наведении**
При открытии overlay в фоне запускается определение окон через `osascript` / JXA (CoreGraphics `CGWindowListCopyWindowInfo`). В режиме ожидания при наведении курсора синяя рамка подсвечивает окно под курсором и показывает его название. Клик снэпает рамку выделения к границам этого окна (после чего входит в режим корректировки с ручками).

**4. Исправление: приложение не запускалось (`ELECTRON_RUN_AS_NODE`)**
В окружении была установлена переменная `ELECTRON_RUN_AS_NODE=1`, из-за которой Electron запускался как обычный Node.js и `require('electron').app` возвращал `undefined`. Исправлено добавлением `env -u ELECTRON_RUN_AS_NODE` во все npm-скрипты (`dev`, `build`, `start`).
