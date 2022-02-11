import React, { useState } from "react";
import { Maybe, RemoteData } from "@/Core";
import { DryRun } from "@/Test";
import { MaybeReport } from "../types";
import { SelectReportAction } from "./SelectReportAction";

export default {
  title: "SelectReportAction",
  component: SelectReportAction,
};

const list = [DryRun.a, ...DryRun.listOfReports];

export const Default: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<MaybeReport>(
    Maybe.some(list[0])
  );
  return (
    <SelectReportAction
      setSelectedReport={setSelectedReport}
      selectedReport={selectedReport}
      reportsData={RemoteData.success(list)}
    />
  );
};
