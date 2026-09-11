import type { StudioPack } from './studio';
export const views = [
  'side',
  'front-quarter',
  'rear-quarter',
  'front',
] as const;
export type View = (typeof views)[number];
export const viewLabels: Record<View, string> = {
  side: 'Side profile',
  'front-quarter': 'Front three-quarter',
  'rear-quarter': 'Rear three-quarter',
  front: 'Straight front',
};
export type Direction = 'Lowered' | 'Lifted';
export const manufacturers = ['Chevrolet', 'Ford'] as const;
export const fordModels = ['F-100', 'F-150'] as const;
export const stances = [
  { id: 'stock', label: 'Stock', direction: 'Both', offset: 0 },
  { id: 'drop2', label: '2-inch drop', direction: 'Lowered', offset: 8 },
  { id: 'drop4', label: '4-inch drop', direction: 'Lowered', offset: 16 },
  { id: 'drop6', label: '6-inch drop', direction: 'Lowered', offset: 24 },
  { id: 'frame', label: 'Lay frame', direction: 'Lowered', offset: 40 },
  { id: 'lift3', label: '3-inch lift', direction: 'Lifted', offset: -20 },
  { id: 'lift6', label: '6-inch lift', direction: 'Lifted', offset: -38 },
];
export const trimFields = [
  'grille',
  'headlights',
  'sideMolding',
  'badges',
  'tailgate',
  'bumper',
] as const;
export type TrimField = (typeof trimFields)[number];
export const trimLabels: Record<TrimField, string> = {
  grille: 'Grille treatment',
  headlights: 'Headlights',
  sideMolding: 'Side molding',
  badges: 'Badges',
  tailgate: 'Tailgate trim',
  bumper: 'Bumper finish',
};
export const trimOptions = {
  grille: ['Chrome', 'Black', 'Body color', 'Removed'],
  headlights: ['Model-year placeholder'],
  sideMolding: ['Chrome', 'Black', 'Removed'],
  badges: ['Placeholder badge', 'Removed'],
  tailgate: ['Chrome', 'Body color', 'Removed'],
  bumper: ['Chrome', 'Black', 'Body color', 'Removed'],
};
export const baseTrim: Record<TrimField, string> = {
  grille: 'Chrome',
  headlights: 'Model-year placeholder',
  sideMolding: 'Chrome',
  badges: 'Removed',
  tailgate: 'Chrome',
  bumper: 'Chrome',
};
export const colors = [
  { name: 'Torch red', hex: '#bc252c' },
  { name: 'Graphite', hex: '#424b55' },
  { name: 'Glacier white', hex: '#e5e7e7' },
  { name: 'Deep blue', hex: '#205381' },
  { name: 'Copper', hex: '#aa6538' },
  { name: 'Forest', hex: '#3c6254' },
];
export const roofs = ['White top', 'Black top', 'Body-color top', 'Top off'];
export const tires = [
  'Street performance',
  'Drag radial/pro-touring',
  'All-terrain',
  'Mud-terrain',
];
export type TireProduct = {
  id: string;
  brand: string;
  model: string;
  sku: string;
  productUrl: string;
  size: string;
  imageAssets: Partial<Record<View, string>>;
  fitmentNotes: string;
};
export const tireCatalog = tires.map((category) => ({
  category,
  products: [] as TireProduct[],
}));
export type Anchor = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  mask: string | null;
};
export type ViewManifest = {
  studio?: StudioPack;
  assetRoot: string;
  background: string | null;
  body: string | null;
  paintMask: string | null;
  frontEnd: string | null;
  trim: string | null;
  roof: string | null;
  topOffInterior: string | null;
  foregroundMask: string | null;
  anchors: Anchor[];
};
export const geometry: Record<
  View,
  {
    body: string;
    cab: string;
    glass: string;
    front: string;
    bed: string;
    anchors: Anchor[];
  }
