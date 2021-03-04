import React from "react";
import { ExpandableTable } from "./ExpandableTable";
import { InstanceLog as InstanceLogData } from "@/Test";
import { InstanceLog } from "@/Core";
import { InstanceLogRow } from "@/UI/Pages/ServiceInstanceHistory/InstanceLogRow";

export default {
  title: "ExpandableTable",
  component: ExpandableTable,
};

export const Default: React.FC = () => {
  const columnHeads = ["Version", "Timestamp", "State", "Attributes"];
  const ids = InstanceLogData.list.map((log) => log.version.toString());
  const dict: Record<string, InstanceLog> = {};
  InstanceLogData.list.forEach((log) => (dict[log.version.toString()] = log));
  return (
    <ExpandableTable
      columnHeads={columnHeads}
      ids={ids}
      Row={(props) => <InstanceLogRow {...props} log={dict[props.id]} />}
    />
  );
};
