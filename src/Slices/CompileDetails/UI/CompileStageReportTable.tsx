import React from "react";
import { Table, TableVariant, Th, Thead, Tr } from "@patternfly/react-table";
import { useExpansion } from "@/Data";
import { words } from "@/UI";
import { MomentDatePresenter } from "@/UI/Utils";
import { CompileStageReport } from "@S/CompileDetails/Core/Domain";
import { CompileStageReportTablePresenter } from "./CompileStageReportTablePresenter";
import { CompileStageReportTableRow } from "./CompileStageReportTableRow";
import { LogViewerComponent, LogViewerData } from "@/UI/Components/LogViewer";

interface Props {
  compileStarted?: string | null;
  reports: CompileStageReport[];
}

export const CompileStageReportTable: React.FC<Props> = ({ compileStarted, reports, ...props }) => {
  const logs: LogViewerData[] = reports.map((report) => {
    return {
      data: [report.command, report.errstream, report.outstream],
      name: report.name,
      id: report.id,
      duration: getDuration(report.started, report.completed),
      failed: report.returncode !== null && report.returncode !== undefined && report.returncode !== 0,
    };
  });

  return (
    <LogViewerComponent logs={logs} />
  );
};

/**
 * Get the duration of a compile stage
 * If the completed time is not provided, use the current time
 * @param started - The start time of the compile stage
 * @param completed - The end time of the compile stage
 * @returns The duration of the compile stage
 */
const getDuration = (started: string, completed?: string) => {
  const startTime = new Date(started);
  const endTime = new Date(completed || new Date().toISOString());
  const duration = endTime.getTime() - startTime.getTime();
  return duration;
};

