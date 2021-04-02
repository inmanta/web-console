import React, { useContext, useState } from "react";
import {
  PageSection,
  Alert,
  Card,
  CardFooter,
  Toolbar,
  ToolbarGroup,
  AlertActionCloseButton,
  ToolbarItem,
  ToolbarContent,
  AlertGroup,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownPosition,
  ToolbarFilter,
  Select,
  SelectOption,
  InputGroup,
  TextInput,
  ButtonVariant,
  SelectVariant,
} from "@patternfly/react-core";
import { words } from "@/UI/words";
import { TableProvider } from "./TableProvider";
import {
  Pagination,
  Query,
  RemoteData,
  ServiceModel,
  toggleValueInList,
} from "@/Core";
import { useKeycloak } from "react-keycloak";
import { Link } from "react-router-dom";
import { FilterIcon, PlusIcon, SearchIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  ServiceProvider,
  EnvironmentProvider,
} from "@/UI/Components";
import { InventoryContext } from "./InventoryContext";
import { PaginationToolbar } from "./Components";
import { uniq } from "lodash";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSection className={"horizontally-scrollable"} {...props}>
    <Card>{children}</Card>
  </PageSection>
);

export const ServiceInventoryWithProvider: React.FC<{
  match: { params: { id: string } };
}> = ({ match }) => {
  return (
    <EnvironmentProvider
      Wrapper={Wrapper}
      Dependant={({ environment }) => (
        <ServiceProvider
          serviceName={match.params.id}
          environmentId={environment}
          Wrapper={Wrapper}
          Dependant={({ service }) => (
            <ServiceInventory
              service={service}
              environmentId={environment}
              serviceName={match.params.id}
            />
          )}
        />
      )}
    />
  );
};

export const ServiceInventory: React.FunctionComponent<{
  serviceName: string;
  environmentId: string;
  service: ServiceModel;
}> = ({ serviceName, environmentId, service }) => {
  const [instanceErrorMessage, setInstanceErrorMessage] = React.useState("");

  const shouldUseAuth =
    process.env.SHOULD_USE_AUTH === "true" || (globalThis && globalThis.auth);
  let keycloak;
  if (shouldUseAuth) {
    // The value will be always true or always false during one session
    [keycloak] = useKeycloak();
  }

  const { dataProvider } = useContext(DependencyContext);
  const [sortColumn, setSortColumn] = useState<string | undefined>(
    "created_at"
  );
  const [order, setOrder] = useState<Query.SortDirection | undefined>("desc");
  const sort =
    sortColumn && order ? { name: sortColumn, order: order } : undefined;
  const [filter, setFilter] = useState<Query.Filter>({});

  const [data, retry] = dataProvider.useContinuous<"ServiceInstances">({
    kind: "ServiceInstances",
    qualifier: {
      name: serviceName,
      environment: environmentId || "",
      sort,
      filter,
    },
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <Wrapper aria-label="ServiceInventory-Loading">
          <LoadingView delay={500} />
        </Wrapper>
      ),
      failed: (error) => (
        <Wrapper aria-label="ServiceInventory-Failed">
          <ErrorView message={error} retry={retry} />
        </Wrapper>
      ),
      success: ({ data: instances, handlers, metadata }) => (
        <InventoryContext.Provider
          value={{
            attributes: service.attributes,
            environmentId,
            inventoryUrl: `/lsm/v1/service_inventory/${serviceName}`,
            setErrorMessage: setInstanceErrorMessage,
            refresh: retry,
          }}
        >
          {instanceErrorMessage && (
            <AlertGroup isToast={true}>
              <Alert
                variant="danger"
                title={instanceErrorMessage}
                actionClose={
                  <AlertActionCloseButton
                    data-cy="close-alert"
                    onClose={() => setInstanceErrorMessage("")}
                  />
                }
              />
            </AlertGroup>
          )}
          {instances.length > 0 ? (
            <Wrapper aria-label="ServiceInventory-Success">
              <Bar
                serviceName={serviceName}
                handlers={handlers}
                metadata={metadata}
                filter={filter}
                setFilter={setFilter}
                service={service}
              />
              <TableProvider
                instances={instances}
                keycloak={keycloak}
                serviceEntity={service}
                sortColumn={sortColumn}
                setSortColumn={setSortColumn}
                order={order}
                setOrder={setOrder}
              />
            </Wrapper>
          ) : (
            <Wrapper aria-label="ServiceInventory-Empty">
              <Bar
                serviceName={serviceName}
                handlers={handlers}
                metadata={metadata}
                filter={filter}
                setFilter={setFilter}
                service={service}
              />
              <EmptyView
                message={words("inventory.empty.message")(serviceName)}
              />
            </Wrapper>
          )}
        </InventoryContext.Provider>
      ),
    },
    data
  );
};

interface BarProps {
  serviceName: string;
  handlers: Pagination.Handlers;
  metadata: Pagination.Metadata;
  filter: Query.Filter;
  setFilter: (filter: Query.Filter) => void;
  service: ServiceModel;
}

