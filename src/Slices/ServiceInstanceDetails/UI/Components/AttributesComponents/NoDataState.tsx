import React from "react";
import { words } from "@/Core";
import { ErrorView } from "@/UI/Components/ErrorView";

/**
 * React Component containing the errorView that is shared
 * amongst the different views of the attributesTab
 */
export const NoDataState: React.FC = () => (
  <ErrorView message={words("instanceDetails.page.noData")} />
);
