import React, { useRef, useState } from "react";
import styled from "styled-components";
import { Tbody, Tr, Td, ExpandableRowContent } from "@patternfly/react-table";
import { Row, VersionedServiceInstanceIdentifier } from "@/Core";
import { words } from "@/UI/words";
import { DateWithTooltip, TextWithCopy } from "@/UI/Components";
import { AttributesSummaryView, IdWithCopy } from "./Components";
import { DeploymentProgressPresenter } from "./Presenters";
import { Tabs, TabKey } from "./Tabs";
import { scrollRowIntoView } from "@/UI/Utils";

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
  const deploymentProgressPresenter = new DeploymentProgressPresenter();
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
            <IdWithCopy id={row.id} />
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
          <span
            id={`instance-row-resources-${row.id.short}`}
            onClick={openTabAndScrollTo(TabKey.Resources)}
          >
            {deploymentProgressPresenter.getDeploymentProgressBar(
              row.deploymentProgress
            )}
          </span>
        </Td>
        <Td dataLabel={words("inventory.column.createdAt")}>
          <DateWithTooltip date={row.createdAt} />
        </Td>
        <Td dataLabel={words("inventory.column.updatedAt")}>
          <DateWithTooltip date={row.updatedAt} />
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

const StyledRow = styled(Tr)<{ $deleted: boolean }>`
  ${(p) =>
    p.$deleted ? "background-color: var(--pf-global--palette--red-50);" : ""}
`;
