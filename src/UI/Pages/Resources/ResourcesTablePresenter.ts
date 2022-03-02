import { Resource } from "@/Core";
import { ColumnHead, TablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";

export class ResourcesTablePresenter
  implements TablePresenter<Resource.Resource, Resource.Row>
{
  readonly columnHeads: ColumnHead[];
  readonly numberOfColumns: number;

  constructor() {
    this.columnHeads = [
      { displayName: words("resources.column.type"), apiName: "resource_type" },
      {
        displayName: words("resources.column.agent"),
        apiName: "agent",
      },
      {
        displayName: words("resources.column.value"),
        apiName: "resource_id_value",
      },
      {
        displayName: words("resources.column.requires"),
        apiName: "requires",
      },
      {
        displayName: words("resources.column.deployState"),
        apiName: "status",
      },
    ];
    this.numberOfColumns = this.columnHeads.length + 2;
  }

  createRows(sourceData: Resource.Resource[]): Resource.Row[] {
    return sourceData.map((resource) => ({
      type: resource.id_details.resource_type,
      value: resource.id_details.resource_id_value,
      agent: resource.id_details.agent,
      deployState: resource.status,
      numberOfDependencies: resource.requires.length,
      id: resource.resource_id,
    }));
  }
  getColumnHeadDisplayNames(): string[] {
    return this.columnHeads.map((columnHead) => columnHead.displayName);
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
      (columnHead) => columnHead.apiName === columnName
    );
  }

  public getSortableColumnNames(): string[] {
    const sortableColumns = [
      "resource_type",
      "agent",
      "resource_id_value",
      "status",
    ];
    return sortableColumns;
  }

  getNumberOfColumns(): number {
    return this.numberOfColumns;
  }
}
