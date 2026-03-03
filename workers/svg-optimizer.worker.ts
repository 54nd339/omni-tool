import * as Comlink from 'comlink';

import { optimizeSvg } from '@/lib/image/svg-optimizer';

export interface SvgOptimizerWorkerApi {
  optimizeSvg: (input: string, precision: number) => Promise<{
    output: string;
    savedBytes: number;
  }>;
}

const api: SvgOptimizerWorkerApi = {
  optimizeSvg: (input, precision) => optimizeSvg({ input, precision }),
};

Comlink.expose(api);
