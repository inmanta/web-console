import React, { lazy, Suspense, useContext, useEffect, useMemo } from "react";
import { Outlet } from "react-router";
import { DependencyContext } from "@/UI/Dependency";
import { SearchSanitizer } from "@/UI/Routing";
import { GlobalStyles } from "@/UI/Styles";
import { getThemePreference, setThemePreference } from "../Components/DarkmodeOption";
import { PrimaryPageManager } from "./PrimaryPageManager";

const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((mod) => ({
    default: mod.ReactQueryDevtools,
  }))
);

/**
 * The layout of the app. The matched route (see `createRootRoutes`) renders in its `Outlet`.
 */
export const Root: React.FC = () => {
  const { routeManager, features } = useContext(DependencyContext);
  const themePreference = getThemePreference();

  setThemePreference(themePreference || "light");

  const pageManager = useMemo(
    () => PrimaryPageManager(routeManager.getRoutes(), features),
    [routeManager, features]
  );

  // Fetch the other pages in the background, so they open without a loading view.
  useEffect(() => pageManager.preloadPages(), [pageManager]);

  // This is done because the StyledComponents package is not fully compatible with React 18 typing definitions.
  // https://github.com/styled-components/styled-components/issues/3738
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const GlobalStyleProxy: any = GlobalStyles;

  return (
    <>
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
      <GlobalStyleProxy />
      <SearchSanitizer.Provider>
        <Outlet />
      </SearchSanitizer.Provider>
    </>
  );
};
