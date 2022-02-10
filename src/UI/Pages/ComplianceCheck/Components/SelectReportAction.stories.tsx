import React, { useState } from "react";
import { Maybe, RemoteData } from "@/Core";
import { DryRun } from "@/Test";
import { MaybeReport } from "../types";
import { SelectReportAction } from "./SelectReportAction";

export default {
  title: "SelectReportAction",
  component: SelectReportAction,
};

const list = [
  { ...DryRun.a, total: 23, todo: 23 },
  { ...DryRun.b, total: 10, todo: 5 },
  DryRun.c,
  { ...DryRun.d, total: 100, todo: 2 },
];

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
