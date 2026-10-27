import React, { memo, useContext } from "react";
import { Button } from "@patternfly/react-core";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import { words } from "@inmanta/web-console-core";
import { ClassifiedAttribute } from "@inmanta/web-console-core/Common";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { Fact } from "@inmanta/web-console-core/Domain/Fact";
import {
  AttributeExpandTd,
  AttributeExpansionRow,
  AttributeValueCell,
  useAttributeExpansion,
} from "@inmanta/web-console-ui/Components/AttributeList";
import { DateWithTooltip } from "@inmanta/web-console-ui/Components/DateWithTooltip";
import { Link } from "@inmanta/web-console-ui/Components/Link";

interface Props {
  row: Pick<Fact, "name" | "updated" | "value" | "resource_id">;
  attribute: ClassifiedAttribute;
  rowIndex: number;
  numberOfColumns: number;
  showExpandColumn: boolean;
}

export const FactsRow: React.FC<Props> = memo(
  ({ row, attribute, rowIndex, numberOfColumns, showExpandColumn }) => {
    const { routeManager } = useContext(DependencyContext);
    const { isExpandable, isExpanded, toggleExpanded } = useAttributeExpansion(attribute);

    return (
      <Tbody isExpanded={isExpandable ? isExpanded : undefined}>
        <Tr aria-label="FactsRow">
          {showExpandColumn && (
            <AttributeExpandTd
              isExpandable={isExpandable}
              rowIndex={rowIndex}
              isExpanded={isExpanded}
              onToggle={toggleExpanded}
            />
          )}
          <Td dataLabel={words("name")}>{row.name}</Td>
          <Td dataLabel={words("updated")}>
            {row.updated && <DateWithTooltip timestamp={row.updated} />}
          </Td>
          <Td modifier="breakWord" dataLabel={words("value")}>
            <AttributeValueCell
              value={row.value}
              attribute={attribute}
              isExpanded={isExpanded}
              onToggle={toggleExpanded}
            />
          </Td>
          <Td modifier="breakWord" dataLabel={words("resourceId")}>
            <Link
              pathname={routeManager.getUrl("ResourceDetails", {
                resourceId: row.resource_id,
              })}
            >
              <Button variant="link" isInline>
                {row.resource_id}
              </Button>
            </Link>
          </Td>
        </Tr>
        {isExpandable && (
          <AttributeExpansionRow
            isExpanded={isExpanded}
            colSpan={numberOfColumns}
            attribute={attribute}
          />
        )}
      </Tbody>
    );
  }
);
