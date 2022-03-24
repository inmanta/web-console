import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { Link } from "@/UI/Components/Link";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  resourceId: string;
  linkText?: string;
}

export const ResourceLink: React.FC<Props> = ({ resourceId, linkText }) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <Link
      pathname={routeManager.getUrl("ResourceDetails", {
        resourceId,
      })}
      envOnly
    >
      <Button variant="link">{linkText ? linkText : resourceId}</Button>
    </Link>
  );
};
