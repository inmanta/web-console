import React, { useContext } from "react";
import { Button, ButtonVariant, Truncate } from "@patternfly/react-core";
import { Link } from "@/UI/Components/Link";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  resourceId: string;
  linkText?: string;
  variant?: ButtonVariant;
  isInline?: boolean;
}

/**
 * Renders a link to a resource's details page, keeping the current environment.
 * Blocks (tables) get a button-styled link that truncates long ids; inline links
 * (e.g. inside a title) flow with and inherit the surrounding text.
 *
 * @example <ResourceLink resourceId="std::File[a,path=/tmp]" /> -> link to /resources/std::File...?env=...
 */
export const ResourceLink: React.FC<Props> = ({
  resourceId,
  linkText,
  variant = ButtonVariant.link,
  isInline = false,
}) => {
  const { routeManager } = useContext(DependencyContext);
  const pathname = routeManager.getUrl("ResourceDetails", { resourceId });

  if (isInline) {
    return (
      <Link pathname={pathname} envOnly isInline>
        {linkText ? linkText : resourceId}
      </Link>
    );
  }

  return (
    <Link pathname={pathname} envOnly>
      <Button variant={variant} component="span">
        <Truncate content={linkText ? linkText : resourceId} />
      </Button>
    </Link>
  );
};
