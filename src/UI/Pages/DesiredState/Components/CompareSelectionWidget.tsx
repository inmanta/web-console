import React, { useContext } from "react";
import { Chip, ChipGroup } from "@patternfly/react-core";
import { Maybe } from "@/Core";
import { GetDesiredStatesContext } from "@/UI/Pages/DesiredState/GetDesiredStatesContext";
import { words } from "@/UI/words";

export const CompareSelectionWidget: React.FC = () => {
  const { compareSelection: selection, setCompareSelection } = useContext(
    GetDesiredStatesContext
  );

  const onDelete = () => {
    setCompareSelection(Maybe.none());
  };

  return (
    <ChipGroup categoryName={words("desiredState.compare.selectionLabel")}>
      {Maybe.isNone(selection) ? (
        <Chip isReadOnly>...</Chip>
      ) : (
        <Chip onClick={onDelete}>
          <b>{selection.value}</b> &amp; ...
        </Chip>
      )}
    </ChipGroup>
  );
};