> = {
  side: {
    body: 'M100 275 L130 223 L290 223 L300 210 L463 210 L483 238 L680 245 L708 275 L708 321 L100 321 Z',
    cab: 'M285 226 L312 138 L441 138 L487 240 Z',
    glass: 'M305 214 L326 152 L430 152 L460 218 Z',
    front: 'M680 252 L708 271 L708 303 L681 303 Z',
    bed: 'M109 224 L284 224 L284 276 L109 276 Z',
    anchors: [
      { x: 205, y: 325, scale: 1, rotation: 0, mask: null },
      { x: 584, y: 325, scale: 1, rotation: 0, mask: null },
    ],
  },
  'front-quarter': {
    body: 'M85 276 L135 226 L281 216 L452 212 L483 226 L614 222 L737 266 L736 333 L574 350 L85 320 Z',
    cab: 'M267 223 L310 137 L414 125 L475 205 L493 240 Z',
    glass: 'M291 213 L321 151 L403 140 L445 207 Z',
    front: 'M596 252 L727 271 L726 319 L596 330 Z',
    bed: 'M103 229 L267 218 L266 273 L96 281 Z',
    anchors: [
      { x: 181, y: 320, scale: 0.82, rotation: -5, mask: null },
      { x: 505, y: 340, scale: 1, rotation: -5, mask: null },
      { x: 700, y: 324, scale: 0.62, rotation: 0, mask: null },
    ],
  },
  'rear-quarter': {
    body: 'M78 264 L194 224 L418 218 L458 232 L670 243 L725 281 L724 326 L219 350 L78 324 Z',
    cab: 'M414 230 L451 139 L557 151 L619 247 Z',
    glass: 'M440 221 L460 153 L547 165 L580 229 Z',
    front: 'M79 267 L213 248 L213 326 L79 310 Z',
    bed: 'M99 251 L406 224 L406 272 L216 303 L100 285 Z',
    anchors: [
      { x: 153, y: 322, scale: 0.63, rotation: 0, mask: null },
      { x: 280, y: 338, scale: 1, rotation: 5, mask: null },
      { x: 630, y: 325, scale: 0.82, rotation: 5, mask: null },
    ],
  },
  front: {
    body: 'M203 252 L236 218 L565 218 L595 252 L595 335 L203 335 Z',
    cab: 'M235 225 L260 137 L535 137 L564 225 Z',
    glass: 'M257 209 L275 153 L520 153 L541 209 Z',
    front: 'M221 262 L578 262 L578 307 L221 307 Z',
    bed: 'M245 223 L554 223 L554 248 L245 248 Z',
    anchors: [
      { x: 240, y: 325, scale: 0.8, rotation: 0, mask: null },
      { x: 558, y: 325, scale: 0.8, rotation: 0, mask: null },
    ],
  },
};
export type Vehicle = {
  id: string;
  manufacturer: string;
  model: string;
  year: number;
  label: string;
  directions: Direction[];
  contrastingRoof: boolean;
  roofOptions: string[];
  trim: typeof trimOptions;
  packages: {
    id: string;
    label: string;
    verified: boolean;
    selections: Record<TrimField, string>;
  }[];
  views: Record<View, ViewManifest>;
};
export const vehicles: Vehicle[] = [
  ...['C10', 'K10', 'K5'].flatMap((model) =>
    (model === 'K5'
      ? [1969, 1970, 1971, 1972]
      : [1967, 1968, 1969, 1970, 1971, 1972]
    ).map((year) => ({ manufacturer: 'Chevrolet', model, year })),
  ),
  ...fordModels.flatMap((model) =>
    [1978, 1979].map((year) => ({ manufacturer: 'Ford', model, year })),
  ),
].map((v) => ({
  ...v,
  id: `${v.manufacturer}-${v.model}-${v.year}`,
  label: `${v.year} ${v.manufacturer === 'Ford' ? `Ford ${v.model}` : v.model}`,
  directions:
    v.model === 'C10'
      ? ['Lowered']
      : v.model === 'K10'
        ? ['Lifted']
        : ['Lowered', 'Lifted'],
  contrastingRoof: true,
  roofOptions: v.model === 'K5' ? roofs : [],
  trim: trimOptions,
  packages: [
    {
      id: 'unverified',
      label: 'Factory-style placeholder — unverified',
      verified: false,
      selections: baseTrim,
    },
  ],
  views: Object.fromEntries(
    views.map((view) => [
      view,
      {
        assetRoot: `/designer/final/${v.manufacturer}/${v.model}/${v.year}/${view}`,
        background: null,
        body: null,
        paintMask: null,
        frontEnd: null,
        trim: null,
        roof: null,
        topOffInterior: null,
        foregroundMask: null,
        anchors: geometry[view].anchors,
      },
    ]),
  ) as Record<View, ViewManifest>,
}));
// Only reviewed raster packs are registered here. Keep every other model/year
// on its explicitly labelled schematic until its own artwork is available.
const c10Studio = vehicles.find((v) => v.id === 'Chevrolet-C10-1967')!;
for (const view of views)
  c10Studio.views[view].studio = {
    root: `/designer/studio/chevrolet-c10-1967-color-v3/${view}`,
    paintScene: true,
    width: 768,
    height: 512,
    viewport: [0, 0, 768, 512],
    shadow: { cx: 0, cy: 0, rx: 0, ry: 0 },
    wheels: [],
  };
