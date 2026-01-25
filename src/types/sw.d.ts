// Service Worker Event Types
declare global {
  interface SyncEvent extends ExtendableEvent {
    tag: string;
  }

  interface ServiceWorkerGlobalScope {
    addEventListener(type: 'sync', listener: (event: SyncEvent) => void): void;
  }
}

export {};
