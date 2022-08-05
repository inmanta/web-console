import { Parameter } from "@/Core";
import { ColumnHead, TablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";

export class ParametersTablePresenter
  implements TablePresenter<Parameter, Parameter>
{
  readonly columnHeads: ColumnHead[];
  readonly numberOfColumns: number;

  constructor() {
    this.columnHeads = [
      { displayName: words("parameters.columns.name"), apiName: "name" },
      {
        displayName: words("parameters.columns.updated"),
        apiName: "updated",
      },
      {
        displayName: words("parameters.columns.source"),
        apiName: "source",
      },
      {
        displayName: words("parameters.columns.value"),
        apiName: "value",
      },
    ];
    this.numberOfColumns = this.columnHeads.length + 1;
  }

  createRows(sourceData: Parameter[]): Parameter[] {
    return sourceData;
  }

  getColumnHeadDisplayNames(): string[] {
    return this.columnHeads.map(({ displayName }) => displayName);
  }
  getSortableColumnNames(): string[] {
    const sortableColumns = ["name", "source", "updated"];
    return sortableColumns;
  }
  getColumnHeads(): ColumnHead[] {
    return this.columnHeads;
  }

  getNumberOfColumns(): number {
    return this.numberOfColumns;
  }

  getColumnNameForIndex(index: number): string | undefined {
    if (index > -1 && index < this.getNumberOfColumns()) {
      return this.getColumnHeads()[index].apiName;
    }
    return undefined;
  }

  getIndexForColumnName(columnName?: string): number {
    return this.columnHeads.findIndex(
      (columnHead) => columnHead.apiName === columnName
    );
  }
}
