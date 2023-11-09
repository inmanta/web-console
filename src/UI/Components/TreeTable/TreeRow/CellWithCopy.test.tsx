import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Table /* data-codemods */, Tbody, Tr } from "@patternfly/react-table";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  CommandResolverImpl,
  getStoreInstance,
  KeycloakAuthHelper,
  QueryManagerResolverImpl,
  QueryResolverImpl,
} from "@/Data";
import { UpdateInstanceAttributeCommandManager } from "@/Data/Managers/UpdateInstanceAttribute";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolverImpl,
  ServiceInstance,
  StaticScheduler,
} from "@/Test";
import { TreeTableCellContext } from "@/UI/Components/TreeTable/RowReferenceContext";
import { DependencyProvider } from "@/UI/Dependency";
import { CellWithCopy } from "./CellWithCopy";

function setup(props) {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );
  const updateAttribute = UpdateInstanceAttributeCommandManager(
    new KeycloakAuthHelper(),
    apiHelper,
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolverImpl([updateAttribute]),
  );
  const onClickFn = jest.fn();

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
        }}
      >
        <StoreProvider store={store}>
          <TreeTableCellContext.Provider value={{ onClick: onClickFn }}>
            <Table>
              <Tbody>
                <Tr>
                  <CellWithCopy {...props} />
                </Tr>
              </Tbody>
            </Table>
          </TreeTableCellContext.Provider>
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler, onClickFn };
}

test("Given CellWithCopy When a cell has a simple value only Then it is shown", async () => {
  const props = { label: "attribute", value: "someValue" };
  const { component } = setup(props);
  render(component);

  expect(await screen.findByText(props.value)).toBeVisible();
});

test("Given CellWithCopy When a cell has on click Then it is rendered as a link", async () => {
  const props = { label: "attribute", value: "someValue", hasRelation: true };
  const { component, onClickFn } = setup(props);

  render(component);
  const cell = await screen.findByText(props.value);

  expect(cell).toBeVisible();

  await act(async () => {
    await userEvent.click(cell);
  });

  expect(onClickFn).toBeCalledWith(props.value);
});

test("Given CellWithCopy When a cell has entity and on click Then it is rendered as a link", async () => {
  const props = {
    label: "attribute",
    value: "someValue",
    hasRelation: true,
    serviceName: "test_service",
  };
  const { component, apiHelper, onClickFn } = setup(props);
  render(component);

  apiHelper.resolve(
    Either.right({
      data: {
        ...ServiceInstance.a,
        service_identity_attribute_value: undefined,
      },
    }),
  );

  const cell = await screen.findByText(props.value);

  expect(cell).toBeVisible();

  await act(async () => {
    await userEvent.click(cell);
  });

  expect(onClickFn).toBeCalledWith(props.value, props.serviceName);
});

test("Given CellWithCopy When a cell has entity, multiple values and on click Then multiple links are rendered", async () => {
  const [someValue, someOtherValue] = ["someValue", "someOtherValue"];
  const props = {
    label: "attribute",
    value: "someValue,someOtherValue",
    hasRelation: true,
    serviceName: "test_service",
  };
  const { component, apiHelper, onClickFn } = setup(props);
  render(component);

  apiHelper.resolve(
    Either.right({
      data: {
        ...ServiceInstance.a,
        service_identity_attribute_value: undefined,
      },
    }),
  );
  apiHelper.resolve(
    Either.right({
      data: {
        ...ServiceInstance.b,
        service_identity_attribute_value: undefined,
      },
    }),
  );

  const firstCell = await screen.findByText(someValue);

  expect(firstCell).toBeVisible();

  await act(async () => {
    await userEvent.click(firstCell);
  });

  expect(onClickFn).toBeCalledWith(someValue, props.serviceName);

  const otherCell = await screen.findByText(someOtherValue);

  expect(otherCell).toBeVisible();

  await act(async () => {
    await userEvent.click(otherCell);
  });

  expect(onClickFn).toBeCalledWith(someOtherValue, props.serviceName);
});
