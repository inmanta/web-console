import React from "react";
import { ToolbarFilter } from "@patternfly/react-core";
import { CompileReportParams, CompileStatus } from "@/Core";
import { SingleTextSelect } from "@/UI/Components";
import { words } from "@/UI/words";

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
  const compileStatuses = Object.keys(CompileStatus).map(
    (k) => CompileStatus[k]
  );
  const deleteChip = () => setSelected(null);
  return (
    <ToolbarFilter
      chips={selected ? [selected] : []}
      showToolbarItem={isVisible}
      categoryName={CompileReportParams.Kind.Status}
      deleteChip={deleteChip}
    >
      <SingleTextSelect
        toggleAriaLabel={CompileReportParams.Kind.Status}
        placeholderText={words("compileReports.filters.status.placeholder")}
        options={compileStatuses}
        selected={selected}
        setSelected={setSelected}
      />
    </ToolbarFilter>
  );
};
