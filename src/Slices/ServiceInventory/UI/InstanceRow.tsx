import React, { useRef, useState } from "react";
import { Tbody, Tr, Td, ExpandableRowContent } from "@patternfly/react-table";
import styled from "styled-components";
import { Row, VersionedServiceInstanceIdentifier } from "@/Core";
import {
  DateWithTooltip,
  TextWithCopy,
  AttributesSummaryView,
} from "@/UI/Components";
import { scrollRowIntoView } from "@/UI/Utils";
import { words } from "@/UI/words";
import { DeploymentProgressBar, IdWithCopy } from "./Components";
import { Tabs, TabKey } from "./Tabs";

interface Props {
  row: Row;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  actions: React.ReactElement | null;
  state: React.ReactElement | null;
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
  shouldUseServiceIdentity?: boolean;
  idDataLabel: string;
}

export const InstanceRow: React.FC<Props> = ({
  row,
  index,
  isExpanded,
  onToggle,
  numberOfColumns,
  actions,
  state,
  serviceInstanceIdentifier,
  shouldUseServiceIdentity,
  idDataLabel,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(TabKey.Status);
  const rowRef = useRef<HTMLSpanElement>(null);
  const openTabAndScrollTo = (tab: TabKey) => () => {
    setActiveTab(tab);
    if (!isExpanded) {
      onToggle();
    }
    scrollRowIntoView(rowRef);
  };
  return (
    <Tbody isExpanded={false}>
      <StyledRow
        $deleted={row.deleted}
        id={`instance-row-${row.id.short}`}
        aria-label="InstanceRow-Intro"
      >
        <Td
          aria-label={`expand-button-${row.id.short}`}
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        {shouldUseServiceIdentity && row.serviceIdentityValue ? (
          <Td
            dataLabel={idDataLabel}
            aria-label={`IdentityCell-${row.serviceIdentityValue}`}
          >
            <TextWithCopy
              value={row.serviceIdentityValue}
              tooltipContent={words("serviceIdentity.copy")}
            />
          </Td>
        ) : (
          <Td dataLabel={idDataLabel} aria-label={`IdCell-${row.id.short}`}>
            <IdWithCopy uuid={row.id} />
          </Td>
        )}
        <Td dataLabel={words("inventory.column.state")}>{state}</Td>
        <Td
          dataLabel={words("inventory.column.attributesSummary")}
          id={`instance-row-summary-${row.id.short}`}
        >
          <span ref={rowRef} />
          <AttributesSummaryView
            summary={row.attributesSummary}
            onClick={openTabAndScrollTo(TabKey.Attributes)}
          />
        </Td>
        <Td dataLabel={words("inventory.collumn.deploymentProgress")}>
          <ActionWrapper
            id={`instance-row-resources-${row.id.short}`}
            onClick={openTabAndScrollTo(TabKey.Resources)}
          >
            <DeploymentProgressBar progress={row.deploymentProgress} />
          </ActionWrapper>
        </Td>
        <Td dataLabel={words("inventory.column.createdAt")}>
          <DateWithTooltip timestamp={row.createdAt} />
        </Td>
        <Td dataLabel={words("inventory.column.updatedAt")}>
          <DateWithTooltip timestamp={row.updatedAt} />
        </Td>
      </StyledRow>
      <Tr
        isExpanded={isExpanded}
        data-testid={`details_${row.id.short}`}
        aria-label="InstanceRow-Details"
      >
        <Td colSpan={numberOfColumns}>
          <ExpandableRowContent>
            <Tabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              row={row}
              state={state}
              actions={actions}
              serviceInstanceIdentifier={serviceInstanceIdentifier}
            />
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

const ActionWrapper = styled.span`
  cursor: pointer;
`;

const StyledRow = styled(Tr)<{ $deleted: boolean }>`
  ${(p) =>
    p.$deleted ? "background-color: var(--pf-global--palette--red-50);" : ""}
`;
