import React, { useState } from "react";
import {
    Divider,
    DrawerActions,
    DrawerCloseButton,
    DrawerHead,
    DrawerPanelBody,
    DrawerPanelContent,
    Stack,
    StackItem,
    Tab,
    TabTitleText,
    Tabs,
    Title,
} from "@patternfly/react-core";
import { Resource } from "@/Core";
import { words } from "@/UI/words";
import { ActiveFiltersSection } from "./ActiveFiltersSection";
import { ResourceFilterForm } from "./ResourceFilterForm";
import { StatusFilterSelect } from "./StatusFilterSelect";

/**
 * @interface FilterWidgetComponentProps
 * @desc Props for FilterWidgetComponent.
 * @property {() => void} onClose - Callback executed when the filter drawer should be closed.
 * @property {Resource.Filter} filter - Current filter state supplied by the parent.
 * @property {(filter: Resource.FilterWithDefaultHandling) => void} setFilter - Setter to persist filter changes upstream.
 */
interface FilterWidgetComponentProps {
    onClose: () => void;
    filter: Resource.Filter;
    setFilter: (filter: Resource.FilterWithDefaultHandling) => void;
}

/**
 * @component FilterWidgetComponent
 * @desc Main filter drawer content combining resource, status and active filter management.
 * @param {FilterWidgetComponentProps} props - Component props.
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent: React.FC<FilterWidgetComponentProps> = ({ onClose, filter, setFilter }) => {
    const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

    const handleAddType = (type: string) => {
        setFilter({
            ...filter,
            type: filter.type ? [...filter.type, type] : [type],
        });
    };

    const handleAddValue = (value: string) => {
        setFilter({
            ...filter,
            value: filter.value ? [...filter.value, value] : [value],
        });
    };

    const handleAddAgent = (agent: string) => {
        setFilter({
            ...filter,
            agent: filter.agent ? [...filter.agent, agent] : [agent],
        });
    };

    const handleStatusChange = (statuses: string[]) => {
        setFilter({
            ...filter,
            status: statuses.length > 0 ? statuses : undefined,
            disregardDefault: true,
        });
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

    const clearTypeFilters = () => {
        setFilter({
            ...filter,
            type: undefined,
        });
    };

    const clearAgentFilters = () => {
        setFilter({
            ...filter,
            agent: undefined,
        });
    };

    const clearValueFilters = () => {
        setFilter({
            ...filter,
            value: undefined,
        });
    };

    const clearStatusFilters = () => {
        setFilter({
            ...filter,
            status: undefined,
            disregardDefault: true,
        });
    };

    const clearAllFilters = () => {
        setFilter({ disregardDefault: true });
    };

    return (
        <DrawerPanelContent isResizable minSize="300px">
            <DrawerHead>
                <Title headingLevel="h2" size="xl">
                    {words("resources.filters")}
                </Title>
                <DrawerActions>
                    <DrawerCloseButton onClick={onClose} />
                </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody >
                <Stack hasGutter>
                    <StackItem isFilled>
                        <Tabs activeKey={activeTabKey} onSelect={(_, tabIndex) => setActiveTabKey(tabIndex)}>
                            <Tab
                                eventKey={0}
                                title={<TabTitleText>{words("resources.filters.tabs.resource")}</TabTitleText>}
                            >
                                <ResourceFilterForm
                                    onAddType={handleAddType}
                                    onAddValue={handleAddValue}
                                    onAddAgent={handleAddAgent}
                                />
                            </Tab>
                            <Tab
                                eventKey={1}
                                title={<TabTitleText>{words("resources.filters.tabs.status")}</TabTitleText>}
                            >
                                <StatusFilterSelect selectedStatuses={filter.status} onChange={handleStatusChange} />
                            </Tab>
                        </Tabs>
                    </StackItem>
                    <Divider />
                    <ActiveFiltersSection
                        filter={filter}
                        onClearAll={clearAllFilters}
                        removeTypeChip={removeTypeChip}
                        removeAgentChip={removeAgentChip}
                        removeValueChip={removeValueChip}
                        removeStatusChip={removeStatusChip}
                        clearTypeFilters={clearTypeFilters}
                        clearAgentFilters={clearAgentFilters}
                        clearValueFilters={clearValueFilters}
                        clearStatusFilters={clearStatusFilters}
                    />
                </Stack>
            </DrawerPanelBody>
        </DrawerPanelContent>
    );
};

