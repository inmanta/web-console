import { getLineageFromRoute } from "@/UI/Routing/Utils";
import { getRouteFromKind } from "@/UI/Routing/Route";
import { Kind } from "@/UI/Routing/Kind";
import { getKeysExcluding } from "@/Core";

export class PageStateSanitizer {
  isSanitized(routeKind: Kind, pageState: Record<string, unknown>): boolean {
    const lineage = getLineageFromRoute(getRouteFromKind(routeKind));
    const kinds = lineage.map((route) => route.kind);
    if (getKeysExcluding(kinds, pageState).length > 0) return false;
    return true;
  }

  sanitize(
    routeKind: Kind,
    pageState: Record<string, unknown>
  ): Record<string, unknown> {
    const lineage = getLineageFromRoute(getRouteFromKind(routeKind));
    const kinds = lineage.map((route) => route.kind);
    return Object.keys(pageState).reduce((acc, cur) => {
      if (kinds.includes(cur as Kind)) {
        acc[cur] = pageState[cur];
      }
      return acc;
    }, {});
  }
}
