import React from "react";
import { LogViewerComponent, LogViewerData } from "@/UI/Components/LogViewer";
import { CompileStageReport } from "@S/CompileDetails/Core/Domain";

interface Props {
  reports: CompileStageReport[];
}

/**
 * CompileStageReportTable component displays a table of compile stage reports
 * with a log viewer for each report.
 *
 * @prop {CompileStageReport[]} reports - The array of compile stage reports
 */
export const CompileStageReportTable: React.FC<Props> = ({ reports }) => {
  const logs: LogViewerData[] = reports.map((report) => {
    return {
      data: [report.command, report.outstream, report.errstream],
      name: report.name,
      id: report.id,
      duration: getDuration(report.started, report.completed),
      failed:
        report.returncode !== null && report.returncode !== undefined && report.returncode !== 0,
    };
  });

  const defaultSelected = logs.find((log) => log.failed)?.id;

  return <LogViewerComponent logs={logs} defaultSelected={defaultSelected} />;
};

/**
 * Get the duration of a compile stage in seconds
 * If the completed time is not provided, use the current time
 *
 * @param started - The start time of the compile stage
 * @param completed - The end time of the compile stage
 *
 * @note We use Math.floor here as it's reliable for this specific duration calculation.
 * Since we're working with integer milliseconds from Date.getTime() and only dividing by 1000,
 * there are no floating-point precision concerns. Math.floor will accurately round down
 * to the nearest second.
 *
 * We are returning a string as the duration is displayed in the UI as a string.
 * And because the number 0 equals to false.
 * @returns The duration of the compile stage in seconds
 */
export const getDuration = (started: string, completed?: string) => {
  const startTime = new Date(started);
  const endTime = new Date(completed || new Date().toISOString());
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationSeconds = durationMs / 1000;

  return Math.floor(durationSeconds).toString();
};
