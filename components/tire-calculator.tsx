'use client';
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- An inline SVG dimension diagram needs the image role; an HTML img cannot contain its vector geometry. */
import { useEffect, useId, useState } from 'react';
import { ArrowLeftRight, Calculator, Copy, Gauge, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { compareTires, parseTireSize, speedAfterTireChange, type Tire, type TireResult } from '@/lib/tires';
import { siteUrl } from '@/lib/seo';

type Unit = 'in' | 'mm';
type Mode = 'compare' | 'calculate';
type DiagramView = 'side' | 'width' | 'overlay';
const defaults = { current: '265/70R17', next: '285/70R17' };
const decimal = (n: number, places = 2) => n.toLocaleString('en-US', { maximumFractionDigits: places, minimumFractionDigits: places });
const measurement = (mm: number, unit: Unit) => `${decimal(unit === 'in' ? mm / 25.4 : mm, unit === 'in' ? 2 : 1)} ${unit === 'in' ? 'in' : 'mm'}`;
const delta = (n: number, unit: Unit) => `${Math.abs(n) < .000001 ? '' : n > 0 ? '+' : '−'}${measurement(Math.abs(n), unit)}`;

function SizeInput({ name, value, result, onChange, accent }: {
  name: string; value: string; result: TireResult; onChange: (value: string) => void; accent?: boolean;
}) {
  const id = useId();
  return <div className={`tire-size-input ${accent ? 'tire-new-input' : ''}`}>
    <label htmlFor={id}><span className={`tire-dot ${accent ? 'new' : ''}`} />{name}</label>
    <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} maxLength={40} autoComplete="off" spellCheck={false}
      placeholder="265/70R17 or 33x12.50R15" aria-invalid={!result.ok} aria-describedby={`${id}-help`} />
    <p id={`${id}-help`} className={result.ok ? 'tire-input-detail' : 'tire-input-error'}>
      {result.ok ? result.tire.format === 'metric'
        ? `${result.tire.widthMm} mm wide · ${result.tire.aspectRatio}% sidewall · ${result.tire.wheelIn}″ wheel`
        : `${decimal(result.tire.diameterMm / 25.4, 1)}″ tall · ${decimal(result.tire.widthMm / 25.4, 2)}″ wide · ${result.tire.wheelIn}″ wheel`
        : result.error}
    </p>
  </div>;
}

function TireDiagram({ current, next, view, unit }: { current: Tire; next?: Tire; view: DiagramView; unit: Unit }) {
  const scale = 222 / Math.max(current.diameterMm, next?.diameterMm || 0);
  const ground = 270;
  const tires = next ? [current, next] : [current];
  return <figure className="tire-diagram">
    <svg viewBox="0 0 720 330" role="img" aria-label={next
      ? `${view === 'width' ? 'Width' : 'Diameter'} comparison of ${current.label} and ${next.label}, drawn to the same scale on a common ground line.`
      : `Dimensions of ${current.label}, ${measurement(current.diameterMm, unit)} in diameter.`}>
      <line x1="40" y1={ground} x2="680" y2={ground} stroke="#536071" strokeWidth="1" />
      {tires.map((t, index) => {
        const x = view === 'overlay' || !next ? 360 : index === 0 ? 190 : 530;
        const radius = t.diameterMm * scale / 2;
        const rim = t.wheelIn * 25.4 * scale / 2;
        const y = ground - radius;
        const width = t.widthMm * scale;
        const color = index ? '#ff525c' : '#b4c3d4';
        return <g key={index}>
          {view === 'width' ? <>
            <rect x={x - width / 2} y={ground - radius * 2} width={width} height={radius * 2} rx="10" fill={color} fillOpacity=".08" stroke={color} strokeWidth="2.5" />
            <line x1={x} y1={ground - radius * 2 + 12} x2={x} y2={ground - 12} stroke={color} strokeDasharray="5 7" opacity=".4" />
            <line x1={x - width / 2} y1="287" x2={x + width / 2} y2="287" stroke={color} />
            <path d={`M${x-width/2},282v10 M${x+width/2},282v10`} stroke={color} />
            <text x={x} y="310" textAnchor="middle" fill={color}>{measurement(t.widthMm, unit)} wide</text>
          </> : <>
            <circle cx={x} cy={y} r={radius} fill={color} fillOpacity={view === 'overlay' ? '.035' : '.07'} stroke={color} strokeWidth="2.5" strokeDasharray={view === 'overlay' && index === 0 ? '7 5' : undefined} />
            <circle cx={x} cy={y} r={rim} fill="#141c25" fillOpacity={view === 'overlay' ? '0' : '.8'} stroke={color} opacity=".8" strokeWidth="1.5" />
            <line x1={x-rim-7} y1={y} x2={x+rim+7} y2={y} stroke={color} strokeDasharray="3 5" opacity=".4" />
            <line x1={x} y1={y-rim-7} x2={x} y2={y+rim+7} stroke={color} strokeDasharray="3 5" opacity=".4" />
            <circle cx={x} cy={y} r="3" fill={color} />
            {view !== 'overlay' && <text x={x} y={y + 32} textAnchor="middle" fill={color}>{t.wheelIn}″ wheel</text>}
            {view !== 'overlay' && <text x={x} y="310" textAnchor="middle" fill={color}>Ø {measurement(t.diameterMm, unit)}</text>}
            {view === 'overlay' && <text x={index ? 570 : 150} y={index ? 205 : 115} textAnchor="middle" fill={color}>Ø {measurement(t.diameterMm, unit)}</text>}
          </>}
        </g>;
      })}
      {view === 'overlay' && <text x="360" y="310" textAnchor="middle" fill="#97a5b6">Shared ground line</text>}
    </svg>
    <figcaption>Nominal dimensions at the same scale. Wheel circles show diameter.</figcaption>
  </figure>;
}

