import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { DependencyContext } from "@/UI";
import { Link } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  version: ParsedNumber;
}

export const ResourcesLink: React.FC<Props> = ({ version }) => {
  const { routeManager } = useContext(DependencyContext);

  return (
    <Link
      pathname={routeManager.getUrl("DesiredStateDetails", {
        version: version.toString(),
      })}
    >
      <Button variant="link">
        {words("desiredState.actions.showResources")}
      </Button>
    </Link>
  );
};
