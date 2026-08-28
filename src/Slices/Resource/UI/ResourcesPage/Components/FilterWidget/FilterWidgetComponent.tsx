import { useContext, useState } from "react";
import {
  Divider,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Form,
  Stack,
  StackItem,
  Tab,
  TabTitleText,
  Tabs,
  Title,
} from "@patternfly/react-core";
import { Resource } from "@/Core";
import { uniq } from "@/Core/Language/collection";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ActiveFiltersSection } from "./ActiveFiltersSection";
import { ResourceFilterForm } from "./ResourceFilterForm";
import { ServiceFilterForm } from "./ServiceFilterForm";
import { StatusFilterSelect } from "./StatusFilterSelect";

interface FilterWidgetComponentProps {
  onClose: () => void;
  filter: Resource.FilterWithDefaultHandling;
  setFilter: (filter: Resource.FilterWithDefaultHandling) => void;
}

/**
 * The FilterWidgetComponent component.
 *
 * Main filter drawer content combining resource, status and active filter management.
 *
 * @Props {FilterWidgetComponentProps} - Component props.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *  @prop {Resource.Filter} filter - Current filter state supplied by the parent.
 *  @prop {(filter: Resource.FilterWithDefaultHandling) => void} setFilter - Setter to persist filter changes upstream.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent: React.FC<FilterWidgetComponentProps> = ({
  onClose,
  filter,
  setFilter,
}) => {
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const { orchestratorProvider } = useContext(DependencyContext);
  const isLsmEnabled = orchestratorProvider.isLsmEnabled();

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

  const addServiceEntity = (entity: string) => {
    setFilter({
      ...filter,
      serviceEntity: uniq([...(filter.serviceEntity ?? []), entity]),
    });
  };

  const removeServiceEntityChip = (entity: string) => {
    setFilter({
      ...filter,
      serviceEntity: filter.serviceEntity?.filter((value) => value !== entity),
    });
  };

  const clearServiceEntities = () => {
    setFilter({
      ...filter,
      serviceEntity: undefined,
    });
  };

  const addServiceInstance = (value: string) => {
    setFilter({
      ...filter,
      serviceInstance: uniq([...(filter.serviceInstance ?? []), value]),
    });
  };

  const removeServiceInstanceChip = (value: string) => {
    setFilter({
      ...filter,
      serviceInstance: filter.serviceInstance?.filter((current) => current !== value),
    });
  };

  const clearServiceInstances = () => {
    setFilter({
      ...filter,
      serviceInstance: undefined,
    });
  };

  const setIncludeOwned = (includeOwned: boolean) => {
    setFilter({
      ...filter,
      includeOwned: includeOwned || undefined,
    });
  };

  const removeIncludeOwned = () => {
    setFilter({
      ...filter,
      includeOwned: undefined,
    });
  };

  const onResetFilters = () => {
    setFilter({});
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
      <DrawerPanelBody>
        <Form onSubmit={(e) => e.preventDefault()}>
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
                    onChangeStatus={handleStatusChange}
                    filter={filter}
                  />
                </Tab>
                <Tab
                  eventKey={1}
                  title={<TabTitleText>{words("resources.filters.tabs.status")}</TabTitleText>}
                >
                  <StatusFilterSelect
                    selectedStatuses={filter.status}
                    onChange={handleStatusChange}
                  />
                </Tab>
                {isLsmEnabled && (
                  <Tab
                    eventKey={2}
                    title={<TabTitleText>{words("resources.filters.tabs.service")}</TabTitleText>}
                  >
                    <ServiceFilterForm
                      filter={filter}
                      onAddServiceEntity={addServiceEntity}
                      onAddServiceInstance={addServiceInstance}
                      onChangeIncludeOwned={setIncludeOwned}
                    />
                  </Tab>
                )}
              </Tabs>
            </StackItem>
            <Divider />
            <ActiveFiltersSection
              filter={filter}
              onResetFilters={onResetFilters}
              removeTypeChip={removeTypeChip}
              removeAgentChip={removeAgentChip}
              removeValueChip={removeValueChip}
              removeStatusChip={removeStatusChip}
              clearTypeFilters={clearTypeFilters}
              clearAgentFilters={clearAgentFilters}
              clearValueFilters={clearValueFilters}
              clearStatusFilters={clearStatusFilters}
              removeServiceEntityChip={removeServiceEntityChip}
              clearServiceEntities={clearServiceEntities}
              removeServiceInstanceChip={removeServiceInstanceChip}
              clearServiceInstances={clearServiceInstances}
              removeIncludeOwned={removeIncludeOwned}
            />
          </Stack>
        </Form>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};
