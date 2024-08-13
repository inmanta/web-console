import React, { useContext } from "react";
import { useUrlStateWithString } from "@/Data";
import { InstanceDetailsContext } from "@/Slices/ServiceInstanceDetails/Core/Context";
import { words } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import { AttributesTableContent } from "./AttributesTableContent";
import { getAvailableAttributesSets } from "./Utils";

/**
 * The AttributesTable Component
 *
 * This component handles the loading and error state of the view.
 * It will set the dropdownOptions for the TreeTable and filter out the attributesSet based on the selectedVersion.
 *
 * @returns {React.FC} A React Component displaying the AttributesTable.
 */
export const AttributesTable: React.FC = () => {
  const { logsQuery, instance } = useContext(InstanceDetailsContext);

  const [selectedVersion] = useUrlStateWithString<string>({
    default: String(instance.version),
    key: `version`,
    route: "InstanceDetails",
  });

  if (logsQuery.isLoading) {
    return <LoadingView />;
  }

  if (!logsQuery.data) {
    return NoDataState;
  }

  const attributeSets = getAvailableAttributesSets(
    logsQuery.data,
    selectedVersion,
  );

  const dropdownOptions = Object.keys(attributeSets);

  if (!dropdownOptions.length) {
    return NoDataState;
  }

  return (
    <AttributesTableContent
      attributeSets={attributeSets}
      dropdownOptions={dropdownOptions}
    />
  );
};

const NoDataState: React.JSX.Element = (
  <ErrorView message={words("instanceDetails.page.noData")} />
);
