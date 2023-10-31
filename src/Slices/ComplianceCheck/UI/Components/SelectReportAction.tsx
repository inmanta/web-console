import React, { useState } from "react";
import { Label, Spinner, ToolbarGroup } from "@patternfly/react-core";
import {
  Select,
  SelectOption,
  SelectOptionObject,
} from "@patternfly/react-core/deprecated";
import { global_Color_100 } from "@patternfly/react-tokens";
import styled from "styled-components";
import { Maybe, RemoteData } from "@/Core";
import { MomentDatePresenter } from "@/UI/Utils";
import { Progress as DomainProgress } from "@S/ComplianceCheck/Core/Domain";
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
    if (!RemoteData.isSuccess(reportsData)) return;
    const report = reportsData.value.find((report) => report.id === value);
    if (report === undefined) return;
    setSelectedReport(Maybe.some(report));
    setIsOpen(false);
  };

  return (
    <ToolbarGroup align={{ default: "alignLeft" }}>
      <Picker
        reportsData={reportsData}
        selectedReport={selectedReport}
        isOpen={isOpen}
        setIsOpen={(_event, value) => setIsOpen(value)}
        onSelect={onSelect}
      />
    </ToolbarGroup>
  );
};

interface PickerProps {
  reportsData: RemoteReportList;
  selectedReport: MaybeReport;
  isOpen: boolean;
  setIsOpen: (
    event:
      | Event
      | React.MouseEvent<Element, MouseEvent>
      | React.ChangeEvent<Element>
      | React.KeyboardEvent<Element>,
    open: boolean,
  ) => void;
  onSelect: (
    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    value: string | SelectOptionObject,
  ) => void;
}

const Picker: React.FC<PickerProps> = ({
  reportsData,
  selectedReport,
  isOpen,
  setIsOpen,
  onSelect,
}) => {
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

const EmptyPicker: React.FC = () => (
  <Select
    isDisabled
    onToggle={() => undefined}
    aria-label="ReportList"
    toggleAriaLabel="ReportListSelect"
    placeholderText="No dry runs exist"
  />
);

const Progress: React.FC<{ report: DomainProgress }> = ({
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
      <StyledSpinner size="sm" /> {current} / {tot}
    </StyledLabel>
  );
};

const StyledLabel = styled(Label)`
  margin-right: 4px;
`;

const StyledSpinner = styled(Spinner)`
  --pf-v5-c-spinner--Color: ${global_Color_100.var};
  margin-right: 8px;
`;
