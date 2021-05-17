import { generatePath } from "react-router-dom";
import { getLineageFromPage, getPageWithParamsFromUrl, Kinds } from "./Page";

interface Crumb {
  kind: Kinds;
  label: string;
  url: string;
  active: boolean;
}

export function getCrumbs(url: string): Crumb[] {
  const pageWithParams = getPageWithParamsFromUrl(url);
  if (typeof pageWithParams === "undefined") return [];
  const [page, params] = pageWithParams;
  const lineage = getLineageFromPage(page);
  return lineage.map(({ kind, label, path }, idx) => ({
    kind,
    label,
    url: generatePath(path, params),
    active: idx === lineage.length - 1,
  }));
}
