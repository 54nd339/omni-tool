'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CopyButton } from '@/components/shared/copy-button';
import { cn } from '@/lib/utils';

const FIELD_TYPES = [
  'First Name',
  'Last Name',
  'Full Name',
  'Email',
  'Phone',
  'Address',
  'City',
  'Country',
  'Company',
  'Job Title',
  'UUID',
  'Date',
  'Boolean',
  'Integer',
  'Float',
  'URL',
  'IP Address',
  'Hex Color',
  'Sentence',
  'Paragraph',
] as const;

type FieldType = (typeof FIELD_TYPES)[number];

interface FieldSchema {
  id: string;
  name: string;
  type: FieldType;
  min?: number;
  max?: number;
}

function randomId(): string {
  return crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  const val = Math.random() * (max - min) + min;
  return Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

const FIRST_NAMES = [
  'James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Isabella',
  'Elijah', 'Mia', 'Lucas', 'Charlotte', 'Mason', 'Amelia', 'Ethan', 'Harper',
  'Alexander', 'Evelyn', 'Henry', 'Abigail', 'Sebastian', 'Emily', 'Jack', 'Elizabeth',
  'Aiden', 'Sofia', 'Owen', 'Avery', 'Samuel', 'Ella',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young',
];

const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
  'London', 'Paris', 'Tokyo', 'Berlin', 'Sydney', 'Toronto', 'Mumbai', 'Singapore',
  'Amsterdam', 'Seoul', 'Madrid', 'Boston', 'Seattle', 'Denver', 'Miami',
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Japan', 'India', 'Brazil', 'Italy', 'Spain', 'Mexico', 'South Korea', 'Netherlands',
  'Sweden', 'Switzerland', 'Ireland', 'Singapore', 'New Zealand', 'Norway',
  'Poland', 'Belgium', 'Austria', 'Portugal', 'Argentina', 'South Africa',
];

const COMPANIES = [
  'Acme Corp', 'TechNova', 'Global Solutions', 'DataFlow Inc', 'CloudSync',
  'NexGen Systems', 'Bright Future', 'Summit Industries', 'Prime Analytics',
  'Vertex Labs', 'Quantum Dynamics', 'Fusion Tech', 'Horizon Ventures',
  'Apex Software', 'Pinnacle Group', 'Catalyst Systems', 'Momentum Inc',
  'Elevate Labs', 'Synergy Corp', 'Atlas Industries', 'Pulse Networks',
  'Zenith Group', 'Nexus Solutions', 'Pioneer Tech',
];

const JOB_TITLES = [
  'Software Engineer', 'Product Manager', 'Data Analyst', 'UX Designer', 'DevOps Engineer',
  'Frontend Developer', 'Backend Developer', 'Project Manager', 'Data Scientist',
  'Marketing Manager', 'Sales Representative', 'HR Specialist', 'Accountant',
  'Business Analyst', 'Quality Assurance', 'Systems Administrator', 'Technical Lead',
  'Scrum Master', 'Solutions Architect', 'Operations Manager', 'Content Writer',
  'Customer Success', 'Research Scientist', 'Consultant',
];

const WORDS = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'hello', 'world',
  'data', 'flow', 'stream', 'cloud', 'system', 'service', 'platform', 'product',
  'design', 'build', 'deploy', 'test', 'integrate', 'scale', 'optimize', 'manage',
];

const EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'mail.org', 'example.io',
  'tech.net', 'business.co', 'startup.dev', 'corp.xyz',
];

