import React, { useContext, useEffect } from "react";
import { NavLink } from "react-router-dom";
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
  <NavItem>
    <NavLink
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
    disabled
    preventDefault
    icon={
      <Tooltip
        content={"Select an environment to enable this link"}
        position="right"
      >
        <LockIcon />
      </Tooltip>
    }
  >
    {label}
  </NavItem>
);

const ExternalItem: React.FC<Label & Url> = ({ label, url }) => (
  <NavItem>
    <a href={url} target="_blank" rel="noreferrer">
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
    <NavItem>
      <NavLink
        to={{
          pathname: url,
          search: new SearchHelper().keepEnvOnly(location.search),
        }}
        end
      >
        {label}
        {data.kind === "Success" && data.value === true && (
          <Tooltip key={"ongoing-compilation-tooltip"} content={"Compiling"}>
            <CompileReportsIndication aria-label="CompileReportsIndication" />
          </Tooltip>
        )}
      </NavLink>
    </NavItem>
  );
};
