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
import { RangeOperator, toggleValueInList } from "@/Core";
import { uniq } from "@/Core/Language/collection";
import { Filter } from "@/Slices/DesiredState/Core/Types";
import { CustomDatePresenter } from "@/UI";
import { FilterDrawerPanelContent, MultiTextSelect } from "@/UI/Components";
import { TimestampPicker } from "@/UI/Components/Filters";
import { words } from "@/UI/words";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";

const datePresenter = new CustomDatePresenter();

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  onClose: () => void;
}

export const FilterWidgetComponent: React.FC<Props> = ({ filter, setFilter, onClose }) => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [versionFrom, setVersionFrom] = useState("");
  const [versionTo, setVersionTo] = useState("");

  const desiredStateStatuses = Object.values(DesiredStateVersionStatus);

  // --- Status ---
  const handleStatusSelect = (selection: string | ((prev: string[]) => string[])) => {
    if (typeof selection !== "string") {
      return;
    }
    const current = filter.status ? [...filter.status] : [];
    const updated = uniq(toggleValueInList(selection, current)) as DesiredStateVersionStatus[];

    setFilter({ ...filter, status: updated.length > 0 ? updated : undefined });
  };

  const removeStatusChip = (value: string) => {
    const updated = (filter.status ?? []).filter((s) => s !== value);

    setFilter({
      ...filter,
      status: updated.length > 0 ? updated : undefined,
      disregardDefault: true,
    });
  };

  const clearStatusFilters = () =>
    setFilter({ ...filter, status: undefined, disregardDefault: true });

  // --- Date ---
  const applyDateFromFilter = () => {
    if (!dateFrom) {
      return;
    }
    const updated = [
      ...(filter.date ?? []).filter((d) => d.operator !== RangeOperator.Operator.From),
      { date: dateFrom, operator: RangeOperator.Operator.From },
    ];

    setFilter({ ...filter, date: updated });
    setDateFrom(undefined);
  };

  const applyDateToFilter = () => {
    if (!dateTo) {
      return;
    }
    const updated = [
      ...(filter.date ?? []).filter((d) => d.operator !== RangeOperator.Operator.To),
      { date: dateTo, operator: RangeOperator.Operator.To },
    ];

    setFilter({ ...filter, date: updated });
    setDateTo(undefined);
  };

  const removeDateChip = (chip: string) => {
    const operator = chip.split("|")[0].trim() as RangeOperator.Operator;
    const updated = (filter.date ?? []).filter((d) => d.operator !== operator);

    setFilter({ ...filter, date: updated.length > 0 ? updated : undefined });
  };

  const clearDateFilters = () => setFilter({ ...filter, date: undefined });

  // --- Version ---
  const applyVersionFromFilter = () => {
    const from = versionFrom !== "" ? parseInt(versionFrom, 10) : undefined;

    if (from === undefined || isNaN(from)) {
      return;
    }
    const updated = [
      ...(filter.version ?? []).filter((v) => v.operator !== RangeOperator.Operator.From),
      { value: from, operator: RangeOperator.Operator.From },
    ];

    setFilter({ ...filter, version: updated });
    setVersionFrom("");
  };

  const applyVersionToFilter = () => {
    const to = versionTo !== "" ? parseInt(versionTo, 10) : undefined;

    if (to === undefined || isNaN(to)) {
      return;
    }
    const updated = [
      ...(filter.version ?? []).filter((v) => v.operator !== RangeOperator.Operator.To),
      { value: to, operator: RangeOperator.Operator.To },
    ];

    setFilter({ ...filter, version: updated });
    setVersionTo("");
  };

  const removeVersionChip = (chip: string) => {
    const operator = chip.split("|")[0].trim() as RangeOperator.Operator;
    const updated = (filter.version ?? []).filter((v) => v.operator !== operator);

    setFilter({ ...filter, version: updated.length > 0 ? updated : undefined });
  };

  const clearVersionFilters = () => setFilter({ ...filter, version: undefined });

  const clearAllFilters = () => setFilter({});

  // --- Chip display ---
  const dateChips: string[] = (filter.date ?? []).map(
    ({ date, operator }) => `${operator} | ${datePresenter.getFull(date.toISOString())}`
  );
  const versionChips: string[] = (filter.version ?? []).map(
    ({ value, operator }) => `${operator} | ${value}`
  );
  const hasActiveFilters =
    (filter.status?.length ?? 0) > 0 || dateChips.length > 0 || versionChips.length > 0;

  return (
    <FilterDrawerPanelContent title={words("desiredState.filters")} onClose={onClose}>
      <Stack hasGutter>
        <Form onSubmit={(e) => e.preventDefault()}>
          <StackItem>
            <FormGroup label={words("desiredState.columns.status")}>
              <MultiTextSelect
                toggleAriaLabel="Status"
                options={desiredStateStatuses.map((status) => ({
                  value: status,
                  children: status,
                  isSelected: (filter.status ?? []).includes(status),
                }))}
                setSelected={handleStatusSelect}
                placeholderText={words("desiredState.filters.status.placeholder")}
                selected={filter.status ?? []}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <FormGroup label={words("desiredState.columns.date")}>
              <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsSm" }}>
                <FlexItem>
                  <FormGroup label={words("desiredState.filters.from")}>
                    <TimestampPicker
                      timestamp={dateFrom}
                      onChange={setDateFrom}
                      from={undefined}
                      datePickerLabel="From Date Picker"
                      timePickerLabel="From Time Picker"
                      action={
                        <Button
                          variant="control"
                          onClick={applyDateFromFilter}
                          isDisabled={!dateFrom}
                          aria-label="Apply date from filter"
                        >
                          <PlusIcon />
                        </Button>
                      }
                    />
                  </FormGroup>
                </FlexItem>
                <FlexItem>
                  <FormGroup label={words("desiredState.filters.to")}>
                    <TimestampPicker
                      timestamp={dateTo}
                      onChange={setDateTo}
                      from={dateFrom}
                      datePickerLabel="To Date Picker"
                      timePickerLabel="To Time Picker"
                      action={
                        <Button
                          variant="control"
                          onClick={applyDateToFilter}
                          isDisabled={!dateTo}
                          aria-label="Apply date to filter"
                        >
                          <PlusIcon />
                        </Button>
                      }
                    />
                  </FormGroup>
                </FlexItem>
              </Flex>
            </FormGroup>
          </StackItem>

          <StackItem>
            <FormGroup label={words("desiredState.columns.version")}>
              <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsSm" }}>
                <FlexItem>
                  <FormGroup label={words("desiredState.filters.from")}>
                    <InputGroup>
                      <InputGroupItem isFill>
                        <TextInput
                          value={versionFrom}
                          onChange={(_e, val) => setVersionFrom(val)}
                          type="number"
                          placeholder={words("desiredState.filters.from")}
                          aria-label="Version range from"
                        />
                      </InputGroupItem>
                      <InputGroupItem>
                        <Button
                          variant="control"
                          onClick={applyVersionFromFilter}
                          isDisabled={!versionFrom}
                          aria-label="Apply Version from filter"
                        >
                          <PlusIcon />
                        </Button>
                      </InputGroupItem>
                    </InputGroup>
                  </FormGroup>
                </FlexItem>
                <FlexItem>
                  <FormGroup label={words("desiredState.filters.to")}>
                    <InputGroup>
                      <InputGroupItem isFill>
                        <TextInput
                          value={versionTo}
                          onChange={(_e, val) => setVersionTo(val)}
                          type="number"
                          placeholder={words("desiredState.filters.to")}
                          aria-label="Version range to"
                        />
                      </InputGroupItem>
                      <InputGroupItem>
                        <Button
                          variant="control"
                          onClick={applyVersionToFilter}
                          isDisabled={!versionTo}
                          aria-label="Apply Version to filter"
                        >
                          <PlusIcon />
                        </Button>
                      </InputGroupItem>
                    </InputGroup>
                  </FormGroup>
                </FlexItem>
              </Flex>
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
              {(filter.status ?? []).length > 0 && (
                <StackItem>
                  <LabelGroup
                    categoryName={words("desiredState.columns.status")}
                    isCompact
                    isClosable
                    isEditable
                    onClick={clearStatusFilters}
                    closeBtnAriaLabel={words("resources.filters.active.group.close")(
                      words("desiredState.columns.status")
                    )}
                  >
                    {(filter.status ?? []).map((s) => (
                      <Label key={s} color="grey" onClose={() => removeStatusChip(s)}>
                        {s}
                      </Label>
                    ))}
                  </LabelGroup>
                </StackItem>
              )}
              {dateChips.length > 0 && (
                <StackItem>
                  <LabelGroup
                    categoryName={words("desiredState.columns.date")}
                    isCompact
                    isClosable
                    isEditable
                    onClick={clearDateFilters}
                    closeBtnAriaLabel={words("resources.filters.active.group.close")(
                      words("desiredState.columns.date")
                    )}
                  >
                    {dateChips.map((chip) => (
                      <Label key={chip} color="grey" onClose={() => removeDateChip(chip)}>
                        {chip}
                      </Label>
                    ))}
                  </LabelGroup>
                </StackItem>
              )}
              {versionChips.length > 0 && (
                <StackItem>
                  <LabelGroup
                    categoryName={words("desiredState.columns.version")}
                    isCompact
                    isClosable
                    isEditable
                    onClick={clearVersionFilters}
                    closeBtnAriaLabel={words("resources.filters.active.group.close")(
                      words("desiredState.columns.version")
                    )}
                  >
                    {versionChips.map((chip) => (
                      <Label key={chip} color="grey" onClose={() => removeVersionChip(chip)}>
                        {chip}
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
