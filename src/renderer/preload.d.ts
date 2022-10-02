import { PrismaClient } from '@prisma/client';
import { Channels } from 'main/preload';

declare global {
  interface Window {
    electron: {
      prisma: PrismaClient;
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: Channels,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: Channels, func: (...args: unknown[]) => void): void;
      };
    };
  }
}

export {};
