import { DatePresenter, TablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";
import {
  CompileStageReport,
  CompileStageReportRow,
} from "@S/CompileDetails/Core/Domain";

export class CompileStageReportTablePresenter
  implements TablePresenter<CompileStageReport, CompileStageReportRow>
{
  private readonly columnHeads: string[] = [
    words("compileDetails.stages.columns.name"),
    words("compileDetails.stages.columns.command"),
    words("compileDetails.stages.columns.delay"),
    words("compileDetails.stages.columns.duration"),
  ];

  constructor(
    private readonly datePresenter: DatePresenter,
    private readonly compileStarted?: string | null
  ) {}

  createRows(sourceData: CompileStageReport[]): CompileStageReportRow[] {
    return sourceData.map((report) => {
      return {
        name: report.name,
        id: report.id,
        command: report.command,
        shortCommand: report.command
          ? `${report.command.substr(0, 80)}...`
          : "",
        completed: report.completed,
        errstream: report.errstream,
        outstream: report.outstream,
        startDelay: this.compileStarted
          ? this.datePresenter.diff(report.started, this.compileStarted)
          : "",
        started: report.started,
        duration: report.completed
          ? this.datePresenter.diff(report.completed, report.started)
          : "",
        returncode: report.returncode,
      };
    });
  }
  getColumnHeadDisplayNames(): string[] {
    return this.columnHeads;
  }
  getNumberOfColumns(): number {
    return this.columnHeads.length + 1;
  }
}
