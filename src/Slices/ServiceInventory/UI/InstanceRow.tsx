import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Flex, FlexItem } from "@patternfly/react-core";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import styled from "styled-components";
import { Row, ServiceModel } from "@/Core";
import { StateLabel } from "@/Slices/ServiceInstanceDetails/UI/Components/Sections";
import { DependencyContext } from "@/UI";
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
  const { routeManager } = useContext(DependencyContext);

  const instanceDetailsUrl = routeManager.useUrl("InstanceDetails", {
    service: service.name,
    instance: row.serviceIdentityValue || row.id.full,
    instanceId: row.id.full,
  });
  const navigate = useNavigate();

  return (
    <Tbody>
      <Tr
        className={row.deleted ? "danger" : ""}
        id={`instance-row-${row.id.short}`}
        aria-label="InstanceRow-Intro"
      >
        {shouldUseServiceIdentity && row.serviceIdentityValue ? (
          <Td dataLabel={idDataLabel} aria-label={`IdentityCell-${row.serviceIdentityValue}`}>
            {row.serviceIdentityValue}
            <CopyMultiOptions options={[row.serviceIdentityValue, row.id.full]} />
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
            aria-label="deploy-progress"
            onClick={() => navigate(`${instanceDetailsUrl}&state.InstanceDetails.tab=Resources`)}
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
          <Flex flexWrap={{ default: "nowrap" }}>
            <FlexItem>
              <Link
                aria-label="instance-details-link"
                to={{
                  pathname: routeManager.getUrl("InstanceDetails", {
                    service: service.name,
                    instance: row.serviceIdentityValue || row.id.full,
                    instanceId: row.id.full,
                  }),
                  search: location.search,
                }}
              >
                <Button variant="link">{words("instanceDetails.button")}</Button>
              </Link>
            </FlexItem>
            <FlexItem>
              <RowActions
                instanceId={row.id.full}
                service_identity_attribute_value={row.serviceIdentityValue}
                entity={service.name}
                editDisabled={row.editDisabled}
                deleteDisabled={row.deleteDisabled}
                diagnoseDisabled={row.deleted}
                version={row.version}
              />
            </FlexItem>
          </Flex>
        </Td>
      </Tr>
    </Tbody>
  );
};

const ActionWrapper = styled.span`
  cursor: pointer;
`;
