import React, { useContext } from "react";
import { Link } from "react-router";
import { Button } from "@patternfly/react-core";
import { words } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  compileId;
}

export const CompileReportLink: React.FC<Props> = ({ compileId }) => {
  const { routeManager } = useContext(DependencyContext);

  if (!routeManager.has("CompileDetails")) {
    return null;
  }

  return (
    <Link
      to={{
        pathname: routeManager.getUrl("CompileDetails", {
          id: compileId,
        }),
        search: location.search,
      }}
    >
      <Button variant="link" isInline>
        {words("events.details.compileReport")}
      </Button>
    </Link>
  );
};
