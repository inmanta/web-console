import React, {
  Component,
  ComponentType,
  ErrorInfo,
  lazy,
  ReactNode,
  Suspense,
  useState,
} from "react";
import {
  FeatureModule,
  PageLoader,
  PageManager,
  Page,
  Route,
  RouteKind,
} from "@inmanta/web-console-core";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { Delayed } from "@inmanta/web-console-ui/Utils";

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
 * A failed request is forgotten, so the next request for the page fetches it again.
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
 * Set when the app reloads because a page failed to open, and cleared once a page opens.
 */
const RELOADED_KEY = "inmanta_page_load_reload";

/**
 * Reloads the app once when a page fails to open. After an upgrade, the files of the pages
 * change name, so the app that is still open asks for files that are gone; only a reload gets the
 * new ones. When the page still fails after the reload, its error is shown instead.
 *
 * @returns whether the app reloads
 */
const reloadOnce = (): boolean => {
  try {
    if (sessionStorage.getItem(RELOADED_KEY) !== null) {
      return false;
    }

    sessionStorage.setItem(RELOADED_KEY, "true");
  } catch {
    // Without storage, a reload could not be told apart from the next one, so don't reload.
    return false;
  }

  globalThis.location.reload();

  return true;
};

/**
 * Forgets that the app reloaded, so the next page that fails to open may reload it again.
 */
const clearReload = (): void => {
  try {
    sessionStorage.removeItem(RELOADED_KEY);
  } catch {
    // Nothing to clear.
  }
};

/**
 * Returns the lazy component of a page. It is kept per page loader: a new component for the same
 * page would remount it. A lazy component keeps a failed load, so it is forgotten when the page
 * fails to open, and opening the page again tries again.
 *
 * @param loadPage - loads the page component
 * @returns the lazy page component
 */
const getLazyPage = (loadPage: PageLoader): ComponentType => {
  let LazyPage = lazyPages.get(loadPage);

  if (LazyPage === undefined) {
    LazyPage = lazy(() =>
      requestPage(loadPage).then(
        (page) => {
          clearReload();

          return { default: page };
        },
        (error) => {
          lazyPages.delete(loadPage);

          if (reloadOnce()) {
            // Keep the loading view until the app reloads.
            return new Promise<never>(() => {});
          }

          throw error;
        }
      )
    );
    lazyPages.set(loadPage, LazyPage);
  }

  return LazyPage;
};

interface PageErrorBoundaryState {
  error?: Error;
}

/**
 * Shows the error of a page that fails to load or render in place of the page, so the rest of the
 * app stays usable. Retrying renders the page again.
 */
class PageErrorBoundary extends Component<{ children: ReactNode }, PageErrorBoundaryState> {
  public state: PageErrorBoundaryState = {};

  public static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Page error:", error, errorInfo);
  }

  public render() {
    if (this.state.error !== undefined) {
      return (
        <ErrorView
          ariaLabel="PageError"
          message={this.state.error.message}
          retry={() => this.setState({ error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Renders a page, with its errors kept to the page.
 */
const FeaturePage: React.FC<{ loadPage: PageLoader }> = ({ loadPage }) => (
  <PageErrorBoundary>
    <FeaturePageContent loadPage={loadPage} />
  </PageErrorBoundary>
);

/**
 * Renders a page. A page that is already loaded renders right away; otherwise it is loaded first,
 * and the loading view is shown when that takes a while.
 */
const FeaturePageContent: React.FC<{ loadPage: PageLoader }> = ({ loadPage }) => {
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
 *
 * @param routes - the registered routes
 * @param features - the features the app ships
 * @returns the page manager
 */
export function PrimaryPageManager(routes: Route[], features: FeatureModule[]): PageManager {
  const featureRoutes = features.flatMap(({ routes, preload = true }) =>
    routes.map(({ route, page }) => ({ kind: route("").kind, page, preload }))
  );

  const pageLoaders = new Map<RouteKind, PageLoader>(
    featureRoutes.map(({ kind, page }) => [kind, page])
  );
  const preloadedKinds = new Set<RouteKind>(
    featureRoutes.filter(({ preload }) => preload).map(({ kind }) => kind)
  );

  function getPages(): Page[] {
    return routes.map((route) => {
      const loadPage = pageLoaders.get(route.kind);

      return {
        ...route,
        // Keyed by kind: when two routes render a page at the same place, the page of the new
        // route mounts instead of taking over the state of the previous one.
        element: loadPage ? <FeaturePage key={route.kind} loadPage={loadPage} /> : null,
      };
    });
  }

  function preloadPages(): () => void {
    const loaders = routes
      .filter(({ kind }) => preloadedKinds.has(kind))
      .map(({ kind }) => pageLoaders.get(kind))
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

  return {
    getPages,
    preloadPages,
  };
}
