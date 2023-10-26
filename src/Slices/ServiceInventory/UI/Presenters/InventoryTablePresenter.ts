import { ReactElement } from "react";
import {
  Row,
  ServiceInstanceModelWithTargetStates,
  getUuidFromRaw,
} from "@/Core";
import {
  ActionPresenter,
  TablePresenter,
  DatePresenter,
  ColumnHead,
} from "@/UI/Presenters";
import { words } from "@/UI/words";
import { AttributesPresenter } from "./AttributesPresenter";
import { StatePresenter } from "./StatePresenter";

/**
 * The TablePresenter is responsible for formatting the domain data.
 * This class should only hold config data and pure functions.
 * This class should not hold state as state should be kept in the Redux Store.
 */
export class InventoryTablePresenter
  implements TablePresenter<ServiceInstanceModelWithTargetStates, Row>
{
  readonly columnHeads: ColumnHead[];
  readonly numberOfColumns: number;

  constructor(
    private datePresenter: DatePresenter,
    private attributesPresenter: AttributesPresenter,
    private actionPresenter: ActionPresenter,
    private statePresenter: StatePresenter,
    private serviceIdentity?: string,
    private serviceIdentityDisplayName?: string,
    private isConfigDisabled?: boolean,
  ) {
    this.columnHeads = [
      {
        displayName: this.getIdColumnName(),
        apiName: this.getIdColumnApiName(),
      },
      { displayName: words("inventory.column.state"), apiName: "state" },
      {
        displayName: words("inventory.column.attributesSummary"),
        apiName: "attributes",
      },
      {
        displayName: words("inventory.collumn.deploymentProgress"),
        apiName: "deployment_progress",
      },
      {
        displayName: words("inventory.column.createdAt"),
        apiName: "created_at",
      },
      {
        displayName: words("inventory.column.updatedAt"),
        apiName: "last_updated",
      },
    ];
    this.numberOfColumns = this.columnHeads.length + 1;
  }

  public getActionsFor(id: string): ReactElement | null {
    return this.actionPresenter.getForId(id);
  }

  public createRows(instances: ServiceInstanceModelWithTargetStates[]): Row[] {
    return instances.map((instance) => this.instanceToRow(instance));
  }

  public getColumnHeadDisplayNames(): string[] {
    return this.columnHeads.map((columnhead) => columnhead.displayName);
  }

  public getColumnHeads(): ColumnHead[] {
    return this.columnHeads;
  }

  public getColumnNameForIndex(index: number): string | undefined {
    if (index > -1 && index < this.getNumberOfColumns()) {
      return this.getColumnHeads()[index].apiName;
    }
    return undefined;
  }

  public getIndexForColumnName(columnName?: string): number {
    return this.columnHeads.findIndex(
      (columnHead) => columnHead.apiName === columnName,
    );
  }

  public getSortableColumnNames(): string[] {
    const sortableColumns = ["state", "created_at", "last_updated"];
    if (this.serviceIdentity) {
      sortableColumns.push(this.serviceIdentity);
    }
    return sortableColumns;
  }

  public getIdColumnName(): string {
    if (this.serviceIdentityDisplayName && this.serviceIdentity) {
      return this.serviceIdentityDisplayName;
    } else if (this.serviceIdentity) {
      return this.serviceIdentity;
    } else {
      return words("inventory.column.id");
    }
  }

  public getIdColumnApiName(): string {
    if (this.serviceIdentity) {
      return this.serviceIdentity;
    } else {
      return "id";
    }
  }

  public shouldUseServiceIdentity(): boolean {
    return !!this.serviceIdentity;
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
      service_identity_attribute_value,
      deleted,
    } = instance;

    return {
      id: getUuidFromRaw(id),
      attributesSummary: this.attributesPresenter.getSummary(
        candidate_attributes,
        active_attributes,
        rollback_attributes,
      ),
      attributes: {
        candidate: candidate_attributes,
        active: active_attributes,
        rollback: rollback_attributes,
      },
      createdAt: created_at,
      updatedAt: last_updated,
      version: version,
      instanceSetStateTargets,
      environment,
      service_entity,
      deploymentProgress: deployment_progress,
      serviceIdentityValue: service_identity_attribute_value,
      deleted,
      configDisabled: this.isConfigDisabled,
    };
  }
}
