import React from "react";
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
  SyncAltIcon,
  TrashAltIcon,
} from "@patternfly/react-icons";
import { EventType } from "@/Core";

interface Props {
  eventType: EventType;
}
export const EventIcon: React.FC<Props> = ({ eventType }) => {
  return (
    <Tooltip content={eventType} entryDelay={200}>
      <>{getIconFor(eventType)}</>
    </Tooltip>
  );
};

function getIconFor(eventType: EventType): React.ReactElement {
  switch (eventType) {
    case EventType.AUTO_TRANSITION:
      return <AutomationIcon />;
    case EventType.CREATE_TRANSITION:
      return <AddCircleOIcon />;
    case EventType.RESOURCE_EVENT:
      return <RunningIcon />;
    case EventType.RESOURCE_TRANSITION:
      return <ResourcesAlmostFullIcon />;
    case EventType.ALLOCATION_UPDATE:
      return <InfoCircleIcon />;
    case EventType.API_SET_STATE_TRANSITION:
      return <ArrowRightIcon />;
    case EventType.ON_UPDATE_TRANSITION:
      return <PencilAltIcon />;
    case EventType.ON_DELETE_TRANSITION:
      return <TrashIcon />;
    case EventType.FORCE_UPDATE:
      return <SyncAltIcon />;
    case EventType.FORCE_DELETE:
      return <TrashAltIcon />;
  }
}
