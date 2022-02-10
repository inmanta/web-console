import React, { useState } from "react";
import { Select, SelectOption, ToolbarGroup } from "@patternfly/react-core";
import { DryRun, Maybe, RemoteData } from "@/Core";
import { MomentDatePresenter } from "@/UI/Utils";
import { MaybeReport, RemoteReportList } from "../types";

interface Props {
  setSelectedReport(report: MaybeReport): void;
  selectedReport: MaybeReport;
  reportsData: RemoteReportList;
}

const datePresenter = new MomentDatePresenter();

export const SelectReportAction: React.FC<Props> = ({
  setSelectedReport,
  selectedReport,
  reportsData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // This should be the trigger from the command

  const onSelect = (event, value) => {
    setIsOpen(false);
    if (!RemoteData.isSuccess(reportsData)) return;
    const report = reportsData.value.find((report) => report.id === value);
    if (report === undefined) return;
    setSelectedReport(Maybe.some(report));
  };

  return (
    <ToolbarGroup alignment={{ default: "alignLeft" }}>
      {RemoteData.isSuccess(reportsData) && Maybe.isSome(selectedReport) && (
        <Select
          onToggle={setIsOpen}
          onSelect={onSelect}
          selections={selectedReport.value.id}
          isOpen={isOpen}
          aria-label="ReportList"
          toggleAriaLabel="ReportListSelect"
        >
          {reportsData.value.map((report) => (
            <SelectOption key={report.id} value={report.id}>
              {datePresenter.getFull(report.date)} <Progress report={report} />
            </SelectOption>
          ))}
        </Select>
      )}
    </ToolbarGroup>
  );
};

const Progress: React.FC<{ report: DryRun.Progress }> = ({
  report: { todo, total },
}) => {
  const tot = Number(total);
  const current = tot - Number(todo);
  return (
    <span>
      {current} / {tot}
    </span>
  );
};
