import { CompileStatus } from "@/Core";
import { ColumnHead, createTablePresenter } from "@/UI/Presenters";
import { CustomDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { CompileReport, CompileReportRow } from "@S/CompileReports/Core/Domain";

const defaultDatePresenter = new CustomDatePresenter();

const columnHeads: readonly ColumnHead[] = [
  { displayName: words("compileReports.columns.requested"), apiName: "requested" },
  { displayName: words("status"), apiName: "status" },
  { displayName: words("message"), apiName: "message" },
  { displayName: words("compileReports.columns.waitTime"), apiName: "wait_time" },
  { displayName: words("compileReports.columns.compileTime"), apiName: "compile_time" },
];

/**
 * Derives a compile's status from its timestamps and success flag. Exported so the Dashboard
 * compiles-health tile derives the status exactly the way this table does.
 *
 * @example getStatusFromReport({ started: null, ... }) // CompileStatus.queued
 */
export const getStatusFromReport = ({
  completed,
  success,
  started,
}: CompileReport): CompileStatus => {
  if (!started) {
    return CompileStatus.queued;
  }
  if (!completed) {
    return CompileStatus.inprogress;
  }
  if (success) {
    return CompileStatus.success;
  }

  return CompileStatus.failed;
};

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
    columnHeads,
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
