import { type Configuration, views } from './manifest';
import { renderSvg } from './render';
import { embedArtwork } from './export';

/** Freeze the customer's current four views as image-only private uploads. */
export async function quotePreviews(configuration: Configuration) {
  const cache = new Map<string, Promise<string>>();
  const load = (path: string) => {
    if (!cache.has(path))
      cache.set(
        path,
        (async () => {
          const response = await fetch(path, {
            signal: AbortSignal.timeout(20000),
          });
          if (!response.ok)
            throw new Error(
              'A build image could not be loaded. Please try again.',
            );
          const blob = await response.blob();
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () =>
              reject(new Error('A build image could not be read.'));
            reader.readAsDataURL(blob);
          });
        })(),
      );
    return cache.get(path)!;
  };
  const files: File[] = [];
  for (const view of views) {
    const svg = await embedArtwork(
      renderSvg(configuration, view, `quote-${view}`),
      load,
    );
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    try {
      const image = new Image(768, 512);
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          image.src = '';
          reject(
            new Error('A build view took too long to load. Please try again.'),
          );
        }, 20000);
        image.onload = () => {
          clearTimeout(timer);
          resolve();
        };
        image.onerror = () => {
          clearTimeout(timer);
          reject(new Error('A build view could not be prepared.'));
        };
        image.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = 768;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      if (!context)
        throw new Error('Your browser could not prepare the build views.');
      context.drawImage(image, 0, 0, 768, 512);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) =>
            b
              ? resolve(b)
              : reject(new Error('A build view could not be saved.')),
          'image/png',
        ),
      );
      if (blob.size > 1.5 * 1024 * 1024)
        throw new Error('A build view is too large. Please try again.');
      files.push(
        new File([blob], `preview-${view}.png`, { type: 'image/png' }),
      );
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return files;
}
