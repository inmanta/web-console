import { ReactElement } from "react";
import { ServiceInstanceModelWithTargetStates } from "@app/Models/LsmModels";
import { Id, Row } from "@/Core";
import { words } from "@/UI";
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
    words("inventory.column.id"),
    words("inventory.column.state"),
    words("inventory.column.attributesSummary"),
    words("inventory.column.createdAt"),
    words("inventory.column.updatedAt"),
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

  public createFromInstances(
    instances: ServiceInstanceModelWithTargetStates[]
  ): Row[] {
    return instances.map((instance) => this.instanceToRow(instance));
  }

  public getColumnHeads(): string[] {
    return this.columnHeads;
  }

  public getNumberOfColumns(): number {
    return this.numberOfColumns;
  }

  private instanceToRow(instance: ServiceInstanceModelWithTargetStates): Row {
    const {
      id,
      state,
      candidate_attributes,
      active_attributes,
      rollback_attributes,
      created_at,
      last_updated,
      version,
      instanceSetStateTargets,
    } = instance;

    return {
      id: this.getId(id),
      state,
      attributesSummary: this.attributesPresenter.getSummary(
        candidate_attributes,
        active_attributes,
        rollback_attributes
      ),
      attributes: {
        candidate: candidate_attributes,
        active: active_attributes,
        rollback: rollback_attributes,
      },
      createdAt: this.datePresenter.get(created_at),
      updatedAt: this.datePresenter.get(last_updated),
      version: version,
      instanceSetStateTargets,
    };
  }

  private getId(full: string): Id {
    return { full, short: full.substring(0, 4) };
  }
}
