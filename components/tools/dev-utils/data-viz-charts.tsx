'use client';

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

interface DataVizChartsProps {
  data: Record<string, unknown>[];
  chartType: ChartType;
  effectiveX: string;
  effectiveY: string;
  numericColumns: string[];
}

export function DataVizCharts({ data, chartType, effectiveX, effectiveY, numericColumns }: DataVizChartsProps) {
  switch (chartType) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={effectiveX} className="text-xs" />
            <YAxis className="text-xs" />
            <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend />
            {numericColumns.filter((k) => k !== effectiveX).map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={effectiveX} className="text-xs" />
            <YAxis className="text-xs" />
            <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend />
            {numericColumns.filter((k) => k !== effectiveX).map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    case 'area':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={effectiveX} className="text-xs" />
            <YAxis className="text-xs" />
            <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend />
            {numericColumns.filter((k) => k !== effectiveX).map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.2} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              dataKey={effectiveY}
              nameKey={effectiveX}
              cx="50%"
              cy="50%"
              outerRadius={140}
              label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''}: ${value ?? ''}`}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    case 'scatter':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={effectiveX} name={effectiveX} className="text-xs" />
            <YAxis dataKey={effectiveY} name={effectiveY} className="text-xs" />
            <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data} fill={COLORS[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );
  }
}
