import { useMemo, useState } from "react";
import {
  Content,
  FormGroup,
  SelectOptionProps,
  Stack,
  StackItem,
  Switch,
  Title,
} from "@patternfly/react-core";
import { Resource } from "@/Core";
import { useGetInstances, useGetServiceModels } from "@/Data/Queries";
import { useDebounce } from "@/UI";
import { SingleTextSelect } from "@/UI/Components";
import { words } from "@/UI/words";

export interface ServiceFilterFormProps {
  filter: Resource.Filter;
  onChangeServiceEntity: (entity: string | null) => void;
  onChangeServiceInstance: (instance: string | null) => void;
  onChangeIncludeOwned: (includeOwned: boolean) => void;
}

/**
 * The ServiceFilterForm component.
 *
 * Renders the Service tab of the resources filter drawer: a service-entity dropdown, an instance
 * dropdown (disabled until an entity is chosen) and an "include owned services" switch (disabled
 * until an instance is chosen). The selections compose with the Resource and Status tabs and
 * surface as removable chips in the active-filters section. The instance option value is the
 * instance id (UUID); its label is the service identity when available, falling back to the id.
 *
 * @Props {ServiceFilterFormProps} - Component props.
 *  @prop {Resource.Filter} filter - Current filter state supplied by the parent.
 *  @prop {(entity: string | null) => void} onChangeServiceEntity - Sets/clears the service entity.
 *  @prop {(instance: string | null) => void} onChangeServiceInstance - Sets/clears the service instance.
 *  @prop {(includeOwned: boolean) => void} onChangeIncludeOwned - Toggles the include-owned scope.
 *
 * @returns {React.ReactElement} The rendered service filter form.
 */
export const ServiceFilterForm: React.FC<ServiceFilterFormProps> = ({
  filter,
  onChangeServiceEntity,
  onChangeServiceInstance,
  onChangeIncludeOwned,
}) => {
  const [entitySearch, setEntitySearch] = useState("");
  const [instanceSearch, setInstanceSearch] = useState("");
  const debouncedInstanceSearch = useDebounce(instanceSearch, 500);

  const { data: serviceModels } = useGetServiceModels().useOneTime();

  const { data: instancesData, isLoading: isLoadingInstances } = useGetInstances(
    filter.serviceEntity ?? "",
    {
      filter: debouncedInstanceSearch
        ? { id_or_service_identity: [debouncedInstanceSearch] }
        : undefined,
      pageSize: { kind: "PageSize", value: "20" },
      currentPage: { kind: "CurrentPage", value: "" },
    }
  ).useOneTime({ enabled: Boolean(filter.serviceEntity) });

  const entityOptions = useMemo<SelectOptionProps[]>(
    () =>
      (serviceModels ?? [])
        .filter((model) => model.name.toLowerCase().includes(entitySearch.toLowerCase()))
        .map((model) => ({ value: model.name, children: model.name })),
    [serviceModels, entitySearch]
  );

  const instanceOptions = useMemo<SelectOptionProps[]>(
    () =>
      (instancesData?.data ?? []).map((instance) => ({
        value: instance.id,
        children: instance.service_identity_attribute_value ?? instance.id,
      })),
    [instancesData]
  );

  return (
    <Stack hasGutter style={{ padding: "1rem 0" }}>
      <StackItem>
        <Title headingLevel="h3" size="md">
          {words("resources.filters.service.sectionTitle")}
        </Title>
      </StackItem>
      <StackItem>
        <FormGroup label={words("resources.filters.service.entity.label")}>
          <SingleTextSelect
            key={`service-entity-${filter.serviceEntity ?? ""}`}
            selected={filter.serviceEntity ?? null}
            setSelected={(value) => onChangeServiceEntity(value || null)}
            options={entityOptions}
            onSearchTextChanged={setEntitySearch}
            toggleAriaLabel="service-entity"
            maxMenuHeight="300px"
            placeholderText={words("resources.filters.service.entity.placeholder")}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup label={words("resources.filters.service.instance.label")}>
          <SingleTextSelect
            key={`service-instance-${filter.serviceInstance ?? ""}`}
            selected={filter.serviceInstance ?? null}
            setSelected={(value) => onChangeServiceInstance(value || null)}
            options={instanceOptions}
            onSearchTextChanged={setInstanceSearch}
            isDisabled={!filter.serviceEntity}
            toggleAriaLabel="service-instance"
            maxMenuHeight="300px"
            placeholderText={
              isLoadingInstances
                ? words("resources.filters.service.instance.loading")
                : words("resources.filters.service.instance.placeholder")
            }
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <Switch
          id="resources-filter-include-owned"
          label={words("resources.filters.service.includeOwned.label")}
          isChecked={Boolean(filter.includeOwned)}
          isDisabled={!filter.serviceInstance}
          onChange={(_event, checked) => onChangeIncludeOwned(checked)}
        />
        <Content component="small">
          {words("resources.filters.service.includeOwned.description")}
        </Content>
      </StackItem>
    </Stack>
  );
};
