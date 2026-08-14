import React from "react";
import { Divider, Form, FormGroup, Stack, StackItem } from "@patternfly/react-core";
import {
  ServiceInstanceParams,
  invertFilter,
  removeInvertedSelection,
  toggleValueInList,
} from "@/Core";
import { uniq } from "@/Core/Language/collection";
import {
  ActiveFilterGroup,
  ActiveFilters,
  AddableTextInput,
  FilterDrawerPanelContent,
  IncludeExcludeSelect,
  MultiTextSelect,
  OptionalToggleGroup,
  getFilterActions,
} from "@/UI/Components";
import { words } from "@/UI/words";

/** The attribute sets, paired with the label shown to the user. */
const ATTRIBUTE_SETS: { value: ServiceInstanceParams.AttributeSet; label: string }[] = [
  {
    value: ServiceInstanceParams.AttributeSet.Active,
    label: words("inventory.filters.attributeSet.active"),
  },
  {
    value: ServiceInstanceParams.AttributeSet.Candidate,
    label: words("inventory.filters.attributeSet.candidate"),
  },
  {
    value: ServiceInstanceParams.AttributeSet.Rollback,
    label: words("inventory.filters.attributeSet.rollback"),
  },
];

const prettyAttributeSet = (value: string): string =>
  ATTRIBUTE_SETS.find((set) => set.value === value)?.label ?? value;

const rawAttributeSet = (label: string): ServiceInstanceParams.AttributeSet =>
  ATTRIBUTE_SETS.find((set) => set.label === label)?.value ??
  (label as ServiceInstanceParams.AttributeSet);

/** The deleted-instance rules, paired with the label and tooltip shown for each option. */
const DELETED_RULES: {
  value: Exclude<ServiceInstanceParams.DeletedRule, undefined>;
  label: string;
  tooltip: string;
}[] = [
  {
    value: "Include",
    label: words("inventory.filters.deleted.include.label"),
    tooltip: words("inventory.filters.deleted.include.description"),
  },
  {
    value: "Only",
    label: words("inventory.filters.deleted.only.label"),
    tooltip: words("inventory.filters.deleted.only.description"),
  },
];

interface Props {
  filter: ServiceInstanceParams.Filter;
  setFilter: (filter: ServiceInstanceParams.Filter) => void;
  states: string[];
  onClose: () => void;
}

