/** Inline only local designer assets so a downloaded sheet works offline. */
export async function embedArtwork(
  svg: string,
  load: (path: string) => Promise<string>,
): Promise<string> {
  const paths = [
    ...new Set(
      [...svg.matchAll(/href="(\/designer\/[a-zA-Z0-9_./-]+)"/g)].map(
        (match) => match[1],
      ),
    ),
  ];
  let embedded = svg;
  for (const path of paths) {
    if (path.split('/').includes('..'))
      throw new Error('Invalid artwork path.');
    const uri = await load(path);
    if (!/^data:image\/(png|webp|jpeg);base64,[a-zA-Z0-9+/=]+$/.test(uri))
      throw new Error('Invalid artwork image.');
    embedded = embedded.replaceAll(`href="${path}"`, `href="${uri}"`);
  }
  return embedded;
}
