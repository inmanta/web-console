import { generatePath, matchPath } from "react-router-dom";
import { pages, CatalogPage, Page, getPagesFromPage } from "./Page";

interface Crumb {
  label: string;
  url: string;
  active: boolean;
}

type Params = { [paramName: string]: string | number | boolean | undefined };

function getPageWithParams(url: string): [Page, Params] | undefined {
  const page = pages.find(
    ({ path }) => matchPath(url, { path, exact: true }) !== null
  );
  if (typeof page === "undefined") return undefined;
  const match = matchPath(url, { path: page.path, exact: true });
  if (match === null) return undefined;
  return [page, match.params];
}

export function getBreadcrumbs(url: string): Crumb[] {
  const pair = getPageWithParams(url);
  if (typeof pair === "undefined") {
    return [{ label: CatalogPage.label, url: CatalogPage.path, active: false }];
  }
  const [page, params] = pair;
  const pages = getPagesFromPage(page);

  return pages.map((page, idx) => ({
    label: page.label,
    url: generatePath(page.path, params),
    active: idx === pages.length - 1,
  }));
}
