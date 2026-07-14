import React from "react";
import { Language } from "@patternfly/react-code-editor";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
} from "@patternfly/react-core";
import { InfoAltIcon } from "@patternfly/react-icons";
import { Tr, Td } from "@patternfly/react-table";
import styled from "styled-components";
import { JsonFormatter } from "@/Data";
import { ServiceOrderItem } from "@/Slices/Orders/Core/Types";
import { OrderStatusLabel } from "@/Slices/Orders/UI/OrderStatusLabel";
import { CodeEditor, Toggle } from "@/UI/Components";
import { words } from "@/UI/words";
import { OrderDependencies } from "./OrderDependencies";
import { OrderInstanceLink } from "./OrderInstanceLink";
import { OrderStateDetails } from "./OrderStateDetails";

// Same JSON pretty-printer the AttributeClassifier uses console-wide, so config
// and attribute payloads render with identical formatting everywhere.
const jsonFormatter = new JsonFormatter();

interface Props {
  row: ServiceOrderItem;
  orderItems: ServiceOrderItem[];
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  rowRef?: (element: HTMLTableRowElement | null) => void;
  expandInstanceOrderDetailsRow?: (instanceId: string) => void;
}

/**
 * OrderDetailsRow Component
 *
 * Displays all the details in expandable rows about the service_order_item
 *
 * @param row  ServiceOrderItem
 * @param orderItems all service_order_items of the order, used to resolve the identity of dependencies
 * @param isExpanded boolean
 * @param onToggle callback method
 * @param numberOfColumns number
 * @param rowRef ref callback used to scroll to and focus this row from a dependency link
 * @param expandInstanceOrderDetailsRow callback invoked to expand and focus the row for a given instanceId
 * @returns ReactNode
 */
export const OrderDetailsRow: React.FC<Props> = ({
  row,
  orderItems,
  isExpanded,
  onToggle,
  numberOfColumns,
  rowRef,
  expandInstanceOrderDetailsRow,
}) => {
  return (
    <>
      <Tr aria-label="ServiceOrderDetailsRow" ref={rowRef} tabIndex={-1}>
        <Td>
          <Toggle expanded={isExpanded} onToggle={onToggle} aria-label={"Toggle-DetailsRow"} />
        </Td>
        <Td width={35} dataLabel={words("orders.column.instanceId")}>
          <OrderInstanceLink row={row} />
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
              <TopAlignedLayout aria-label="Expanded-Details">
                <DescriptionListTerm>{words("orders.row.details")}</DescriptionListTerm>
                <DescriptionListDescription>
                  <OrderStateDetails state={row.status} />
                </DescriptionListDescription>
              </TopAlignedLayout>
              <TopAlignedLayout aria-label="Expanded-Dependencies">
                <DescriptionListTerm>{words("orders.row.dependencies")}</DescriptionListTerm>
                <DescriptionListDescription>
                  <OrderDependencies
                    dependencies={row.status.direct_dependencies}
                    orderItems={orderItems}
                    expandInstanceOrderDetailsRow={expandInstanceOrderDetailsRow}
                  />
                </DescriptionListDescription>
              </TopAlignedLayout>
              <TopAlignedLayout aria-label="Expanded-Config">
                <DescriptionListTerm>{words("orders.row.config")}</DescriptionListTerm>
                <DescriptionListDescription>
                  {row.config && Object.keys(row.config).length ? (
                    <CodeEditor
                      code={jsonFormatter.format(row.config)}
                      rawValue={JSON.stringify(row.config)}
                      language={Language.json}
                      height="400px"
                    />
                  ) : (
                    <Label color="blue" variant="outline" icon={<InfoAltIcon />}>
                      {words("orders.row.empty")}
                    </Label>
                  )}
                </DescriptionListDescription>
              </TopAlignedLayout>
              {(row.attributes || row.edits) && (
                <TopAlignedLayout aria-label="Expanded-Body">
                  <DescriptionListTerm>{words("orders.row.body")}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <CodeEditor
                      code={jsonFormatter.format(row.attributes || row.edits)}
                      rawValue={JSON.stringify(row.attributes || row.edits)}
                      language={Language.json}
                      height="400px"
                    />
                  </DescriptionListDescription>
                </TopAlignedLayout>
              )}
            </PaddedDescriptionList>
          </Td>
        </Tr>
      )}
    </>
  );
};

const PaddedDescriptionList = styled(DescriptionList)`
  padding-bottom: 1em;
  padding-top: 2em;
`;

const TopAlignedLayout = styled(DescriptionListGroup)`
  align-items: start;
`;