const Bar: React.FC<BarProps> = ({
  serviceName,
  handlers,
  metadata,
  filter,
  setFilter,
  service,
}) => {
  return (
    <CardFooter>
      <Toolbar clearAllFilters={() => setFilter({})}>
        <ToolbarContent>
          {
            <FilterView
              filter={filter}
              setFilter={setFilter}
              service={service}
            />
          }
          <ToolbarGroup>
            <ToolbarItem>
              <Link
                to={{
                  pathname: `/lsm/catalog/${serviceName}/inventory/add`,
                  search: location.search,
                }}
              >
                <Button id="add-instance-button">
                  <PlusIcon /> {words("inventory.addInstance.button")}
                </Button>
              </Link>
            </ToolbarItem>
          </ToolbarGroup>
          <PaginationToolbar handlers={handlers} metadata={metadata} />
        </ToolbarContent>
      </Toolbar>
    </CardFooter>
  );
};

interface FilterProps {
  filter: Query.Filter;
  setFilter: (filter: Query.Filter) => void;
  service: ServiceModel;
}

type AttributeSetSelectionKey =
  | "Active (empty)"
  | "Active (not empty)"
  | "Candidate (empty)"
  | "Candidate (not empty)"
  | "Rollback (empty)"
  | "Rollback (not empty)";

const FilterView: React.FC<FilterProps> = ({ filter, setFilter, service }) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [category, setCategory] = useState("State");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [idInput, setIdInput] = useState("");

  const onCategorySelect = (newCategory: string) => {
    setCategory(newCategory);
    setIsCategoryOpen(false);
  };

  const onStateSelect = (event, selection) => {
    setFilter({
      ...filter,
      state: filter.state
        ? uniq(toggleValueInList(selection, [...filter.state]))
        : [selection],
    });
    setIsFilterOpen(false);
  };

  const filterSelector = (
    <ToolbarItem>
      <Dropdown
        onSelect={(event) => {
          onCategorySelect((event?.target as HTMLElement).innerText);
        }}
        position={DropdownPosition.left}
        toggle={
          <DropdownToggle
            onToggle={setIsCategoryOpen}
            style={{ width: "100%" }}
          >
            <FilterIcon /> {category}
          </DropdownToggle>
        }
        isOpen={isCategoryOpen}
        dropdownItems={[
          <DropdownItem key="cat1">State</DropdownItem>,
          <DropdownItem key="cat2">Id</DropdownItem>,
          <DropdownItem key="cat3">AttributeSet</DropdownItem>,
        ]}
        style={{ width: "100%" }}
      ></Dropdown>
    </ToolbarItem>
  );

  const states = service.lifecycle.states.map((state) => state.name);

  const removeChip = (cat, id) => {
    console.log({ cat, id });
    const name = cat.toString().toLowerCase();
    setFilter({
      ...filter,
      [name]: filter[name].filter((a) => a !== id),
    });
  };

  const onIdInput = (event) => {
    if (event.key && event.key !== "Enter") {
      return;
    }

    setFilter({
      ...filter,
      id: filter.id
        ? uniq(toggleValueInList(idInput, [...filter.id]))
        : [idInput],
    });
    setIdInput("");
  };

  const isDisabled = (
    kind: "Empty" | "Not Empty",
    set: "Active" | "Candidate" | "Rollback"
  ) => {
    if (kind === "Empty") {
      if (typeof filter.attribute_set_not_empty === "undefined") return false;
      return filter.attribute_set_not_empty.includes(Query.Attributes[set]);
    }

    if (typeof filter.attribute_set_empty === "undefined") return false;
    return filter.attribute_set_empty.includes(Query.Attributes[set]);
  };

  const onAttributeSelect = (event, selection) => {
    const currentEmpty = attributesListToSelection(
      "empty",
      getFromFilter("empty", filter)
    );
    const emptyList = attributeSelectionToAttributesList(
      "empty",
      toggleValueInList(selection, currentEmpty)
    );

    const currentNotEmpty = attributesListToSelection(
      "not empty",
      getFromFilter("not empty", filter)
    );

    const notEmptyList = attributeSelectionToAttributesList(
      "not empty",
      toggleValueInList(selection, currentNotEmpty)
    );

    setFilter({
      ...filter,
      attribute_set_empty: emptyList,
      attribute_set_not_empty: notEmptyList,
    });

    setIsFilterOpen(false);
  };

  const attributeSetFilter = (
    <ToolbarFilter
      chips={getAttributeSelectionFromFilter(filter)}
      // deleteChip={removeChip}
      categoryName="AttributeSet"
      showToolbarItem={category === "AttributeSet"}
    >
      <Select
        variant={SelectVariant.typeaheadMulti}
        typeAheadAriaLabel="Select a state"
        onToggle={setIsFilterOpen}
        onSelect={onAttributeSelect}
        selections={getAttributeSelectionFromFilter(filter)}
        isOpen={isFilterOpen}
        placeholderText="Any"
        chipGroupProps={{ numChips: 0 }}
      >
        <SelectOption
          key={0}
          value="Active (empty)"
          isDisabled={isDisabled("Empty", "Active")}
        />
        <SelectOption
          key={1}
          value="Candidate (empty)"
          isDisabled={isDisabled("Empty", "Candidate")}
        />
        <SelectOption
          key={2}
          value="Rollback (empty)"
          isDisabled={isDisabled("Empty", "Rollback")}
        />
        <SelectOption
          key={3}
          value="Active (not empty)"
          isDisabled={isDisabled("Not Empty", "Active")}
        />
        <SelectOption
          key={4}
          value="Candidate (not empty)"
          isDisabled={isDisabled("Not Empty", "Candidate")}
        />
        <SelectOption
          key={5}
          value="Rollback (not empty)"
          isDisabled={isDisabled("Not Empty", "Rollback")}
        />
      </Select>
    </ToolbarFilter>
  );

  const stateFilter = (
    <ToolbarFilter
      chips={filter.state}
      deleteChip={removeChip}
      categoryName="State"
      showToolbarItem={category === "State"}
    >
      <Select
        aria-label="State"
        onToggle={setIsFilterOpen}
        onSelect={onStateSelect}
        selections={filter.state}
        isOpen={isFilterOpen}
        placeholderText="Any"
        variant="typeaheadmulti"
        chipGroupProps={{ numChips: 0 }}
      >
        {states.map((state) => (
          <SelectOption key={state} value={state} />
        ))}
      </Select>
    </ToolbarFilter>
  );

  const idFilter = (
    <ToolbarFilter
      chips={filter.id}
      deleteChip={removeChip}
      categoryName="Id"
      showToolbarItem={category === "Id"}
    >
      <InputGroup>
        <TextInput
          name="idInput"
          id="idInput1"
          type="search"
          aria-label="id filter"
          onChange={setIdInput}
          value={idInput}
          placeholder="Filter by id..."
          onKeyDown={onIdInput}
        />
        <Button
          variant={ButtonVariant.control}
          aria-label="search button for search input"
          onClick={onIdInput}
        >
          <SearchIcon />
        </Button>
      </InputGroup>
    </ToolbarFilter>
  );

  const filters = (
    <>
      {stateFilter}
      {idFilter}
      {attributeSetFilter}
    </>
  );

  return (
    <ToolbarGroup variant="filter-group">
      {filterSelector}
      {filters}
    </ToolbarGroup>
  );
};

