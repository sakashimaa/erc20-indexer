// theres no other way to identify error because each provider returns his own message
// so we just define as much as possible
export function isRangeTooLargeError(err: unknown): boolean {
  const msg =
    err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();

  return (
    msg.includes('block range') ||
    msg.includes('too many results') ||
    msg.includes('query returned more than') ||
    msg.includes('response size exceeded') ||
    msg.includes('limit exceeded')
  );
}
