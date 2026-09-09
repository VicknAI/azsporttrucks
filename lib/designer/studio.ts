import { stances, type Configuration } from './manifest';

export type StudioPack = {
  root: string;
  width: number;
  height: number;
  wheels: {
    file: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
};

/** Composite supplied raster artwork; geometry and masks belong to the asset pack. */
export function renderStudio(
  c: Configuration,
  pack: StudioPack,
  prefix: string,
): string {
  const { width, height, root } = pack;
  const body = `${root}/body.png`;
  const offset = (stances.find((s) => s.id === c.stance)?.offset || 0) * 2;
  const image = (file: string, extra = '') =>
    `<image href="${file}" width="${width}" height="${height}" ${extra}/>`;
  const filter = (id: string, color: string) => {
    const channels = [1, 3, 5].map(
      (i) => Number.parseInt(color.slice(i, i + 2), 16) / 255,
    );
    return `<filter id="${prefix}-${id}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${channels.map((n, i) => `<feFunc${['R', 'G', 'B'][i]} type="table" tableValues="0 ${(n * 0.23).toFixed(4)} ${(n * 0.63).toFixed(4)} ${n.toFixed(4)} ${Math.min(1, n + (c.finish === 'Gloss' ? 0.34 : 0.13)).toFixed(4)}"/>`).join('')}</feComponentTransfer></filter>`;
  };
  const masks = ['paint', 'secondary', 'roof', 'grille', 'bumper'];
  const tint = (name: string, color: string) =>
    `${filter(name, color)}<g mask="url(#${prefix}-${name}-mask)"><use href="#${prefix}-source" filter="url(#${prefix}-${name})"/></g>`;
  const trimColor = (value: string) =>
    value === 'Body color' ? c.color : '#24272c';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 90 ${width} 850" role="img" aria-label="1967 C10 studio artwork study, front three-quarter"><defs>
    ${image(body, `id="${prefix}-source"`)}
    <radialGradient id="${prefix}-studio"><stop stop-color="#3b424c"/><stop offset="1" stop-color="#14181e"/></radialGradient>
    ${masks.map((name) => `<mask id="${prefix}-${name}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:alpha">${image(`${root}/${name}-mask.png`)}</mask>`).join('')}
    </defs><rect width="${width}" height="${height}" fill="url(#${prefix}-studio)"/>
    <ellipse cx="790" cy="825" rx="650" ry="42" fill="#000" opacity=".38"/>
    <g data-layer="tires-and-wheels">${pack.wheels.map((w) => `<image href="${root}/${w.file}" x="${w.x - w.width / 2}" y="${w.y - w.height / 2}" width="${w.width}" height="${w.height}"/>`).join('')}</g>
    <g transform="translate(0 ${offset})"><g data-layer="vehicle-body"><use href="#${prefix}-source"/></g>
    <g data-layer="paint-mask">${tint('paint', c.color)}${c.paintMode === 'Two-tone' ? tint('secondary', c.secondaryColor) : ''}</g>
    <g data-layer="roof">${c.contrastRoof ? tint('roof', c.roofColor) : ''}</g>
    <g data-layer="trim">${c.trim.grille === 'Black' || c.trim.grille === 'Body color' ? tint('grille', trimColor(c.trim.grille)) : ''}${c.trim.bumper === 'Black' || c.trim.bumper === 'Body color' ? tint('bumper', trimColor(c.trim.bumper)) : ''}</g></g>
    <text x="50" y="904" fill="#c2c9d2" font-family="Arial,sans-serif" font-size="22">STUDIO STUDY · WHEEL STYLE AND SOME TRIM OPTIONS NOT YET PREVIEWED</text></svg>`;
}
