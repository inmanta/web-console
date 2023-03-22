import React from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { TableComposable, Tbody, Tr } from "@patternfly/react-table";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, RemoteData } from "@/Core";
import {
  CommandResolverImpl,
  getStoreInstance,
  KeycloakAuthHelper,
  QueryManagerResolver,
  QueryResolverImpl,
} from "@/Data";
import { UpdateInstanceAttributeCommandManager } from "@/Data/Managers/UpdateInstanceAttribute";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  ServiceInstance,
  StaticScheduler,
} from "@/Test";
import { TreeTableCellContext } from "@/UI/Components/TreeTable/RowReferenceContext";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import { CellWithCopyExpert } from "./CellWithCopyExpert";

function setup(props) {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );
  const updateAttribute = UpdateInstanceAttributeCommandManager(
    new KeycloakAuthHelper(),
    apiHelper
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([updateAttribute])
  );
  const onClickFn = jest.fn();
  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    dependencies.routeManager
  );
  store.dispatch.environment.setEnvironments(
    RemoteData.success([
      {
        id: "aaa",
        name: "env-a",
        project_id: "ppp",
        repo_branch: "branch",
        repo_url: "repo",
        projectName: "project",
        settings: {
          enable_lsm_expert_mode: true,
        },
      },
    ])
  );
  const component = (
    <MemoryRouter initialEntries={[{ search: "?env=aaa" }]}>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          environmentHandler,
        }}
      >
        <StoreProvider store={store}>
          <TreeTableCellContext.Provider value={{ onClick: onClickFn }}>
            <TableComposable>
              <Tbody>
                <Tr>
                  <CellWithCopyExpert {...props} />
                </Tr>
              </Tbody>
            </TableComposable>
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
  const props = { label: "attribute", value: "someValue", hasOnClick: true };
  const { component, onClickFn } = setup(props);
  render(component);

  const cell = await screen.findByText(props.value);
  expect(cell).toBeVisible();
  await userEvent.click(cell);
  expect(onClickFn).toBeCalledWith(props.value);
});

test("Given CellWithCopy When a cell has entity and on click Then it is rendered as a link", async () => {
  const props = {
    label: "attribute",
    value: "someValue",
    hasOnClick: true,
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
    })
  );

  const cell = await screen.findByText(props.value);
  expect(cell).toBeVisible();
  await userEvent.click(cell);
  expect(onClickFn).toBeCalledWith(props.value, props.serviceName);
});

test("Given CellWithCopy When a cell has entity, multiple values and on click Then multiple links are rendered", async () => {
  const [someValue, someOtherValue] = ["someValue", "someOtherValue"];
  const props = {
    label: "attribute",
    value: "someValue,someOtherValue",
    hasOnClick: true,
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
    })
  );
  apiHelper.resolve(
    Either.right({
      data: {
        ...ServiceInstance.b,
        service_identity_attribute_value: undefined,
      },
    })
  );

  const firstCell = await screen.findByText(someValue);
  expect(firstCell).toBeVisible();
  await userEvent.click(firstCell);
  expect(onClickFn).toBeCalledWith(someValue, props.serviceName);
  const otherCell = await screen.findByText(someOtherValue);
  expect(otherCell).toBeVisible();
  await userEvent.click(otherCell);
  expect(onClickFn).toBeCalledWith(someOtherValue, props.serviceName);
});
