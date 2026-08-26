import { useMemo, useState } from "react";
import { Content, Stack, StackItem, Switch, Title } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { useGetInstances, useGetServiceModels } from "@/Data/Queries";
import { useDebounce } from "@/UI";
import { AddableSelectInput, AddableSelectOption, AddableTextInput } from "@/UI/Components";
import { words } from "@/UI/words";

export interface ServiceFilterFormProps {
  filter: Resource.Filter;
  onAddServiceEntity: (entity: string) => void;
  onAddServiceInstance: (value: string) => void;
  onChangeIncludeOwned: (includeOwned: boolean) => void;
}

/**
 * The ServiceFilterForm component.
 *
 * Renders the Service tab of the resources filter drawer: a service-entity field, an instance field
 * and an "include owned services" switch. The entity is a typeahead select that can toggle to a
 * free-text input; the instance is a typeahead select only (no free text) and stays disabled until
 * the entity input holds a value. Each pick is added as a removable chip. Instance options carry the
 * encoded id/label filter value (see {@link Resource.encodeServiceInstanceFilterValue}) as their
 * value and the service identity (falling back to the id) as their label.
 *
 * @Props {ServiceFilterFormProps} - Component props.
 *  @prop {Resource.Filter} filter - Current filter state supplied by the parent.
 *  @prop {(entity: string) => void} onAddServiceEntity - Adds a service entity to the filter.
 *  @prop {(value: string) => void} onAddServiceInstance - Adds a service instance (encoded id/label value) to the filter.
 *  @prop {(includeOwned: boolean) => void} onChangeIncludeOwned - Toggles the include-owned scope.
 *
 * @returns {React.ReactElement} The rendered service filter form.
 */
export const ServiceFilterForm: React.FC<ServiceFilterFormProps> = ({
  filter,
  onAddServiceEntity,
  onAddServiceInstance,
  onChangeIncludeOwned,
}) => {
  const [entityInputMode, setEntityInputMode] = useState<"select" | "text">("select");
  const [entitySearch, setEntitySearch] = useState("");
  const [instanceSearch, setInstanceSearch] = useState("");
  const debouncedInstanceSearch = useDebounce(instanceSearch, 500);

  const { data: serviceModels, isLoading: isLoadingModels } = useGetServiceModels().useOneTime();

  // Only query instances once the entity input holds a known entity
  const isEntitySelected = (serviceModels ?? []).some((model) => model.name === entitySearch);

  const {
    data: instancesData,
    isLoading: isLoadingInstances,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetInstances(entitySearch).useInfiniteScroll(
    {
      filter: debouncedInstanceSearch
        ? { id_or_service_identity: [debouncedInstanceSearch] }
        : undefined,
      pageSize: { kind: "PageSize", value: "20" },
    },
    { enabled: isEntitySelected }
  );

  // Unlike instanceOptions, entityOptions intentionally keeps already-added entities selectable: the
  // entity field both adds entities to the filter and selects one to look up its instances.
  const entityOptions = useMemo<AddableSelectOption[]>(
    () =>
      (serviceModels ?? [])
        .filter((model) => model.name.toLowerCase().includes(entitySearch.toLowerCase()))
        .map((model) => ({ value: model.name, label: model.name })),
    [serviceModels, entitySearch]
  );

  const instanceOptions = useMemo<AddableSelectOption[]>(
    () =>
      (instancesData?.pages ?? [])
        .flatMap((page) => page.data)
        .filter(
          (instance) =>
            !filter.serviceInstance?.some(
              (value) => Resource.parseServiceInstanceFilterValue(value).id === instance.id
            )
        )
        .map((instance) => ({
          value: Resource.encodeServiceInstanceFilterValue(
            instance.id,
            instance.service_identity_attribute_value
          ),
          label: instance.service_identity_attribute_value ?? instance.id,
        })),
    [instancesData, filter.serviceInstance]
  );

  return (
    <Stack hasGutter style={{ padding: "1rem 0" }}>
      <StackItem>
        <Title headingLevel="h3" size="md">
          {words("resources.filters.service.sectionTitle")}
        </Title>
      </StackItem>
      <StackItem>
        {entityInputMode === "select" ? (
          <AddableSelectInput
            label={words("resources.filters.service.entity.label")}
            placeholder={words("resources.filters.service.entity.placeholder")}
            onAdd={onAddServiceEntity}
            options={entityOptions}
            onFilter={setEntitySearch}
            onReachEnd={() => {}}
            isLoading={isLoadingModels}
            onToggleInputMode={() => setEntityInputMode("text")}
            toggleLabel={words("resources.filters.service.entity.selectInfoLabel")}
            loadingLabel={words("resources.filters.service.entity.loading")}
            emptyLabel={words("resources.filters.service.entity.empty")}
          />
        ) : (
          <AddableTextInput
            label={words("resources.filters.service.entity.label")}
            placeholder={words("resources.filters.service.entity.placeholder")}
            onAdd={onAddServiceEntity}
            onToggleInputMode={() => setEntityInputMode("select")}
            toggleLabel={words("resources.filters.service.entity.textInfoLabel")}
          />
        )}
      </StackItem>
      <StackItem>
        <AddableSelectInput
          label={words("resources.filters.service.instance.label")}
          placeholder={
            isLoadingInstances
              ? words("resources.filters.service.instance.loading")
              : words("resources.filters.service.instance.placeholder")
          }
          onAdd={onAddServiceInstance}
          options={instanceOptions}
          onFilter={setInstanceSearch}
          onReachEnd={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          isLoading={isLoadingInstances || isFetchingNextPage}
          isDisabled={!entitySearch}
          loadingLabel={words("resources.filters.service.instance.loading")}
          emptyLabel={words("resources.filters.service.instance.empty")}
        />
      </StackItem>
      <StackItem>
        <Switch
          id="resources-filter-include-owned"
          label={words("resources.filters.service.includeOwned.label")}
          isChecked={Boolean(filter.includeOwned)}
          isDisabled={!filter.serviceInstance?.length}
          onChange={(_event, checked) => onChangeIncludeOwned(checked)}
        />
        <Content component="small">
          {words("resources.filters.service.includeOwned.description")}
        </Content>
      </StackItem>
    </Stack>
  );
};
