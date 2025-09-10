import React, { useContext } from "react";
import { Button, ButtonVariant, Truncate } from "@patternfly/react-core";
import { Link } from "@/UI/Components/Link";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  resourceId: string;
  linkText?: string;
  variant?: ButtonVariant;
}

/**
 * The ResourceLink component.
 *
 * This component is responsible of displaying a link to a resource.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} resourceId - The id of the resource
 *  @prop {string} linkText - The text of the link
 *  @prop {ButtonVariant} variant - The variant of the button
 *
 * @returns {React.FC} ResourceLink component
 */
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
