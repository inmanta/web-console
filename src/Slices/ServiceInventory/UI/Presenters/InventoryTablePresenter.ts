import {
  Row,
  ServiceInstanceModel,
  ServiceInstanceModelWithTargetStates,
  ServiceModel,
  getUuidFromRaw,
} from "@/Core";
import { isTransferDisabled } from "@/Slices/ServiceInstanceDetails/Utils";
import { TablePresenter, ColumnHead } from "@/UI/Presenters";
import { words } from "@/UI/words";

/**
 * The TablePresenter is responsible for formatting the domain data.
 * This class should only hold config data and pure functions.
 * This class should not hold state as state should be kept in the Redux Store.
 */
export class InventoryTablePresenter
  implements TablePresenter<ServiceInstanceModel, Row>
{
  readonly columnHeads: ColumnHead[];
  readonly numberOfColumns: number;

  constructor(
    private serviceIdentity?: string,
    private serviceIdentityDisplayName?: string | null,
  ) {
    this.columnHeads = [
      {
        displayName: this.getIdColumnName(),
        apiName: this.getIdColumnApiName(),
      },
      { displayName: words("inventory.column.state"), apiName: "state" },
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

  public createRows(
    instances: ServiceInstanceModelWithTargetStates[],
    service: ServiceModel,
  ): Row[] {
    return instances.map((instance) => this.instanceToRow(instance, service));
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

  private instanceToRow(
    instance: ServiceInstanceModel,
    service: ServiceModel,
  ): Row {
    const {
      id,
      created_at,
      last_updated,
      version,
      environment,
      service_entity,
      state,
      deployment_progress,
      service_identity_attribute_value,
      deleted,
    } = instance;

    return {
      id: getUuidFromRaw(id),
      state: state,
      createdAt: created_at,
      updatedAt: last_updated,
      version: version,
      environment,
      service_entity,
      deploymentProgress: deployment_progress,
      serviceIdentityValue: service_identity_attribute_value,
      deleted,
      editDisabled: isTransferDisabled(instance, "on_update", service),
      deleteDisabled: isTransferDisabled(instance, "on_delete", service),
    };
  }
}
