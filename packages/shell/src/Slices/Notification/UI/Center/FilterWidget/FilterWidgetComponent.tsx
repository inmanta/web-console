import React from "react";
import { Divider, Form, FormGroup, Stack, StackItem } from "@patternfly/react-core";
import { hasAnySetValue, words } from "@inmanta/web-console-core";
import { severityList } from "@inmanta/web-console-core/Domain/Notification";
import { NotificationFilter } from "@inmanta/web-console-core/Queries/Slices/Notification";
import { AddableTextInput } from "@inmanta/web-console-ui/Components/AddableTextInput";
import {
  ActiveFilterGroup,
  ActiveFilters,
  FilterDrawerPanelContent,
  getFilterActions,
} from "@inmanta/web-console-ui/Components/FilterDrawer";
import { SingleTextSelect } from "@inmanta/web-console-ui/Components/SingleTextSelect";

type Read = "read" | "unread";
const readOptions: Read[] = ["read", "unread"];

interface Props {
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
  onClose: () => void;
}

/**
 * The FilterWidgetComponent component.
 *
 * Renders the contents of the Notification Center filter side panel. The severity, read,
 * message and title filters are shown at once inside a DrawerPanelContent, together with a
 * section that lists the currently active filters as removable chips.
 *
 * @Props {Props} - Component props.
 *  @prop {NotificationFilter} filter - Current filter state supplied by the parent.
 *  @prop {(filter: NotificationFilter) => void} setFilter - Setter to persist filter changes upstream.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent: React.FC<Props> = ({ filter, setFilter, onClose }) => {
  const { addString, removeStringChip, clearStringGroup } = getFilterActions(filter, setFilter);

  const selectedRead = toRead(filter.read);

  const updateSeverity = (value: string | null) =>
    setFilter({ ...filter, severity: severityList.find((severity) => severity === value) });

  const updateRead = (value: string | null) =>
    setFilter({ ...filter, read: value ? value === "read" : undefined });

  const hasActiveFilters = hasAnySetValue(filter);

  return (
    <FilterDrawerPanelContent title={words("filters")} onClose={onClose}>
      <Stack hasGutter>
        <Form onSubmit={(e) => e.preventDefault()}>
          <StackItem>
            <FormGroup label={words("notification.filters.severity")}>
              <SingleTextSelect
                toggleAriaLabel="Severity"
                placeholderText={words("notification.severity.placeholder")}
                options={severityList.map((value) => ({ value, children: value }))}
                selected={filter.severity ?? null}
                setSelected={updateSeverity}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <FormGroup label={words("notification.filters.read")}>
              <SingleTextSelect
                toggleAriaLabel="Read"
                placeholderText={words("notification.read.placeholder")}
                options={readOptions.map((value) => ({ value, children: value }))}
                selected={selectedRead}
                setSelected={updateRead}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <AddableTextInput
              label={words("message")}
              placeholder={words("notification.message.placeholder")}
              onAdd={(value) => addString("message", value)}
              type="search"
            />
          </StackItem>

          <StackItem>
            <AddableTextInput
              label={words("notification.filters.title")}
              placeholder={words("notification.title.placeholder")}
              onAdd={(value) => addString("title", value)}
              type="search"
            />
          </StackItem>
        </Form>

        <Divider />

        <ActiveFilters hasActiveFilters={hasActiveFilters} onClear={() => setFilter({})}>
          {filter.severity && (
            <StackItem>
              <ActiveFilterGroup
                title={words("notification.filters.severity")}
                values={[filter.severity]}
                onRemove={() => updateSeverity(null)}
                onRemoveGroup={() => updateSeverity(null)}
              />
            </StackItem>
          )}
          {selectedRead && (
            <StackItem>
              <ActiveFilterGroup
                title={words("notification.filters.read")}
                values={[selectedRead]}
                onRemove={() => updateRead(null)}
                onRemoveGroup={() => updateRead(null)}
              />
            </StackItem>
          )}
          {(filter.message?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("message")}
                values={filter.message}
                onRemove={(value) => removeStringChip("message", value)}
                onRemoveGroup={() => clearStringGroup("message")}
              />
            </StackItem>
          )}
          {(filter.title?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("notification.filters.title")}
                values={filter.title}
                onRemove={(value) => removeStringChip("title", value)}
                onRemoveGroup={() => clearStringGroup("title")}
              />
            </StackItem>
          )}
        </ActiveFilters>
      </Stack>
    </FilterDrawerPanelContent>
  );
};

/**
 * The read filter is stored as a boolean, but shown as "read" or "unread".
 */
const toRead = (read: boolean | undefined): Read | null => {
  switch (read) {
    case undefined:
      return null;
    case true:
      return "read";
    case false:
      return "unread";
  }
};
