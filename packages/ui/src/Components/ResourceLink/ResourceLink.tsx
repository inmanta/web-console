import React, { useContext } from "react";
import { useLocation } from "react-router";
import { Button, ButtonVariant, Truncate } from "@patternfly/react-core";
import { keepKeys } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { ResourceDetailsTab } from "@inmanta/web-console-core/Domain";
import { SearchHelper } from "@inmanta/web-console-core/Routing";
import { Link } from "@inmanta/web-console-ui/Components/Link";

const searchHelper = new SearchHelper();

interface Props {
  resourceId: string;
  linkText?: string;
  variant?: ButtonVariant;
  isInline?: boolean;
  tab?: ResourceDetailsTab;
}

/**
 * Renders a link to a resource's details page, keeping the current environment.
 * Blocks (tables) get a button-styled link that truncates long ids; inline links
 * (e.g. inside a title) size to their content instead of filling the container.
 * A `tab` opens the details page on that tab.
 *
 * @example <ResourceLink resourceId="std::File[a,path=/tmp]" /> -> link to /resources/std::File...?env=...
 * @example <ResourceLink resourceId="std::File[a,path=/tmp]" tab={ResourceDetailsTab.Facts} /> -> ...?env=...&state.ResourceDetails.tab=Facts
 *
 * @prop {string} resourceId - The id of the resource to link to.
 * @prop {string} [linkText] - Text to show instead of the resource id.
 * @prop {ButtonVariant} [variant] - Button variant of the block link.
 * @prop {boolean} [isInline] - Whether the link sizes to its content instead of filling the container.
 * @prop {ResourceDetailsTab} [tab] - The details page tab to open.
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
  const text = linkText || resourceId;

  // Without the resource details page, show the resource id as plain text instead of a broken link.
  if (!routeManager.has("ResourceDetails")) {
    return isInline ? <>{text}</> : <Truncate content={text} />;
  }

  const pathname = routeManager.getUrl("ResourceDetails", { resourceId });

  const search = tab
    ? searchHelper.stringify({
        ...keepKeys(["env"], searchHelper.parse(currentSearch)),
        state: { ResourceDetails: { tab } },
      })
    : undefined;

  if (isInline) {
    return (
      <Link pathname={pathname} search={search} envOnly fitContent>
        {text}
      </Link>
    );
  }

  return (
    <Link pathname={pathname} search={search} envOnly>
      <Button variant={variant} component="span">
        <Truncate content={text} />
      </Button>
    </Link>
  );
};
