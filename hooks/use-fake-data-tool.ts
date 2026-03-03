'use client';

import { useCallback, useState } from 'react';

import {
  createRandomFieldId,
  DEFAULT_FIELDS,
  type FieldSchema,
  generateFakeData,
} from '@/lib/dev-utils/fake-data';

interface UseFakeDataToolResult {
  addField: () => void;
  fields: FieldSchema[];
  generate: () => void;
  output: string;
  outputFormat: 'json' | 'csv';
  recordCount: number;
  removeField: (id: string) => void;
  setOutputFormat: (value: 'json' | 'csv') => void;
  setRecordCount: (value: number) => void;
  updateField: (id: string, updates: Partial<FieldSchema>) => void;
}

export function useFakeDataTool(): UseFakeDataToolResult {
  const [fields, setFields] = useState<FieldSchema[]>(() => [...DEFAULT_FIELDS]);
  const [recordCount, setRecordCountState] = useState(10);
  const [outputFormat, setOutputFormat] = useState<'json' | 'csv'>('json');
  const [output, setOutput] = useState('');

  const addField = useCallback(() => {
    setFields((previous) => [
      ...previous,
      {
        id: createRandomFieldId(),
        name: `field_${previous.length + 1}`,
        type: 'First Name',
      },
    ]);
  }, []);

  const removeField = useCallback((id: string) => {
    setFields((previous) => previous.filter((field) => field.id !== id));
  }, []);

  const updateField = useCallback((id: string, updates: Partial<FieldSchema>) => {
    setFields((previous) =>
      previous.map((field) => (field.id === id ? { ...field, ...updates } : field)),
    );
  }, []);

  const setRecordCount = useCallback((value: number) => {
    setRecordCountState(Math.min(1000, Math.max(1, value || 1)));
  }, []);

  const generate = useCallback(() => {
    setOutput(generateFakeData(fields, recordCount, outputFormat));
  }, [fields, outputFormat, recordCount]);

  return {
    addField,
    fields,
    generate,
    output,
    outputFormat,
    recordCount,
    removeField,
    setOutputFormat,
    setRecordCount,
    updateField,
  };
}