function Dimensions({ current, next, unit }: { current: Tire; next?: Tire; unit: Unit }) {
  const rows: [string, number, number | undefined][] = [
    ['Overall diameter', current.diameterMm, next?.diameterMm],
    ['Section width', current.widthMm, next?.widthMm],
    ['Sidewall height', current.sidewallMm, next?.sidewallMm],
    ['Wheel diameter', current.wheelIn * 25.4, next ? next.wheelIn * 25.4 : undefined],
    ['Circumference', current.circumferenceMm, next?.circumferenceMm],
  ];
  return <div className="tire-table-wrap"><table className="tire-dimensions">
    <caption>Dimension breakdown</caption>
    <thead><tr><th scope="col">Measurement</th><th scope="col">{next ? 'Current' : 'Tire size'}</th>{next && <><th scope="col">New</th><th scope="col">Change</th></>}</tr></thead>
    <tbody>{rows.map(([label, a, b]) => <tr key={label}><th scope="row">{label}</th><td>{measurement(a, unit)}</td>{b !== undefined && <><td>{measurement(b, unit)}</td><td>{delta(b-a, unit)}</td></>}</tr>)}
      <tr><th scope="row">Theoretical revs / mile</th><td>{decimal(current.theoreticalRevsPerMile, 0)}</td>{next && <><td>{decimal(next.theoreticalRevsPerMile, 0)}</td><td>{next.theoreticalRevsPerMile >= current.theoreticalRevsPerMile ? '+' : '−'}{decimal(Math.abs(next.theoreticalRevsPerMile-current.theoreticalRevsPerMile), 0)}</td></>}</tr>
    </tbody>
  </table></div>;
}

