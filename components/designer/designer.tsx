'use client';
import {
  useEffect,
  useId,
  useState,
  type SyntheticEvent,
  type ReactNode,
} from 'react';
import { Download, Share2, RotateCcw, Save, ArrowUpRight } from 'lucide-react';
import { NativeSelect } from '@/components/ui/native-select';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  allowedStances,
  colors,
  defaultConfiguration,
  fitmentNotice,
  manufacturers,
  normalize,
  roofs,
  summary,
  tires,
  trimFields,
  trimLabels,
  vehicles,
  viewLabels,
  views,
  wheelCatalog,
  type Configuration,
} from '@/lib/designer/manifest';
import { escapeHtml, renderSvg } from '@/lib/designer/render';
import { embedArtwork } from '@/lib/designer/export';
import {
  prepareQuoteEmail,
  quoteRecipient,
  type QuoteEmail,
} from '@/lib/designer/quote';
import {
  draftKey,
  readDraft,
  readShare,
  shareHash,
  storeLead,
  type MockLead,
} from '@/lib/designer/storage';

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: (string | { id: string; label: string })[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="design-field">
      <label htmlFor={id}>{label}</label>
      <NativeSelect
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option
            key={typeof o === 'string' ? o : o.id}
            value={typeof o === 'string' ? o : o.id}
          >
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
function Category({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <AccordionItem value={id}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        <div className="category-fields">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="design-color">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span>{value.toUpperCase()}</span>
    </div>
  );
}
function BuildSummary({ config }: { config: Configuration }) {
  return (
    <dl className="design-summary">
      {Object.entries(summary(config)).map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
const actions = {
  save: 'Save Build',
  download: 'Download Build',
  quote: 'Request a Quote',
};
type Action = keyof typeof actions;
export function Designer() {
  const [config, setConfig] = useState<Configuration>(defaultConfiguration());
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [readyDownload, setReadyDownload] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [review, setReview] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [quoteEmail, setQuoteEmail] = useState<QuoteEmail | null>(null);
  const vehicle = vehicles.find((v) => v.id === config.vehicleId)!;
  const studioView = Boolean(vehicle.views[config.view].studio);
  const wheel = wheelCatalog.find((w) => w.id === config.wheelId)!;
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const shared = readShare(location.hash);
        const saved = shared || readDraft();
        if (saved) setConfig(saved);
        if (shared)
          setNotice(
            'Shared configuration loaded. Contact information is never included in a build link.',
          );
      } catch {
        setNotice(
          'The saved build or shared link could not be read. A fresh build is ready.',
        );
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(config));
    } catch {
      queueMicrotask(() =>
        setNotice(
          'Browser storage is unavailable. Your current build still works, but will not survive a refresh.',
        ),
      );
    }
  }, [config, ready]);
  useEffect(
    () => () => {
      if (readyDownload) URL.revokeObjectURL(readyDownload.url);
    },
    [readyDownload],
  );
  function update(patch: Partial<Configuration>) {
    setConfig((c) => normalize({ ...c, ...patch }));
    setSuccess('');
  }
  function changeVehicle(id: string) {
    const v = vehicles.find((v) => v.id === id)!;
    setConfig((c) =>
      normalize({
        ...c,
        vehicleId: v.id,
        direction: v.directions.includes(c.direction)
          ? c.direction
          : v.directions[0],
        stance: 'stock',
        trimPackage: 'unverified',
        trim: defaultConfiguration(v).trim,
      }),
    );
    setNotice(
      'Vehicle changed. Ride height and model-specific trim have been reset.',
    );
  }
  function begin(which: Action) {
    setReview(false);
    setSuccess('');
    setFormError('');
    setPhotos([]);
    setQuoteEmail(null);
    setAction(which);
  }
  async function share() {
    const url = location.origin + location.pathname + shareHash(config);
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      setNotice('Build link copied. It includes your configuration only.');
    } catch {
      setNotice(
        'Copy the build link below. It includes your configuration only.',
      );
    }
  }
  async function downloadLead(lead: MockLead) {
    const cache = new Map<string, Promise<string>>();
    const loadImage = (path: string) => {
      if (!cache.has(path))
        cache.set(
          path,
          (async () => {
            const response = await fetch(path);
            if (!response.ok)
              throw new Error(
                'The artwork could not be loaded. Try preparing your build again.',
              );
            const blob = await response.blob();
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') resolve(reader.result);
                else reject(new Error('The artwork could not be read.'));
              };
              reader.onerror = () =>
                reject(
                  new Error('The build sheet artwork could not be prepared.'),
                );
              reader.readAsDataURL(blob);
            });
          })(),
        );
      return cache.get(path)!;
    };
    const exportStates = await Promise.all(
      lead.renderStates.map(async (state) => ({
        ...state,
        svg: await embedArtwork(state.svg, loadImage),
      })),
    );
    const lines = Object.entries(summary(lead.configuration))
      .map(
        ([k, v]) =>
          `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`,
      )
      .join('');
    const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.buildNumber} — AZ Sport Trucks</title><style>body{font:16px Arial;margin:32px auto;max-width:1000px;padding:20px;color:#222}h1{font-size:32px}th,td{text-align:left;padding:8px;border-bottom:1px solid #ddd}svg{width:100%;height:auto}article{break-inside:avoid}p{line-height:1.6}@media print{button{display:none}}</style><h1>AZ SPORT TRUCKS</h1><h2>${lead.buildNumber}</h2><p>PHASE 1 PROTOTYPE — no quote submitted. Placeholder artwork and wheels are not technically verified.</p><table>${lines}</table>${exportStates.map((r) => `<article><h2>${escapeHtml(viewLabels[r.view as keyof typeof viewLabels])}</h2>${r.svg}</article>`).join('')}<p>${fitmentNotice}</p><p>Contact Nick: Aztruckshootout@gmail.com</p></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${lead.buildNumber}.html`;
    setReadyDownload({ url, name: anchor.download });
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action || busy) return;
    setBusy(true);
    setFormError('');
    const form = new FormData(event.currentTarget);
    const contact = Object.fromEntries(
      [
        'name',
        'email',
        'phone',
        'location',
        'ownsTruck',
        'budget',
        'timeline',
        'description',
      ].map((k) => [
        k,
        typeof form.get(k) === 'string' ? (form.get(k) as string).trim() : '',
      ]),
    );
    const lead: MockLead = {
      buildNumber: `AZST-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      action,
      contact,
      configuration: config,
      renderStates: views.map((v) => ({
        view: v,
        svg: renderSvg(config, v, `export-${v}`),
      })),
      photos,
      mock: true,
    };
    try {
      if (action === 'quote') {
        const email = prepareQuoteEmail({ ...lead, photoCount: photos.length });
        await downloadLead(lead);
        setQuoteEmail(email);
        setSuccess(
          'Your quote email is ready. Open your email app, attach the build sheet and any truck photos, then send it to Nick. Nothing has been sent yet.',
        );
        setAction(null);
        return;
      }
      await storeLead(lead);
      if (action === 'download') await downloadLead(lead);
      setSuccess(
        `${action === 'download' ? 'Build sheet prepared and saved locally' : 'Build saved locally'}. Build number: ${lead.buildNumber}. Nothing has been sent to Nick.`,
      );
      setAction(null);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to save. Nothing was submitted.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="designer">
      <div className="design-heading">
        <div>
          <p className="eyebrow">AZ SPORT TRUCKS / PHASE 1 PROTOTYPE</p>
          <h1>
            DESIGN YOUR <em>BUILD.</em>
          </h1>
        </div>
        <p>Old-school soul. Your direction.</p>
      </div>
      <div className="designer-grid">
        <section className="design-stage" aria-label="Vehicle preview">
          <div className="render-dock">
            <div className="render-heading">
              <div>
                <h2>{vehicle.label}</h2>
                <span>
                  {vehicle.manufacturer} · {vehicle.model}
                  {vehicle.manufacturer === 'Ford'
                    ? ' · Regular-cab short-bed'
                    : ''}
                </span>
              </div>
              <span className="prototype-tag">
                {studioView ? 'STUDIO STUDY' : 'MOCK ARTWORK'}
              </span>
            </div>
            <div
              className="truck-render"
              dangerouslySetInnerHTML={{
                __html: renderSvg(config, config.view, 'main'),
              }}
            />
            <fieldset className="view-buttons" aria-label="Vehicle view">
              {views.map((v) => (
                <button
                  type="button"
                  key={v}
                  aria-pressed={config.view === v}
                  onClick={() => update({ view: v })}
                >
                  {viewLabels[v]}
                </button>
              ))}
            </fieldset>
          </div>
          <div className="render-meta">
            <span>{summary(config)['Ride height']}</span>
            <span>
              {config.finish} · {config.paintMode}
            </span>
            <span>{vehicle.year} selected separately</span>
          </div>
          <p className="design-note">
            {studioView
              ? 'Studio artwork study: paint, two-tone, roof color, and ride height can be previewed. Wheel styles and some trim options are recorded in your summary but not yet shown in this view. Details are not factory-verified.'
              : 'Schematic artwork is shared across years for this prototype. Grilles, lighting, trim, and proportions are not factory-accurate.'}
          </p>
          <div className="build-current">
            <div>
              <span className="eyebrow">YOUR CURRENT BUILD</span>
              <p>
                {vehicle.label} · {config.direction} ·{' '}
                {config.color.toUpperCase()}
              </p>
            </div>
            <button className="design-button" onClick={() => setReview(true)}>
              Review build <ArrowUpRight size={16} />
            </button>
          </div>
          <p className="fitment-note">{fitmentNotice}</p>
          <div className="secondary-actions">
            <button onClick={() => begin('download')}>
              <Download size={16} />
              Download Build
            </button>
            <button onClick={share}>
              <Share2 size={16} />
              Share Build
            </button>
            <button
              onClick={() => {
                setConfig(defaultConfiguration());
                setNotice(
                  'Configuration reset. Previously saved lead records remain on this device.',
                );
                setShareUrl('');
                history.replaceState(null, '', location.pathname);
              }}
            >
              <RotateCcw size={16} />
              Reset design
            </button>
          </div>
          {shareUrl && (
            <label className="share-field" htmlFor="share-link">
              Configuration-only link
              <Input
                id="share-link"
                readOnly
                value={shareUrl}
                onFocus={(e) => e.target.select()}
              />
              <small>
                Local prototype links open only where this preview server is
                available.
              </small>
            </label>
          )}
        </section>
        <aside className="design-controls" aria-label="Build configuration">
          <div className="controls-heading">
            <h2>MAKE IT YOURS</h2>
            <span>Selections stay with your build</span>
          </div>
          <Accordion defaultValue={['vehicle']} multiple>
            <Category id="vehicle" title="01 / Vehicle & direction">
              <Choice
                label="Manufacturer"
                value={vehicle.manufacturer}
                options={[...manufacturers]}
                onChange={(value) =>
                  changeVehicle(
                    vehicles.find((v) => v.manufacturer === value)!.id,
                  )
                }
              />
              <Choice
                label="Model"
                value={vehicle.model}
                options={[
                  ...new Set(
                    vehicles
                      .filter((v) => v.manufacturer === vehicle.manufacturer)
                      .map((v) => v.model),
                  ),
                ]}
                onChange={(value) =>
                  changeVehicle(
                    vehicles.find(
                      (v) =>
                        v.manufacturer === vehicle.manufacturer &&
                        v.model === value,
                    )!.id,
                  )
                }
              />
              <Choice
                label="Exact model year"
                value={vehicle.id}
                options={vehicles
                  .filter(
                    (v) =>
                      v.manufacturer === vehicle.manufacturer &&
                      v.model === vehicle.model,
                  )
                  .map((v) => ({ id: v.id, label: v.label }))}
                onChange={changeVehicle}
              />
              {vehicle.manufacturer === 'Ford' && (
                <p className="design-note">
                  F-100 / F-150 coverage is still to be selected. No badge or
                  fitment is confirmed.
                </p>
              )}
              <Choice
                label="Build direction"
                value={config.direction}
                options={vehicle.directions}
                onChange={(value) =>
                  update({ direction: value as Configuration['direction'] })
                }
              />
            </Category>
            <Category id="trim" title="02 / Exterior trim">
              <Choice
                label="Trim mode"
                value={config.trimMode}
                options={['Match My Truck', 'Customize It']}
                onChange={(value) =>
                  update({ trimMode: value as Configuration['trimMode'] })
                }
              />
              {config.trimMode === 'Match My Truck' ? (
                <>
                  <Choice
                    label="Factory-style package"
                    value={config.trimPackage}
                    options={vehicle.packages.map((p) => ({
                      id: p.id,
                      label: p.label,
                    }))}
                    onChange={(value) => update({ trimPackage: value })}
                  />
                  <p className="design-note">
                    Verified {vehicle.year} {vehicle.model} packages will be
                    added later. This neutral placeholder sets all six trim
                    treatments together.
                  </p>
                </>
              ) : (
                trimFields.map((key) => (
                  <Choice
                    key={key}
                    label={trimLabels[key]}
                    value={config.trim[key]}
                    options={vehicle.trim[key]}
                    onChange={(value) =>
                      update({ trim: { ...config.trim, [key]: value } })
                    }
                  />
                ))
              )}
              <p className="design-note">
                Custom treatments are visual concepts, not factory package
                names. Headlights remain a year-specific artwork placeholder.
              </p>
            </Category>
            <Category id="stance" title="03 / Ride height">
              <Choice
                label="Ride height"
                value={config.stance}
                options={allowedStances(config.direction).map((s) => ({
                  id: s.id,
                  label: s.label,
                }))}
                onChange={(value) => update({ stance: value })}
              />
              <p className="design-note">
                Stance changes illustrate direction only; dimensions and
                suspension geometry are not simulated.
              </p>
            </Category>
            <Category id="paint" title="04 / Paint & finish">
              <fieldset className="paint-presets" aria-label="Paint presets">
                {colors.map((color) => (
                  <button
                    key={color.hex}
                    title={color.name}
                    aria-label={color.name}
                    aria-pressed={config.color === color.hex}
                    style={{ background: color.hex }}
                    onClick={() => update({ color: color.hex })}
                  >
                    {config.color === color.hex ? '✓' : ''}
                  </button>
                ))}
              </fieldset>
              <ColorField
                label="Body color"
                value={config.color}
                onChange={(value) => update({ color: value })}
              />
              <Choice
                label="Finish"
                value={config.finish}
                options={['Gloss', 'Satin']}
                onChange={(value) =>
                  update({ finish: value as Configuration['finish'] })
                }
              />
              <Choice
                label="Paint layout"
                value={config.paintMode}
                options={['Solid', 'Two-tone']}
                onChange={(value) =>
                  update({ paintMode: value as Configuration['paintMode'] })
                }
              />
              {config.paintMode === 'Two-tone' && (
                <ColorField
                  label="Secondary color"
                  value={config.secondaryColor}
                  onChange={(value) => update({ secondaryColor: value })}
                />
              )}
              {vehicle.model !== 'K5' && vehicle.contrastingRoof && (
                <>
                  <Choice
                    label="Contrasting cab roof"
                    value={config.contrastRoof ? 'Yes' : 'No'}
                    options={['No', 'Yes']}
                    onChange={(value) =>
                      update({ contrastRoof: value === 'Yes' })
                    }
                  />
                  {config.contrastRoof && (
                    <ColorField
                      label="Roof color"
                      value={config.roofColor}
                      onChange={(value) => update({ roofColor: value })}
                    />
                  )}
                </>
              )}
            </Category>
            <Category id="wheels" title="05 / Wheels & tires">
              <Choice
                label="Wheel collection / mock product"
                value={config.wheelId}
                options={wheelCatalog.map((w) => ({ id: w.id, label: w.name }))}
                onChange={(value) => update({ wheelId: value })}
              />
              <div className="wheel-facts">
                <b>TEMPORARY ENTRY</b>
                <p>{wheel.finish}</p>
                <p>
                  Brand, model, SKU, diameter, width, and product link: pending
                  approved catalog.
                </p>
                <p>{wheel.fitmentNotes}</p>
              </div>
              <Choice
                label="Tire category"
                value={config.tire}
                options={tires}
                onChange={(value) => update({ tire: value })}
              />
            </Category>
            {vehicle.model === 'K5' && (
              <Category id="roof" title="06 / K5 roof">
                <Choice
                  label="K5 roof option"
                  value={config.roof}
                  options={roofs}
                  onChange={(value) => update({ roof: value })}
                />
                <p className="design-note">
                  Top off uses a separate interior and bed-rail placeholder.
                  Final seating, shadows, and roof details are pending artwork.
                </p>
              </Category>
            )}
          </Accordion>
        </aside>
      </div>
      <div className="design-status" aria-live="polite">
        {success ||
          notice ||
          (ready
            ? 'Your draft is kept on this device. No contact details are needed to design.'
            : 'Loading your draft…')}
      </div>
      {readyDownload && (
        <a
          className="design-button"
          href={readyDownload.url}
          download={readyDownload.name}
        >
          Download prepared build sheet <Download size={17} />
        </a>
      )}
      <div className="designer-actions">
        <div>
          <strong>{vehicle.label}</strong>
          <span>
            {config.direction} · {summary(config)['Ride height']}
          </span>
        </div>
        <button className="design-button" onClick={() => begin('save')}>
          <Save size={17} />
          Save Build
        </button>
        <button
          className="design-button primary"
          onClick={() => begin('quote')}
        >
          Request a Quote <ArrowUpRight size={17} />
        </button>
      </div>
      <Dialog open={review} onOpenChange={setReview}>
        <DialogContent className="designer-modal review-modal">
          <DialogTitle>Review your build</DialogTitle>
          <DialogDescription>
            All four views use the same configuration. Artwork and fitment
            remain unverified.
          </DialogDescription>
          <div className="review-renders">
            {views.map((v) => (
              <figure key={v}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderSvg(config, v, `review-${v}`),
                  }}
                />
                <figcaption>{viewLabels[v]}</figcaption>
              </figure>
            ))}
          </div>
          <BuildSummary config={config} />
          <p className="fitment-note">{fitmentNotice}</p>
          <div className="review-actions">
            <button className="design-button" onClick={() => setReview(false)}>
              Keep designing
            </button>
            <button className="design-button" onClick={() => begin('save')}>
              Save Build
            </button>
            <button
              className="design-button primary"
              onClick={() => begin('quote')}
            >
              Request a Quote
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setAction(null);
        }}
      >
        <DialogContent className="designer-modal">
          <DialogTitle>{action ? actions[action] : ''}</DialogTitle>
          <DialogDescription>
            {action === 'quote'
              ? 'Prepare an email to Nick with your build details. You will send it from your email app and attach your build sheet and photos yourself.'
              : 'Save this build on your device. Nothing is sent to AZ Sport Trucks.'}
          </DialogDescription>
          <div className="lead-build">
            {vehicle.label} · {config.direction} ·{' '}
            {summary(config)['Ride height']}
            <small>
              Your build sheet includes the full configuration and all four
              concept views.
            </small>
          </div>
          <form onSubmit={submit} className="lead-form">
            <div className="lead-fields">
              {[
                { name: 'name', label: 'Name', type: 'text', complete: 'name' },
                {
                  name: 'email',
                  label: 'Email',
                  type: 'email',
                  complete: 'email',
                },
                { name: 'phone', label: 'Phone', type: 'tel', complete: 'tel' },
                {
                  name: 'location',
                  label: 'Location (city / state)',
                  type: 'text',
                  complete: 'address-level2',
                },
              ].map((field) => (
                <label key={field.name} htmlFor={field.name}>
                  {field.label}
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    autoComplete={field.complete}
                    required
                    maxLength={160}
                  />
                </label>
              ))}
              <label htmlFor="ownsTruck">
                Do you already own the truck?
                <NativeSelect
                  id="ownsTruck"
                  name="ownsTruck"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option>Yes</option>
                  <option>No</option>
                  <option>Currently shopping</option>
                </NativeSelect>
              </label>
              <label htmlFor="budget">
                Target budget
                <Input
                  id="budget"
                  name="budget"
                  placeholder="Amount or range, or undecided"
                  required
                  maxLength={120}
                />
              </label>
              <label htmlFor="timeline">
                Desired timeline
                <Input
                  id="timeline"
                  name="timeline"
                  placeholder="For example: 6–12 months or flexible"
                  required
                  maxLength={120}
                />
              </label>
            </div>
            <label htmlFor="description">
              Project description
              <Textarea
                id="description"
                name="description"
                required
                maxLength={3000}
                placeholder="How will you use the truck, and what matters most?"
              />
            </label>
            <label>
              Current truck pictures (optional)
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={(e) => {
                  const selected = Array.from(e.target.files || []);
                  if (
                    selected.length > 3 ||
                    selected.some(
                      (f) =>
                        f.size > 5 * 1024 * 1024 ||
                        !['image/png', 'image/jpeg', 'image/webp'].includes(
                          f.type,
                        ),
                    )
                  ) {
                    setFormError(
                      'Choose up to 3 JPG, PNG, or WebP images, each 5 MB or smaller.',
                    );
                    setPhotos([]);
                    e.target.value = '';
                    return;
                  }
                  setPhotos(selected);
                  setFormError('');
                }}
              />
            </label>
            <p className="design-note">
              Up to 3 pictures, 5 MB each. Pictures are not uploaded.
              {action === 'quote'
                ? ' Attach them in your email app before sending.'
                : ' They are saved on this device with your build.'}{' '}
              Contact details and pictures are excluded from shared links and
              downloaded build sheets.
            </p>
            {photos.length > 0 && (
              <p className="design-note">
                Selected: {photos.map((p) => p.name).join(', ')}
              </p>
            )}
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <button
              type="submit"
              className="design-button primary"
              disabled={busy}
            >
              {busy
                ? 'Preparing your build…'
                : action === 'quote'
                  ? 'Prepare email to Nick'
                  : action === 'download'
                    ? 'Save & download build sheet'
                    : 'Save build on this device'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={quoteEmail !== null}
        onOpenChange={(open) => {
          if (!open) setQuoteEmail(null);
        }}
      >
        <DialogContent className="designer-modal">
          <DialogTitle>Send your build to Nick</DialogTitle>
          <DialogDescription>
            Your message is ready, but has not been sent. Copy the message
            below, open your email app, and attach the downloaded build sheet
            and any truck photos before sending.
          </DialogDescription>
          {quoteEmail && (
            <>
              <p>To: {quoteRecipient}</p>
              <p>Subject: {quoteEmail.subject}</p>
              <label htmlFor="quote-message">Your quote message</label>
              <Textarea
                id="quote-message"
                readOnly
                value={quoteEmail.body}
                rows={10}
              />
              <div className="review-actions">
                <button
                  className="design-button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(quoteEmail.body);
                      setNotice(
                        'Quote message copied. Paste it into your email.',
                      );
                    } catch {
                      setNotice(
                        'Select and copy the message above, then paste it into your email.',
                      );
                    }
                  }}
                >
                  Copy message
                </button>
                <a className="design-button primary" href={quoteEmail.href}>
                  Open email app <ArrowUpRight size={17} />
                </a>
                {readyDownload && (
                  <a
                    className="design-button"
                    href={readyDownload.url}
                    download={readyDownload.name}
                  >
                    Download build sheet <Download size={17} />
                  </a>
                )}
              </div>
              <output className="design-note" aria-live="polite">
                {notice}
              </output>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
