import React, { useContext } from "react";
import { Button, ButtonVariant, Truncate } from "@patternfly/react-core";
import { Link } from "@/UI/Components/Link";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  resourceId: string;
  linkText?: string;
  variant?: ButtonVariant;
}

export const ResourceLink: React.FC<Props> = ({
  resourceId,
  linkText,
  variant = ButtonVariant.link,
}) => {
  const { routeManager } = useContext(DependencyContext);

  return (
    <Link
      pathname={routeManager.getUrl("ResourceDetails", {
        resourceId,
      })}
      envOnly
    >
      <Button variant={variant}>
        <Truncate content={linkText ? linkText : resourceId} />
      </Button>
    </Link>
  );
};
