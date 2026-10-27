import React from "react";
import { words } from "@inmanta/web-console-core";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";

/**
 * React Component containing the errorView that is shared
 * amongst the different views of the attributesTab
 */
export const NoDataState: React.FC = () => (
  <ErrorView message={words("instanceDetails.page.noData")} />
);
