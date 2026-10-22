import React from "react";
import { Outlet } from "react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SearchSanitizer } from "@/UI/Routing";
import { GlobalStyles } from "@/UI/Styles";
import { getThemePreference, setThemePreference } from "../Components/DarkmodeOption";

/**
 * The layout of the app. The matched route (see `createRootRoutes`) renders in its `Outlet`.
 */
export const Root: React.FC = () => {
  const themePreference = getThemePreference();

  setThemePreference(themePreference || "light");

  // This is done because the StyledComponents package is not fully compatible with React 18 typing definitions.
  // https://github.com/styled-components/styled-components/issues/3738
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const GlobalStyleProxy: any = GlobalStyles;

  return (
    <>
      <ReactQueryDevtools initialIsOpen={false} />
      <GlobalStyleProxy />
      <SearchSanitizer.Provider>
        <Outlet />
      </SearchSanitizer.Provider>
    </>
  );
};
