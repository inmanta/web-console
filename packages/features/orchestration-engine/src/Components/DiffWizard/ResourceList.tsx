import React, { useEffect, useId } from "react";
import { Badge, Content, Flex, FlexItem, Truncate } from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Tr } from "@patternfly/react-table";
import { Resource, words } from "@inmanta/web-console-core";
import { DiffStatusLetterLabel } from "./DiffStatusLetterLabel";
import { Item, ResourceListGroup } from "./types";

interface Props {
  groups: ResourceListGroup[];
  listedItems: Item[];
  selectedIndex: number;
  onSelect: (resourceId: string) => void;
}

/**
 * The resources of a diff as a compact table with a row group per status, each headed by its
 * status and count, and the selected resource marked as current. The arrow keys select the
 * previous or next resource, and the selected resource scrolls into view.
 *
 * @props {Props} props - The component props
 *  @prop {ResourceListGroup[]} groups - The resources, grouped by status
 *  @prop {Item[]} listedItems - The same resources in the order they show, group after group
 *  @prop {number} selectedIndex - The index in listedItems of the resource whose diff is shown
 *  @prop {(resourceId: string) => void} onSelect - Called with the id of the resource to show
 *
 * @returns {React.FC<Props>} The resource list
 */
const ResourceListView: React.FC<Props> = ({ groups, listedItems, selectedIndex, onSelect }) => {
  const rowIdPrefix = useId();
  const getRowElementId = (index: number) => `${rowIdPrefix}-${index}`;
  const selectedElementId = getRowElementId(selectedIndex);

  useEffect(() => {
    document.getElementById(selectedElementId)?.scrollIntoView({ block: "nearest" });
  }, [selectedElementId]);

  const getIndexToStepFrom = (): number => {
    const focusedIndex = listedItems.findIndex(
      (_item, index) => getRowElementId(index) === document.activeElement?.id
    );

    return focusedIndex < 0 ? selectedIndex : focusedIndex;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];

    if (step === undefined) {
      return;
    }

    event.preventDefault();
    const nextIndex = getIndexToStepFrom() + step;

    if (nextIndex < 0 || nextIndex >= listedItems.length) {
      return;
    }

    onSelect(listedItems[nextIndex].id);
    document.getElementById(getRowElementId(nextIndex))?.focus();
  };

  return (
    <Table variant="compact" aria-label={words("resources")} onKeyDown={onKeyDown}>
      {groups.map((group) => (
        <Tbody key={group.status}>
          <Tr isStriped>
            <Th colSpan={2} scope="rowgroup" isSubheader>
              <Flex gap={{ default: "gapSm" }} alignItems={{ default: "alignItemsCenter" }}>
                <FlexItem>{words(`desiredState.compare.status.${group.status}`)}</FlexItem>
                <Badge isRead>{group.items.length}</Badge>
              </Flex>
            </Th>
          </Tr>
          {group.items.map((item, indexInGroup) => {
            const index = group.startIndex + indexInGroup;
            const isSelected = index === selectedIndex;

            return (
              <Tr
                key={item.id}
                id={getRowElementId(index)}
                isClickable
                isRowSelected={isSelected}
                onRowClick={() => onSelect(item.id)}
                aria-current={isSelected}
                tabIndex={isSelected ? 0 : -1}
              >
                <Td modifier="fitContent">
                  <DiffStatusLetterLabel status={item.status} />
                </Td>
                <Td>
                  <ResourceListRowName item={item} />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      ))}
    </Table>
  );
};

/**
 * The name of a resource in the list: the value of its id, then its type and agent. An id that
 * doesn't parse shows in full. Skipped when the list re-renders for a new selection, so stepping
 * through a large list only updates the rows' selected state.
 *
 * @props {{ item: Item }} props - The component props
 *  @prop {Item} item - The resource
 *
 * @returns {React.FC<{ item: Item }>} The resource name
 */
const ResourceListRowName = React.memo<{ item: Item }>(({ item }) => {
  const id = Resource.IdParser.parse(item.id);

  return (
    <Flex direction={{ default: "column" }} gap={{ default: "gapNone" }}>
      <Truncate content={id?.attributeValue ?? item.id} />
      {id && (
        <Content component="small">
          <Truncate
            content={words("desiredState.compare.resource.typeAndAgent")(
              id.entityType,
              id.agentName
            )}
          />
        </Content>
      )}
    </Flex>
  );
});

/**
 * The resource list, skipped when the page re-renders with the same groups and selection, like
 * when the Compliance Check page polls its list of reports.
 */
export const ResourceList = React.memo(ResourceListView);
