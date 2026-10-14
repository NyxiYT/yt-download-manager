// Shared by the build and the browser (scripts/live.ts), so both write dates the same way.

// "October 13, 2026"
export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// "13 Oct 2026", for the mono labels
export const formatDateShort = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
