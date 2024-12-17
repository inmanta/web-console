import React, { useRef, useState } from "react";

import { Tbody, Tr, Td, ExpandableRowContent } from "@patternfly/react-table";
import styled from "styled-components";
import { Row, ServiceModel, VersionedServiceInstanceIdentifier } from "@/Core";
import { DateWithTooltip } from "@/UI/Components";
import { CopyMultiOptions } from "@/UI/Components/CopyMultiOptions";
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
  rowActions: React.ReactElement | null;
  state: React.ReactElement | null;
  service?: ServiceModel;
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
  rowActions,
  state,
  serviceInstanceIdentifier,
  shouldUseServiceIdentity,
  idDataLabel,
  service,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey | string>(TabKey.Status);
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
            {row.serviceIdentityValue}
            <CopyMultiOptions
              options={[row.serviceIdentityValue, row.id.full]}
            />
          </Td>
        ) : (
          <Td dataLabel={idDataLabel} aria-label={`IdCell-${row.id.short}`}>
            <IdWithCopy uuid={row.id} />
          </Td>
        )}
        <Td dataLabel={words("inventory.column.state")}>{state}</Td>
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
        <Td dataLabel="actions">{rowActions}</Td>
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
              serviceInstanceIdentifier={serviceInstanceIdentifier}
              service={service}
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
    p.$deleted
      ? "background-color: var(--pf-t--global--color--nonstatus--red--default)"
      : ""}
`;
