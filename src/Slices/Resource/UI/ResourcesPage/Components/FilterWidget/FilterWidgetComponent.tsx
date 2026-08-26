import { useState } from "react";
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
import { getFilterActions } from "@/UI/Components";
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
  const { addString, setStrings, removeStringChip, clearStringGroup } = getFilterActions(
    filter,
    setFilter
  );

  const handleAddType = (type: string) => addString("type", type);
  const handleAddValue = (value: string) => addString("value", value);
  const handleAddAgent = (agent: string) => addString("agent", agent);

  const removeTypeChip = (id: string) => removeStringChip("type", id);
  const removeAgentChip = (id: string) => removeStringChip("agent", id);
  const removeValueChip = (id: string) => removeStringChip("value", id);

  const clearTypeFilters = () => clearStringGroup("type");
  const clearAgentFilters = () => clearStringGroup("agent");
  const clearValueFilters = () => clearStringGroup("value");

  // Status changes must also set disregardDefault (it suppresses the default !orphaned view),
  // passed as the actions' patch argument.
  const handleStatusChange = (statuses: string[]) => {
    setStrings("status", statuses, { disregardDefault: true });
  };
  const removeStatusChip = (id: string) => {
    removeStringChip("status", id, { disregardDefault: true });
  };
  const clearStatusFilters = () => clearStringGroup("status", { disregardDefault: true });

  const addServiceEntity = (entity: string) => addString("serviceEntity", entity);
  const removeServiceEntityChip = (entity: string) => removeStringChip("serviceEntity", entity);
  const clearServiceEntities = () => clearStringGroup("serviceEntity");

  const addServiceInstance = (value: string) => addString("serviceInstance", value);
  const removeServiceInstanceChip = (value: string) => removeStringChip("serviceInstance", value);
  const clearServiceInstances = () => clearStringGroup("serviceInstance");

  const setIncludeOwned = (includeOwned: boolean) => {
    setFilter({ ...filter, includeOwned: includeOwned || undefined });
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
              </Tabs>
            </StackItem>
            <Divider />
            <ActiveFiltersSection
              filter={filter}
              onResetFilters={() => setFilter({})}
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
              removeIncludeOwned={() => setIncludeOwned(false)}
            />
          </Stack>
        </Form>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};
