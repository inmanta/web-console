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
    <Tr key={state} style={{ borderBottom: 0 }}>
        <Td>
            <span style={{ whiteSpace: "nowrap" }}>{state}</span>
        </Td>
        <Td>
            <Button
                variant="plain"
                onClick={onInclude}
                aria-label={`${state}-include-toggle`}
                style={{ padding: 0, minWidth: "auto" }}
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
                style={{ padding: 0, minWidth: "auto" }}
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
        <DrawerPanelContent
            style={{
                position: "sticky",
                top: 0,
                maxHeight: "100vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <DrawerHead>
                <Title headingLevel="h2" size="xl">
                    Filters
                </Title>
                <DrawerActions>
                    <DrawerCloseButton onClick={onClose} />
                </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <StackItem isFilled style={{ overflow: "auto", paddingBottom: "var(--pf-t--global--spacer--md)" }}>
                    <Tabs
                        activeKey={activeTabKey}
                        onSelect={(_, tabIndex) => setActiveTabKey(tabIndex)}
                    >
                        <Tab eventKey={0} title={<TabTitleText>Resource</TabTitleText>}>
                            <StackItem style={{ paddingTop: "var(--pf-t--global--spacer--md)" }}>
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
                                    <StackItem style={{ paddingTop: "var(--pf-t--global--spacer--md)" }}>
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
                            <StackItem style={{ paddingTop: "var(--pf-t--global--spacer--md)" }}>
                                <div style={{ width: "100%" }}>
                                    <Select
                                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                            <MenuToggle
                                                ref={toggleRef}
                                                aria-label="status-toggle"
                                                onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                                                isExpanded={isStatusFilterOpen}
                                                icon={<SearchIcon />}
                                                style={{ width: "100%" }}
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
                                </div>
                            </StackItem>
                        </Tab>
                    </Tabs>
                </StackItem>
                <Divider />
                <StackItem style={{ padding: "var(--pf-t--global--spacer--md)", minHeight: "200px" }}>
                    <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
                        <FlexItem>
                            <Title headingLevel="h3" size="md">
                                Active filters
                            </Title>
                        </FlexItem>
                        {hasActiveFilters && (
                            <FlexItem>
                                <Button variant="link" isInline onClick={clearAllFilters}>
                                    Clear all
                                </Button>
                            </FlexItem>
                        )}
                    </Flex>
                    {hasActiveFilters ? (
                        <Stack hasGutter style={{ marginTop: "var(--pf-t--global--spacer--md)" }}>
                            {filter.type && filter.type.length > 0 && (
                                <StackItem>
                                    <div
                                        style={{
                                            border: "1px solid var(--pf-t--global--border--color--default)",
                                            borderRadius: "var(--pf-t--global--border--radius--medium)",
                                            padding: "var(--pf-t--global--spacer--sm)",
                                        }}
                                    >
                                        <strong>Type</strong>
                                        <LabelGroup style={{ marginTop: "var(--pf-t--global--spacer--sm)" }}>
                                            {filter.type.map((typeValue) => (
                                                <Label
                                                    key={typeValue}
                                                    color={typeValue.startsWith("!") ? "red" : "grey"}
                                                    onClose={() => removeTypeChip(typeValue)}
                                                >
                                                    {typeValue}
                                                </Label>
                                            ))}
                                        </LabelGroup>
                                    </div>
                                </StackItem>
                            )}
                            {filter.agent && filter.agent.length > 0 && (
                                <StackItem>
                                    <div
                                        style={{
                                            border: "1px solid var(--pf-t--global--border--color--default)",
                                            borderRadius: "var(--pf-t--global--border--radius--medium)",
                                            padding: "var(--pf-t--global--spacer--sm)",
                                        }}
                                    >
                                        <strong>Agent</strong>
                                        <LabelGroup style={{ marginTop: "var(--pf-t--global--spacer--sm)" }}>
                                            {filter.agent.map((agentValue) => (
                                                <Label
                                                    key={agentValue}
                                                    color={agentValue.startsWith("!") ? "red" : "grey"}
                                                    onClose={() => removeAgentChip(agentValue)}
                                                >
                                                    {agentValue}
                                                </Label>
                                            ))}
                                        </LabelGroup>
                                    </div>
                                </StackItem>
                            )}
                            {filter.value && filter.value.length > 0 && (
                                <StackItem>
                                    <div
                                        style={{
                                            border: "1px solid var(--pf-t--global--border--color--default)",
                                            borderRadius: "var(--pf-t--global--border--radius--medium)",
                                            padding: "var(--pf-t--global--spacer--sm)",
                                        }}
                                    >
                                        <strong>Value</strong>
                                        <LabelGroup style={{ marginTop: "var(--pf-t--global--spacer--sm)" }}>
                                            {filter.value.map((valueValue) => (
                                                <Label
                                                    key={valueValue}
                                                    color={valueValue.startsWith("!") ? "red" : "grey"}
                                                    onClose={() => removeValueChip(valueValue)}
                                                >
                                                    {valueValue}
                                                </Label>
                                            ))}
                                        </LabelGroup>
                                    </div>
                                </StackItem>
                            )}
                            {filter.status && filter.status.length > 0 && (
                                <StackItem>
                                    <div
                                        style={{
                                            border: "1px solid var(--pf-t--global--border--color--default)",
                                            borderRadius: "var(--pf-t--global--border--radius--medium)",
                                            padding: "var(--pf-t--global--spacer--sm)",
                                        }}
                                    >
                                        <strong>Status</strong>
                                        <LabelGroup style={{ marginTop: "var(--pf-t--global--spacer--sm)" }}>
                                            {filter.status.map((statusValue) => (
                                                <Label
                                                    key={statusValue}
                                                    color={statusValue.startsWith("!") ? "red" : "grey"}
                                                    onClose={() => removeStatusChip(statusValue)}
                                                >
                                                    {statusValue}
                                                </Label>
                                            ))}
                                        </LabelGroup>
                                    </div>
                                </StackItem>
                            )}
                        </Stack>
                    ) : (
                        <StackItem style={{ paddingTop: "var(--pf-t--global--spacer--md)" }}>
                            <Content component="p" style={{ color: "var(--pf-t--global--text--color--subtle)" }}>
                                No filters applied. Select filters from the tabs above to refine your results.
                            </Content>
                        </StackItem>
                    )}
                </StackItem>
            </DrawerPanelBody>
        </DrawerPanelContent>
    );
};