const c10Reference = vehicles.find(
  (vehicle) => vehicle.id === 'Chevrolet-C10-1971',
)!;
c10Reference.views['side'].studio = {
  viewport: [7, 172, 613, 270],
  wheels: [
    { x: 113.5, height: 101, file: 'wheel-front.png', y: 367.5, width: 105 },
    { x: 487, height: 102, file: 'wheel-rear.png', y: 367, width: 106 },
  ],
  shadow: { rx: 287, ry: 12, cx: 316, cy: 416 },
  height: 627,
  root: '/designer/studio/chevrolet-c10-1971/side',
  width: 627,
};
c10Reference.views['front-quarter'].studio = {
  viewport: [-86.5, 124, 800, 381],
  wheels: [
    { x: 246, height: 154, file: 'wheel-front.png', y: 393, width: 114 },
    { x: 63.5, height: 109, file: 'wheel-rear.png', y: 353.5, width: 71 },
    { x: 512, height: 50, file: 'wheel-far-front.png', y: 422, width: 112 },
  ],
  shadow: { rx: 290, ry: 25, cx: 311, cy: 463 },
  height: 627,
  root: '/designer/studio/chevrolet-c10-1971/front-quarter',
  width: 627,
};
c10Reference.views['rear-quarter'].studio = {
  viewport: [-30, 117, 695, 331],
  wheels: [
    { x: 407, height: 149, file: 'wheel-rear.png', y: 366.5, width: 104 },
    { x: 572.5, height: 112, file: 'wheel-front.png', y: 338, width: 67 },
    { x: 154.5, height: 63, file: 'wheel-far-rear.png', y: 393.5, width: 105 },
  ],
  shadow: { rx: 281, ry: 23, cx: 318, cy: 421 },
  height: 627,
  root: '/designer/studio/chevrolet-c10-1971/rear-quarter',
  width: 627,
};
c10Reference.views['front'].studio = {
  viewport: [-181, 55, 983, 468],
  wheels: [
    { x: 89, height: 85, file: 'wheel-left.png', y: 456.5, width: 92 },
    { x: 524, height: 87, file: 'wheel-right.png', y: 455.5, width: 90 },
  ],
  shadow: { rx: 275, ry: 22, cx: 306, cy: 494 },
  height: 627,
  root: '/designer/studio/chevrolet-c10-1971/front',
  width: 627,
};
// Reviewed source geometry uses intact studio scenes with separate paint layers.
for (const model of ['C10', 'K10'])
  for (const year of [1969, 1970, 1971, 1972]) {
    const vehicle = vehicles.find(
      (v) => v.id === `Chevrolet-${model}-${year}`,
    )!;
    const sourceYear = year <= 1970 ? 1970 : model === 'C10' ? 1971 : 1972;
    for (const view of views)
      vehicle.views[view].studio = {
        root: `/designer/studio/chevrolet-${model.toLowerCase()}-${sourceYear}-color-v${model === 'C10' ? sourceYear === 1971 ? 4 : 2 : 1}/${view}`,
        paintScene: true,
        width: 768,
        height: 512,
        viewport: [0, 0, 768, 512],
        shadow: { cx: 0, cy: 0, rx: 0, ry: 0 },
        wheels: [],
      };
  }
