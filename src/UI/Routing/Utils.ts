import { generatePath } from "react-router-dom";
import { getPageFromKind, PageParams, Kinds } from "./Page";

export function getUrl(kind: Kinds, params: PageParams<typeof kind>): string {
  const page = getPageFromKind(kind);
  return generatePath(page.path, params);
}
