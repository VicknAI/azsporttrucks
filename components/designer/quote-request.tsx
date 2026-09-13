'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { type Configuration, summary } from '@/lib/designer/manifest';

type Turnstile = {
  render: (node: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
let turnstileScript: Promise<void> | undefined;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (!turnstileScript)
    turnstileScript = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        script.remove();
        turnstileScript = undefined;
        reject(
          new Error(
            'The security check could not load. Check your connection and reopen this form.',
          ),
        );
      };
      document.head.appendChild(script);
    });
  return turnstileScript;
}
export function QuoteRequest({
  open,
  onOpenChange,
  configuration,
  siteKey,
  onReceived,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configuration: Configuration;
  siteKey: string;
  onReceived: (reference: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) onOpenChange(value);
      }}
    >
      <DialogContent className="designer-modal">
        <QuoteForm
          configuration={configuration}
          siteKey={siteKey}
          onReceived={onReceived}
          onBusy={setBusy}
        />
      </DialogContent>
    </Dialog>
  );
}
function QuoteForm({
  configuration,
  siteKey,
  onReceived,
  onBusy,
}: {
  configuration: Configuration;
  siteKey: string;
  onReceived: (reference: string) => void;
  onBusy: (busy: boolean) => void;
}) {
  const challenge = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const submitting = useRef(false);
  const attempt = useRef<{ key: string; payload: FormData } | null>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [reference, setReference] = useState('');
  useEffect(() => {
    if (reference) return;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !challenge.current || !window.turnstile) return;
        widget.current = window.turnstile.render(challenge.current, {
          sitekey: siteKey,
          action: 'quote',
          theme: 'dark',
          size: 'flexible',
          callback: (value: string) => {
            setToken(value);
            setError('');
          },
          'expired-callback': () => setToken(''),
          'error-callback': () => {
            setToken('');
            setError(
              'The security check could not complete. Please try again.',
            );
          },
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
      if (widget.current && window.turnstile)
        window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey, reference]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !token) return;
    submitting.current = true;
    onBusy(true);
    setError('');
    setProgress('Preparing your build…');
    try {
      if (!attempt.current) {
        const payload = new FormData(event.currentTarget);
        payload.set('configuration', JSON.stringify(configuration));
        const key = crypto.randomUUID();
        attempt.current = { key, payload };
      }
      const { key, payload } = attempt.current;
      payload.set('cf-turnstile-response', token);
      setProgress('Sending your request…');
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Idempotency-Key': key },
        body: payload,
        signal: AbortSignal.timeout(90000),
      });
      const result = (await response.json().catch(() => null)) as {
        received?: unknown;
        reference?: unknown;
        code?: unknown;
        error?: unknown;
      } | null;
      if (
        !response.ok ||
        result?.received !== true ||
        typeof result.reference !== 'string'
      ) {
        if (result?.code === 'CHANGED') attempt.current = null;
        throw new Error(
          typeof result?.error === 'string'
            ? result.error
            : 'We could not confirm receipt. Please retry; your form is still here.',
        );
      }
      setReference(result.reference);
      onReceived(result.reference);
      attempt.current = null;
    } catch (e) {
      setError(
        e instanceof Error && e.name !== 'TimeoutError'
          ? e.message
          : 'We could not confirm receipt. Please retry; repeated attempts will not create another request.',
      );
      setToken('');
      if (widget.current && window.turnstile)
        window.turnstile.reset(widget.current);
    } finally {
      submitting.current = false;
      onBusy(false);
      setProgress('');
    }
  }
  if (reference)
    return (
      <>
        <DialogTitle>Request received</DialogTitle>
        <DialogDescription>
          Thanks—your build selections and contact details have been saved for
          Nick to review.
        </DialogDescription>
        <p className="quote-reference">{reference}</p>
        <p>
          Keep this reference number. Nick will follow up using the contact
          details you provided.
        </p>
        <p>
          Have photos of your truck?{' '}
          <a
            href={`mailto:Aztruckshootout@gmail.com?subject=${encodeURIComponent(`${reference} — Truck photos`)}`}
          >
            Email photos to Nick
          </a>{' '}
          and include this reference number.
        </p>
        <p className="design-note">
          This is a build inquiry. Pricing, parts, and fitment will be confirmed
          with you.
        </p>
      </>
    );
  return (
    <>
      <DialogTitle>Send your build to Nick</DialogTitle>
      <DialogDescription>
        Tell us about your project. Nick will receive your contact details and
        selected build, with a link to review all four views.
      </DialogDescription>
      <div className="lead-build">
        {summary(configuration).Vehicle}
        <small>
          {summary(configuration)['Ride height']} ·{' '}
          {summary(configuration).Paint}
        </small>
      </div>
      <form
        onSubmit={submit}
        className="lead-form"
        onChange={() => {
          if (!submitting.current) attempt.current = null;
        }}
      >
        <fieldset disabled={!!progress} className="quote-fields">
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
              <label key={field.name} htmlFor={`quote-${field.name}`}>
                {field.label}
                <Input
                  id={`quote-${field.name}`}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.complete}
                  required
                  maxLength={160}
                />
              </label>
            ))}
            <label htmlFor="quote-owns">
              Do you already own the truck?
              <NativeSelect
                id="quote-owns"
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
            <label htmlFor="quote-budget">
              Target budget
              <Input
                id="quote-budget"
                name="budget"
                required
                maxLength={120}
                placeholder="Amount or range, or undecided"
              />
            </label>
            <label htmlFor="quote-timeline">
              Desired timeline
              <Input
                id="quote-timeline"
                name="timeline"
                required
                maxLength={120}
                placeholder="For example: 6–12 months or flexible"
              />
            </label>
          </div>
          <label htmlFor="quote-description">
            Project description
            <Textarea
              id="quote-description"
              name="description"
              required
              maxLength={3000}
              placeholder="How will you use the truck, and what matters most?"
            />
          </label>
          <p className="design-note">
            You can email truck photos after submitting. We’ll give you a
            reference number to include with them.
          </p>
          <div className="quote-honeypot" aria-hidden="true">
            <label>
              Company website
              <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <label className="quote-consent">
            <input type="checkbox" name="privacyConsent" value="yes" required />
            <span>
              I understand that AZ Sport Trucks will use my details and build
              selections to review and respond to this request.{' '}
              <a href="/privacy" target="_blank" rel="noreferrer">
                Privacy notice
              </a>
            </span>
          </label>
        </fieldset>
        <div ref={challenge} className="quote-challenge" />
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="design-button primary"
          disabled={!!progress || !token}
        >
          {progress || 'Send Request'}
        </button>
        <p aria-live="polite" className="design-note">
          {progress
            ? 'Please keep this form open until you see your reference number.'
            : 'Submitting a request does not place an order.'}
        </p>
      </form>
    </>
  );
}
