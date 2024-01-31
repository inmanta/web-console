import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import styled from "styled-components";
import { ServiceOrderItemStatus } from "@/Slices/Orders/Core/Query";
import { DependencyContext, words } from "@/UI";
import { Spinner } from "@/UI/Components";

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
          {state.validation_compile_id ? (
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
          ) : (
            <DescriptionListDescription aria-label="Spinner-Compile">
              <Spinner variant="small" />
            </DescriptionListDescription>
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
