import { EventRow, InstanceEvent } from "@/Core";
import {
  DatePresenter,
  TablePresenter,
} from "@/UI/ServiceInventory/Presenters";
import { words } from "@/UI/words";

export class EventsTablePresenter
  implements TablePresenter<InstanceEvent, EventRow> {
  constructor(private datePresenter: DatePresenter) {}
  readonly columnHeads = [
    words("events.column.eventType"),
    words("events.column.date"),
    words("events.column.instanceVersion"),
    words("events.column.sourceState"),
    words("events.column.destinationState"),
  ];
  readonly numberOfColumns = this.columnHeads.length + 1;

  public getColumnHeads(): string[] {
    return this.columnHeads;
  }

  public getNumberOfColumns(): number {
    return this.numberOfColumns;
  }
  public createRows(events: InstanceEvent[]): EventRow[] {
    return events.map((instance) => this.instanceToRow(instance));
  }
  private instanceToRow(event: InstanceEvent): EventRow {
    const {
      id,
      service_instance_id,
      service_instance_version,
      timestamp,
      source,
      destination,
      message,
      ignored_transition,
      event_correlation_id,
      severity,
      id_compile_report,
      event_type,
      is_error_transition,
    } = event;

    return {
      id,
      serviceInstanceId: service_instance_id,
      serviceInstanceVersion: service_instance_version,
      timestamp: this.datePresenter.get(timestamp),
      source,
      destination,
      message,
      ignoredTransition: ignored_transition,
      eventCorrelationId: event_correlation_id,
      severity,
      idCompileReport: id_compile_report,
      eventType: event_type,
      isErrorTransition: is_error_transition,
      fullJson: event,
    };
  }
}
