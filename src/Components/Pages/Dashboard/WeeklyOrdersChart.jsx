import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

function normalizeDateStr(dateStr = "") {
  
  const cleaned = String(dateStr).replace(/(\d{1,2})(st|nd|rd|th)/i, "$1")
  const parsed = new Date(cleaned)
  return isNaN(parsed.getTime()) ? null : parsed
}

function getWeekdayIndex(date, weekStart) {
  const d = date.getDay() // 
  if (weekStart === "mon") {
 
    return (d + 6) % 7
  }
 
  return d
}

function getDayLabels(weekStart) {
  const sunFirst = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  if (weekStart === "mon") {
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  }
  return sunFirst
}

  
function pickOrderDate(order) {
  return order?.created_at || ""
}


function parseTotal(total) {
  if (typeof total === "number") return total
  if (typeof total === "string") {
    const n = Number.parseFloat(total.replace(/[^\d.]/g, ""))
    return isNaN(n) ? 0 : n
  }
  return 0
}

function buildWeeklySeries(orders = [], weekStart = "sun") {
  const labels = getDayLabels(weekStart)
  const base = labels.map((day) => ({ day, orders: 0, revenue: 0 }))

  for (const order of orders) {
    const dStr = pickOrderDate(order)
    const d = normalizeDateStr(dStr)
    if (!d) continue

   
    const idx = getWeekdayIndex(d, weekStart)
    base[idx].orders += 1
   base[idx].revenue += parseTotal(order?.total_amount)
  }


  return base.map((row) => ({
    ...row,
    revenue: Math.round(row.revenue * 100) / 100,
  }))
}

export default function WeeklyOrdersChart({
  orders = [],
  height = 300,
  title = "Weekly Orders",
  weekStart = "sun",
  showRevenue = true,
}) {
  const data = buildWeeklySeries(orders, weekStart)

  return (
    <div className="weekly-chart-card" role="region" aria-label="Weekly orders chart">
      <div className="chart-header">
        <h3>{title}</h3>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-dot orders"></span> Orders
          </span>
          {showRevenue && (
            <span className="legend-item">
              <span className="legend-dot revenue"></span> Revenue
            </span>
          )}
        </div>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#4a5568", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="left"
              tick={{ fill: "#4a5568", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#4a5568", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            
            <Legend />
            <Bar yAxisId="left" dataKey="orders" name="Orders" barSize={26} radius={[6, 6, 0, 0]} fill="#28a745" />
            {showRevenue && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#38a169"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
