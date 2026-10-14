import { stances, type Configuration, type View } from './manifest';

export type StudioPack = {
  root: string;
  fixedAppearance?: boolean;
  paintScene?: boolean;
  /** This pack includes an aligned mask below the lower body molding. */
  rockerPaint?: boolean;
  solidOnly?: boolean;
  /** Precisely traced missing body paint, in this pack's source coordinates. */
  paintMaskExtension?: string;
  /** Additional cab coverage in source coordinates, bounded by the body paint mask. */
  cabMaskExtension?: string;
  /** Extra center-band coverage, clipped to painted metal at each ride height. */
  centerBandMaskExtension?: {
    path: string;
    stanceOffsets: Record<string, number>;
  };
  /** Static details drawn above paint, clipped by trusted SVG shapes in pack coordinates. */
  detailOverlay?: {
    file: string;
    clipPath: string;
    offset: [number, number];
    size: [number, number];
    saturation?: number;
    /** Keep base-scene details from covering a selected replacement wheel scene. */
    baseSceneOnly?: boolean;
  };
  stanceRoots?: Record<string, string>;
  openTopStanceRoots?: Record<string, string>;
  wheelScenes?: Record<string, Record<string, string>>;
  openTopWheelScenes?: Record<string, Record<string, string>>;
  /** Clean rim faces projected into a view without resampling tires or bodywork. */
  wheelFaceOverlays?: Record<string, {
    stance: string;
    source: string;
    faces: {
      /** Center and radii of the metal rim in the source scene. */
      source: [number, number, number, number];
      /** Center and radii of the metal rim in this camera view. */
      target: [number, number, number, number];
      rotation?: number;
    }[];
  }>;
  openTopRoot?: string;
  width: number;
  height: number;
  viewport: [number, number, number, number];
  shadow: { cx: number; cy: number; rx: number; ry: number };
  stanceScale?: number;
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
  view: View,
  ariaLabel: string,
): string {
  const { width, height } = pack;
  const openTop = c.roof === 'Top off' && Boolean(pack.openTopRoot);
  const root = openTop
    ? pack.openTopStanceRoots?.[c.stance] ?? pack.openTopRoot!
    : pack.stanceRoots?.[c.stance] ?? pack.root;
  const wheelScenes = openTop ? pack.openTopWheelScenes : pack.wheelScenes;
  const wheelScene = wheelScenes?.[c.wheelId]?.[c.stance];
  const faceOverlay = !openTop && pack.wheelFaceOverlays?.[c.wheelId];
  const projectedFaces = faceOverlay && faceOverlay.stance === c.stance ? faceOverlay : undefined;
  const wheelFaces = projectedFaces
    ? `<g data-layer="wheel-faces">${projectedFaces.faces.map((face, index) => {
      const [sx, sy, srX, srY] = face.source;
      const [x, y, rx, ry] = face.target;
      const id = `${prefix}-wheel-face-${index}`;
      return `<g transform="translate(${x} ${y}) rotate(${face.rotation ?? 0}) scale(${rx} ${ry})"><defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><circle r="1"/></clipPath></defs><g clip-path="url(#${id})"><svg x="-1" y="-1" width="2" height="2" viewBox="${sx - srX} ${sy - srY} ${srX * 2} ${srY * 2}" preserveAspectRatio="none"><image href="${projectedFaces.source}" width="${width}" height="${height}"/></svg></g></g>`;
    }).join('')}</g>`
    : '';
  const overlay = pack.detailOverlay?.baseSceneOnly && wheelScene ? undefined : pack.detailOverlay;
  const detailTone = overlay?.saturation === undefined ? ''
    : `<filter id="${prefix}-detail-tone" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="${overlay.saturation}"/></filter>`;
  const detailOverlay = overlay
    ? `<g data-layer="detail-overlay"><defs><clipPath id="${prefix}-detail-clip" clipPathUnits="userSpaceOnUse">${overlay.clipPath}</clipPath>${detailTone}</defs><image href="${overlay.file}" x="${overlay.offset[0]}" y="${overlay.offset[1]}" width="${overlay.size[0]}" height="${overlay.size[1]}" clip-path="url(#${prefix}-detail-clip)"${detailTone ? ` filter="url(#${prefix}-detail-tone)"` : ''}/></g>`
    : '';
  if (pack.paintScene) {
    // Start with the aligned stock scene so an old, oversized rim cannot show
    // around the new face. The projection is clipped to the metal rim only.
    const scene = projectedFaces ? `${root}/studio.png` : wheelScene ?? `${root}/studio.png`;
    const rocker = c.paintMode === 'Two-tone' && c.twoToneStyle === 'Rocker' && pack.rockerPaint;
    const masks = ['paint', 'center-band', 'cab', 'roof', ...(rocker ? ['rocker'] : [])];
    const roofColor = pack.openTopRoot
      ? c.roof === 'Body-color top' ? c.color : c.roof === 'Black top' ? '#171717' : '#e5e7e7'
      : c.roofColor;
    const roofTint = pack.openTopRoot ? c.roof !== 'Top off' : c.contrastRoof;
    const maskDefinitions = masks.map((name) => {
      const extension = roofTint && pack.cabMaskExtension && (name === 'cab' || name === 'roof')
        ? `<path d="${pack.cabMaskExtension}" fill="white" mask="url(#${prefix}-paint-mask)"/>`
        : '';
      const paintExtension = name === 'paint' && pack.paintMaskExtension
        ? `<path d="${pack.paintMaskExtension}" fill="white"/>`
        : '';
      const band = pack.centerBandMaskExtension;
      const bandOffset = band?.stanceOffsets[c.stance];
      const bandExtension = name === 'center-band' && band && bandOffset !== undefined
        ? `<g mask="url(#${prefix}-paint-mask)"><path d="${band.path}" transform="translate(0 ${bandOffset})" fill="white"/></g>`
        : '';
      return `<mask id="${prefix}-${name}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:alpha"><image href="${root}/${name}-mask.png" width="${width}" height="${height}"/>${paintExtension}${extension}${bandExtension}</mask>`;
    }).join('');
    const tint = (name: string, color: string) => {
      const channels = [1, 3, 5].map(
        (i) => Number.parseInt(color.slice(i, i + 2), 16) / 255,
      );
      const filter = `<filter id="${prefix}-${name}-tint" color-interpolation-filters="sRGB"><feComponentTransfer>${channels.map((n, i) => `<feFunc${['R', 'G', 'B'][i]} type="table" tableValues="0 ${n / 3} ${(n * 2) / 3} ${n} ${c.finish === 'Gloss' ? 1 : n + (1 - n) * 0.45}"/>`).join('')}</feComponentTransfer></filter>`;
      return `${filter}<g mask="url(#${prefix}-${name}-mask)"><use href="#${prefix}-texture" filter="url(#${prefix}-${name}-tint)"/></g>`;
    };
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${pack.viewport.join(' ')}" role="img" aria-label="${ariaLabel} customizable studio artwork"><defs><image id="${prefix}-texture" href="${root}/paint-texture.png" width="${width}" height="${height}"/>${maskDefinitions}</defs><image data-layer="reference-artwork" href="${scene}" width="${width}" height="${height}"/>${wheelFaces}<g data-layer="paint-mask">${tint('paint', c.color)}${c.paintMode === 'Two-tone' ? tint(rocker ? 'rocker' : 'center-band', c.secondaryColor) : ''}</g><g data-layer="roof">${roofTint ? tint(!pack.openTopRoot && c.cabPaint === 'Roof and pillars' ? 'cab' : 'roof', roofColor) : ''}</g>${detailOverlay}</svg>`;
  }
  if (pack.fixedAppearance) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${pack.viewport.join(' ')}" role="img" aria-label="${ariaLabel} red and white reference artwork"><image data-layer="reference-artwork" href="${root}/studio.png" width="${width}" height="${height}"/>${detailOverlay}</svg>`;
  }
  const body = `${root}/body.png`;
  const offset =
    (stances.find((s) => s.id === c.stance)?.offset || 0) *
    (pack.stanceScale ?? width / 800);
  const frontTrim = view === 'rear-quarter' ? c.trim.tailgate : c.trim.grille;
  const image = (file: string, extra = '') =>
    `<image href="${file}" width="${width}" height="${height}" ${extra}/>`;
  const filter = (id: string, color: string) => {
    const channels = [1, 3, 5].map(
      (i) => Number.parseInt(color.slice(i, i + 2), 16) / 255,
    );
    return `<filter id="${prefix}-${id}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${channels.map((n, i) => `<feFunc${['R', 'G', 'B'][i]} type="table" tableValues="0 ${(n * 0.23).toFixed(4)} ${(n * 0.63).toFixed(4)} ${n.toFixed(4)} ${Math.min(1, n + (c.finish === 'Gloss' ? 0.34 : 0.13)).toFixed(4)}"/>`).join('')}</feComponentTransfer></filter>`;
  };
  const masks = [
    'paint',
    'secondary',
    'roof',
    'grille',
    'bumper',
    'center-band',
    'cab',
  ];
  const tint = (name: string, color: string) =>
    `${filter(name, color)}<g mask="url(#${prefix}-${name}-mask)"><use href="#${prefix}-source" filter="url(#${prefix}-${name})"/></g>`;
  const trimColor = (value: string) =>
    value === 'Body color' ? c.color : '#24272c';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${pack.viewport.join(' ')}" role="img" aria-label="${ariaLabel} studio artwork study"><defs>
    ${image(body, `id="${prefix}-source"`)}
    <radialGradient id="${prefix}-studio"><stop stop-color="#3b424c"/><stop offset="1" stop-color="#14181e"/></radialGradient>
    ${masks.map((name) => `<mask id="${prefix}-${name}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:alpha">${image(`${root}/${name}-mask.png`)}</mask>`).join('')}
    </defs><rect x="${pack.viewport[0]}" y="${pack.viewport[1]}" width="${pack.viewport[2]}" height="${pack.viewport[3]}" fill="url(#${prefix}-studio)"/>
    <ellipse cx="${pack.shadow.cx}" cy="${pack.shadow.cy}" rx="${pack.shadow.rx}" ry="${pack.shadow.ry}" fill="#000" opacity=".38"/>
    <g data-layer="tires-and-wheels">${pack.wheels.map((w) => `<image href="${root}/${w.file}" x="${w.x - w.width / 2}" y="${w.y - w.height / 2}" width="${w.width}" height="${w.height}"/>`).join('')}</g>
    <g transform="translate(0 ${offset})"><g data-layer="vehicle-body"><use href="#${prefix}-source"/></g>
    <g data-layer="paint-mask">${tint('paint', c.color)}${c.paintMode === 'Two-tone' ? tint(c.twoToneStyle === 'Center band' ? 'center-band' : 'secondary', c.secondaryColor) : ''}</g>
    <g data-layer="roof">${c.contrastRoof ? tint(c.cabPaint === 'Roof and pillars' ? 'cab' : 'roof', c.roofColor) : ''}</g>
    <g data-layer="trim">${frontTrim === 'Black' || frontTrim === 'Body color' ? tint('grille', trimColor(frontTrim)) : ''}${c.trim.bumper === 'Black' || c.trim.bumper === 'Body color' ? tint('bumper', trimColor(c.trim.bumper)) : ''}</g></g>${detailOverlay}</svg>`;
}
