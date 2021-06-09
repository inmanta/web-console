import { generatePath } from "react-router-dom";
import { PageParams, Kinds } from "./Page";
import { getPageFromKind } from "./Pages";

export function getUrl(kind: Kinds, params: PageParams<typeof kind>): string {
  const page = getPageFromKind(kind);
  return generatePath(page.path, params);
}
