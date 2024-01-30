import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import styled from "styled-components";
import { ServiceOrderItem } from "@/Slices/Orders/Core/Query";
import { OrderStatusLabel } from "@/Slices/Orders/UI/OrderStatusLabel";
import { CodeHighlighter, TextWithCopy, Toggle } from "@/UI/Components";
import { words } from "@/UI/words";
import { OrderDependencies } from "./OrderDependencies";
import { OrderStateDetails } from "./OrderStateDetails";

interface Props {
  row: ServiceOrderItem;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
}

export const OrderDetailsRow: React.FC<Props> = ({
  row,
  isExpanded,
  onToggle,
  numberOfColumns,
}) => {
  return (
    <Tbody>
      <Tr aria-label="ServiceOrderDetailsRow">
        <Td>
          <Toggle
            expanded={isExpanded}
            onToggle={onToggle}
            aria-label={`Toggle-${row.instance_id}`}
          />
        </Td>
        <Td width={35} dataLabel={words("orders.column.instanceId")}>
          <TextWithCopy
            value={row.instance_id}
            tooltipContent={words("serviceIdentity.copy")}
          />
        </Td>
        <Td width={25} dataLabel={words("orders.column.serviceEntity")}>
          {row.service_entity}
        </Td>
        <Td width={20} dataLabel={words("orders.column.action")}>
          {row.action.toUpperCase()}
        </Td>
        <Td style={{ width: "50px" }} dataLabel={words("orders.column.status")}>
          <OrderStatusLabel status={row.status.state} />
        </Td>
      </Tr>
      {isExpanded && (
        <Tr aria-label="Expanded-Discovered-Row" isExpanded={isExpanded}>
          <Td colSpan={numberOfColumns}>
            <PaddedDescriptionList
              isFillColumns
              isHorizontal
              horizontalTermWidthModifier={{
                default: "25ch",
              }}
            >
              <TopAlignedLayout>
                <DescriptionListTerm>
                  {words("orders.row.details")}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <OrderStateDetails state={row.status} />
                </DescriptionListDescription>
              </TopAlignedLayout>
              <TopAlignedLayout>
                <DescriptionListTerm>
                  {words("orders.row.dependencies")}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <OrderDependencies
                    dependencies={row.status.direct_dependencies}
                  />
                </DescriptionListDescription>
              </TopAlignedLayout>
              <TopAlignedLayout>
                <DescriptionListTerm>
                  {words("orders.row.config")}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  {row.config && Object.keys(row.config).length ? (
                    <CodeHighlighter
                      keyId="Json"
                      code={JSON.stringify(row.config, null, 2)}
                      language="json"
                    />
                  ) : (
                    <Label icon={<ExclamationCircleIcon />} variant="outline">
                      {words("orders.row.empty")}
                    </Label>
                  )}
                </DescriptionListDescription>
              </TopAlignedLayout>
              {(row.attributes || row.edits) && (
                <TopAlignedLayout>
                  <DescriptionListTerm>
                    {words("orders.row.body")}
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    <CodeHighlighter
                      keyId="Json"
                      code={JSON.stringify(
                        row.attributes || row.edits,
                        null,
                        2,
                      )}
                      language="json"
                    />
                  </DescriptionListDescription>
                </TopAlignedLayout>
              )}
            </PaddedDescriptionList>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};

const PaddedDescriptionList = styled(DescriptionList)`
  padding-bottom: 1em;
  padding-top: 2em;
`;

const TopAlignedLayout = styled(DescriptionListGroup)`
  align-items: start;
`;
