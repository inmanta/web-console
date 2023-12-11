import React from "react";
import { SelectOptionProps, ToolbarFilter } from "@patternfly/react-core";
import { CompileStatus } from "@/Core";
import { SingleTextSelect } from "@/UI/Components";
import { words } from "@/UI/words";
import { Kind } from "@S/CompileReports/Core/Query";

interface Props {
  isVisible: boolean;
  selected: string | null;
  setSelected: (selected: string | null) => void;
}

export const StatusFilter: React.FC<Props> = ({
  isVisible,
  selected,
  setSelected,
}) => {
  const compileStatuses: SelectOptionProps[] = Object.keys(CompileStatus).map(
    (key) => {
      return { value: CompileStatus[key], children: CompileStatus[key] };
    },
  );
  const deleteChip = () => setSelected(null);
  return (
    <ToolbarFilter
      chips={selected ? [selected] : []}
      showToolbarItem={isVisible}
      categoryName={Kind.Status}
      deleteChip={deleteChip}
    >
      <SingleTextSelect
        toggleAriaLabel={Kind.Status}
        placeholderText={words("compileReports.filters.status.placeholder")}
        options={compileStatuses}
        selected={selected}
        setSelected={setSelected}
      />
    </ToolbarFilter>
  );
};
