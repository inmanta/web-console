import { words } from "@inmanta/web-console-core";
import { CompileReport, getStatusFromReport } from "@inmanta/web-console-core/Domain/CompileReport";
import { CompileReportRow } from "@inmanta/web-console-feature-orchestration-engine/Slices/CompileReports/Core/Types";
import { createTablePresenter } from "@inmanta/web-console-ui/Presenters";
import { CustomDatePresenter } from "@inmanta/web-console-ui/Utils";

const defaultDatePresenter = new CustomDatePresenter();

/**
 * Table presenter for the compile reports view. Derives wait and compile times
 * from the report timestamps and maps its status to a CompileStatus.
 *
 * @example createCompileReportsTablePresenter().getNumberOfColumns() // 5
 */
export const createCompileReportsTablePresenter = (
  datePresenter: CustomDatePresenter = defaultDatePresenter
) =>
  createTablePresenter<CompileReport, CompileReportRow>({
    columnHeads: [
      { displayName: words("compileReports.columns.requested"), apiName: "requested" },
      { displayName: words("status"), apiName: "status" },
      { displayName: words("message"), apiName: "message" },
      { displayName: words("compileReports.columns.waitTime"), apiName: "wait_time" },
      { displayName: words("compileReports.columns.compileTime"), apiName: "compile_time" },
    ],
    createRows: (reports) =>
      reports.map((report) => ({
        id: report.id,
        requested: report.requested,
        compileTime:
          report.started && report.completed
            ? datePresenter.diff(report.completed, report.started)
            : "",
        waitTime: report.started ? datePresenter.diff(report.started, report.requested) : "",
        completed: report.completed,
        message: report.metadata["message"] as string,
        status: getStatusFromReport(report),
      })),
  });

export type CompileReportsTablePresenter = ReturnType<typeof createCompileReportsTablePresenter>;