function getAttributeSelectionFromFilter(
  filter: Query.Filter
): AttributeSetSelectionKey[] {
  if (typeof filter === "undefined") return [];
  let list: AttributeSetSelectionKey[] = [];
  if (typeof filter.attribute_set_empty !== "undefined") {
    list = [
      ...list,
      ...attributesListToSelection("empty", filter.attribute_set_empty),
    ];
  }
  if (typeof filter.attribute_set_not_empty !== "undefined") {
    list = [
      ...list,
      ...attributesListToSelection("not empty", filter.attribute_set_not_empty),
    ];
  }
  return list;
}

function attributesListToSelection(
  kind: "empty" | "not empty",
  list: Query.Attributes[]
): AttributeSetSelectionKey[] {
  return list.map((a) => {
    switch (a) {
      case Query.Attributes.Active:
        return `Active (${kind})` as AttributeSetSelectionKey;
      case Query.Attributes.Candidate:
        return `Candidate (${kind})` as AttributeSetSelectionKey;
      case Query.Attributes.Rollback:
        return `Rollback (${kind})` as AttributeSetSelectionKey;
    }
  });
}

function attributeSelectionToAttributesList(
  kind: "empty" | "not empty",
  list: AttributeSetSelectionKey[]
): Query.Attributes[] {
  if (list.length <= 0) return [];
  return list
    .map((value) => attributeToSelection(value))
    .filter(([, k]) => k === kind)
    .map(([attr]) => attr);
}

function attributeToSelection(
  selection: AttributeSetSelectionKey
): [Query.Attributes, "empty" | "not empty"] {
  switch (selection) {
    case "Active (empty)":
      return [Query.Attributes.Active, "empty"];
    case "Active (not empty)":
      return [Query.Attributes.Active, "not empty"];
    case "Candidate (empty)":
      return [Query.Attributes.Candidate, "empty"];
    case "Candidate (not empty)":
      return [Query.Attributes.Candidate, "not empty"];
    case "Rollback (empty)":
      return [Query.Attributes.Rollback, "empty"];
    case "Rollback (not empty)":
      return [Query.Attributes.Rollback, "not empty"];
  }
}

function getFromFilter(
  kind: "empty" | "not empty",
  filter: Query.Filter
): Query.Attributes[] {
  if (typeof filter === "undefined") return [];
  switch (kind) {
    case "empty": {
      if (typeof filter.attribute_set_empty === "undefined") return [];
      return filter.attribute_set_empty;
    }

    case "not empty": {
      if (typeof filter.attribute_set_not_empty === "undefined") return [];
      return filter.attribute_set_not_empty;
    }
  }
}
