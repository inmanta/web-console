import qs from "qs";

export class UrlHelper {
  clean(search: string): string {
    const sanitized = this.sanitize(search);
    const parsed = this.parse(sanitized);
    return this.stringify({ env: parsed.env });
  }

  sanitize(search: string): string {
    if (search.startsWith("?")) return search.slice(1);
    return search;
  }

  parse(search: string): Record<string, unknown> {
    return qs.parse(search, { allowDots: true });
  }

  stringify(value: Record<string, unknown>): string {
    return qs.stringify(value, { allowDots: true });
  }
}
