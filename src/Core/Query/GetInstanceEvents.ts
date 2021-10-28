import {
  InstanceEvent,
  ServiceInstanceIdentifier,
  Pagination,
  EventParams,
} from "@/Core/Domain";

/**
 * The events query describes events belonging to one specific service instance
 */
export interface GetInstanceEvents
  extends ServiceInstanceIdentifier,
    EventParams.EventParams {
  kind: "GetInstanceEvents";
}

export interface GetInstanceEventsManifest {
  error: string;
  apiResponse: {
    data: InstanceEvent[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: InstanceEvent[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: InstanceEvent[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: GetInstanceEvents;
}
