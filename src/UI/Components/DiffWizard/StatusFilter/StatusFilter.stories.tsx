import React, { useState } from "react";
import { Diff } from "@/Core";
import { StatusFilter } from "./StatusFilter";

export default {
  title: "Components/Diff.StatusFilter",
  component: StatusFilter,
};

export const Default: React.FC = () => {
  const [statuses, setStatuses] = useState(Diff.statuses);
  return <StatusFilter statuses={statuses} setStatuses={setStatuses} />;
};
