import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { ParsedNumber, words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { Link } from "@inmanta/web-console-ui/Components/Link";

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
      <Button variant="link">{words("desiredState.actions.showResources")}</Button>
    </Link>
  );
};
