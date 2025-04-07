import {
  InstanceEvent,
  ServiceInstanceIdentifier,
  Pagination,
  Sort,
  PageSize,
  EventType,
  DateRange,
} from '@/Core/Domain';
import { CurrentPage } from '@/Data/Common/UrlState/useUrlStateWithCurrentPage';

/**
 * The events query describes events belonging to one specific service instance
 */
export interface Query extends ServiceInstanceIdentifier, EventParams {
  kind: 'GetInstanceEvents';
}

export interface Manifest {
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
  query: Query;
}

interface EventParams {
  filter?: Filter;
  sort?: Sort.Sort;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

export interface Filter {
  event_type?: EventType[];
  version?: string[];
  source?: string[];
  destination?: string[];
  timestamp?: DateRange.DateRange[];
}

export enum FilterKind {
  EventType = 'EventType',
  Version = 'Version',
  Source = 'Source',
  Destination = 'Destination',
  Date = 'Date',
}

export const FilterList: FilterKind[] = [
  FilterKind.EventType,
  FilterKind.Version,
  FilterKind.Source,
  FilterKind.Destination,
  FilterKind.Date,
];
