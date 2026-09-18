import React, { forwardRef } from "react";
import { Link as RRLink, useLocation } from "react-router";
import styled from "styled-components";
import { SearchHelper } from "@/UI/Routing";

interface Props {
  isDisabled?: boolean;
  pathname: string;
  envOnly?: boolean;
  search?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: "plain" | "default";
  fitContent?: boolean;
}

export const Link: React.FC<Props> = forwardRef<HTMLAnchorElement, Props>(
  (
    {
      children,
      isDisabled,
      pathname,
      envOnly,
      search: newSearch,
      className,
      variant = "default",
      fitContent = false,
    },
    ref
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
      <StyledRRLink
        to={{ pathname, search }}
        className={className}
        ref={ref}
        $variant={variant}
        $fitContent={fitContent}
      >
        {children}
      </StyledRRLink>
    );
  }
);

const StyledRRLink = styled(RRLink)<{ $variant?: "plain" | "default"; $fitContent?: boolean }>`
  display: inline-block;
  ${({ $fitContent }) => (!$fitContent ? "width: 100%;" : "")}
  color: ${({ $variant }) =>
    $variant === "plain" ? "inherit" : "var(--pf-t--global--text--color--link--default)"};
  ${({ $variant }) => ($variant === "plain" ? "text-decoration:none" : "")};
`;