const k10Studio1967 = vehicles.find((v) => v.id === 'Chevrolet-K10-1967')!;
for (const view of views)
  k10Studio1967.views[view].studio = {
    root: `/designer/studio/chevrolet-k10-1967-color-v1/${view}`,
    paintScene: true,
    width: 768,
    height: 512,
    viewport: [0, 0, 768, 512],
    shadow: { cx: 0, cy: 0, rx: 0, ry: 0 },
    wheels: [],
  };
const k10Studio1968 = vehicles.find((v) => v.id === 'Chevrolet-K10-1968')!;
for (const view of views)
  k10Studio1968.views[view].studio = {
    root: `/designer/studio/chevrolet-k10-1968-color-v1/${view}`,
    paintScene: true,
    width: 768,
    height: 512,
    viewport: [0, 0, 768, 512],
    shadow: { cx: 0, cy: 0, rx: 0, ry: 0 },
    wheels: [],
  };
const c10Studio1968 = vehicles.find((v) => v.id === 'Chevrolet-C10-1968')!;
for (const view of views)
  c10Studio1968.views[view].studio = {
    root: `/designer/studio/chevrolet-c10-1968-color-v2/${view}`,
    paintScene: true,
    width: 768,
    height: 512,
    viewport: [0, 0, 768, 512],
    shadow: { cx: 0, cy: 0, rx: 0, ry: 0 },
    wheels: [],
  };
for (const year of [1969, 1970, 1971, 1972]) {
const k5Studio = vehicles.find((v) => v.id === `Chevrolet-K5-${year}`)!;
const sourceYear = year <= 1970 ? 1970 : 1972;
const k5Root = `/designer/studio/chevrolet-k5-${sourceYear}-color-v${sourceYear === 1972 ? 2 : 1}`;
for (const view of views)
  k5Studio.views[view].studio = {
    root: `${k5Root}/top-on/${view}`,
    openTopRoot: `${k5Root}/top-off/${view}`,
    paintScene: true,
    width: 768,
    height: 512,
    viewport: [0, 0, 768, 512],
    shadow: { cx: 0, cy: 0, rx: 0, ry: 0 },
    wheels: [],
  };
}
export const wheelCatalog = [
  {
    id: 'street-temp',
    name: 'Street / pro-touring mock wheel',
    brand: null,
    model: null,
    sku: null,
    diameter: null,
    width: null,
    finish: 'Silver placeholder',
    productUrl: null,
    intendedUse: 'Street / pro-touring',
    fitmentNotes: 'Unverified visual placeholder. Not a purchasable product.',
    spokes: 5,
    assetPack: Object.fromEntries(views.map((v) => [v, null])) as Record<
      View,
      string | null
    >,
  },
  {
    id: 'offroad-temp',
    name: 'Off-road mock wheel',
    brand: null,
    model: null,
    sku: null,
    diameter: null,
    width: null,
    finish: 'Dark placeholder',
    productUrl: null,
    intendedUse: 'Off-road',
    fitmentNotes: 'Unverified visual placeholder. Not a purchasable product.',
    spokes: 8,
    assetPack: Object.fromEntries(views.map((v) => [v, null])) as Record<
      View,
      string | null
    >,
  },
];
const f100Studio1979 = vehicles.find((v) => v.id === 'Ford-F-100-1979')!;
for (const view of views) f100Studio1979.views[view].studio = {
  root: `/designer/studio/ford-f100-1979-solid-v2/${view}`,
  paintScene: true,
  solidOnly: true,
  width: 768, height: 512, viewport: [0, 0, 768, 512],
  shadow: { cx: 0, cy: 0, rx: 0, ry: 0 }, wheels: [],
};
f100Studio1979.contrastingRoof = false;

