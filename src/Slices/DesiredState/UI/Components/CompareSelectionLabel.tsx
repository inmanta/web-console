import React from "react";
import { Label, LabelGroup } from "@patternfly/react-core";
import { words } from "@/UI/words";
import { CompareSelection } from "../Utils";

interface Props {
  onDelete(): void;
  selection: CompareSelection;
}

export const CompareSelectionLabel: React.FC<Props> = ({ selection, onDelete }) => {
  return selection !== undefined ? (
    <LabelGroup categoryName={words("desiredState.compare.selectionLabel")}>
      <Label onClose={onDelete}>{selection}</Label>
    </LabelGroup>
  ) : null;
};
