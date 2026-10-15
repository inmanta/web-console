import React, { ComponentType, lazy, Suspense, useState } from "react";
import { FeatureModule, PageLoader, PageManager, Page, Route, RouteKind } from "@/Core";
import { LoadingView } from "@/UI/Components/LoadingView";
import { Delayed } from "@/UI/Utils";

/**
 * How long a page may take to load before the loading view is shown, in ms. Most pages load
 * faster, so they open without a loading view flashing by.
 */
const LOADING_VIEW_DELAY = 300;

/**
 * How many pages are fetched at the same time when preloading.
 */
const PRELOAD_BATCH_SIZE = 4;

/**
 * The page manager is rebuilt whenever the route manager is, so what is known about each page is
 * kept here, by page loader, instead of in the page manager.
 */
const loadedPages = new WeakMap<PageLoader, ComponentType>();
const pageRequests = new WeakMap<PageLoader, Promise<ComponentType>>();
const lazyPages = new WeakMap<PageLoader, ComponentType>();

/**
 * Loads a page once: opening the page and preloading it share the same request.
 * A failed request is forgotten, so opening the page tries again.
 *
 * @param loadPage - loads the page component
 * @returns the page component
 */
const requestPage = (loadPage: PageLoader): Promise<ComponentType> => {
  let request = pageRequests.get(loadPage);

  if (request === undefined) {
    request = loadPage().then(
      (page) => {
        loadedPages.set(loadPage, page);

        return page;
      },
      (error) => {
        pageRequests.delete(loadPage);
        throw error;
      }
    );
    pageRequests.set(loadPage, request);
  }

  return request;
};

/**
 * Returns the lazy component of a page. It is kept per page loader: a new component for the same
 * page would remount it.
 *
 * @param loadPage - loads the page component
 * @returns the lazy page component
 */
const getLazyPage = (loadPage: PageLoader): ComponentType => {
  let LazyPage = lazyPages.get(loadPage);

  if (LazyPage === undefined) {
    LazyPage = lazy(() => requestPage(loadPage).then((page) => ({ default: page })));
    lazyPages.set(loadPage, LazyPage);
  }

  return LazyPage;
};

/**
 * Renders a page. A page that is already loaded renders right away; otherwise it is loaded first,
 * and the loading view is shown when that takes a while.
 */
const FeaturePage: React.FC<{ loadPage: PageLoader }> = ({ loadPage }) => {
  // Decided once, when the page mounts: switching from the lazy page to the loaded one later
  // would remount the page.
  const [LoadedPage] = useState(() => loadedPages.get(loadPage));

  if (LoadedPage !== undefined) {
    return <LoadedPage />;
  }

  const LazyPage = getLazyPage(loadPage);

  return (
    <Suspense
      fallback={
        <Delayed delay={LOADING_VIEW_DELAY}>
          <LoadingView ariaLabel="LoadingPage" />
        </Delayed>
      }
    >
      <LazyPage />
    </Suspense>
  );
};

/**
 * Calls the callback once the browser is idle.
 *
 * @param callback - the function to call
 * @returns a function that cancels the call
 */
const whenIdle = (callback: () => void): (() => void) => {
  if (typeof globalThis.requestIdleCallback === "function") {
    const id = globalThis.requestIdleCallback(callback);

    return () => globalThis.cancelIdleCallback(id);
  }

  const id = setTimeout(callback, 200);

  return () => clearTimeout(id);
};

/**
 * Builds the pages of the registered routes from the features that declare them.
 */
export class PrimaryPageManager implements PageManager {
  private readonly pageLoaders: Map<RouteKind, PageLoader>;
  private readonly preloadedKinds: Set<RouteKind>;

  /**
   * @param routes - the registered routes
   * @param features - the features the app ships
   */
  constructor(
    private readonly routes: Route[],
    features: FeatureModule[]
  ) {
    const featureRoutes = features.flatMap(({ routes, preload = true }) =>
      routes.map(({ route, page }) => ({ kind: route("").kind, page, preload }))
    );

    this.pageLoaders = new Map(featureRoutes.map(({ kind, page }) => [kind, page]));
    this.preloadedKinds = new Set(
      featureRoutes.filter(({ preload }) => preload).map(({ kind }) => kind)
    );
  }

  getPages(): Page[] {
    return this.routes.map((route) => {
      const loadPage = this.pageLoaders.get(route.kind);

      return {
        ...route,
        // Keyed by kind: when two routes render a page at the same place, the page of the new
        // route mounts instead of taking over the state of the previous one.
        element: loadPage ? <FeaturePage key={route.kind} loadPage={loadPage} /> : null,
      };
    });
  }

  preloadPages(): () => void {
    const loaders = this.routes
      .filter(({ kind }) => this.preloadedKinds.has(kind))
      .map(({ kind }) => this.pageLoaders.get(kind))
      .filter((loadPage): loadPage is PageLoader => loadPage !== undefined)
      .filter((loadPage) => !loadedPages.has(loadPage));

    let cancelled = false;
    let cancelNext = () => {};

    const preloadFrom = (index: number): void => {
      if (cancelled || index >= loaders.length) {
        return;
      }

      cancelNext = whenIdle(() => {
        const batch = loaders.slice(index, index + PRELOAD_BATCH_SIZE);

        // A page that fails to preload is fetched again when it is opened.
        Promise.allSettled(batch.map(requestPage)).then(() =>
          preloadFrom(index + PRELOAD_BATCH_SIZE)
        );
      });
    };

    preloadFrom(0);

    return () => {
      cancelled = true;
      cancelNext();
    };
  }
}
