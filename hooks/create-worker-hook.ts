'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Comlink from 'comlink';
import type { ProcessingStatus } from '@/types';
import { getErrorMessage } from '@/lib/utils';

interface WorkerHookInit<TApi> {
  api: Comlink.Remote<TApi>;
  setProgress: (value: number) => void;
}

interface WorkerPoolEntry<TApi> {
  worker: Worker;
  api: Comlink.Remote<TApi>;
  refCount: number;
  initPromise: Promise<void> | null;
}

const workerPool = new Map<string, WorkerPoolEntry<unknown>>();

interface WorkerHookOptions<TApi> {
  workerKey: string;
  workerFactory: () => Worker;
  onInit?: (ctx: WorkerHookInit<TApi>) => Promise<void>;
  errorFallback: string;
}

function acquireWorker<TApi>(
  key: string,
  factory: () => Worker,
  onInit?: (ctx: WorkerHookInit<TApi>) => Promise<void>,
  setProgress?: (value: number) => void,
): Promise<{ worker: Worker; api: Comlink.Remote<TApi> }> {
  const existing = workerPool.get(key) as WorkerPoolEntry<TApi> | undefined;

  if (existing) {
    existing.refCount++;
    if (existing.initPromise) {
      return existing.initPromise.then(() => ({
        worker: existing.worker,
        api: existing.api,
      }));
    }
    return Promise.resolve({ worker: existing.worker, api: existing.api });
  }

  const worker = factory();
  const api = Comlink.wrap<TApi>(worker);

  const initPromise = onInit
    ? onInit({ api, setProgress: setProgress ?? (() => {}) })
    : null;

  const entry: WorkerPoolEntry<TApi> = {
    worker,
    api,
    refCount: 1,
    initPromise,
  };
  workerPool.set(key, entry as WorkerPoolEntry<unknown>);

  worker.addEventListener('error', () => {
    workerPool.delete(key);
    worker.terminate();
  });

  const resultPromise = initPromise
    ? initPromise.then(() => {
        entry.initPromise = null;
        return { worker, api };
      })
    : Promise.resolve({ worker, api });

  return resultPromise;
}

function releaseWorker(key: string): void {
  const entry = workerPool.get(key);
  if (!entry) return;
  entry.refCount--;
  if (entry.refCount <= 0) {
    workerPool.delete(key);
    entry.worker.terminate();
  }
}

export function createWorkerHook<TApi>(options: WorkerHookOptions<TApi>) {
  const { workerKey } = options;

  return function useWorker() {
    const workerRef = useRef<Worker | null>(null);
    const apiRef = useRef<Comlink.Remote<TApi> | null>(null);
    const hasAcquiredRef = useRef(false);
    const [status, setStatus] = useState<ProcessingStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      return () => {
        if (hasAcquiredRef.current) {
          releaseWorker(workerKey);
          hasAcquiredRef.current = false;
          workerRef.current = null;
          apiRef.current = null;
        }
      };
    // workerKey is a static option, not a reactive dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getApi = useCallback(async () => {
      if (apiRef.current) return apiRef.current;

      const { worker, api } = await acquireWorker<TApi>(
        workerKey,
        options.workerFactory,
        options.onInit,
        setProgress,
      );

      if (!hasAcquiredRef.current) {
        hasAcquiredRef.current = true;
      }
      workerRef.current = worker;
      apiRef.current = api;
      return api;
    // workerKey is a static option
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const run = useCallback(
      async <T>(fn: (api: Comlink.Remote<TApi>) => Promise<T>): Promise<T> => {
        setStatus('loading');
        setProgress(0);
        setError(null);

        try {
          const api = await getApi();
          setStatus('processing');
          const result = await fn(api);
          setStatus('done');
          return result;
        } catch (err) {
          setError(getErrorMessage(err, options.errorFallback));
          setStatus('error');
          throw err;
        }
      },
      [getApi],
    );

    const terminate = useCallback(() => {
      if (hasAcquiredRef.current) {
        releaseWorker(workerKey);
        hasAcquiredRef.current = false;
      }
      workerRef.current = null;
      apiRef.current = null;
      setStatus('idle');
      setProgress(0);
      setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { run, terminate, status, progress, error, setProgress, getApi };
  };
}
