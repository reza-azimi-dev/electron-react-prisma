import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const { PrismaClient } = require('@prisma/client');

export type Channels = 'ipc-example';

const dbPath = ipcRenderer.sendSync('config:get-prisma-db-path');
const qePath = ipcRenderer.sendSync('config:get-prisma-qe-path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
  // see https://github.com/prisma/prisma/discussions/5200
  __internal: {
    engine: {
      binaryPath: qePath,
    },
  },
});

contextBridge.exposeInMainWorld('electron', {
  prisma: () => prisma,
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});