export type Configuration = {
  version: 1;
  vehicleId: string;
  direction: Direction;
  stance: string;
  trimMode: 'Match My Truck' | 'Customize It';
  trimPackage: string;
  trim: Record<TrimField, string>;
  color: string;
  secondaryColor: string;
  roofColor: string;
  finish: 'Gloss' | 'Satin';
  paintMode: 'Solid' | 'Two-tone';
  twoToneStyle: 'Center band' | 'Lower body';
  cabPaint: 'Roof only' | 'Roof and pillars';
  contrastRoof: boolean;
  wheelId: string;
  tire: string;
  roof: string;
  view: View;
};
export function defaultConfiguration(vehicle = vehicles[0]): Configuration {
  const blueK10 = vehicle.id === 'Chevrolet-K10-1967';
  const greenK10 = vehicle.id === 'Chevrolet-K10-1968';
  const seafoam1967 = vehicle.id === 'Chevrolet-C10-1967';
  const blue1968 = vehicle.id === 'Chevrolet-C10-1968';
  return {
    version: 1,
    vehicleId: vehicle.id,
    direction: vehicle.directions[0],
    stance: 'stock',
    trimMode: 'Match My Truck',
    trimPackage: 'unverified',
    trim: { ...baseTrim },
    color: vehicle.views.side.studio?.solidOnly ? '#1678ba' : blueK10 ? '#087ca2' : greenK10 ? '#20584b' : seafoam1967 ? '#63aba6' : blue1968 ? '#087fb8' : vehicle.model === 'K5' && vehicle.year <= 1970 ? '#a9adb1' : vehicle.views.side.studio?.openTopRoot ? '#1678ba' : vehicle.views.side.studio?.paintScene ? '#bc252c' : colors[0].hex,
    secondaryColor: '#e5e7e7',
    roofColor: '#e5e7e7',
    finish: 'Gloss',
    paintMode: vehicle.views.side.studio?.solidOnly || blueK10 || greenK10 || seafoam1967 || blue1968 || (vehicle.model === 'K5' && vehicle.year <= 1970) ? 'Solid' : vehicle.views.side.studio?.paintScene ? 'Two-tone' : 'Solid',
    twoToneStyle: ['C10', 'K10'].includes(vehicle.model)
      ? 'Center band'
      : 'Lower body',
    cabPaint: ['C10', 'K10'].includes(vehicle.model)
      ? 'Roof and pillars'
      : 'Roof only',
    contrastRoof: seafoam1967,
    wheelId: 'street-temp',
    tire: 'Street performance',
    roof: 'White top',
    view: vehicle.views['front-quarter'].studio ? 'front-quarter' : 'side',
  };
}
export function allowedStances(direction: Direction) {
  return stances.filter(
    (s) => s.direction === 'Both' || s.direction === direction,
  );
}
export function normalize(input: unknown): Configuration {
  const raw =
    input && typeof input === 'object' ? (input as Partial<Configuration>) : {};
  const v = vehicles.find((v) => v.id === raw.vehicleId) || vehicles[0];
  const c = defaultConfiguration(v);
  const pick = <T extends string>(
    value: unknown,
    options: readonly T[],
    fallback: T,
  ): T => (options.includes(value as T) ? (value as T) : fallback);
  const hex = (value: unknown, fallback: string) =>
    typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
      ? value
      : fallback;
  c.direction = pick(raw.direction, v.directions, c.direction);
  c.stance = pick(
    raw.stance,
    allowedStances(c.direction).map((s) => s.id),
    'stock',
  );
  c.trimMode = pick(
    raw.trimMode,
    ['Match My Truck', 'Customize It'],
    c.trimMode,
  );
  c.trimPackage = pick(
    raw.trimPackage,
    v.packages.map((p) => p.id),
    c.trimPackage,
  );
  for (const key of trimFields)
    c.trim[key] = pick(raw.trim?.[key], v.trim[key], baseTrim[key]);
  if (c.trimMode === 'Match My Truck')
    c.trim = { ...v.packages.find((p) => p.id === c.trimPackage)!.selections };
  c.color = hex(raw.color, c.color);
  c.secondaryColor = hex(raw.secondaryColor, c.secondaryColor);
  c.roofColor = hex(raw.roofColor, c.roofColor);
  c.finish = pick(raw.finish, ['Gloss', 'Satin'], c.finish);
  c.paintMode = pick(raw.paintMode, ['Solid', 'Two-tone'], c.paintMode);
  const chevyPickup = ['C10', 'K10'].includes(v.model);
  c.twoToneStyle = chevyPickup
    ? pick(
        raw.twoToneStyle,
        ['Center band', 'Lower body'],
        raw.vehicleId ? 'Lower body' : c.twoToneStyle,
      )
    : 'Lower body';
  c.cabPaint = chevyPickup ? 'Roof and pillars' : 'Roof only';
  c.contrastRoof =
    v.model !== 'K5' && v.contrastingRoof && raw.contrastRoof === true;
  c.wheelId = pick(
    raw.wheelId,
    wheelCatalog.map((w) => w.id),
    c.wheelId,
  );
  c.tire = pick(raw.tire, tires, c.tire);
  c.roof = v.model === 'K5' ? pick(raw.roof, roofs, c.roof) : 'Not applicable';
  c.view = pick(raw.view, views, c.view);
  // Unsupported customization is paused during the artwork rebuild. Apply this
  // to restored/shared builds too, so hidden legacy options cannot alter a view.
  c.stance = 'stock';
  c.trimMode = 'Match My Truck';
  c.trimPackage = 'unverified';
  c.trim = { ...baseTrim };
  c.wheelId = 'street-temp';
  c.tire = 'Street performance';
  if (v.views.side.studio?.paintScene) c.twoToneStyle = 'Center band';
  if (v.views.side.studio?.solidOnly) {
    c.paintMode = 'Solid';
    c.contrastRoof = false;
  }
  return c;
}
export function summary(c: Configuration): Record<string, string> {
  const v = vehicles.find((v) => v.id === c.vehicleId)!;
  return {
    Vehicle: `${v.year} ${v.manufacturer} ${v.model}`,
    'Exterior trim': 'As pictured; custom requests to be discussed',
    'Ride height': 'As pictured',
    Paint: v.views.side.studio?.fixedAppearance
      ? 'Red / white center band, red cab - as pictured'
      : `${c.color} · ${c.finish} · ${c.paintMode}${c.paintMode === 'Two-tone' ? ` / ${c.secondaryColor}` : ''}`,
    'Two-tone pattern':
      c.paintMode === 'Two-tone' ? c.twoToneStyle : 'Not applicable',
    'Contrasting roof': c.contrastRoof ? c.roofColor : 'No',
    'Cab paint coverage': c.contrastRoof ? c.cabPaint : 'Body color',
    Wheels: 'As pictured; fitment to be discussed',
    Tires: 'As pictured; size to be discussed',
    'K5 roof': v.model === 'K5' ? c.roof : 'Not applicable',
    ...(v.model === 'K5' ? { Interior: 'Black dash and roll bar; gray/black patterned seat centers with light outer upholstery' } : {}),
  };
}
export const fitmentNotice =
  'Final wheel fitment, backspacing, brake clearance, suspension geometry, and tire sizing must be confirmed by AZ Sport Trucks.';
