/**
 * The personal mark (concept C, "pillars and points"), redrawn from the PNG boards in src/assets/logo.
 * In the page it takes the site's colors: ink pillars, accent dots. The favicon keeps the brand colors.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128.5 100" aria-hidden="true" focusable="false">
      <rect width="22" height="100" rx="7.5" fill="currentColor" />
      <rect x="106.5" width="22" height="100" rx="7.5" fill="currentColor" />
      <circle cx="37.75" cy="11" r="11" fill="var(--accent)" />
      <circle cx="91" cy="11" r="11" fill="var(--accent)" />
      <circle cx="64.25" cy="41" r="11" fill="var(--accent-2)" />
    </svg>
  );
}
