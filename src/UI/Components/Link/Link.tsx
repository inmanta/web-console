import { SearchHelper } from "@/UI";
import React from "react";
import { Link as RRLink, useLocation } from "react-router-dom";

interface Props {
  isDisabled?: boolean;
  pathname: string;
  envOnly?: boolean;
}

export const Link: React.FC<Props> = ({
  children,
  isDisabled,
  pathname,
  envOnly,
}) => {
  const { search } = useLocation();
  return isDisabled ? (
    <>{children}</>
  ) : (
    <RRLink
      to={{
        pathname,
        search: envOnly ? new SearchHelper().keepEnvOnly(search) : search,
      }}
    >
      {children}
    </RRLink>
  );
};
