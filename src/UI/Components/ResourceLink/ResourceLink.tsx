import React, { useContext } from "react";
import { useLocation } from "react-router";
import { Button, ButtonVariant, Truncate } from "@patternfly/react-core";
import { keepKeys } from "@/Core";
import { Link } from "@/UI/Components/Link";
import { DependencyContext } from "@/UI/Dependency";
import { SearchHelper } from "@/UI/Routing";

const searchHelper = new SearchHelper();

interface Props {
  resourceId: string;
  linkText?: string;
  variant?: ButtonVariant;
  isInline?: boolean;
  tab?: string;
}

/**
 * Renders a link to a resource's details page, keeping the current environment.
 * Blocks (tables) get a button-styled link that truncates long ids; inline links
 * (e.g. inside a title) size to their content instead of filling the container.
 * A `tab` opens the details page on that tab.
 *
 * @example <ResourceLink resourceId="std::File[a,path=/tmp]" /> -> link to /resources/std::File...?env=...
 * @example <ResourceLink resourceId="std::File[a,path=/tmp]" tab="Facts" /> -> ...?env=...&state.ResourceDetails.tab=Facts
 *
 * @prop {string} resourceId - The id of the resource to link to.
 * @prop {string} [linkText] - Text to show instead of the resource id.
 * @prop {ButtonVariant} [variant] - Button variant of the block link.
 * @prop {boolean} [isInline] - Whether the link sizes to its content instead of filling the container.
 * @prop {string} [tab] - The details page tab to open.
 */
export const ResourceLink: React.FC<Props> = ({
  resourceId,
  linkText,
  variant = ButtonVariant.link,
  isInline = false,
  tab,
}) => {
  const { routeManager } = useContext(DependencyContext);
  const { search: currentSearch } = useLocation();
  const pathname = routeManager.getUrl("ResourceDetails", { resourceId });

  const search = tab
    ? searchHelper.stringify({
        ...keepKeys(["env"], searchHelper.parse(currentSearch)),
        state: { ResourceDetails: { tab } },
      })
    : undefined;

  if (isInline) {
    return (
      <Link pathname={pathname} search={search} envOnly={!tab} fitContent>
        {linkText ? linkText : resourceId}
      </Link>
    );
  }

  return (
    <Link pathname={pathname} search={search} envOnly={!tab}>
      <Button variant={variant} component="span">
        <Truncate content={linkText ? linkText : resourceId} />
      </Button>
    </Link>
  );
};
