import React, { forwardRef } from "react";
import { Link as RRLink, useLocation } from "react-router-dom";
import { SearchHelper } from "@/UI";

interface Props {
  isDisabled?: boolean;
  pathname: string;
  envOnly?: boolean;
  search?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Link: React.FC<Props> = forwardRef<HTMLAnchorElement, Props>(
  (
    { children, isDisabled, pathname, envOnly, search: newSearch, className },
    ref,
  ) => {
    const { search: currentSearch } = useLocation();
    const search = newSearch
      ? newSearch
      : envOnly
      ? new SearchHelper().keepEnvOnly(currentSearch)
      : currentSearch;

    return isDisabled ? (
      <>{children}</>
    ) : (
      <RRLink to={{ pathname, search }} className={className} ref={ref}>
        {children}
      </RRLink>
    );
  },
);
