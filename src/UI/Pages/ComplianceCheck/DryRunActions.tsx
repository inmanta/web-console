import React, { useState } from "react";
import {
  Button,
  Select,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
} from "@patternfly/react-core";
import { MomentDatePresenter } from "@/UI/Utils";
import { ProgressReport, RemoteReportId, RemoteReportList } from "./types";

interface Props {
  updateList(): void;
  setReportId(reportId: string): void;
  reportId: RemoteReportId;
  reportsData: RemoteReportList;
}

const datePresenter = new MomentDatePresenter();

export const DryRunActions: React.FC<Props> = ({
  setReportId,
  reportId,
  updateList,
  reportsData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // This should be the trigger from the command
  const trigger = async () => {
    console.log("trigger");
  };

  const onTrigger = async () => {
    await trigger();
    updateList();
  };

  const onSelect = (event, value) => {
    setReportId(value);
    setIsOpen(false);
  };

  return (
    <Toolbar>
      <ToolbarContent style={{ padding: 0 }}>
        <ToolbarGroup alignment={{ default: "alignLeft" }}>
          {reportsData.kind === "Success" && reportId.kind === "Success" && (
            <Select
              onToggle={setIsOpen}
              onSelect={onSelect}
              selections={reportId.value}
              isOpen={isOpen}
            >
              {reportsData.value.map((report) => (
                <SelectOption key={report.id} value={report.id}>
                  {datePresenter.getFull(report.date)}{" "}
                  <Progress report={report} />
                </SelectOption>
              ))}
            </Select>
          )}
        </ToolbarGroup>
        <ToolbarGroup alignment={{ default: "alignRight" }}>
          <Button onClick={onTrigger}>Trigger new dryrun</Button>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

const Progress: React.FC<{ report: ProgressReport }> = ({
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
