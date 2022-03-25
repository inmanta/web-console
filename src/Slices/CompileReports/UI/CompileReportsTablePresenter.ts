import { CompileStatus } from "@/Core";
import { DatePresenter, TablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";
import { CompileReport, CompileReportRow } from "@S/CompileReports/Core/Domain";

export class CompileReportsTablePresenter
  implements TablePresenter<CompileReport, CompileReportRow>
{
  readonly columnHeads: string[];
  readonly numberOfColumns: number;

  constructor(private datePresenter: DatePresenter) {
    this.columnHeads = [
      words("compileReports.columns.requested"),
      words("compileReports.columns.status"),
      words("compileReports.columns.message"),
      words("compileReports.columns.waitTime"),
      words("compileReports.columns.compileTime"),
    ];
    this.numberOfColumns = this.columnHeads.length + 2;
  }

  createRows(sourceData: CompileReport[]): CompileReportRow[] {
    return sourceData.map((compileReport) => ({
      id: compileReport.id,
      requested: compileReport.requested,
      compileTime:
        compileReport.started && compileReport.completed
          ? this.datePresenter.diff(
              compileReport.completed,
              compileReport.started
            )
          : "",
      waitTime: compileReport.started
        ? this.datePresenter.diff(
            compileReport.started,
            compileReport.requested
          )
        : "",
      completed: compileReport.completed,
      message: compileReport.metadata["message"] as string,
      status: this.getStatusFromReport(compileReport),
    }));
  }

  private getStatusFromReport({
    completed,
    success,
    started,
  }: CompileReport): CompileStatus {
    if (!started) {
      return CompileStatus.queued;
    } else if (!!started && !completed) {
      return CompileStatus.inprogress;
    } else if (success) {
      return CompileStatus.success;
    } else {
      return CompileStatus.failed;
    }
  }

  getColumnHeadDisplayNames(): string[] {
    return this.columnHeads;
  }

  getNumberOfColumns(): number {
    return this.numberOfColumns;
  }
}
