import React, { useState } from "react";
import {
    DrawerPanelContent,
    DrawerHead,
    DrawerActions,
    DrawerCloseButton,
    DrawerPanelBody,
    Title,
    Tabs,
    Tab,
    TabTitleText,
    Button,
    Label,
    LabelGroup,
    Stack,
    StackItem,
    MenuToggle,
    MenuToggleElement,
    Select,
    Flex,
    FlexItem,
    Divider,
    Content,
    TextInput,
    InputGroup,
    InputGroupItem,
    FormGroup,
    Card,
    CardBody,
    CardTitle,
    EmptyState,
    EmptyStateBody
} from "@patternfly/react-core";
import { CheckCircleIcon, CheckIcon, SearchIcon, TimesCircleIcon, TimesIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Tr } from "@patternfly/react-table";
import { uniq } from "lodash-es";
import { toggleValueInList, Resource } from "@/Core";
import { words } from "@/UI/words";

interface Props {
    onClose: () => void;
    filter: Resource.Filter;
    setFilter: (filter: Resource.FilterWithDefaultHandling) => void;
}

// Helper functions for include/exclude filter
const ensureInvertedFilterIsNotPresent = (selection: string, selectedStates: string[]): string[] => {
    const invertedFilter = invertFilter(selection);
    if (selectedStates.includes(invertedFilter)) {
        return toggleValueInList(invertedFilter, selectedStates);
    }
    return selectedStates;
};

const invertFilter = (selection: string) =>
    selection.startsWith("!") ? selection.slice(1) : `!${selection}`;

interface RowProps {
    state: string;
    includeActive: boolean;
    excludeActive: boolean;
    onInclude: () => void;
    onExclude: () => void;
}

const IncludeExcludeOption: React.FC<RowProps> = ({
    state,
    includeActive,
    excludeActive,
    onInclude,
    onExclude,
}) => (
    <Tr key={state}>
        <Td>
            <span className="pf-u-text-nowrap">{state}</span>
        </Td>
        <Td>
            <Button
                variant="plain"
                onClick={onInclude}
                aria-label={`${state}-include-toggle`}
                isInline
            >
                <span aria-label={includeActive ? `${state}-include-active` : `${state}-include-inactive`}>
                    {includeActive ? (
                        <CheckIcon
                            color="var(--pf-t--global--icon--color--status--success--default)"
                            aria-hidden="true"
                        />
                    ) : (
                        <CheckCircleIcon
                            color="var(--pf-t--global--icon--color--disabled)"
                            aria-hidden="true"
                        />
                    )}
                </span>
            </Button>
        </Td>
        <Td>
            <Button
                variant="plain"
                onClick={onExclude}
                aria-label={`${state}-exclude-toggle`}
                isInline
            >
                <span aria-label={excludeActive ? `${state}-exclude-active` : `${state}-exclude-inactive`}>
                    {excludeActive ? (
                        <TimesIcon
                            color="var(--pf-t--global--icon--color--status--danger--default)"
                            aria-hidden="true"
                        />
                    ) : (
                        <TimesCircleIcon
                            color="var(--pf-t--global--icon--color--disabled)"
                            aria-hidden="true"
                        />
                    )}
                </span>
            </Button>
        </Td>
    </Tr>
);

interface ActiveFilterGroupProps {
    title: string;
    values?: string[];
    onRemove: (value: string) => void;
}

const ActiveFilterGroup: React.FC<ActiveFilterGroupProps> = ({ title, values, onRemove }) => {
    if (!values || values.length === 0) {
        return null;
    }

    return (
        <Card isCompact>
            <CardTitle>{title}</CardTitle>
            <CardBody>
                <LabelGroup isCompact className="pf-u-mt-sm">
                    {values.map((value) => (
                        <Label
                            key={value}
                            color={value.startsWith("!") ? "red" : "grey"}
                            onClose={() => onRemove(value)}
                        >
                            {value}
                        </Label>
                    ))}
                </LabelGroup>
            </CardBody>
        </Card>
    );
};

interface ActiveFiltersSectionProps {
    filter: Resource.Filter;
    onClearAll: () => void;
    hasActiveFilters: boolean;
    removeTypeChip: (id: string) => void;
    removeAgentChip: (id: string) => void;
    removeValueChip: (id: string) => void;
    removeStatusChip: (id: string) => void;
}

