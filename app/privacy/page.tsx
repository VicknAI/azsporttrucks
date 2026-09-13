import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata({
  path: '/privacy',
  title: 'Privacy Notice | AZ Sport Trucks',
  description:
    'How AZ Sport Trucks uses build inquiries, contact details, uploaded photos, and locally saved designs.',
});
export default function Privacy() {
  return (
    <main id="main" className="section privacy-page">
      <span className="eyebrow">AZ SPORT TRUCKS</span>
      <h1>PRIVACY NOTICE.</h1>
      <p>Updated September 13, 2026</p>
      <h2>Build inquiries</h2>
      <p>
        When you send a quote request through this website, we collect the
        contact details and project information you enter, your selected build
        and four preview images, and any truck photos you choose to include.
        Nick uses this information to review your project and respond to you.
      </p>
      <p>
        Direct website submissions are stored privately with Cloudflare. An
        email notification is sent to AZ Sport Trucks’ Gmail inbox, with a
        private link to the request and its pictures. These records are separate
        from public build-sharing links.
      </p>
      <h2>Designs saved on your device</h2>
      <p>
        Designing a truck does not require your contact details. Drafts and the
        Save Build feature use storage in your browser. Shared build links
        contain the truck configuration, not the contact details or photos you
        enter. Clearing browser data can remove locally saved builds.
      </p>
      <h2>Email preparation</h2>
      <p>
        If you use the email preparation option, the website opens a draft for
        you to send from your own email app. Your message and attachments are
        sent only when you send that email.
      </p>
      <h2>Hosting and security</h2>
      <p>
        Cloudflare provides website hosting, traffic measurement, and security
        services. The direct-submission form uses Cloudflare Turnstile and
        request limits to reduce automated abuse. Security processing may
        include your IP address and browser information.
      </p>
      <h2>Your information</h2>
      <p>
        Quote information is used to handle your inquiry and related business
        follow-up. To ask about information you have sent, request a correction
        or deletion, or raise a privacy question, contact Nick at{' '}
        <a href="mailto:Aztruckshootout@gmail.com">Aztruckshootout@gmail.com</a>
        . Include your request reference if you have one.
      </p>
    </main>
  );
}
