import { normalize, type Configuration } from './manifest';
export const draftKey = 'azst-designer-draft-v1';
export function readDraft(): Configuration | null {
  const text = localStorage.getItem(draftKey);
  return text ? normalize(JSON.parse(text)) : null;
}
export function shareHash(c: Configuration) {
  return '#build=' + encodeURIComponent(JSON.stringify(c));
}
export function readShare(hash: string): Configuration | null {
  if (!hash.startsWith('#build=')) return null;
  if (hash.length > 10000) throw new Error('This build link is too long.');
  return normalize(JSON.parse(decodeURIComponent(hash.slice(7))));
}
export type MockLead = {
  buildNumber: string;
  createdAt: string;
  action: string;
  contact: Record<string, string>;
  configuration: Configuration;
  renderStates: { view: string; svg: string }[];
  photos: File[];
  mock: true;
};
export async function storeLead(lead: MockLead): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('azst-designer-prototype', 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore('leads', { keyPath: 'buildNumber' });
    request.onerror = () =>
      reject(new Error('Local storage is unavailable. No request was sent.'));
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('leads', 'readwrite');
      tx.objectStore('leads').put(lead);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(
          new Error(
            'Could not save locally. Free browser storage and try again.',
          ),
        );
      };
    };
  });
}
