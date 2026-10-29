import React, { useContext } from "react";
import { GetDesiredStatesContext } from "@inmanta/web-console-feature-orchestration-engine/Slices/DesiredState/UI/GetDesiredStatesContext";
import { CompareSelectionLabel } from "./CompareSelectionLabel";

export const CompareSelectionWidget: React.FC = () => {
  const { compareSelection: selection, setCompareSelection } = useContext(GetDesiredStatesContext);

  const onDelete = () => {
    setCompareSelection(undefined);
  };

  return <CompareSelectionLabel selection={selection} onDelete={onDelete} />;
};
