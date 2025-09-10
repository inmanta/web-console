import React, { useContext } from "react";
import { NavLink, useLocation } from "react-router";
import { Label, NavItem, Tooltip } from "@patternfly/react-core";
import { LockIcon } from "@patternfly/react-icons";
import { CompileReportsIndication } from "@/Slices/Resource/UI/ResourcesPage/Components/CompileReportsIndication";
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
  isActive?: boolean;
}

export const NavigationItem: React.FC<Link> = ({
  id,
  label,
  url,
  external,
  locked,
  statusIndication,
  isActive,
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

  return <RegularItem key={id} label={label} url={url} isActive={isActive} />;
};

const RegularItem: React.FC<Label & Url & { isActive?: boolean }> = ({ label, url, isActive }) => (
  <NavItem itemId={label} isActive={isActive}>
    <NavLink
      aria-label="Sidebar-Navigation-Item"
      to={{
        pathname: url,
        search: new SearchHelper().keepEnvOnly(location.search),
      }}
      end
    >
      {label}
    </NavLink>
  </NavItem>
);

const LockedItem: React.FC<Label> = ({ label }) => (
  <NavItem
    itemId={label}
    disabled
    preventDefault
    icon={
      <Tooltip content={"Select an environment to enable this link"} position="right">
        <LockIcon />
      </Tooltip>
    }
  >
    {label}
  </NavItem>
);

const ExternalItem: React.FC<Label & Url & { isActive?: boolean }> = ({ label, url, isActive }) => (
  <NavItem itemId={label} isActive={isActive}>
    <a href={url} target="_blank" rel="noreferrer" aria-label="Sidebar-Navigation-Item-External">
      {label}
    </a>
  </NavItem>
);

const CompileReportItem: React.FC<Label & Url & { isActive?: boolean }> = ({ label, url, isActive }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const isCompiling = environmentHandler.useIsCompiling();

  return (
    <NavItem itemId={label} isActive={isActive}>
      <NavLink
        to={{
          pathname: url,
          search: new SearchHelper().keepEnvOnly(location.search),
        }}
        end
        aria-label="Sidebar-Navigation-Item"
      >
        {label}
        {isCompiling && (
          <Tooltip key={"ongoing-compilation-tooltip"} content={"Compiling"}>
            <CompileReportsIndication role="presentation" aria-label="CompileReportsIndication" />
          </Tooltip>
        )}
      </NavLink>
    </NavItem>
  );
};
