import React, { useContext } from "react";
import { useLocation } from "react-router";
import { Button } from "@patternfly/react-core";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { SearchHelper } from "@/UI/Routing";
import { words } from "@/UI/words";
import dayjs from "@/dayjs";

interface Props {
  resourceId: string;
  action: string;
  started: string;
  finished: string | null;
}

/**
 * A link to the logs tab of a resource, pre-filtered on the action type and the
 * time range of the action so that exactly the log lines of that action are
 * shown.
 *
 * The resource details page reads its active tab and filters from the
 * `state.ResourceDetails` section of the URL search parameters. The timestamp
 * range is padded by one second on each side to account for the sub-second
 * precision that is lost when serializing to the URL.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} resourceId - The (versionless) resource id to link to.
 *  @prop {string} action - The action type to filter the logs on.
 *  @prop {string} started - The start time of the action.
 *  @prop {string | null} finished - The end time of the action, if any.
 * @returns {React.FC<Props>} The resource logs link.
 */
export const ResourceLogsLink: React.FC<Props> = ({ resourceId, action, started, finished }) => {
  const { routeManager } = useContext(DependencyContext);
  const { search: currentSearch } = useLocation();
  const searchHelper = new SearchHelper();

  const from = `from__${dayjs(started).subtract(1, "second").toISOString()}`;
  const to = finished ? `to__${dayjs(finished).add(1, "second").toISOString()}` : undefined;
  const timestamp = to ? [from, to] : [from];

  const envSearch = searchHelper.parse(searchHelper.keepEnvOnly(currentSearch));
  const search = searchHelper.stringify({
    ...envSearch,
    state: {
      ResourceDetails: {
        tab: "Logs",
        filter: { action: [action], timestamp },
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
