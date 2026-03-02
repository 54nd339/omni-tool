import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

export interface CollabSession {
  doc: Y.Doc;
  provider: WebrtcProvider;
  roomId: string;
  destroy: () => void;
}

const SIGNALING_SERVERS = [
  'wss://signaling.yjs.dev',
  'wss://y-webrtc-signaling-eu.herokuapp.com',
  'wss://y-webrtc-signaling-us.herokuapp.com',
  // 'ws://localhost:4444', // Uncomment this if you run a local signaling server
];

export function generateRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'omni-';
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const activeSessions = new Map<string, CollabSession>();

export function createCollabSession(roomId: string): CollabSession {
  const existing = activeSessions.get(roomId);
  if (existing) return existing;

  const doc = new Y.Doc();
  const provider = new WebrtcProvider(roomId, doc, {
    signaling: SIGNALING_SERVERS,
  });

  const session: CollabSession = {
    doc,
    provider,
    roomId,
    destroy: () => {
      provider.destroy();
      doc.destroy();
      activeSessions.delete(roomId);
    },
  };

  activeSessions.set(roomId, session);
  return session;
}

export function getPeerCount(provider: WebrtcProvider): number {
  try {
    // y-webrtc tracks connected peers via its awareness protocol
    const awareness = provider.awareness;
    return awareness.getStates().size - 1; // subtract self
  } catch {
    return 0;
  }
}

export function isConnected(provider: WebrtcProvider): boolean {
  return provider.connected;
}
