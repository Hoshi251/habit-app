'use client'

type DayData = {
  label: string   // "月" など
  date: string    // "MM/DD"
  rate: number    // 0〜100
  isToday: boolean
}

type Props = {
  data: DayData[]
}

export default function WeeklyBarChart({ data }: Props) {
  const BAR_WIDTH = 32
  const MAX_HEIGHT = 120
  const GAP = 12
  const WIDTH = data.length * (BAR_WIDTH + GAP) - GAP
  const HEIGHT = MAX_HEIGHT + 48

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full overflow-visible"
      style={{ maxHeight: 180 }}
    >
      {data.map((d, i) => {
        const x = i * (BAR_WIDTH + GAP)
        const barH = Math.max(4, (d.rate / 100) * MAX_HEIGHT)
        const barY = MAX_HEIGHT - barH

        const color =
          d.rate === 0 ? '#e5e7eb'
          : d.rate === 100 ? '#22c55e'
          : d.rate >= 50 ? '#6366f1'
          : '#a5b4fc'

        return (
          <g key={d.date}>
            {/* バー背景 */}
            <rect
              x={x}
              y={0}
              width={BAR_WIDTH}
              height={MAX_HEIGHT}
              rx={8}
              fill="#f3f4f6"
            />
            {/* バー本体 */}
            <rect
              x={x}
              y={barY}
              width={BAR_WIDTH}
              height={barH}
              rx={8}
              fill={color}
              opacity={d.isToday ? 1 : 0.85}
            />
            {/* 今日のインジケーター */}
            {d.isToday && (
              <circle cx={x + BAR_WIDTH / 2} cy={MAX_HEIGHT + 8} r={3} fill="#6366f1" />
            )}
            {/* 達成率テキスト（0%以外） */}
            {d.rate > 0 && (
              <text
                x={x + BAR_WIDTH / 2}
                y={barY - 5}
                textAnchor="middle"
                fontSize={9}
                fill={color}
                fontWeight="600"
              >
                {d.rate}%
              </text>
            )}
            {/* 曜日ラベル */}
            <text
              x={x + BAR_WIDTH / 2}
              y={MAX_HEIGHT + 22}
              textAnchor="middle"
              fontSize={11}
              fill={d.isToday ? '#6366f1' : '#9ca3af'}
              fontWeight={d.isToday ? '700' : '400'}
            >
              {d.label}
            </text>
            {/* 日付ラベル */}
            <text
              x={x + BAR_WIDTH / 2}
              y={MAX_HEIGHT + 36}
              textAnchor="middle"
              fontSize={9}
              fill="#d1d5db"
            >
              {d.date}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
