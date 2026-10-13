// Shared by the build (release.ts) and the browser (scripts/live.ts), so both write the same.

// "October 13, 2026"
export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// Below this the star count says little; the button then just invites a star.
export const STAR_THRESHOLD = 10;
