import { SearchHelper } from "@/UI";
import React from "react";
import { Link as RRLink, useLocation } from "react-router-dom";

interface Props {
  isDisabled?: boolean;
  pathname: string;
  envOnly?: boolean;
  search?: string;
}

export const Link: React.FC<Props> = ({
  children,
  isDisabled,
  pathname,
  envOnly,
  search: newSearch,
}) => {
  const { search: currentSearch } = useLocation();
  return isDisabled ? (
    <>{children}</>
  ) : (
    <RRLink
      to={{
        pathname,
        search: newSearch
          ? newSearch
          : envOnly
          ? new SearchHelper().keepEnvOnly(currentSearch)
          : currentSearch,
      }}
    >
      {children}
    </RRLink>
  );
};
