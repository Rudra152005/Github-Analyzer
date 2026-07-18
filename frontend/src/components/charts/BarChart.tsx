import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartComponentProps {
  data: Array<Record<string, any>>;
  dataKeys: string[];
  xAxisKey?: string;
  colors?: string[];
}

export default function BarChartComponent({
  data,
  dataKeys,
  xAxisKey = 'name',
  colors = ['#58C46B', '#8B949E', '#F0A63A']
}: BarChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A313C" opacity={0.3} />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: '#8A949E', fontSize: 12 }}
          axisLine={{ stroke: '#2A313C' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#8A949E', fontSize: 12 }}
          axisLine={{ stroke: '#2A313C' }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1B222C',
            border: '1px solid #2A313C',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          }}
          labelStyle={{ color: '#fff' }}
        />
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

interface HorizontalBarChartProps {
  data: Array<{ name: string; value: number }>;
  color?: string;
}

export function HorizontalBarChart({ data, color = '#58C46B' }: HorizontalBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={data.length * 36}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 80 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: '#8A949E', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1B222C',
            border: '1px solid #2A313C',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          }}
          labelStyle={{ color: '#fff' }}
        />
        <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
