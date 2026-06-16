import React, { useState } from "react";
import {
  Button,
  Divider,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  InputGroup,
  InputGroupItem,
  Label,
  LabelGroup,
  Stack,
  StackItem,
  TextInput,
  Title,
} from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";
import { toggleValueInList } from "@/Core";
import { uniq } from "@/Core/Language/collection";
import { Filter } from "@/Slices/Agents/Core/Types";
import { FilterDrawerPanelContent, MultiTextSelect } from "@/UI/Components";
import { words } from "@/UI/words";
import { AgentStatus } from "@S/Agents/Core/Domain";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  onClose: () => void;
}

/**
 * The FilterWidgetComponent component.
 *
 * Renders the contents of the Agents filter side panel. Both the name and the
 * status filters are shown at once inside a DrawerPanelContent, together with a
 * section that lists the currently active filters as removable chips.
 *
 * @Props {Props} - Component props.
 *  @prop {Filter} filter - Current filter state supplied by the parent.
 *  @prop {(filter: Filter) => void} setFilter - Setter to persist filter changes upstream.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent: React.FC<Props> = ({ filter, setFilter, onClose }) => {
  const [nameInput, setNameInput] = useState("");

  const agentStatuses = Object.values(AgentStatus);

  // --- Name ---
  const applyNameFilter = () => {
    const trimmed = nameInput.trim();

    if (!trimmed) {
      return;
    }

    setFilter({ ...filter, name: uniq([...(filter.name ?? []), trimmed]) });
    setNameInput("");
  };

  const removeNameChip = (value: string) => {
    const updated = (filter.name ?? []).filter((name) => name !== value);

    setFilter({ ...filter, name: updated.length > 0 ? updated : undefined });
  };

  const clearNameFilters = () => setFilter({ ...filter, name: undefined });

  // --- Status ---
  const handleStatusSelect = (selection: string | ((prev: string[]) => string[])) => {
    if (typeof selection !== "string") {
      return;
    }

    const updated = uniq(toggleValueInList(selection, filter.status ?? [])) as AgentStatus[];

    setFilter({ ...filter, status: updated.length > 0 ? updated : undefined });
  };

  const removeStatusChip = (value: string) => {
    const updated = (filter.status ?? []).filter((status) => status !== value);

    setFilter({ ...filter, status: updated.length > 0 ? updated : undefined });
  };

  const clearStatusFilters = () => setFilter({ ...filter, status: undefined });

  const clearAllFilters = () => setFilter({});

  const hasActiveFilters = (filter.name?.length ?? 0) > 0 || (filter.status?.length ?? 0) > 0;

  return (
    <FilterDrawerPanelContent title={words("agents.filters")} onClose={onClose}>
      <Stack hasGutter>
        <Form onSubmit={(e) => e.preventDefault()}>
          <StackItem>
            <FormGroup label={words("agents.columns.status")}>
              <MultiTextSelect
                toggleAriaLabel="Status"
                options={agentStatuses.map((status) => ({
                  value: status,
                  children: status,
                  isSelected: (filter.status ?? []).includes(status),
                }))}
                setSelected={handleStatusSelect}
                placeholderText={words("agents.filters.status.placeholder")}
                selected={filter.status ?? []}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <FormGroup label={words("agents.columns.name")}>
              <InputGroup>
                <InputGroupItem isFill>
                  <TextInput
                    value={nameInput}
                    onChange={(_event, value) => setNameInput(value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        applyNameFilter();
                      }
                    }}
                    type="search"
                    placeholder={words("agents.filters.name.placeholder")}
                    aria-label="NameFilterInput"
                  />
                </InputGroupItem>
                <InputGroupItem>
                  <Button
                    variant="control"
                    onClick={applyNameFilter}
                    isDisabled={!nameInput.trim()}
                    aria-label="Apply name filter"
                  >
                    <PlusIcon />
                  </Button>
                </InputGroupItem>
              </InputGroup>
            </FormGroup>
          </StackItem>
        </Form>

        <Divider />

        <StackItem>
          <Flex
            justifyContent={{ default: "justifyContentSpaceBetween" }}
            alignItems={{ default: "alignItemsCenter" }}
          >
            <FlexItem>
              <Title headingLevel="h3" size="md">
                {words("resources.filters.active.title")}
              </Title>
            </FlexItem>
            <FlexItem>
              <Button variant="link" isInline onClick={clearAllFilters}>
                {words("resources.filters.active.resetFilters")}
              </Button>
            </FlexItem>
          </Flex>

          {hasActiveFilters ? (
            <Stack hasGutter style={{ padding: "1rem 0" }}>
              {(filter.name?.length ?? 0) > 0 && (
                <StackItem>
                  <LabelGroup
                    categoryName={words("agents.columns.name")}
                    isCompact
                    isClosable
                    isEditable
                    onClick={clearNameFilters}
                    closeBtnAriaLabel={words("resources.filters.active.group.close")(
                      words("agents.columns.name")
                    )}
                  >
                    {(filter.name ?? []).map((name) => (
                      <Label key={name} color="grey" onClose={() => removeNameChip(name)}>
                        {name}
                      </Label>
                    ))}
                  </LabelGroup>
                </StackItem>
              )}
              {(filter.status?.length ?? 0) > 0 && (
                <StackItem>
                  <LabelGroup
                    categoryName={words("agents.columns.status")}
                    isCompact
                    isClosable
                    isEditable
                    onClick={clearStatusFilters}
                    closeBtnAriaLabel={words("resources.filters.active.group.close")(
                      words("agents.columns.status")
                    )}
                  >
                    {(filter.status ?? []).map((status) => (
                      <Label key={status} color="grey" onClose={() => removeStatusChip(status)}>
                        {status}
                      </Label>
                    ))}
                  </LabelGroup>
                </StackItem>
              )}
            </Stack>
          ) : (
            <EmptyState variant="xs">
              <Title headingLevel="h4" size="md">
                {words("resources.filters.active.empty.title")}
              </Title>
              <EmptyStateBody>{words("resources.filters.active.empty.body.noTabs")}</EmptyStateBody>
            </EmptyState>
          )}
        </StackItem>
      </Stack>
    </FilterDrawerPanelContent>
  );
};
