/** Only allow same-origin relative paths (block open redirects). */
export function safeInternalPath(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith('/') || next.startsWith('//')) return null;
  return next;
}

export function defaultHomeForRole(role?: 'admin' | 'customer' | null): string {
  return role === 'admin' ? '/admin' : '/account';
}
