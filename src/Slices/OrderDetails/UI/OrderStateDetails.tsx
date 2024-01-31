import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { ServiceOrderItemStatus } from "@/Slices/Orders/Core/Query";
import { DependencyContext, words } from "@/UI";

interface Props {
  state: ServiceOrderItemStatus;
}

/**
 * OrderStateDetails component.
 *
 * It will display the information about the ServiceOrderItem conditionally,
 * depending on the properties made available in the data.
 * It also contains a link to the compile report if present.
 *
 * (Compile reports are only available when the ServiceOrderItem has either failed or completed)
 *
 * @param state ServiceOrderItemStatus
 * @returns ReactNode
 */
export const OrderStateDetails: React.FC<Props> = ({ state }) => {
  const { routeManager } = useContext(DependencyContext);

  if (!state.failure_type && !state.reason && !state.validation_compile_id) {
    return (
      <Label icon={<ExclamationCircleIcon />} variant="outline">
        {words("orders.row.empty")}
      </Label>
    );
  }

  return (
    <Card>
      <CardBody>
        <PaddedDescriptionList isHorizontal>
          {state.failure_type && (
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words("orders.row.failureType")}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {state.failure_type}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {state.reason && (
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words("orders.row.reason")}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {state.reason}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {state.validation_compile_id && (
            <Link
              target="_blank"
              to={{
                pathname: routeManager.getUrl("CompileDetails", {
                  id: state.validation_compile_id,
                }),
                search: location.search,
              }}
            >
              {words("orders.row.compilerReport")}
            </Link>
          )}
        </PaddedDescriptionList>
      </CardBody>
    </Card>
  );
};

const PaddedDescriptionList = styled(DescriptionList)`
  padding-left: 1em;
  padding-right: 1em;
`;
