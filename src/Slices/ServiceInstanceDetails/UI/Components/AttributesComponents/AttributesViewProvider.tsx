import React, { useContext } from "react";
import { useUrlStateWithString } from "@/Data";
import { InstanceDetailsContext } from "@/Slices/ServiceInstanceDetails/Core/Context";
import { LoadingView } from "@/UI/Components";
import { AttributesCompare } from "./AttributesCompare";
import { AttributesEditor } from "./AttributesEditor";
import { AttributesTable } from "./AttributesTable";
import { NoDataState } from "./NoDataState";
import {
  AttributeViews,
  AttributeViewToggles,
  getAvailableAttributesSets,
} from "./Utils";

interface Props {
  selectedView: AttributeViews;
}

/**
 * The AttributesProvider Component
 *
 * This component handles the loading and error state of the view.
 * It will set the dropdownOptions and filter out the attributesSet based on the selectedVersion.
 *
 * @props {Props} - The props of the component
 *  @prop {AttributeViews} selectedView - the active selected view
 * @returns {React.FC<>} A React Component displaying the Attributes depending on the toggled AttributeView.
 */
export const AttributesViewProvider: React.FC<Props> = ({ selectedView }) => {
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
    <>
      {selectedView === AttributeViewToggles.TABLE && (
        <AttributesTable
          attributeSets={attributeSets}
          dropdownOptions={dropdownOptions}
        />
      )}
      {selectedView === AttributeViewToggles.EDITOR && (
        <AttributesEditor
          attributeSets={attributeSets}
          dropdownOptions={dropdownOptions}
          service_entity={instance.service_entity}
        />
      )}
      {selectedView === AttributeViewToggles.COMPARE && (
        <AttributesCompare
          instanceLogs={logsQuery.data}
          selectedVersion={selectedVersion}
        />
      )}
    </>
  );
};
