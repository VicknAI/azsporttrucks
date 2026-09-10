import {
  geometry,
  normalize,
  stances,
  vehicles,
  viewLabels,
  wheelCatalog,
  type Configuration,
  type View,
} from './manifest';
import { renderStudio } from './studio';
export function escapeHtml(value: unknown) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
}
// Deliberately schematic artwork, not model-year-accurate vehicle imagery.
// All rendering comes from normalized configuration and the per-view manifest.
export function renderSvg(
  input: Configuration,
  view: View,
  uid = 'truck',
): string {
  const c = normalize(input),
    v = vehicles.find((v) => v.id === c.vehicleId)!,
    g = geometry[view],
    a = v.views[view];
  const prefix = uid.replace(/[^a-z0-9-]/gi, '');
  if (a.studio)
    return renderStudio(
      c,
      a.studio,
      prefix,
      view,
      escapeHtml(`${v.label} ${viewLabels[view]}`),
    );
  const offset = stances.find((s) => s.id === c.stance)!.offset;
  const wheel = wheelCatalog.find((w) => w.id === c.wheelId)!;
  const isFront = view === 'front',
    rear = view === 'rear-quarter',
    k5 = v.model === 'K5';
  const finish = (value: string) =>
    value === 'Chrome'
      ? '#c4cbd0'
      : value === 'Body color'
        ? c.color
        : '#25282b';
  const layer = (name: string, markup: string) =>
    `<g data-layer="${name}">${markup}</g>`;
  const asset = (src: string | null, fallback: string) =>
    src
      ? `<image href="${escapeHtml(src)}" width="800" height="460"/>`
      : fallback;
  const radius =
    c.tire === 'Mud-terrain'
      ? 54
      : c.tire === 'All-terrain'
        ? 50
        : c.tire === 'Drag radial/pro-touring'
          ? 47
          : 44;
  const tires = a.anchors
    .map(
      (anchor) =>
        `<g transform="translate(${anchor.x} ${anchor.y}) rotate(${anchor.rotation}) scale(${isFront ? 0.6 : anchor.scale} ${anchor.scale})"${anchor.mask ? ` mask="url(#${escapeHtml(anchor.mask)})"` : ''}><circle r="${radius}" fill="#111318" stroke="#555b63" stroke-width="3"/><circle r="${radius - 5}" fill="none" stroke="#717780" stroke-width="3" stroke-dasharray="${c.tire === 'Mud-terrain' ? '7 6' : c.tire === 'All-terrain' ? '3 4' : '0'}"/>${wheel.assetPack[view] ? `<image href="${escapeHtml(wheel.assetPack[view])}" x="-31" y="-31" width="62" height="62"/>` : `<circle r="30" fill="${wheel.id === 'street-temp' ? '#b9c1c8' : '#444d59'}" stroke="#cdd4d9" stroke-width="3"/><circle r="24" fill="#242b33"/>${Array.from({ length: wheel.spokes }, (_, n) => `<path d="M-4 -5 L-7 -26 L7 -26 L4 -5Z" fill="${wheel.id === 'street-temp' ? '#d9dfe3' : '#747e89'}" transform="rotate(${(n * 360) / wheel.spokes})"/>`).join('')}<circle r="7" fill="#151a20" stroke="#dce1e5"/>`}</g>`,
    )
    .join('');
  const roofColor = k5
    ? c.roof === 'White top'
      ? '#e8eaeb'
      : c.roof === 'Black top'
        ? '#181c22'
        : c.color
    : c.contrastRoof
      ? c.roofColor
      : c.color;
  const roofFront =
    k5 && isFront
      ? c.roof === 'Top off'
        ? `<path d="M283 182V151H517V182" fill="none" stroke="#141414" stroke-width="7"/><path d="M299 176V160H335V176 M466 176V160H502V176" fill="url(#${prefix}-seat-fabric)" stroke="#d5d5d2" stroke-width="3"/>`
        : `<path d="M255 142 L266 126 L528 126 L540 142Z" fill="${roofColor}" stroke="#151c24" stroke-width="3"/>`
      : '';
  const roof =
    k5 && !isFront
      ? c.roof === 'Top off'
        ? `<path d="M119 218 L267 218" stroke="#b9c2cb" stroke-width="8"/><path d="M133 213V160H211L255 213" fill="none" stroke="#141414" stroke-width="7"/><path d="M145 214 L145 181 L174 181 L181 214 M208 214 L208 181 L240 181 L248 214" fill="url(#${prefix}-seat-fabric)" stroke="#d5d5d2" stroke-width="4"/>`
        : `<path d="M116 220 L129 145 L300 140 L285 222Z" fill="${roofColor}" stroke="#151c24" stroke-width="4"/><path d="M146 163 L266 160 L255 204 L138 204Z" fill="#405767"/>`
      : roofFront;
  const wheelCutouts = a.anchors
    .map(
      (p) =>
        `<circle cx="${p.x}" cy="${p.y - offset}" r="${radius + 8}" fill="black"/>`,
    )
    .join('');
  const fullCab = !k5 && c.contrastRoof && c.cabPaint === 'Roof and pillars';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" role="img" aria-label="${escapeHtml(v.label)} ${view} schematic prototype"><defs><linearGradient id="${prefix}-gloss" x2="0" y2="1"><stop stop-color="white" stop-opacity="${c.finish === 'Gloss' ? '.38' : '.12'}"/><stop offset=".5" stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="black" stop-opacity=".3"/></linearGradient><clipPath id="${prefix}-body"><path d="${g.body}"/><path d="${g.cab}"/></clipPath><mask id="${prefix}-arches"><rect width="800" height="460" fill="white"/>${wheelCutouts}</mask></defs>
 ${layer('background', asset(a.background, '<rect width="800" height="460" fill="#171d25"/><path d="M35 375H765 M100 390H700" stroke="#3a414b" stroke-width="1"/>'))}
 ${layer('shadows', '<ellipse cx="402" cy="376" rx="300" ry="16" fill="#03060b" opacity=".6"/>')}
 ${layer('tires-and-wheels', tires)}
 <g transform="translate(0 ${offset})">${layer('vehicle-body', asset(a.body, `<g mask="url(#${prefix}-arches)"><path d="${g.body}" fill="${c.color}" stroke="#101722" stroke-width="4"/><path d="${g.cab}" fill="${c.color}" stroke="#101722" stroke-width="4"/></g>`))}
 ${layer('paint-mask', a.paintMask ? `<mask id="${prefix}-paint"><image href="${escapeHtml(a.paintMask)}" width="800" height="460"/></mask><rect width="800" height="460" fill="${c.color}" mask="url(#${prefix}-paint)"/>` : `<g clip-path="url(#${prefix}-body)" mask="url(#${prefix}-arches)">${c.paintMode === 'Two-tone' ? `<rect y="${c.twoToneStyle === 'Center band' ? 250 : 290}" width="800" height="${c.twoToneStyle === 'Center band' ? 40 : 45}" fill="${c.secondaryColor}"/>` : ''}<rect width="800" height="460" fill="url(#${prefix}-gloss)"/></g>`)}
 ${fullCab ? `<path d="${g.cab}" fill="${roofColor}"/>` : ''}
 ${layer('glass', `<path d="${g.glass}" fill="#415b70" stroke="#1b2735" stroke-width="5"/><path d="M345 158 L357 202" stroke="#b1c6d5" stroke-width="3" opacity=".4"/>`)}
 ${k5 ? `<defs><pattern id="${prefix}-seat-fabric" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#777"/><path d="M0 2H8 M2 0V8" stroke="#171717" stroke-width="3"/></pattern><clipPath id="${prefix}-interior-glass"><path d="${g.glass}"/></clipPath></defs><g data-layer="interior" clip-path="url(#${prefix}-interior-glass)"><path d="M285 211V177H536V214" fill="none" stroke="#161616" stroke-width="7"/><path d="M317 220V186H351V220 M462 220V186H496V220" fill="url(#${prefix}-seat-fabric)" stroke="#d5d5d2" stroke-width="5"/><path d="M245 215H570" stroke="#141414" stroke-width="12"/></g>` : ''}
 ${layer('roof', asset(k5 && c.roof === 'Top off' ? a.topOffInterior : a.roof, roof + (!k5 && c.contrastRoof && !fullCab ? `<path d="${g.cab}" fill="${roofColor}" clip-path="inset(0 0 65% 0)"/>` : '')))}
 ${layer('front-end', asset(a.frontEnd, `${(rear ? c.trim.tailgate : c.trim.grille) !== 'Removed' ? `<path d="${g.front}" fill="${rear ? finish(c.trim.tailgate) : finish(c.trim.grille)}" stroke="#19232e" stroke-width="3"/>` : ''}${!rear ? `<path d="${g.front}" fill="none" stroke="#6e7780" stroke-width="1"/>${isFront ? '<rect x="236" y="270" width="44" height="27" rx="10" fill="#fff1c9"/><rect x="518" y="270" width="44" height="27" rx="10" fill="#fff1c9"/>' : view === 'side' ? '<rect x="685" y="263" width="12" height="19" fill="#fff1c9"/>' : '<rect x="603" y="266" width="23" height="23" rx="8" fill="#fff1c9"/><rect x="693" y="278" width="23" height="23" rx="8" fill="#fff1c9"/>'}` : ''}`))}
 ${layer('trim', asset(a.trim, `${c.trim.sideMolding !== 'Removed' && !isFront ? `<path d="M112 279 L570 292" stroke="${finish(c.trim.sideMolding)}" stroke-width="5"/>` : ''}${c.trim.badges !== 'Removed' ? '<rect x="475" y="254" width="20" height="8" fill="#d1d7de"/>' : ''}${rear && c.trim.tailgate !== 'Removed' ? `<path d="M95 283 L196 271" stroke="${finish(c.trim.tailgate)}" stroke-width="9"/>` : ''}${c.trim.bumper !== 'Removed' ? `<path d="${isFront ? 'M204 324H595' : rear ? 'M77 318L215 338' : 'M597 327L734 316'}" stroke="${finish(c.trim.bumper)}" stroke-width="10"/>` : ''}`))}</g>
 ${layer('foreground-mask', asset(a.foregroundMask, ''))}<text x="34" y="422" fill="#929dab" font-family="Arial,sans-serif" font-size="13">SCHEMATIC PLACEHOLDER • NOT YEAR-ACCURATE • NOT TO SCALE</text></svg>`;
}
