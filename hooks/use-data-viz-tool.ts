'use client';

import { type RefObject, useCallback, useMemo, useRef, useState } from 'react';

import { useToolParams } from '@/hooks/use-tool-params';
import {
  type ChartType,
  type DataVizRow,
  exportChartAsPng,
  exportChartAsSvg,
  getDataVizSample,
  inferDataVizColumns,
  parseDataVizInput,
} from '@/lib/dev-utils/data-viz';

const PARAM_DEFAULTS = {
  chartType: 'bar',
  xAxis: '',
  yAxis: '',
};

interface UseDataVizToolResult {
  allColumns: string[];
  chartRef: RefObject<HTMLDivElement | null>;
  chartType: ChartType;
  columns: {
    categorical: string[];
    numeric: string[];
  };
  data: DataVizRow[] | null;
  effectiveX: string;
  effectiveY: string;
  exportChart: (type: 'svg' | 'png') => Promise<void>;
  handleLoad: (sample: 'json' | 'csv') => void;
  input: string;
  setChartType: (value: ChartType) => void;
  setInput: (value: string) => void;
  setXAxis: (value: string) => void;
  setYAxis: (value: string) => void;
}

export function useDataVizTool(): UseDataVizToolResult {
  const [params, setParams] = useToolParams(PARAM_DEFAULTS);
  const [input, setInput] = useState('');
  const chartRef = useRef<HTMLDivElement>(null);

  const chartType: ChartType = ['bar', 'line', 'area', 'pie', 'scatter'].includes(params.chartType)
    ? (params.chartType as ChartType)
    : 'bar';
  const xAxis = params.xAxis;
  const yAxis = params.yAxis;

  const data = useMemo(() => parseDataVizInput(input), [input]);

  const columns = useMemo(() => {
    if (!data) return { numeric: [] as string[], categorical: [] as string[] };
    return inferDataVizColumns(data);
  }, [data]);

  const allColumns = useMemo(() => [...columns.categorical, ...columns.numeric], [columns]);

  const effectiveX = xAxis || allColumns[0] || '';
  const effectiveY = yAxis || columns.numeric[0] || '';

  const setChartType = useCallback(
    (value: ChartType) => {
      setParams({ chartType: value });
    },
    [setParams],
  );

  const setXAxis = useCallback(
    (value: string) => {
      setParams({ xAxis: value });
    },
    [setParams],
  );

  const setYAxis = useCallback(
    (value: string) => {
      setParams({ yAxis: value });
    },
    [setParams],
  );

  const handleLoad = useCallback((sample: 'json' | 'csv') => {
    setInput(getDataVizSample(sample));
  }, []);

  const exportChart = useCallback(async (type: 'svg' | 'png') => {
    const container = chartRef.current;
    if (!container) return;
    if (type === 'svg') {
      exportChartAsSvg(container);
      return;
    }

    await exportChartAsPng(container);
  }, []);

  return {
    allColumns,
    chartRef,
    chartType,
    columns,
    data,
    effectiveX,
    effectiveY,
    exportChart,
    handleLoad,
    input,
    setChartType,
    setInput,
    setXAxis,
    setYAxis,
  };
}
