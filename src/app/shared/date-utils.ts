
export function dateToIso(value: string): string {
  return new Date(value + 'T00:00:00Z').toISOString();
}

export function localToIso(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  return new Date(value).toISOString();
}