function generateValue(
  type: FieldType,
  min?: number,
  max?: number,
  firstName?: string,
  lastName?: string,
): string | number | boolean {
  switch (type) {
    case 'First Name':
      return pickRandom(FIRST_NAMES);
    case 'Last Name':
      return pickRandom(LAST_NAMES);
    case 'Full Name':
      return `${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`;
    case 'Email': {
      const first = pickRandom(FIRST_NAMES).toLowerCase();
      const last = pickRandom(LAST_NAMES).toLowerCase();
      const sep = Math.random() > 0.5 ? '.' : '_';
      const domain = pickRandom(EMAIL_DOMAINS);
      return `${first}${sep}${last}@${domain}`;
    }
    case 'Phone':
      return `+1-${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
    case 'Address':
      return `${randomInt(1, 9999)} ${pickRandom(WORDS)} ${pickRandom(['St', 'Ave', 'Blvd', 'Rd', 'Ln'])}`;
    case 'City':
      return pickRandom(CITIES);
    case 'Country':
      return pickRandom(COUNTRIES);
    case 'Company':
      return pickRandom(COMPANIES);
    case 'Job Title':
      return pickRandom(JOB_TITLES);
    case 'UUID':
      return crypto.randomUUID();
    case 'Date': {
      const year = randomInt(2020, 2025);
      const month = String(randomInt(1, 12)).padStart(2, '0');
      const day = String(randomInt(1, 28)).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    case 'Boolean':
      return Math.random() > 0.5;
    case 'Integer': {
      const lo = min ?? 0;
      const hi = max ?? 100;
      return randomInt(Math.min(lo, hi), Math.max(lo, hi));
    }
    case 'Float': {
      const lo = min ?? 0;
      const hi = max ?? 100;
      return randomFloat(Math.min(lo, hi), Math.max(lo, hi));
    }
    case 'URL':
      return `https://${pickRandom(WORDS)}.${pickRandom(['com', 'io', 'net', 'org'])}/${pickRandom(WORDS)}`;
    case 'IP Address':
      return `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 255)}`;
    case 'Hex Color': {
      const bytes = crypto.getRandomValues(new Uint8Array(3));
      return `#${Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
    }
    case 'Sentence': {
      const len = randomInt(5, 15);
      const words = Array.from({ length: len }, () => pickRandom(WORDS));
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      return words.join(' ') + '.';
    }
    case 'Paragraph': {
      const count = randomInt(3, 6);
      const sentences: string[] = [];
      for (let i = 0; i < count; i++) {
        const len = randomInt(5, 12);
        const words = Array.from({ length: len }, () => pickRandom(WORDS));
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        sentences.push(words.join(' ') + '.');
      }
      return sentences.join(' ');
    }
    default:
      return '';
  }
}

const DEFAULT_FIELDS: FieldSchema[] = [
  { id: '1', name: 'id', type: 'Integer', min: 1, max: 1000 },
  { id: '2', name: 'full_name', type: 'Full Name' },
  { id: '3', name: 'email', type: 'Email' },
];

export function FakeDataTool() {
  const [fields, setFields] = useState<FieldSchema[]>(DEFAULT_FIELDS);
  const [recordCount, setRecordCount] = useState(10);
  const [outputFormat, setOutputFormat] = useState<'json' | 'csv'>('json');
  const [output, setOutput] = useState('');

  const addField = useCallback(() => {
    setFields((prev) => [
      ...prev,
      { id: randomId(), name: `field_${prev.length + 1}`, type: 'First Name' },
    ]);
  }, []);

  const removeField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateField = useCallback(
    (id: string, updates: Partial<FieldSchema>) => {
      setFields((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      );
    },
    [],
  );

  const generate = useCallback(() => {
    const count = Math.min(1000, Math.max(1, recordCount));
    const rows: Record<string, string | number | boolean>[] = [];

    for (let i = 0; i < count; i++) {
      const row: Record<string, string | number | boolean> = {};
      let firstName = '';
      let lastName = '';

      for (const field of fields) {
        let val: string | number | boolean;
        if (field.type === 'Email' && (firstName || lastName)) {
          const first = firstName || pickRandom(FIRST_NAMES);
          const last = lastName || pickRandom(LAST_NAMES);
          const sep = Math.random() > 0.5 ? '.' : '_';
          val = `${(first as string).toLowerCase()}${sep}${(last as string).toLowerCase()}@${pickRandom(EMAIL_DOMAINS)}`;
        } else {
          val = generateValue(
            field.type,
            field.min,
            field.max,
            firstName || undefined,
            lastName || undefined,
          );
        }
        if (field.type === 'First Name') firstName = String(val);
        if (field.type === 'Last Name') lastName = String(val);
        if (field.type === 'Full Name') {
          const parts = String(val).split(' ');
          firstName = parts[0] ?? '';
          lastName = parts[1] ?? '';
        }
        row[field.name || `field_${field.id}`] = val;
      }
      rows.push(row);
    }

    if (outputFormat === 'json') {
      setOutput(JSON.stringify(rows, null, 2));
    } else {
      const headers = Object.keys(rows[0] ?? {});
      const lines = [
        headers.join(','),
        ...rows.map((r) =>
          headers
            .map((h) => {
              const v = r[h];
              if (typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n'))) {
                return `"${String(v).replace(/"/g, '""')}"`;
              }
              return String(v);
            })
            .join(','),
        ),
      ];
      setOutput(lines.join('\n'));
    }
  }, [fields, recordCount, outputFormat]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Schema Settings</p>
            <Button variant="outline" size="sm" onClick={addField}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add field
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-muted/20 p-3"
              >
                <div className="min-w-[140px] flex-1">
                  <label className="mb-1 block text-xs text-muted-foreground">Name</label>
                  <Input
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                    placeholder="field_name"
                    className="h-9"
                  />
                </div>
                <div className="min-w-[160px] flex-1">
                  <label className="mb-1 block text-xs text-muted-foreground">Type</label>
                  <Select
                    value={field.type}
                    onValueChange={(v) => updateField(field.id, { type: v as FieldType })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(field.type === 'Integer' || field.type === 'Float') && (
                  <>
                    <div className="w-20">
                      <label className="mb-1 block text-xs text-muted-foreground">Min</label>
                      <Input
                        type="number"
                        value={field.min ?? ''}
                        onChange={(e) =>
                          updateField(field.id, {
                            min: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                        placeholder="0"
                        className="h-9"
                      />
                    </div>
                    <div className="w-20">
                      <label className="mb-1 block text-xs text-muted-foreground">Max</label>
                      <Input
                        type="number"
                        value={field.max ?? ''}
                        onChange={(e) =>
                          updateField(field.id, {
                            max: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                        placeholder="100"
                        className="h-9"
                      />
                    </div>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-9 w-9 shrink-0', fields.length <= 1 && 'invisible')}
                  onClick={() => removeField(field.id)}
                  aria-label="Remove field"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-6 rounded-lg border border-border bg-muted/10 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Records (1–1000)
            </label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={recordCount}
              onChange={(e) => setRecordCount(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))}
              className="h-9 w-24"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Format</label>
            <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as 'json' | 'csv')}>
              <SelectTrigger className="h-9 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} className="flex-1">Generate</Button>
        </div>
      </div>

      <div className="space-y-2 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Output Data</p>
          {output && <CopyButton value={output} size="sm" />}
        </div>
        <div className="relative flex-1 rounded-md border border-border mt-2 min-h-[300px]">
          {output ? (
            <Textarea
              readOnly
              value={output}
              className="absolute inset-0 h-full w-full resize-none border-0 font-mono text-sm focus-visible:ring-0"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground italic bg-muted/10">
              Click Generate to construct data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
