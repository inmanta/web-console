import { ReactElement } from "react";
import { ServiceInstance, content, Id, Row } from "Core";
import { DatePresenter } from "./DatePresenter";
import { AttributesPresenter } from "./AttributesPresenter";
import { ActionPresenter } from "./ActionPresenter";

/**
 * The TablePresenter is responsible for formatting the domain data.
 * This class should only hold config data and pure functions.
 * This class should not hold state as state should be kept in the Redux Store.
 */
export class TablePresenter {
  readonly columnHeads = [
    content("inventory.column.id"),
    content("inventory.column.state"),
    content("inventory.column.attributesSummary"),
    content("inventory.column.createdAt"),
    content("inventory.column.updatedAt"),
    content("inventory.column.actions"),
  ];
  readonly numberOfColumns = this.columnHeads.length + 1;

  constructor(
    private datePresenter: DatePresenter,
    private attributesPresenter: AttributesPresenter,
    private actionPresenter: ActionPresenter
  ) {}

  public getActionsFor(id: string): ReactElement | null {
    return this.actionPresenter.getForId(id);
  }

  public createFromInstances(instances: ServiceInstance[]): Row[] {
    return instances.map((instance) => this.instanceToRow(instance));
  }

  public getColumnHeads(): string[] {
    return this.columnHeads;
  }

  public getNumberOfColumns(): number {
    return this.numberOfColumns;
  }

  private instanceToRow(instance: ServiceInstance): Row {
    const {
      id,
      state,
      candidate_attributes,
      active_attributes,
      rollback_attributes,
      created_at,
      last_updated,
    } = instance;

    return {
      id: this.getId(id),
      state,
      attributesSummary: this.attributesPresenter.getSummary(
        candidate_attributes,
        active_attributes,
        rollback_attributes
      ),
      createdAt: this.datePresenter.get(created_at),
      updatedAt: this.datePresenter.get(last_updated),
    };
  }

  private getId(full: string): Id {
    return { full, short: full.substring(0, 4) };
  }
}
