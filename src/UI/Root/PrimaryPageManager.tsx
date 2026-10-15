import React, { ComponentType, lazy, Suspense } from "react";
import { FeatureModule, PageLoader, PageManager, Page, Route, RouteKind } from "@/Core";
import { LoadingView } from "@/UI/Components/LoadingView";

/**
 * The lazy component of each page loader. The page manager is rebuilt whenever the route manager
 * is, so the lazy components are kept here: a new component for the same page would remount it.
 */
const lazyPages = new WeakMap<PageLoader, ComponentType>();

/**
 * Wraps a page loader in a lazy component, so the page's code is only fetched when it is opened.
 *
 * @param loadPage - loads the page component
 * @returns the page element, with a loading view while the page is fetched
 */
const lazyPage = (loadPage: PageLoader): React.ReactElement => {
  let LazyPage = lazyPages.get(loadPage);

  if (LazyPage === undefined) {
    LazyPage = lazy(() => loadPage().then((page) => ({ default: page })));
    lazyPages.set(loadPage, LazyPage);
  }

  return (
    <Suspense fallback={<LoadingView ariaLabel="LoadingPage" />}>
      <LazyPage />
    </Suspense>
  );
};

/**
 * Builds the pages of the registered routes from the features that declare them.
 */
export class PrimaryPageManager implements PageManager {
  private readonly pageLoaders: Map<RouteKind, PageLoader>;

  /**
   * @param routes - the registered routes
   * @param features - the features the app ships
   */
  constructor(
    private readonly routes: Route[],
    features: FeatureModule[]
  ) {
    this.pageLoaders = new Map(
      features.flatMap((feature) =>
        feature.routes.map(({ route, page }): [RouteKind, PageLoader] => [route("").kind, page])
      )
    );
  }

  getPages(): Page[] {
    return this.routes.map((route) => {
      const loadPage = this.pageLoaders.get(route.kind);

      return { ...route, element: loadPage ? lazyPage(loadPage) : null };
    });
  }
}
