import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ContributionsChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  xAxisKey?: string;
  color?: string;
}

export default function ContributionsChart({
  data,
  dataKey,
  xAxisKey = 'name',
  color = '#58C46B'
}: ContributionsChartProps) {
  // Filter out empty growth objects
  const hasData = data && data.length > 0 && data.some(d => d[dataKey] > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[250px] bg-light-surface-secondary dark:bg-dark-card rounded-lg border border-dashed border-light-border dark:border-dark-border p-4">
        <TrendingUp className="w-8 h-8 text-text-muted mb-2 animate-pulse" />
        <span className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">Not enough history yet</span>
        <span className="text-xs text-text-muted mt-1">Check back later once more data is indexed</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
        <defs>
          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0.0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A313C" opacity={0.15} />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: '#8A949E', fontSize: 11 }}
          axisLine={{ stroke: '#2A313C', opacity: 0.5 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#8A949E', fontSize: 11 }}
          axisLine={{ stroke: '#2A313C', opacity: 0.5 }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E2530',
            border: '1px solid #2F3847',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          }}
          labelStyle={{ color: '#8A949E', fontSize: 11, fontWeight: 500 }}
          itemStyle={{ color, fontSize: 12, fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorGrowth)"
          activeDot={{ r: 5, strokeWidth: 0, fill: color }}
          isAnimationActive={true}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
