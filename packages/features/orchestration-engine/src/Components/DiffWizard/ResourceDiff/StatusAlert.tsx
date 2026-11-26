import React from "react";
import { Alert } from "@patternfly/react-core";
import { CheckCircleIcon } from "@patternfly/react-icons";
import { Diff } from "@inmanta/web-console-core";
import { getStatusAlertContent } from "./helpers";

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
  const statusAlertContent = getStatusAlertContent(resourceId, status);

  if (!statusAlertContent) {
    return null;
  }

  return (
    <Alert
      isInline
      component="p"
      variant={statusAlertContent.variant}
      title={statusAlertContent.title}
      customIcon={statusAlertContent.variant === "custom" ? <CheckCircleIcon /> : undefined}
    />
  );
};
