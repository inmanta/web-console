import React from "react";
import { words } from "@/UI";
import { ErrorView } from "@/UI/Components";

export const NoDataState: React.JSX.Element = (
  <ErrorView message={words("instanceDetails.page.noData")} />
);
