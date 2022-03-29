import React, { useRef } from "react";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import { AttributesSummary, InstanceLog } from "@/Core";
import { useUrlStateWithString } from "@/Data";
import { AttributesSummaryView } from "@/UI/Components";
import { MomentDatePresenter, scrollRowIntoView } from "@/UI/Utils";
import { Tabs, TabKey } from "./Tabs";

interface Props {
  id: string;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  log: InstanceLog;
  timestamp: string;
  attributesSummary: AttributesSummary;
  state: React.ReactElement;
}

export const InstanceLogRow: React.FC<Props> = ({
  numberOfColumns,
  isExpanded,
  index,
  onToggle,
  id,
  log,
  timestamp,
  attributesSummary,
  state,
}) => {
  const [activeTab, setActiveTab] = useUrlStateWithString<TabKey>({
    default: TabKey.Attributes,
    key: `tab-${id}`,
    route: "History",
  });
  const rowRef = useRef<HTMLTableCellElement>(null);
  const attributesOnClick = () => {
    if (!isExpanded) {
      onToggle();
    }
    setActiveTab(TabKey.Attributes);
    scrollRowIntoView(rowRef);
  };

  return (
    <Tbody isExpanded={false}>
      <Tr id={`instance-row-${id}`}>
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        <Td dataLabel={"version"}>{id}</Td>
        <Td dataLabel={"timestamp"}>
          {new MomentDatePresenter().getFull(timestamp)}
        </Td>
        <Td dataLabel={"state"}>{state}</Td>
        <Td dataLabel={"Attributes"} ref={rowRef}>
          <AttributesSummaryView
            summary={attributesSummary}
            onClick={attributesOnClick}
          />
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded} data-testid={`details_${id}`}>
        <Td colSpan={numberOfColumns}>
          <ExpandableRowContent>
            <Tabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              state={state}
              log={log}
              timestamp={timestamp}
            />
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};
