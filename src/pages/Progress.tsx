import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { WORKOUT_PROGRAM } from '../data/program'
import { getProgressData } from '../lib/supabase'
import { tg, getTelegramUserId } from '../lib/tg'

interface Props {
  onBack: () => void
}

const ALL_EXERCISES = WORKOUT_PROGRAM.flatMap((d) =>
  d.exercises.filter((e) => !e.isWarmup).map((e) => ({ ...e, dayTitle: d.title })),
)

export function Progress({ onBack }: Props) {
  const userId = getTelegramUserId()
  const [selectedExerciseId, setSelectedExerciseId] = useState(ALL_EXERCISES[0]?.id ?? '')
  const [chartData, setChartData] = useState<{ date: string; maxWeight: number; totalVolume: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [metric, setMetric] = useState<'maxWeight' | 'totalVolume'>('maxWeight')

  useEffect(() => {
    tg?.BackButton.show()
    tg?.BackButton.onClick(onBack)
    return () => {
      tg?.BackButton.hide()
      tg?.BackButton.offClick(onBack)
    }
  }, [onBack])

  useEffect(() => {
    if (!selectedExerciseId || !userId) return
    setLoading(true)
    getProgressData(userId, selectedExerciseId)
      .then(setChartData)
      .finally(() => setLoading(false))
  }, [selectedExerciseId, userId])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  const hasData = chartData.length > 0

  return (
    <div style={{ padding: '16px', maxWidth: 480, margin: '0 auto', paddingBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 12 }}>
        {!tg && (
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 0, color: 'var(--tg-theme-button-color, #2481cc)' }}
          >
            ←
          </button>
        )}
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Прогресс</h2>
      </div>

      {/* Exercise selector */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--tg-theme-hint-color, #999)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
          Упражнение
        </p>
        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 12,
            border: '1.5px solid var(--tg-theme-secondary-bg-color, #e0e0e0)',
            background: 'var(--tg-theme-secondary-bg-color, #f8f8f8)',
            color: 'var(--tg-theme-text-color, #000)',
            fontSize: 15, fontWeight: 500, outline: 'none', appearance: 'none',
          }}
        >
          {WORKOUT_PROGRAM.map((day) => (
            <optgroup key={day.number} label={day.title}>
              {day.exercises.filter((e) => !e.isWarmup).map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Metric toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['maxWeight', 'totalVolume'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14,
              background: metric === m ? 'var(--tg-theme-button-color, #2481cc)' : 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
              color: metric === m ? 'var(--tg-theme-button-text-color, #fff)' : 'var(--tg-theme-text-color, #000)',
            }}
          >
            {m === 'maxWeight' ? '⚖️ Макс. вес' : '📦 Объём'}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{
        background: 'var(--tg-theme-secondary-bg-color, #f8f8f8)',
        borderRadius: 16, padding: '16px 8px 8px',
        minHeight: 220,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {loading && <p style={{ color: 'var(--tg-theme-hint-color, #999)', fontSize: 14 }}>Загрузка...</p>}
        {!loading && !hasData && (
          <p style={{ color: 'var(--tg-theme-hint-color, #999)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
            Нет данных по этому упражнению.{'\n'}Проведи тренировку, чтобы увидеть прогресс!
          </p>
        )}
        {!loading && hasData && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--tg-theme-hint-color, #e0e0e0)" opacity={0.4} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: 'var(--tg-theme-hint-color, #999)' }}
              />
              <YAxis tick={{ fontSize: 11, fill: 'var(--tg-theme-hint-color, #999)' }} />
              <Tooltip
                formatter={(value: number) =>
                  metric === 'maxWeight' ? [`${value} кг`, 'Макс. вес'] : [`${value} кг×повт`, 'Объём']
                }
                labelFormatter={formatDate}
                contentStyle={{
                  borderRadius: 10,
                  background: 'var(--tg-theme-bg-color, #fff)',
                  border: '1px solid var(--tg-theme-secondary-bg-color, #e0e0e0)',
                  fontSize: 13,
                }}
              />
              <Line
                type="monotone"
                dataKey={metric}
                stroke="var(--tg-theme-button-color, #2481cc)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--tg-theme-button-color, #2481cc)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats summary */}
      {hasData && (
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <StatCard
            label="Сессий"
            value={String(chartData.length)}
          />
          <StatCard
            label="Макс. вес"
            value={`${Math.max(...chartData.map((d) => d.maxWeight))} кг`}
          />
          <StatCard
            label="Рост"
            value={chartData.length > 1
              ? `+${(chartData[chartData.length - 1].maxWeight - chartData[0].maxWeight).toFixed(1)} кг`
              : '—'}
          />
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      flex: 1, padding: '12px', borderRadius: 12,
      background: 'var(--tg-theme-secondary-bg-color, #f8f8f8)',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--tg-theme-text-color, #000)' }}>{value}</p>
      <p style={{ fontSize: 11, color: 'var(--tg-theme-hint-color, #999)', marginTop: 2 }}>{label}</p>
    </div>
  )
}
