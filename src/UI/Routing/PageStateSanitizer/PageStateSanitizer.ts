import { getKeysExcluding, RouteManager, RouteKind } from "@/Core";

export class PageStateSanitizer {
  constructor(private readonly routeManager: RouteManager) {}

  isSanitized(
    routeKind: RouteKind,
    pageState: Record<string, unknown>,
  ): boolean {
    const lineage = this.routeManager.getLineageFromRoute(
      this.routeManager.getRoute(routeKind),
    );
    const kinds = lineage.map((route) => route.kind);
    if (getKeysExcluding(kinds, pageState).length > 0) return false;
    return true;
  }

  sanitize(
    routeKind: RouteKind,
    pageState: Record<string, unknown>,
  ): Record<string, unknown> {
    const lineage = this.routeManager.getLineageFromRoute(
      this.routeManager.getRoute(routeKind),
    );
    const kinds = lineage.map((route) => route.kind);
    return Object.keys(pageState).reduce((acc, cur) => {
      if (kinds.includes(cur as RouteKind)) {
        acc[cur] = pageState[cur];
      }
      return acc;
    }, {});
  }
}
