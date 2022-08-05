import { ColumnHead, TablePresenter } from "@/UI/Presenters";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { Fact } from "@S/Facts/Core/Domain";

const datePresenter = new MomentDatePresenter();

export class FactsTablePresenter implements TablePresenter<Fact, Fact> {
  readonly columnHeads: ColumnHead[];
  readonly numberOfColumns: number;

  constructor() {
    this.columnHeads = [
      { displayName: words("facts.column.name"), apiName: "name" },
      { displayName: words("facts.column.updated"), apiName: "updated" },
      { displayName: words("facts.column.value"), apiName: "value" },
      { displayName: words("facts.column.resourceId"), apiName: "resource_id" },
    ];
    this.numberOfColumns = this.columnHeads.length + 1;
  }

  createRows(sourceData: Fact[]): Fact[] {
    return sourceData.map((fact) => ({
      ...fact,
      updated: fact.updated ? datePresenter.getFull(fact.updated) : undefined,
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
    return ["name", "resource_id"];
  }

  getNumberOfColumns(): number {
    return this.numberOfColumns;
  }
}
