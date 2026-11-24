const profiles = [
  {
    platform: 'Facebook',
    name: 'The C10 Lover',
    href: 'https://www.facebook.com/profile.php?id=100087361065035',
  },
  {
    platform: 'Instagram',
    name: '@thec10lover',
    href: 'https://www.instagram.com/thec10lover/',
  },
];

export function SocialLinks() {
  return (
    <div className="social-links" role="group" aria-label="Find us on social">
        {profiles.map(({ platform, name, href }) => (
          <a key={platform} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${platform}: ${name} (opens in a new tab)`} title={`${platform}: ${name} (opens in a new tab)`}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" focusable="false">
              {platform === 'Facebook' ? (
                <path fill="currentColor" d="M14 21v-8h2.7l.4-3H14V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.6v8H14Z" />
              ) : (
                <g stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </g>
              )}
            </svg>
          </a>
        ))}
    </div>
  );
}