/**
 * The FilterWidgetComponent for the Service Inventory page.
 *
 * Renders the side-panel drawer content with a state multi-select, a free-text id/identity
 * filter, an attribute-set include/exclude selector and a deleted-instances rule, followed
 * by an active filters chip section.
 *
 * @Props {Props} - Component props.
 *  @prop {ServiceInstanceParams.Filter} filter - Current filter state supplied by the parent.
 *  @prop {(filter: ServiceInstanceParams.Filter) => void} setFilter - Setter to persist filter changes upstream.
 *  @prop {string[]} states - The lifecycle state names offered by the state filter.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent: React.FC<Props> = ({ filter, setFilter, states, onClose }) => {
  const { addString, toggleString, removeStringChip, clearStringGroup } = getFilterActions(
    filter,
    setFilter
  );

  // The two attribute-set filters are shown as one include/exclude control: an included set
  // (plain label) means "not empty", an excluded set ("!label") means "empty". This mirrors the
  // include/exclude pattern used for statuses on the Resources page.
  const attributeSetSelected = [
    ...(filter.attributeSetNotEmpty ?? []).map((set) => prettyAttributeSet(set)),
    ...(filter.attributeSetEmpty ?? []).map((set) => invertFilter(prettyAttributeSet(set))),
  ];

  const onAttributeSetClick = (selection: string) => {
    const safeSelection = removeInvertedSelection(selection, attributeSetSelected);
    const next = uniq(toggleValueInList(selection, safeSelection));
    const notEmpty = next.filter((entry) => !entry.startsWith("!")).map(rawAttributeSet);
    const empty = next
      .filter((entry) => entry.startsWith("!"))
      .map((entry) => rawAttributeSet(invertFilter(entry)));

    setFilter({
      ...filter,
      attributeSetEmpty: empty.length > 0 ? empty : undefined,
      attributeSetNotEmpty: notEmpty.length > 0 ? notEmpty : undefined,
    });
  };

  const clearAttributeSets = () =>
    setFilter({ ...filter, attributeSetEmpty: undefined, attributeSetNotEmpty: undefined });

  const updateDeleted = (deleted: ServiceInstanceParams.DeletedRule) =>
    setFilter({ ...filter, deleted });

  const hasActiveFilters =
    (filter.state?.length ?? 0) > 0 ||
    (filter.id_or_service_identity?.length ?? 0) > 0 ||
    (filter.attributeSetEmpty?.length ?? 0) > 0 ||
    (filter.attributeSetNotEmpty?.length ?? 0) > 0 ||
    Boolean(filter.deleted);

  return (
    <FilterDrawerPanelContent title={words("inventory.filters")} onClose={onClose}>
      <Stack hasGutter>
        <Form onSubmit={(e) => e.preventDefault()}>
          <StackItem>
            <FormGroup label={words("inventory.filters.state.label")}>
              <MultiTextSelect
                toggleAriaLabel="State"
                options={states.map((state) => ({
                  value: state,
                  children: state,
                  isSelected: (filter.state ?? []).includes(state),
                }))}
                setSelected={(selection) => {
                  if (typeof selection === "string") {
                    toggleString("state", selection);
                  }
                }}
                placeholderText={words("inventory.filters.state.placeholder")}
                selected={filter.state ?? []}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <AddableTextInput
              label={words("inventory.filters.id.label")}
              placeholder={words("inventory.filters.id.placeholder")}
              onAdd={(value) => addString("id_or_service_identity", value)}
              type="search"
            />
          </StackItem>

          <StackItem>
            <FormGroup label={words("inventory.filters.attributeSet.label")}>
              <IncludeExcludeSelect
                label={words("inventory.filters.attributeSet.activeLabel")}
                placeholder={words("inventory.filters.attributeSet.placeholder")}
                selected={attributeSetSelected}
                options={ATTRIBUTE_SETS.map((set) => set.label)}
                onOptionClick={onAttributeSetClick}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <FormGroup label={words("inventory.filters.deleted.label")}>
              <OptionalToggleGroup
                selected={filter.deleted ? [filter.deleted] : []}
                onChange={(next) => updateDeleted(next[0] as ServiceInstanceParams.DeletedRule)}
                options={DELETED_RULES.map((rule) => ({
                  value: rule.value,
                  buttonId: `deleted-${rule.value.toLowerCase()}`,
                  label: rule.label,
                  tooltip: rule.tooltip,
                }))}
              />
            </FormGroup>
          </StackItem>
        </Form>

        <Divider />

        <ActiveFilters hasActiveFilters={hasActiveFilters} onClear={() => setFilter({})}>
          {(filter.state?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("inventory.filters.state.label")}
                values={filter.state}
                onRemove={(value) => removeStringChip("state", value)}
                onRemoveGroup={() => clearStringGroup("state")}
              />
            </StackItem>
          )}
          {(filter.id_or_service_identity?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("inventory.filters.id.label")}
                values={filter.id_or_service_identity}
                onRemove={(value) => removeStringChip("id_or_service_identity", value)}
                onRemoveGroup={() => clearStringGroup("id_or_service_identity")}
              />
            </StackItem>
          )}
          {attributeSetSelected.length > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("inventory.filters.attributeSet.activeLabel")}
                values={attributeSetSelected}
                onRemove={onAttributeSetClick}
                onRemoveGroup={clearAttributeSets}
              />
            </StackItem>
          )}
          {filter.deleted && (
            <StackItem>
              <ActiveFilterGroup
                title={words("inventory.filters.deleted.label")}
                values={[filter.deleted]}
                onRemove={() => updateDeleted(undefined)}
                onRemoveGroup={() => updateDeleted(undefined)}
              />
            </StackItem>
          )}
        </ActiveFilters>
      </Stack>
    </FilterDrawerPanelContent>
  );
};
