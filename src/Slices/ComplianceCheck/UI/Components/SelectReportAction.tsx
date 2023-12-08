import React, { useEffect, useState } from "react";
import {
  Label,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectOption,
  Spinner,
  ToolbarGroup,
} from "@patternfly/react-core";
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

  const onSelect = (value) => {
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
        setIsOpen={(value) => setIsOpen(value)}
        onSelect={onSelect}
      />
    </ToolbarGroup>
  );
};

interface PickerProps {
  reportsData: RemoteReportList;
  selectedReport: MaybeReport;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSelect: (value: string | number | undefined) => void;
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

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      aria-label="ReportListSelect"
      isExpanded={isOpen}
      style={
        {
          width: "300px",
        } as React.CSSProperties
      }
    >
      <Progress report={reportsData.value[0]} />{" "}
      {datePresenter.getFull(selectedReport.value.date)}
    </MenuToggle>
  );

  return (
    <Select
      toggle={toggle}
      onSelect={(_event, value) => onSelect(value)}
      selected={selectedReport.value.id}
      isOpen={isOpen}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      aria-label="ReportList"
    >
      {reportsData.value.map((report) => (
        <SelectOption key={report.id} value={report.id}>
          <Progress report={report} /> {datePresenter.getFull(report.date)}
        </SelectOption>
      ))}
    </Select>
  );
};

const DisabledToggle = () => (
  <MenuToggle aria-label="ReportListSelect" isDisabled>
    No Dry runs exists
  </MenuToggle>
);

const EmptyPicker: React.FC = () => (
  <Select toggle={DisabledToggle} aria-label="ReportList" />
);

const Progress: React.FC<{ report: DomainProgress }> = ({ report }) => {
  const tot = Number(report.total);
  const current = tot - Number(report.todo);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(tot === current);
  }, [tot, current, report.total, report.todo, done]);

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
