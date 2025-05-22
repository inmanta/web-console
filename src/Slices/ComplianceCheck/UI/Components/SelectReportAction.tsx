import React, { useEffect, useState } from "react";
import {
  Label,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  ToolbarGroup,
} from "@patternfly/react-core";
import { DryRun } from "@/Data/Queries/Slices/DryRun";
import { MomentDatePresenter } from "@/UI/Utils";
import { Progress as DomainProgress } from "@S/ComplianceCheck/Core/Domain";

interface Props {
  setSelectedReport(report: DryRun | null): void;
  selectedReport: DryRun | null;
  reportsData?: DryRun[];
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
    if (!reportsData) return;

    const report = reportsData.find((report) => report.id === value);

    if (report === undefined) return;

    setSelectedReport(report);
    setIsOpen(false);
  };

  return (
    <ToolbarGroup align={{ default: "alignStart" }}>
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
  reportsData?: DryRun[];
  selectedReport: DryRun | null;
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
  if (!reportsData) return null;

  if (reportsData.length <= 0) return <EmptyPicker />;

  if (!selectedReport) return null;

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
      <Progress report={reportsData[0]} /> {datePresenter.getFull(selectedReport.date)}
    </MenuToggle>
  );

  return (
    <Select
      toggle={toggle}
      onSelect={(_event, value) => onSelect(value)}
      selected={selectedReport.id}
      isOpen={isOpen}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      aria-label="ReportList"
    >
      <SelectList aria-label="ReportSelectOptions">
        {reportsData.map((report) => (
          <SelectOption key={report.id} value={report.id}>
            <Progress report={report} /> {datePresenter.getFull(report.date)}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

const DisabledToggle = () => (
  <MenuToggle aria-label="ReportListSelect" isDisabled>
    No Dry runs exists
  </MenuToggle>
);

const EmptyPicker: React.FC = () => <Select toggle={DisabledToggle} aria-label="ReportList" />;

const Progress: React.FC<{ report: DomainProgress }> = ({ report }) => {
  const tot = Number(report.total);
  const current = tot - Number(report.todo);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(tot === current);
  }, [tot, current, report.total, report.todo, done]);

  return done ? (
    <Label variant="outline">
      {current} / {tot}
    </Label>
  ) : (
    <Label variant="outline" color="blue" icon={<Spinner size="sm" />}>
      {current} / {tot}
    </Label>
  );
};
