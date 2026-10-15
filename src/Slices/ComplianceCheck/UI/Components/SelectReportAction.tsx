import React, { useState } from "react";
import {
  Flex,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  ToolbarGroup,
} from "@patternfly/react-core";
import { DryRun } from "@/Core";
import { CustomDatePresenter } from "@/UI/Utils";
import { DryRunProgressLabel } from "./DryRunProgressLabel";
import { ScopeLabel } from "./ReportScope";
import { InstancesById } from "./ReportScope/types";

interface Props {
  setSelectedReport(report: DryRun | null): void;
  selectedReport: DryRun | null;
  reportsData?: DryRun[];
  instances: InstancesById;
}

const datePresenter = new CustomDatePresenter();

/**
 * The width of a report's line in the picker, so the toggle keeps one size and its scope label
 * ends at the right, like in the options: the widest progress and date ("100 / 100" and a full
 * date, about 13.5rem), the gap (1rem), the label's padding (1rem) and a scope label at its
 * longest (28 characters, about 14rem).
 */
const REPORT_LABEL_WIDTH = "30rem";

export const SelectReportAction: React.FC<Props> = ({
  setSelectedReport,
  selectedReport,
  reportsData,
  instances,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // This should be the trigger from the command

  const onSelect = (value) => {
    if (!reportsData) {
      return;
    }

    const report = reportsData.find((report) => report.id === value);

    if (report === undefined) {
      return;
    }

    setSelectedReport(report);
    setIsOpen(false);
  };

  return (
    <ToolbarGroup align={{ default: "alignStart" }}>
      <Picker
        reportsData={reportsData}
        selectedReport={selectedReport}
        instances={instances}
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
  instances: InstancesById;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSelect: (value: string | number | undefined) => void;
}

const Picker: React.FC<PickerProps> = ({
  reportsData,
  selectedReport,
  instances,
  isOpen,
  setIsOpen,
  onSelect,
}) => {
  if (!reportsData) {
    return null;
  }

  if (reportsData.length <= 0) {
    return <EmptyPicker />;
  }

  if (!selectedReport) {
    return null;
  }

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      aria-label="ReportListSelect"
      isExpanded={isOpen}
    >
      <ReportLabel report={selectedReport} instances={instances} />
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
      isScrollable
    >
      <SelectList aria-label="ReportSelectOptions">
        {reportsData.map((report) => (
          <SelectOption key={report.id} value={report.id}>
            <ReportLabel report={report} instances={instances} />
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

/**
 * Identifies a report in the picker: its progress and date, with a summary of its scope on the
 * right.
 *
 * @props {{ report: DryRun; instances: InstancesById }} props - The props of the component
 *  @prop {DryRun} report - The dry run report
 *  @prop {InstancesById} instances - The instances of the reports' filters, to show by name
 *
 * @returns {React.FC<{ report: DryRun; instances: InstancesById }>} The report's line
 */
const ReportLabel: React.FC<{ report: DryRun; instances: InstancesById }> = ({
  report,
  instances,
}) => (
  <Flex
    justifyContent={{ default: "justifyContentSpaceBetween" }}
    alignItems={{ default: "alignItemsCenter" }}
    gap={{ default: "gapMd" }}
    flexWrap={{ default: "nowrap" }}
    style={{ width: REPORT_LABEL_WIDTH }}
  >
    <Flex
      gap={{ default: "gapSm" }}
      alignItems={{ default: "alignItemsCenter" }}
      flexWrap={{ default: "nowrap" }}
    >
      <DryRunProgressLabel progress={report} />
      {datePresenter.getFull(report.date)}
    </Flex>
    <ScopeLabel report={report} instances={instances} />
  </Flex>
);
