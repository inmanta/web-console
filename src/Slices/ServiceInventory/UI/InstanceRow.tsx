import React from "react";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import styled from "styled-components";
import { Row, ServiceModel } from "@/Core";
import { StateLabel } from "@/Slices/ServiceInstanceDetails/UI/Components/Sections";
import { DateWithTooltip } from "@/UI/Components";
import { CopyMultiOptions } from "@/UI/Components/CopyMultiOptions";
import { words } from "@/UI/words";
import { DeploymentProgressBar, IdWithCopy } from "./Components";
import { RowActions } from "./Components/RowActionsMenu/RowActions";

interface Props {
  row: Row;
  shouldUseServiceIdentity?: boolean;
  idDataLabel: string;
  service: ServiceModel;
}

export const InstanceRow: React.FC<Props> = ({
  row,
  shouldUseServiceIdentity,
  idDataLabel,
  service,
}) => {
  const openTabAndScrollTo = () => () => {
    // Replace with opening the instance details and opening the resource tab
  };

  return (
    <Tbody>
      <Tr
        className={row.deleted ? "danger" : ""}
        id={`instance-row-${row.id.short}`}
        aria-label="InstanceRow-Intro"
      >
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
        <Td dataLabel={words("inventory.column.state")}>
          <StateLabel service={service} state={row.state} />
        </Td>
        <Td dataLabel={words("inventory.collumn.deploymentProgress")}>
          <ActionWrapper
            id={`instance-row-resources-${row.id.short}`}
            onClick={openTabAndScrollTo()}
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
        <Td dataLabel="actions" isActionCell>
          <RowActions
            instanceId={row.id.full}
            service_identity_attribute_value={row.serviceIdentityValue}
            entity={service.name}
            editDisabled={row.editDisabled}
            deleteDisabled={row.deleteDisabled}
            diagnoseDisabled={row.deleted}
            version={row.version}
          />
        </Td>
      </Tr>
    </Tbody>
  );
};

const ActionWrapper = styled.span`
  cursor: pointer;
`;
