import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { type ChartType, DATA_VIZ_COLORS } from '@/lib/dev-utils/data-viz';
const TOOLTIP_CONTENT_STYLE = { borderRadius: 8, fontSize: 12 } as const;
const SCATTER_CURSOR_STYLE = { strokeDasharray: '3 3' } as const;

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
            <RTooltip contentStyle={TOOLTIP_CONTENT_STYLE} />
            <Legend />
            {numericColumns.filter((k) => k !== effectiveX).map((key, i) => (
              <Bar key={key} dataKey={key} fill={DATA_VIZ_COLORS[i % DATA_VIZ_COLORS.length]} radius={[4, 4, 0, 0]} />
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
            <RTooltip contentStyle={TOOLTIP_CONTENT_STYLE} />
            <Legend />
            {numericColumns.filter((k) => k !== effectiveX).map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={DATA_VIZ_COLORS[i % DATA_VIZ_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
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
            <RTooltip contentStyle={TOOLTIP_CONTENT_STYLE} />
            <Legend />
            {numericColumns.filter((k) => k !== effectiveX).map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={DATA_VIZ_COLORS[i % DATA_VIZ_COLORS.length]} fill={DATA_VIZ_COLORS[i % DATA_VIZ_COLORS.length]} fillOpacity={0.2} />
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
                <Cell key={i} fill={DATA_VIZ_COLORS[i % DATA_VIZ_COLORS.length]} />
              ))}
            </Pie>
            <RTooltip contentStyle={TOOLTIP_CONTENT_STYLE} />
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
            <RTooltip contentStyle={TOOLTIP_CONTENT_STYLE} cursor={SCATTER_CURSOR_STYLE} />
            <Scatter data={data} fill={DATA_VIZ_COLORS[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );
  }
}
