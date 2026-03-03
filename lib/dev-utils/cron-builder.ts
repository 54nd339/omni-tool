export interface CronPreset {
  label: string;
  value: string;
}

export const CRON_PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Daily at 9 AM', value: '0 9 * * *' },
  { label: 'Weekly (Mon 9 AM)', value: '0 9 * * 1' },
  { label: 'Monthly (1st, midnight)', value: '0 0 1 * *' },
  { label: 'Yearly (Jan 1, midnight)', value: '0 0 1 1 *' },
] as const satisfies readonly CronPreset[];

export async function describeCron(expression: string): Promise<string | null> {
  try {
    const cronstrueModule = await import('cronstrue');
    return cronstrueModule.default.toString(expression, { verbose: true });
  } catch {
    return null;
  }
}

export async function getNextCronRuns(
  expression: string,
  count = 10,
): Promise<string[] | null> {
  try {
    const cronParserModule = await import('cron-parser');
    const { CronExpressionParser } = cronParserModule;
    const interval = CronExpressionParser.parse(expression);
    const runs: string[] = [];

    for (let index = 0; index < count; index++) {
      runs.push(interval.next().toDate().toLocaleString());
    }

    return runs;
  } catch {
    return null;
  }
}