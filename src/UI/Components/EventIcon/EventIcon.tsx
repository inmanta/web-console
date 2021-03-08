import { InstanceEventType } from "@/Core";
import { Tooltip } from "@patternfly/react-core";
import {
  AddCircleOIcon,
  ArrowRightIcon,
  AutomationIcon,
  InfoCircleIcon,
  PencilAltIcon,
  ResourcesAlmostFullIcon,
  RunningIcon,
  TrashIcon,
} from "@patternfly/react-icons";

import React from "react";

interface Props {
  eventType: InstanceEventType;
}
export const EventIcon: React.FC<Props> = ({ eventType }) => {
  return (
    <Tooltip content={eventType} entryDelay={200}>
      <>{getIconFor(eventType)}</>
    </Tooltip>
  );
};
function getIconFor(eventType: InstanceEventType): React.ReactElement {
  switch (eventType) {
    case "AUTO_TRANSITION":
      return <AutomationIcon />;
    case "CREATE_TRANSITION":
      return <AddCircleOIcon />;
    case "RESOURCE_EVENT":
      return <RunningIcon />;
    case "RESOURCE_TRANSITION":
      return <ResourcesAlmostFullIcon />;
    case "ALLOCATION_UPDATE":
      return <InfoCircleIcon />;
    case "API_SET_STATE_TRANSITION":
      return <ArrowRightIcon />;
    case "ON_UPDATE_TRANSITION":
      return <PencilAltIcon />;
    case "ON_DELETE_TRANSITION":
      return <TrashIcon />;
  }
}
