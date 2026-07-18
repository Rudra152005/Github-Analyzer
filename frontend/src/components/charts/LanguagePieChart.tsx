import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { LanguageStats } from '../../types';

interface LanguagePieChartProps {
  data: LanguageStats[];
}

export default function LanguagePieChart({ data }: LanguagePieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="percentage"
          nameKey="language"
          stroke="none"
        >
          {data.map((entry) => (
            <Cell
              key={entry.language}
              fill={entry.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as LanguageStats;
              return (
                <div className="bg-light-surface dark:bg-dark-card-elevated border border-light-border dark:border-dark-border rounded-lg p-3 shadow-soft">
                  <p className="font-medium text-text-primary dark:text-white">{data.language}</p>
                  <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                    {data.percentage}% • {data.repos} repos
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          verticalAlign="middle"
          align="right"
          layout="vertical"
          formatter={(value) => (
            <span className="text-sm text-text-secondary dark:text-text-dark-secondary">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
