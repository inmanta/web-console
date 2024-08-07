import React, { useContext, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Label, NavItem, Tooltip } from "@patternfly/react-core";
import { LockIcon } from "@patternfly/react-icons";
import styled, { keyframes } from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
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
  statusIndication: boolean;
}

export const NavigationItem: React.FC<Link> = ({
  id,
  label,
  url,
  external,
  locked,
  statusIndication,
}) => {
  if (locked) {
    return <LockedItem label={label} key={id} />;
  }
  if (external) {
    return <ExternalItem label={label} url={url} key={id} />;
  }
  if (statusIndication) {
    return <CompileReportItem label={label} url={url} key={id} />;
  }

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
        "pf-v5-c-nav__link" + (isActive ? " pf-v5-m-current" : "")
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
    <a
      className="pf-v5-c-nav__link"
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      {label}
    </a>
  </NavItem>
);

const CompileReportItem: React.FC<Label & Url> = ({ label, url }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useContinuous<"GetCompilationState">({
    kind: "GetCompilationState",
  });

  useEffect(() => {
    document.addEventListener("CompileTrigger", retry);

    return () => {
      document.removeEventListener("CompileTrigger", retry);
    };
  }, [data, retry]);

  return (
    <NavItem styleChildren={false}>
      <NavLink
        to={{
          pathname: url,
          search: new SearchHelper().keepEnvOnly(location.search),
        }}
        className={({ isActive }) =>
          "pf-v5-c-nav__link" + (isActive ? " pf-v5-m-current" : "")
        }
        end
      >
        {label}
        {data.kind === "Success" && data.value === true && (
          <Tooltip key={"ongoing-compilation-tooltip"} content={"Compiling"}>
            <StyledIndication
              aria-label="CompileReportsIndication"
              className="--pf-v5-c-label--m-blue__content--before--BorderColor"
            />
          </Tooltip>
        )}
      </NavLink>
    </NavItem>
  );
};

const StyledNavItem = styled(NavItem)`
  --pf-v5-c-nav__link--hover--BackgroundColor: none;
  --pf-v5-c-nav__link--active--BackgroundColor: none;
`;

const StyledLockIcon = styled(LockIcon)`
  transform: scale(0.7) translateY(2px);
  margin-left: 4px;
`;

const StyledTooltip = styled(Tooltip)`
  --pf-v5-c-tooltip__content--Color: black;
  --pf-v5-c-tooltip__content--BackgroundColor: white;
`;

//Indication colors based on <Label color="blue" /> component
const pendingAnimation = keyframes`
 0% { opacity: .2}
 50% { opacity: 1}
 100% { opacity: .2}
`;

const StyledIndication = styled.div`
  width: 10px;
  height: 10px;
  margin-left: 10px;
  position: relative;
  &::before {
    position: absolute;
    top: 1px;
    content: "";
    background-color: #e7f1fa;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid #bee1f4;
    animation: ${pendingAnimation} 2s infinite;
  }
`;
