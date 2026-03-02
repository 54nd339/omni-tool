'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Link2, Link2Off, Users, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import type { CollabSession } from '@/lib/collab/provider';

interface CollabButtonProps {
  onSession: (session: CollabSession | null) => void;
}

export function CollabButton({ onSession }: CollabButtonProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<CollabSession | null>(null);
  const [peerCount, setPeerCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const initializingRef = useRef<string | null>(null);

  const startSession = useCallback(async (roomId?: string) => {
    try {
      const { createCollabSession, generateRoomId } = await import('@/lib/collab/provider');
      const id = roomId || generateRoomId();

      // Guard against double initialization
      if (initializingRef.current === id && session) return;

      const newSession = createCollabSession(id);
      setSession(newSession);
      onSession(newSession);
      setConnected(true);
      toast.success(roomId ? 'Joined collaborative session' : 'Started collaborative session');
    } catch (err) {
      toast.error('Failed to start collaborative session');
      console.error(err);
      initializingRef.current = null;
    }
  }, [onSession, session]);

  const stopSession = useCallback(() => {
    if (session) {
      session.destroy();
      setSession(null);
      onSession(null);
      setConnected(false);
      setPeerCount(0);
      initializingRef.current = null;

      // Remove collab param from URL to prevent auto-rejoin
      const params = new URLSearchParams(searchParams.toString());
      params.delete('collab');
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });

      toast.info('Left collaborative session');
    }
  }, [session, onSession, searchParams, router, pathname]);

  useEffect(() => {
    const collabParam = searchParams.get('collab');
    if (collabParam && !session && initializingRef.current !== collabParam) {
      initializingRef.current = collabParam;
      startSession(collabParam);
    }
  }, [searchParams, session, startSession]);

  useEffect(() => {
    return () => {
      if (session) {
        session.destroy();
      }
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;
    intervalRef.current = setInterval(async () => {
      try {
        const { getPeerCount, isConnected } = await import('@/lib/collab/provider');
        setPeerCount(getPeerCount(session.provider));
        setConnected(isConnected(session.provider));
      } catch { /* ignore */ }
    }, 2000);
    return () => clearInterval(intervalRef.current);
  }, [session]);

  const copyShareLink = useCallback(async () => {
    if (!session) return;
    const url = new URL(window.location.href);
    url.searchParams.set('collab', session.roomId);
    try {
      await navigator.clipboard.writeText(url.toString());
      setLinkCopied(true);
      toast.success('Share link copied');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  }, [session]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={session ? 'outline' : 'ghost'}
          size="sm"
          className="gap-1.5"
          aria-label={session ? 'Manage collaborative session' : 'Start collaborative session'}
        >
          {session ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${connected ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'}`} />
              </span>
              <Users className="h-3.5 w-3.5" />
              {peerCount > 0 && <span className="text-xs">{peerCount}</span>}
            </>
          ) : (
            <>
              <Link2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Share</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        {session ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium">Collaborative Session</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {connected ? (
                  <span className="text-green-600 dark:text-green-400">Connected</span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400">Connecting...</span>
                )}
                {' · '}{peerCount} {peerCount === 1 ? 'peer' : 'peers'}
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                value={session.roomId}
                readOnly
                className="text-xs font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyShareLink}
                aria-label="Copy share link"
              >
                {linkCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={stopSession}
            >
              <Link2Off className="mr-1.5 h-3.5 w-3.5" />
              Leave Session
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium">Real-time Collaboration</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Share a live session with others via peer-to-peer connection.
              </p>
            </div>
            <Button
              className="w-full"
              size="sm"
              onClick={() => startSession()}
            >
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Start Session
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