const ActiveFiltersSection: React.FC<ActiveFiltersSectionProps> = ({
    filter,
    onClearAll,
    hasActiveFilters,
    removeTypeChip,
    removeAgentChip,
    removeValueChip,
    removeStatusChip,
}) => (
    <StackItem>
        <Flex justifyContent={{ default: "justifyContentSpaceBetween" }} alignItems={{ default: "alignItemsCenter" }}>
            <FlexItem>
                <Title headingLevel="h3" size="md">
                    Active filters
                </Title>
            </FlexItem>
            {hasActiveFilters && (
                <FlexItem>
                    <Button variant="link" isInline onClick={onClearAll}>
                        Clear all
                    </Button>
                </FlexItem>
            )}
        </Flex>
        {hasActiveFilters ? (
            <Stack hasGutter>
                {filter.type && filter.type.length > 0 && (
                    <StackItem>
                        <ActiveFilterGroup title="Type" values={filter.type} onRemove={removeTypeChip} />
                    </StackItem>
                )}
                {filter.agent && filter.agent.length > 0 && (
                    <StackItem>
                        <ActiveFilterGroup title="Agent" values={filter.agent} onRemove={removeAgentChip} />
                    </StackItem>
                )}
                {filter.value && filter.value.length > 0 && (
                    <StackItem>
                        <ActiveFilterGroup title="Value" values={filter.value} onRemove={removeValueChip} />
                    </StackItem>
                )}
                {filter.status && filter.status.length > 0 && (
                    <StackItem>
                        <ActiveFilterGroup title="Status" values={filter.status} onRemove={removeStatusChip} />
                    </StackItem>
                )}
            </Stack>
        ) : (
            <EmptyState variant="xs">
                <Title headingLevel="h4" size="md">
                    No filters applied
                </Title>
                <EmptyStateBody>
                    Select filters from the tabs above to refine your results.
                </EmptyStateBody>
            </EmptyState>
        )}
    </StackItem>
);

