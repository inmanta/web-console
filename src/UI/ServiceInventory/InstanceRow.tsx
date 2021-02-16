import { InstanceForResources, Row } from "@/Core";
import React, { useState } from "react";
import { Tbody, Tr, Td, ExpandableRowContent } from "@patternfly/react-table";
import { words } from "@/UI";
import {
  AttributesSummaryView,
  DateWithTooltip,
  IdWithCopy,
} from "./Components";
import {
  ServiceInstanceDetails,
  AttributesView,
  StatusView,
  ResourcesView,
  TabKey,
} from "@/UI/ServiceInstanceDetails";
import {
  AutomationIcon,
  InfoCircleIcon,
  ListIcon,
} from "@patternfly/react-icons";
import { DeploymentProgressPresenter } from "./Presenters";

interface Props {
  row: Row;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  actions: React.ReactElement | null;
  state: React.ReactElement | null;
  instanceForResources: InstanceForResources;
}

export const InstanceRow: React.FC<Props> = ({
  row,
  index,
  isExpanded,
  onToggle,
  numberOfColumns,
  actions,
  state,
  instanceForResources,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("Status");
  const deploymentProgressPresenter = new DeploymentProgressPresenter();
  const attributesOnClick = () => {
    if (!isExpanded) {
      onToggle();
    }
    setActiveTab("Attributes");
  };
  return (
    <Tbody isExpanded={false}>
      <Tr id={`instance-row-${row.id.short}`}>
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        <Td dataLabel={words("inventory.column.id")}>
          <IdWithCopy id={row.id} />
        </Td>
        <Td dataLabel={words("inventory.column.state")}>{state}</Td>
        <Td dataLabel={words("inventory.column.attributesSummary")}>
          <a href={`#instance-row-${row.id.short}`}>
            <AttributesSummaryView
              summary={row.attributesSummary}
              onClick={attributesOnClick}
            />
          </a>
        </Td>
        <Td dataLabel={words("inventory.collumn.deploymentProgress")}>
          {deploymentProgressPresenter.getDeploymentProgressBar(
            row.deploymentProgress
          )}
        </Td>
        <Td dataLabel={words("inventory.column.createdAt")}>
          <DateWithTooltip date={row.createdAt} />
        </Td>
        <Td dataLabel={words("inventory.column.updatedAt")}>
          <DateWithTooltip date={row.updatedAt} />
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded} data-testid={`details_${row.id.short}`}>
        <Td colSpan={numberOfColumns}>
          <ExpandableRowContent>
            <ServiceInstanceDetails
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            >
              <StatusView
                title={words("inventory.tabs.status")}
                icon={<InfoCircleIcon />}
                statusInfo={{
                  instanceId: row.id.full,
                  state: state,
                  version: row.version,
                  createdAt: row.createdAt.full,
                  updatedAt: row.updatedAt.full,
                  actions: actions,
                }}
              />
              <AttributesView
                attributes={row.attributes}
                title={words("inventory.tabs.attributes")}
                icon={<ListIcon />}
              />
              <ResourcesView
                instance={instanceForResources}
                title={words("inventory.tabs.resources")}
                icon={<AutomationIcon />}
              />
            </ServiceInstanceDetails>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};
