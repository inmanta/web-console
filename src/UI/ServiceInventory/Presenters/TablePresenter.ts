import { ReactElement } from "react";
import { Id, Row, ServiceInstanceModelWithTargetStates } from "@/Core";
import { words } from "@/UI/words";
import { DatePresenter } from "./DatePresenter";
import { AttributesPresenter } from "./AttributesPresenter";
import { ActionPresenter } from "./ActionPresenter";
import { StatePresenter } from "./StatePresenter";

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
    words("inventory.collumn.deploymentProgress"),
    words("inventory.column.createdAt"),
    words("inventory.column.updatedAt"),
  ];
  readonly numberOfColumns = this.columnHeads.length + 1;

  constructor(
    private datePresenter: DatePresenter,
    private attributesPresenter: AttributesPresenter,
    private actionPresenter: ActionPresenter,
    private statePresenter: StatePresenter
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

  public getStateFor(id: string): ReactElement | null {
    return this.statePresenter.getForId(id);
  }

  private instanceToRow(instance: ServiceInstanceModelWithTargetStates): Row {
    const {
      id,
      candidate_attributes,
      active_attributes,
      rollback_attributes,
      created_at,
      last_updated,
      version,
      instanceSetStateTargets,
      environment,
      service_entity,
      deployment_progress,
    } = instance;

    return {
      id: this.getId(id),
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
      environment,
      service_entity,
      deploymentProgress: deployment_progress,
    };
  }

  private getId(full: string): Id {
    return { full, short: full.substring(0, 4) };
  }
}
