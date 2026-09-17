import { EventRow, InstanceEvent } from "@/Core";
import { ColumnHead, createTablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";

const columnHeads: ColumnHead[] = [
  { displayName: words("events.column.eventType"), apiName: "event_type" },
  { displayName: words("date"), apiName: "timestamp" },
  { displayName: words("events.column.instanceVersion"), apiName: "service_instance_version" },
  { displayName: words("events.column.sourceState"), apiName: "source" },
  { displayName: words("events.column.destinationState"), apiName: "destination" },
];

const instanceToRow = (event: InstanceEvent): EventRow => ({
  id: event.id,
  serviceInstanceId: event.service_instance_id,
  serviceInstanceVersion: event.service_instance_version,
  timestamp: event.timestamp,
  source: event.source,
  destination: event.destination,
  message: event.message,
  ignoredTransition: event.ignored_transition,
  eventCorrelationId: event.event_correlation_id,
  severity: event.severity,
  idCompileReport: event.id_compile_report,
  eventType: event.event_type,
  isErrorTransition: event.is_error_transition,
  fullJson: event,
});

/**
 * Table presenter for the instance events table.
 *
 * @example createEventsTablePresenter().getNumberOfColumns() // 6
 */
export const createEventsTablePresenter = () =>
  createTablePresenter<InstanceEvent, EventRow>({
    columnHeads,
    extraColumns: 1,
    createRows: (events) => events.map(instanceToRow),
  });

export type EventsTablePresenter = ReturnType<typeof createEventsTablePresenter>;