export const FilterWidgetComponent: React.FC<Props> = ({ onClose, filter, setFilter }) => {
    const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
    const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

    // Resource tab input states
    const [typeInput, setTypeInput] = useState("");
    const [valueInput, setValueInput] = useState("");
    const [agentInput, setAgentInput] = useState("");

    const updateStatus = (statuses: string[]) =>
        setFilter({
            ...filter,
            status: statuses.length > 0 ? statuses : undefined,
            disregardDefault: true,
        });

    const onStatusClick = (selection: string) => {
        const safeSelectedStates = ensureInvertedFilterIsNotPresent(
            selection,
            filter.status ? filter.status : []
        );
        const updatedSelection = uniq(toggleValueInList(selection, safeSelectedStates));
        updateStatus(updatedSelection);
        setIsStatusFilterOpen(false);
    };

    const addTypeFilter = () => {
        if (typeInput.trim()) {
            setFilter({
                ...filter,
                type: filter.type ? [...filter.type, typeInput.trim()] : [typeInput.trim()],
            });
            setTypeInput("");
        }
    };

    const addValueFilter = () => {
        if (valueInput.trim()) {
            setFilter({
                ...filter,
                value: filter.value ? [...filter.value, valueInput.trim()] : [valueInput.trim()],
            });
            setValueInput("");
        }
    };

    const addAgentFilter = () => {
        if (agentInput.trim()) {
            setFilter({
                ...filter,
                agent: filter.agent ? [...filter.agent, agentInput.trim()] : [agentInput.trim()],
            });
            setAgentInput("");
        }
    };

    const removeTypeChip = (id: string) => {
        setFilter({
            ...filter,
            type: filter.type?.filter((value) => value !== id),
        });
    };

    const removeAgentChip = (id: string) => {
        setFilter({
            ...filter,
            agent: filter.agent?.filter((value) => value !== id),
        });
    };

    const removeValueChip = (id: string) => {
        setFilter({
            ...filter,
            value: filter.value?.filter((value) => value !== id),
        });
    };

    const removeStatusChip = (id: string) => {
        setFilter({
            ...filter,
            status: filter.status?.filter((value) => value !== id),
            disregardDefault: true,
        });
    };

    const clearAllFilters = () => {
        setFilter({ disregardDefault: true });
    };

    const hasActiveFilters =
        (filter.type && filter.type.length > 0) ||
        (filter.agent && filter.agent.length > 0) ||
        (filter.value && filter.value.length > 0) ||
        (filter.status && filter.status.length > 0);

    return (
        <DrawerPanelContent>
            <DrawerHead>
                <Title headingLevel="h2" size="xl">
                    Filters
                </Title>
                <DrawerActions>
                    <DrawerCloseButton onClick={onClose} />
                </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody className="pf-u-flex-grow-1 pf-u-display-flex pf-u-flex-direction-column">
                <Stack hasGutter>
                    <StackItem isFilled className="pf-u-overflow-auto pf-u-pb-md">
                        <Tabs
                            activeKey={activeTabKey}
                            onSelect={(_, tabIndex) => setActiveTabKey(tabIndex)}
                        >
                            <Tab eventKey={0} title={<TabTitleText>Resource</TabTitleText>}>
                                <StackItem className="pf-u-pt-md">
                                    <Stack hasGutter>
                                        {/* Resource Id Section */}
                                        <StackItem>
                                            <Title headingLevel="h4" size="md">Resource Id</Title>
                                        </StackItem>
                                        <StackItem>
                                            <FormGroup label="Type">
                                                <InputGroup>
                                                    <InputGroupItem isFill>
                                                        <TextInput
                                                            type="text"
                                                            placeholder="Resource type..."
                                                            value={typeInput}
                                                            onChange={(_, value) => setTypeInput(value)}
                                                            onKeyPress={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    addTypeFilter();
                                                                }
                                                            }}
                                                        />
                                                    </InputGroupItem>
                                                    <InputGroupItem>
                                                        <Button variant="control" onClick={addTypeFilter}>+</Button>
                                                    </InputGroupItem>
                                                </InputGroup>
                                            </FormGroup>
                                        </StackItem>
                                        <StackItem>
                                            <FormGroup label="Value">
                                                <InputGroup>
                                                    <InputGroupItem isFill>
                                                        <TextInput
                                                            type="text"
                                                            placeholder="Value..."
                                                            value={valueInput}
                                                            onChange={(_, value) => setValueInput(value)}
                                                            onKeyPress={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    addValueFilter();
                                                                }
                                                            }}
                                                        />
                                                    </InputGroupItem>
                                                    <InputGroupItem>
                                                        <Button variant="control" onClick={addValueFilter}>+</Button>
                                                    </InputGroupItem>
                                                </InputGroup>
                                            </FormGroup>
                                        </StackItem>

                                        {/* Agent(s) Section */}
                                        <StackItem className="pf-u-pt-md">
                                            <FormGroup label="Agent(s)">
                                                <InputGroup>
                                                    <InputGroupItem isFill>
                                                        <TextInput
                                                            type="text"
                                                            placeholder="Agent..."
                                                            value={agentInput}
                                                            onChange={(_, value) => setAgentInput(value)}
                                                            onKeyPress={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    addAgentFilter();
                                                                }
                                                            }}
                                                        />
                                                    </InputGroupItem>
                                                    <InputGroupItem>
                                                        <Button variant="control" onClick={addAgentFilter}>+</Button>
                                                    </InputGroupItem>
                                                </InputGroup>
                                            </FormGroup>
                                        </StackItem>
                                    </Stack>
                                </StackItem>
                            </Tab>
                            <Tab eventKey={1} title={<TabTitleText>Status</TabTitleText>}>
                                <Stack hasGutter>
                                    <StackItem>
                                        <Title headingLevel="h4" size="md">Deploy State</Title>
                                    </StackItem>

                                    <Select
                                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                            <MenuToggle
                                                ref={toggleRef}
                                                aria-label="status-toggle"
                                                onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                                                isExpanded={isStatusFilterOpen}
                                                icon={<SearchIcon />}
                                                isFullWidth
                                            >
                                                {words("resources.filters.status.placeholder")}
                                            </MenuToggle>
                                        )}
                                        aria-label={words("resources.column.deployState")}
                                        selected={filter.status ? filter.status : []}
                                        isOpen={isStatusFilterOpen}
                                        onOpenChange={(isOpen: boolean) => setIsStatusFilterOpen(isOpen)}
                                    >
                                        <Table variant="compact">
                                            <Tbody>
                                                {Object.keys(Resource.Status).map((k) => {
                                                    const state = Resource.Status[k];
                                                    return (
                                                        <IncludeExcludeOption
                                                            key={state}
                                                            state={state}
                                                            includeActive={
                                                                filter.status ? filter.status.includes(state) : false
                                                            }
                                                            excludeActive={
                                                                filter.status
                                                                    ? filter.status.includes(invertFilter(state))
                                                                    : false
                                                            }
                                                            onInclude={() => onStatusClick(state)}
                                                            onExclude={() => onStatusClick(invertFilter(state))}
                                                        />
                                                    );
                                                })}
                                            </Tbody>
                                        </Table>
                                    </Select>
                                </Stack>
                            </Tab>
                        </Tabs>
                    </StackItem>
                    <Divider />
                    <ActiveFiltersSection
                        filter={filter}
                        onClearAll={clearAllFilters}
                        hasActiveFilters={hasActiveFilters ?? false}
                        removeTypeChip={removeTypeChip}
                        removeAgentChip={removeAgentChip}
                        removeValueChip={removeValueChip}
                        removeStatusChip={removeStatusChip}
                    />
                </Stack>
            </DrawerPanelBody>
        </DrawerPanelContent>
    );
};

