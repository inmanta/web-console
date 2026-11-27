import React from "react";
import {
  Badge,
  Checkbox,
  Divider,
  Flex,
  Form,
  FormGroup,
  Skeleton,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { Diff, hasAnySetValue, words } from "@inmanta/web-console-core";
import { AddableTextInput } from "@inmanta/web-console-ui/Components/AddableTextInput";
import {
  ActiveFilterGroup,
  ActiveFilters,
  FilterDrawerPanelContent,
  getFilterActions,
} from "@inmanta/web-console-ui/Components/FilterDrawer";
import { DiffStatusLetterLabel } from "./DiffStatusLetterLabel";
import { DiffFilter, DiffFilterIdKey, RESOURCE_LIST_STATUS_ORDER } from "./types";

interface Props {
  filter: DiffFilter;
  setFilter: (filter: DiffFilter) => void;
  statusCounts: Map<Diff.Status, number> | undefined;
  onClose: () => void;
}

/**
 * Gets the resource id filter fields of the drawer, in the order it shows them, with the texts of
 * each field.
 */
const getIdFields = (): {
  key: DiffFilterIdKey;
  label: string;
  placeholder: string;
  hint: string;
}[] => [
  {
    key: "type",
    label: words("type"),
    placeholder: words("resources.filters.resource.type.placeholder"),
    hint: words("resources.filters.resource.type.hint"),
  },
  {
    key: "agent",
    label: words("resources.filters.resource.agent.label"),
    placeholder: words("resources.filters.resource.agent.textPlaceholder"),
    hint: words("resources.filters.resource.agent.hint"),
  },
  {
    key: "value",
    label: words("value"),
    placeholder: words("resources.filters.resource.value.placeholder"),
    hint: words("resources.filters.resource.value.hint"),
  },
];

/**
 * Gets the display text of a status chip in the active filters, like the status checkbox.
 */
const getStatusChipText = (value: string): string => {
  const status = RESOURCE_LIST_STATUS_ORDER.find((candidate) => candidate === value);

  return status ? words(`desiredState.compare.status.${status}`) : value;
};

/**
 * The filter drawer panel of a diff: a checkbox per status with its number of resources, the
 * resource id filters, and the active filters. A changed status sets disregardDefault, so the
 * default statuses don't come back once they were unticked; Reset to default brings them back.
 *
 * @props {Props} props - The component props
 *  @prop {DiffFilter} filter - The filter, with the default statuses filled in
 *  @prop {(filter: DiffFilter) => void} setFilter - Stores the new filter
 *  @prop {Map<Diff.Status, number> | undefined} statusCounts - The number of resources of the diff per status; undefined while the diff loads, which shows loading placeholders instead
 *  @prop {() => void} onClose - Closes the drawer
 *
 * @returns {React.FC<Props>} The filter drawer panel
 */
export const DiffFilterWidget: React.FC<Props> = ({ filter, setFilter, statusCounts, onClose }) => {
  const { toggleString, addString, removeStringChip, clearStringGroup } = getFilterActions(
    filter,
    setFilter
  );
  const selectedStatuses = filter.status ?? [];
  const idFields = getIdFields();

  return (
    <FilterDrawerPanelContent title={words("filters")} onClose={onClose}>
      <Stack hasGutter>
        <Form onSubmit={(event) => event.preventDefault()}>
          <FormGroup role="group" label={words("status")} isStack>
            {RESOURCE_LIST_STATUS_ORDER.map((status) => (
              <Checkbox
                key={status}
                id={`diff-filter-status-${status}`}
                isChecked={selectedStatuses.includes(status)}
                onChange={() => toggleString("status", status, { disregardDefault: true })}
                label={
                  <Flex gap={{ default: "gapSm" }} alignItems={{ default: "alignItemsCenter" }}>
                    <DiffStatusLetterLabel status={status} />
                    {words(`desiredState.compare.status.${status}`)}
                    {statusCounts ? (
                      <Badge isRead>{statusCounts.get(status) ?? 0}</Badge>
                    ) : (
                      <Skeleton fontSize="sm" width="1.5rem" />
                    )}
                  </Flex>
                }
              />
            ))}
          </FormGroup>
          <Title headingLevel="h3" size="md">
            {words("resourceId")}
          </Title>
          {idFields.map(({ key, label, placeholder, hint }) => (
            <AddableTextInput
              key={key}
              label={label}
              placeholder={placeholder}
              hint={hint}
              onAdd={(value) => addString(key, value)}
            />
          ))}
        </Form>

        <Divider />

        <ActiveFilters
          hasActiveFilters={hasAnySetValue(filter)}
          onClear={() => setFilter({})}
          clearLabel={words("resources.filters.active.resetToDefault")}
        >
          {selectedStatuses.length > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("status")}
                values={selectedStatuses}
                renderValue={getStatusChipText}
                onRemove={(status) =>
                  removeStringChip("status", status, { disregardDefault: true })
                }
                onRemoveGroup={() => clearStringGroup("status", { disregardDefault: true })}
              />
            </StackItem>
          )}
          {idFields.map(({ key, label }) =>
            (filter[key]?.length ?? 0) > 0 ? (
              <StackItem key={key}>
                <ActiveFilterGroup
                  title={label}
                  values={filter[key]}
                  onRemove={(value) => removeStringChip(key, value)}
                  onRemoveGroup={() => clearStringGroup(key)}
                />
              </StackItem>
            ) : null
          )}
        </ActiveFilters>
      </Stack>
    </FilterDrawerPanelContent>
  );
};