export function TireCalculator() {
  const [currentInput, setCurrentInput] = useState(defaults.current);
  const [nextInput, setNextInput] = useState(defaults.next);
  const [mode, setMode] = useState<Mode>('compare');
  const [unit, setUnit] = useState<Unit>('in');
  const [view, setView] = useState<DiagramView>('side');
  const [speed, setSpeed] = useState('60');
  const [shareFeedback, setShareFeedback] = useState<{ key: string; message: string; url?: string } | null>(null);
  const stateKey = JSON.stringify([currentInput, nextInput, mode, unit, speed]);
  const shareStatus = shareFeedback?.key === stateKey ? shareFeedback.message : '';
  const manualShare = shareFeedback?.key === stateKey ? shareFeedback.url : '';
  const currentResult = parseTireSize(currentInput);
  const nextResult = parseTireSize(nextInput);
  const current = currentResult.ok ? currentResult.tire : null;
  const next = nextResult.ok && mode === 'compare' ? nextResult.tire : null;
  const ready = !!current && (mode === 'calculate' || !!next);
  const comparison = current && next ? compareTires(current, next) : null;
  const indicatedSpeed = speed.trim() === '' ? NaN : Number(speed);
  const actualSpeed = current && next ? speedAfterTireChange(indicatedSpeed, current, next) : null;

  useEffect(() => {
    const restore = () => {
    const p = new URLSearchParams(window.location.hash.slice(1));
    if (!p.has('a')) return;
    const a = p.get('a') || '', b = p.get('b') || '';
    if (a.length <= 40) setCurrentInput(a);
    setNextInput(b && b.length <= 40 ? b : defaults.next);
    setMode(p.get('mode') === 'calculate' ? 'calculate' : 'compare');
    setUnit(p.get('unit') === 'mm' ? 'mm' : 'in');
    setSpeed(p.has('speed') && p.get('speed') !== '' && Number.isFinite(Number(p.get('speed'))) && Number(p.get('speed')) >= 0 && Number(p.get('speed')) <= 200 ? p.get('speed')! : '60');
    };
    const frame = window.requestAnimationFrame(restore);
    window.addEventListener('hashchange', restore);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('hashchange', restore); };
  }, []);

  function reset() {
    setCurrentInput(defaults.current); setNextInput(defaults.next); setSpeed('60'); setView('side'); setUnit('in'); setMode('compare');
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  async function share() {
    const params = new URLSearchParams({ a: currentInput, mode, unit, speed: actualSpeed !== null ? speed : '60' });
    if (mode === 'compare') params.set('b', nextInput);
    const link = `${siteUrl}/tire-calculator#${params}`;
    try { await navigator.clipboard.writeText(link); setShareFeedback({ key: stateKey, message: 'Link copied' }); }
    catch { setShareFeedback({ key: stateKey, message: 'Copy the link below', url: link }); }
  }
  function quickComparison(a: string, b: string) { setCurrentInput(a); setNextInput(b); }

  const workspace = (compare: boolean) => <div className="tire-workspace">
    <aside className="tire-input-panel" aria-label="Tire size inputs">
      <div className="tire-input-heading"><h2>{compare ? 'YOUR TWO SIZES' : 'YOUR TIRE SIZE'}</h2><span>LIVE RESULTS</span></div>
      <p className="tire-input-instructions">Enter the size from your sidewall. Metric and inch sizes both work.</p>
      <SizeInput name={compare ? 'Current tire' : 'Tire size'} value={currentInput} result={currentResult} onChange={setCurrentInput} />
      {compare && <>
        <Button className="tire-swap" variant="ghost" onClick={() => { setCurrentInput(nextInput); setNextInput(currentInput); }}><ArrowLeftRight size={15} />Swap sizes</Button>
        <SizeInput name="New tire" value={nextInput} result={nextResult} onChange={setNextInput} accent />
      </>}
      <div className="tire-format-help"><span>METRIC</span><code>265/70R17</code><span>INCHES</span><code>33x12.50R15</code></div>
      {compare && <div className="tire-examples"><p>Try a comparison</p>
        <Button variant="outline" onClick={() => quickComparison('33x12.50R15', '35x12.50R17')}>33″ to 35″</Button>
        <Button variant="outline" onClick={() => quickComparison('275/60R15', '275/40R20')}>15″ to 20″ wheels</Button>
      </div>}
      <div className="tire-input-actions"><Button variant="outline" disabled={!ready} onClick={share}><Copy size={16} />Share {compare ? 'comparison' : 'size'}</Button>
        <Button variant="ghost" onClick={reset}><RotateCcw size={16} />Reset</Button></div>
      <output className="tire-share-status" aria-live="polite">{shareStatus}</output>
      {manualShare && <Input aria-label="Link to copy" value={manualShare} readOnly onFocus={(e) => e.target.select()} />}
    </aside>
    <section className="tire-results" aria-label="Calculated tire dimensions">
      <div className="tire-result-toolbar"><h2>{compare ? 'SEE THE DIFFERENCE' : 'THE SIZE, DECODED'}</h2>
        <label className="tire-unit-control" htmlFor={`tire-units-${mode}`}>Units<NativeSelect id={`tire-units-${mode}`} value={unit} onChange={(e) => setUnit(e.target.value as Unit)}><option value="in">Inches</option><option value="mm">Millimeters</option></NativeSelect></label>
      </div>
      {ready && current ? <>
        <div className="tire-legend"><span><i className="tire-dot" />{compare ? 'Current · ' : ''}{current.label}</span>{next && <span><i className="tire-dot new" />New · {next.label}</span>}</div>
        <fieldset className="tire-view-options" aria-label="Diagram view">
          {(['side', 'width', ...(compare ? ['overlay'] : [])] as DiagramView[]).map((v) => <Button key={v} variant="ghost" aria-pressed={view === v} onClick={() => setView(v)}>{v === 'side' ? 'Side profile' : v === 'width' ? 'Width view' : 'Overlay'}</Button>)}
        </fieldset>
        <TireDiagram current={current} next={next || undefined} unit={unit} view={!compare && view === 'overlay' ? 'side' : view} />
        {comparison && next ? <>
          <p className="tire-result-summary" aria-live="polite">{Math.abs(comparison.diameterMm) < .000001
            ? 'Same overall diameter'
            : `${measurement(Math.abs(comparison.diameterMm), unit)} ${comparison.diameterMm > 0 ? 'taller' : 'shorter'}`}
            <span> · </span>{Math.abs(comparison.widthMm) < .000001 ? 'same width' : `${measurement(Math.abs(comparison.widthMm), unit)} ${comparison.widthMm > 0 ? 'wider' : 'narrower'}`}</p>
          <dl className="tire-key-stats"><div><dt>Diameter change</dt><dd>{comparison.diameterPercent > 0 ? '+' : ''}{decimal(comparison.diameterPercent)}<small>%</small></dd></div>
            <div><dt>Axle clearance change</dt><dd>{delta(comparison.clearanceMm, unit)}</dd><span>Half the diameter change</span></div></dl>
          <section className="tire-speed-panel" aria-labelledby={`speed-${mode}`}>
            <div><h3 id={`speed-${mode}`}><Gauge size={18} />Speedometer estimate</h3><label htmlFor={`speed-input-${mode}`}>Indicated speed <span>mph</span></label>
              <Input id={`speed-input-${mode}`} type="number" min="0" max="200" step="1" value={speed} onChange={(e) => setSpeed(e.target.value)} aria-invalid={actualSpeed === null} aria-describedby={`speed-note-${mode}`} /></div>
            <div className="tire-actual-speed"><span>Estimated actual speed</span><strong>{actualSpeed === null ? '—' : decimal(actualSpeed, 1)} <small>mph</small></strong>
              <span>{actualSpeed === null ? 'Enter a speed from 0 to 200 mph.' : actualSpeed > indicatedSpeed + .000001 ? 'Faster than indicated' : actualSpeed < indicatedSpeed - .000001 ? 'Slower than indicated' : 'No speed difference'}</span></div>
            <p id={`speed-note-${mode}`}>Assumes calibration to your current tire size. This is a nominal estimate.</p>
            <details><summary>Speed reference table</summary><table><thead><tr><th>Indicated</th><th>Estimated actual</th></tr></thead><tbody>{[30, 45, 60, 75].map((s) => <tr key={s}><td>{s} mph</td><td>{decimal(speedAfterTireChange(s, current, next)!, 1)} mph</td></tr>)}</tbody></table></details>
          </section>
        </> : <div className="tire-single-summary" aria-live="polite"><span>{current.format === 'metric' ? 'Inch dimensions' : 'Metric dimensions'}</span>
          <strong>{current.format === 'metric' ? `${decimal(current.diameterMm/25.4)}″ tall × ${decimal(current.widthMm/25.4)}″ wide` : `${decimal(current.widthMm, 1)} mm wide · ${decimal(current.aspectRatio, 1)}% aspect ratio`}</strong>
          <p>On a {current.wheelIn}″ wheel. A dimensional conversion, not a guaranteed available tire size.</p></div>}
        <Dimensions current={current} next={next || undefined} unit={unit} />
        <p className="tire-results-note">Calculated from size markings. Actual tire dimensions and rolling revolutions vary. <a href="/#contact">Discuss fitment with Nick ↗</a></p>
      </> : <div className="tire-empty"><Calculator size={38} aria-hidden="true" /><h3>LET’S GET YOUR SIZES RIGHT.</h3><p>Enter {compare ? 'two valid tire sizes' : 'a valid tire size'} to see the diagram and calculations.</p></div>}
    </section>
  </div>;

  return <Tabs className="tire-calculator" value={mode} onValueChange={(value) => { setMode(value as Mode); if (value === 'calculate' && view === 'overlay') setView('side'); }}>
    <TabsList className="tire-mode-tabs" aria-label="Tire calculator mode">
      <TabsTrigger value="compare"><ArrowLeftRight />Compare sizes</TabsTrigger>
      <TabsTrigger value="calculate"><Calculator />Calculate a size</TabsTrigger>
    </TabsList>
    <TabsContent value="compare">{workspace(true)}</TabsContent>
    <TabsContent value="calculate">{workspace(false)}</TabsContent>
  </Tabs>;
}
