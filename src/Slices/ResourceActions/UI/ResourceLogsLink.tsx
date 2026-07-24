import React, { useContext } from "react";
import { useLocation } from "react-router";
import { Button } from "@patternfly/react-core";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { SearchHelper } from "@/UI/Routing";
import { words } from "@/UI/words";

interface Props {
  resourceId: string;
  action: string;
}

/**
 * A link to the logs tab of a resource, pre-filtered on the given action type.
 *
 * The resource details page reads its active tab and filters from the
 * `state.ResourceDetails` section of the URL search parameters, so the link is
 * built to target the Logs tab with the action filter applied.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} resourceId - The (versionless) resource id to link to.
 *  @prop {string} action - The action type to filter the logs on.
 * @returns {React.FC<Props>} The resource logs link.
 */
export const ResourceLogsLink: React.FC<Props> = ({ resourceId, action }) => {
  const { routeManager } = useContext(DependencyContext);
  const { search: currentSearch } = useLocation();
  const searchHelper = new SearchHelper();

  const envSearch = searchHelper.parse(searchHelper.keepEnvOnly(currentSearch));
  const search = searchHelper.stringify({
    ...envSearch,
    state: {
      ResourceDetails: {
        tab: "Logs",
        filter: { action: [action] },
      },
    },
  });

  return (
    <Link pathname={routeManager.getUrl("ResourceDetails", { resourceId })} search={search}>
      <Button variant="link" isInline icon={<ExternalLinkAltIcon />} iconPosition="end">
        {words("resourceActions.details.viewLogs")}
      </Button>
    </Link>
  );
};
