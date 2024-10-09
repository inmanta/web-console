import React from "react";
import { words } from "@/UI";
import { ErrorView } from "@/UI/Components";

/**
 * React Component containing the errorView that is shared
 * amongst the different views of the attributesTab
 */
export const NoDataState: React.JSX.Element = (
  <ErrorView message={words("instanceDetails.page.noData")} />
);
