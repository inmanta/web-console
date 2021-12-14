import React from "react";
import { NavLink } from "react-router-dom";
import { NavItem, Tooltip } from "@patternfly/react-core";
import { LockIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { SearchHelper } from "@/UI/Routing";

interface Label {
  label: string;
}

interface Url {
  url: string;
}

interface Link extends Label, Url {
  id: string;
  external: boolean;
  locked: boolean;
}

export const NavigationItem: React.FC<Link> = ({
  id,
  label,
  url,
  external,
  locked,
}) => {
  if (locked) return <LockedItem label={label} key={id} />;
  if (external) return <ExternalItem label={label} url={url} key={id} />;
  return <RegularItem key={id} label={label} url={url} />;
};

const RegularItem: React.FC<Label & Url> = ({ label, url }) => (
  <NavItem styleChildren={false}>
    <NavLink
      to={{
        pathname: url,
        search: new SearchHelper().keepEnvOnly(location.search),
      }}
      className={({ isActive }) =>
        "pf-c-nav__link" + (isActive ? " pf-m-current" : "")
      }
      end
    >
      {label}
    </NavLink>
  </NavItem>
);

const LockedItem: React.FC<Label> = ({ label }) => (
  <StyledNavItem styleChildren={false}>
    {label}
    <StyledTooltip
      content={"Select an environment to enable this link"}
      position="right"
    >
      <StyledLockIcon />
    </StyledTooltip>
  </StyledNavItem>
);

const ExternalItem: React.FC<Label & Url> = ({ label, url }) => (
  <NavItem styleChildren={false}>
    <a className="pf-c-nav__link" href={url} target="_blank" rel="noreferrer">
      {label}
    </a>
  </NavItem>
);

const StyledNavItem = styled(NavItem)`
  --pf-c-nav__link--hover--BackgroundColor: none;
  --pf-c-nav__link--active--BackgroundColor: none;
`;

const StyledLockIcon = styled(LockIcon)`
  transform: scale(0.7) translateY(2px);
  margin-left: 4px;
`;

const StyledTooltip = styled(Tooltip)`
  --pf-c-tooltip__content--Color: black;
  --pf-c-tooltip__content--BackgroundColor: white;
`;
