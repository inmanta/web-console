import React from "react";
import { Alert } from "@patternfly/react-core";
import { CheckCircleIcon } from "@patternfly/react-icons";
import { Diff, Resource, words } from "@inmanta/web-console-core";

interface Props {
  resourceId: string;
  status: Diff.Status;
}

/**
 * The inline alert above a resource's diff that explains its status, with its title as a
 * paragraph since it isn't a section of the page. Added and modified resources get none: their
 * attribute table and status label say it.
 *
 * @props {Props} props - The component props
 *  @prop {string} resourceId - The id of the resource, which names the agent of an agent_down resource
 *  @prop {Diff.Status} status - The diff status of the resource
 *
 * @returns {React.FC<Props>} The alert, or nothing
 */
export const StatusAlert: React.FC<Props> = ({ resourceId, status }) => {
  switch (status) {
    case "deleted":
      return (
        <Alert
          isInline
          component="p"
          variant="danger"
          title={words("desiredState.compare.deleted")}
        />
      );
    case "unmodified":
      return (
        <Alert
          isInline
          component="p"
          variant="custom"
          customIcon={<CheckCircleIcon />}
          title={words("desiredState.compare.unmodified")}
        />
      );
    case "agent_down": {
      const agentName = Resource.IdParser.getAgentName(resourceId) ?? "???";

      return (
        <Alert
          isInline
          component="p"
          variant="info"
          title={words("desiredState.compare.agent_down")(agentName)}
        />
      );
    }
    case "undefined":
      return (
        <Alert
          isInline
          component="p"
          variant="info"
          title={words("desiredState.compare.undefined")}
        />
      );
    case "skipped_for_undefined":
      return (
        <Alert
          isInline
          component="p"
          variant="info"
          title={words("desiredState.compare.skipped_for_undefined")}
        />
      );
    case "added":
    case "modified":
      return null;
  }
};
