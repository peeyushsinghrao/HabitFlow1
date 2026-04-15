export function normalizeEmail(email: unknown) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function userIdFromEmail(email: unknown) {
  const normalized = normalizeEmail(email);
  return normalized ? `email:${normalized}` : 'default-user';
}

function getCookieValue(cookieHeader: string | null, name: string): string {
  if (!cookieHeader) return '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export function getRequestUserId(request: Request) {
  const headerUserId = request.headers.get('x-nuviora-user-id');
  if (headerUserId && headerUserId !== 'default-user') return headerUserId;

  const emailUserId = userIdFromEmail(request.headers.get('x-nuviora-email'));
  if (emailUserId !== 'default-user') return emailUserId;

  const cookieUserId = getCookieValue(request.headers.get('cookie'), 'nuviora-session');
  if (cookieUserId && cookieUserId !== 'default-user') return cookieUserId;

  return 'default-user';
}
