import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Button } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  compileId;
}

export const CompileReportLink: React.FC<Props> = ({ compileId }) => {
  const { routeManager } = useContext(DependencyContext);
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
