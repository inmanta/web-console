import { omit } from "lodash-es";
import { Agent, AgentRow } from "@/Core";
import { ColumnHead, TablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";

export class AgentsTablePresenter implements TablePresenter<Agent, AgentRow> {
  readonly columnHeads: ColumnHead[];
  readonly numberOfColumns: number;

  constructor() {
    this.columnHeads = [
      { displayName: words("agents.columns.name"), apiName: "name" },
      { displayName: words("agents.columns.process"), apiName: "process_name" },
      { displayName: words("agents.columns.status"), apiName: "status" },
      {
        displayName: words("agents.columns.failover"),
        apiName: "last_failover",
      },
      {
        displayName: words("agents.columns.unpause"),
        apiName: "unpause_on_resume",
      },
    ];
    this.numberOfColumns = this.columnHeads.length + 2;
  }

  createRows(sourceData: Agent[]): AgentRow[] {
    return sourceData.map((agent) => omit(agent, ["environment"]));
  }

  getColumnHeadDisplayNames(): string[] {
    return this.columnHeads.map((columnHead) => columnHead.displayName);
  }

  getNumberOfColumns(): number {
    return this.numberOfColumns;
  }
  getColumnHeads(): ColumnHead[] {
    return this.columnHeads;
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

  getSortableColumnNames(): string[] {
    const sortableColumns = ["name", "process_name", "status", "last_failover"];
    return sortableColumns;
  }
}
