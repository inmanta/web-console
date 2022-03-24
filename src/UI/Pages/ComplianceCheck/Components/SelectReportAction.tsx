import React, { useState } from "react";
import {
  Label,
  Select,
  SelectOption,
  Spinner,
  ToolbarGroup,
} from "@patternfly/react-core";
import { global_Color_100 } from "@patternfly/react-tokens";
import styled from "styled-components";
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

  const Picker: React.FC = () => {
    if (!RemoteData.isSuccess(reportsData)) return null;
    if (reportsData.value.length <= 0) return <EmptyPicker />;
    if (Maybe.isNone(selectedReport)) return null;
    return (
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
            <Progress report={report} /> {datePresenter.getFull(report.date)}
          </SelectOption>
        ))}
      </Select>
    );
  };

  return (
    <ToolbarGroup alignment={{ default: "alignLeft" }}>
      <Picker />
    </ToolbarGroup>
  );
};

const EmptyPicker: React.FC = () => (
  <Select
    isDisabled
    onToggle={() => undefined}
    aria-label="ReportList"
    toggleAriaLabel="ReportListSelect"
    placeholderText="No dry runs exist"
  />
);

const Progress: React.FC<{ report: DryRun.Progress }> = ({
  report: { todo, total },
}) => {
  const tot = Number(total);
  const current = tot - Number(todo);
  const done = current === tot;
  return done ? (
    <StyledLabel variant="outline" isCompact>
      {current} / {tot}
    </StyledLabel>
  ) : (
    <StyledLabel variant="filled" color="orange" isCompact>
      <StyledSpinner isSVG size="sm" /> {current} / {tot}
    </StyledLabel>
  );
};

const StyledLabel = styled(Label)`
  margin-right: 4px;
`;

const StyledSpinner = styled(Spinner)`
  --pf-c-spinner--Color: ${global_Color_100.var};
  margin-right: 8px;
`;
