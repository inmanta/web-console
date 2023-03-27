import React from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { TableComposable, Tbody, Tr } from "@patternfly/react-table";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { act } from "react-dom/test-utils";
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

function setup(props, expertMode = false) {
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
          enable_lsm_expert_mode: expertMode,
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

test("Given CellWithCopyExpert When a cell has a simple value only Then it is shown", async () => {
  const props = { label: "attribute", value: "someValue" };
  const { component } = setup(props);
  render(component);

  expect(await screen.findByText(props.value)).toBeVisible();
});

test("Given CellWithCopyExpert When a cell has on click Then it is rendered as a link", async () => {
  const props = { label: "attribute", value: "someValue", hasOnClick: true };
  const { component, onClickFn } = setup(props);
  render(component);

  const cell = await screen.findByText(props.value);
  expect(cell).toBeVisible();
  await userEvent.click(cell);
  expect(onClickFn).toBeCalledWith(props.value);
});

test("Given CellWithCopyExpert When a cell has entity and on click Then it is rendered as a link", async () => {
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

test("Given CellWithCopyExpert When a cell has entity, multiple values and on click Then multiple links are rendered", async () => {
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

test("Given CellWithCopyExpert When a cell has access to expertMode Then button in cell appears that hold functionality to show and hide input", async () => {
  const props = {
    label: "attribute",
    value: "someValue",
    hasOnClick: true,
    serviceName: "test_service",
    path: "mgmt_prefix",
    instanceId: "09042edf-3032-490d-bcaf-cc45615ba782",
    version: 2,
    serviceEntity: "mpn",
    attributeType: "string",
  };
  const { component, apiHelper } = setup(props, true);
  render(component);
  apiHelper.resolve(
    Either.right({
      data: {
        ...ServiceInstance.a,
        service_identity_attribute_value: undefined,
      },
    })
  );
  const button = await screen.findByRole("button");
  await act(async () => {
    await userEvent.click(button);
  });
  const input = await screen.findByPlaceholderText("New Attribute");
  expect(input).toBeVisible();
  await act(async () => {
    await userEvent.click(button);
  });
  expect(input).not.toBeVisible();
  await act(async () => {
    await userEvent.click(button);
  });
  //had to find input once again as it lost
  const input2 = await screen.findByPlaceholderText("New Attribute");
  expect(input2).toBeVisible();
});

test("Given CellWithCopyExpert When a cell has access to expertMode and input will be populated with new values and submit button will be pressed and confirmed Then request will be sent", async () => {
  const newValue = "newValue";
  const props = {
    label: "attribute",
    value: "someValue",
    hasOnClick: true,
    serviceName: "test_service",
    path: "mgmt_prefix",
    instanceId: "09042edf-3032-490d-bcaf-cc45615ba782",
    version: 2,
    serviceEntity: "mpn",
    attributeType: "string",
  };
  const { component, apiHelper } = setup(props, true);
  render(component);
  apiHelper.resolve(
    Either.right({
      data: {
        ...ServiceInstance.a,
        service_identity_attribute_value: undefined,
      },
    })
  );

  const button = await screen.findByRole("button");
  await act(async () => {
    await userEvent.click(button);
  });
  const input = await screen.findByPlaceholderText("New Attribute");
  expect(input).toBeVisible();
  await act(async () => {
    await userEvent.click(button);
  });
  expect(input).not.toBeVisible();
  await act(async () => {
    await userEvent.click(button);
  });

  //had to find input once again as it lost
  const input2 = await screen.findByPlaceholderText("New Attribute");
  expect(input2).toBeVisible();

  // set value and click check/submit button
  await act(async () => {
    await userEvent.clear(input2);
    await userEvent.type(input2, newValue);
  });
  expect(input2).toHaveValue(newValue);

  const submitButton = await screen.findByTestId("inline-submit");
  expect(submitButton).toBeVisible();
  await act(async () => {
    await userEvent.click(submitButton);
  });

  //expect dialog to pop-up
  const dialog = await screen.findByRole("dialog");
  expect(dialog).toBeVisible();
  //close dialog and expect it to be hidden
  const dialogCancel = await screen.findByTestId("dialog-cancel");
  expect(dialogCancel).toBeVisible();
  await act(async () => {
    await userEvent.click(dialogCancel);
  });
  expect(dialog).not.toBeVisible();

  //click sumbit button again then close it by X icon
  await act(async () => {
    await userEvent.click(submitButton);
  });
  const dialog2 = await screen.findByRole("dialog");
  expect(dialog2).toBeVisible();

  const closeButton = screen.getByLabelText("Close");
  await act(async () => {
    await userEvent.click(closeButton);
  });
  expect(dialog2).not.toBeVisible();

  //click sumbit button again then click confirmation button in the dialog and expect to patch request to be sent
  await act(async () => {
    await userEvent.click(submitButton);
  });
  const dialog3 = await screen.findByRole("dialog");
  expect(dialog3).toBeVisible();

  const dialogSubmit = await screen.findByTestId("dialog-submit");

  await act(async () => {
    await userEvent.click(dialogSubmit);
  });

  expect(
    apiHelper.pendingRequests.find((request) => request.method === "PATCH")
  ).toMatchObject({
    method: "PATCH",
    url: "/lsm/v2/service_inventory/mpn/09042edf-3032-490d-bcaf-cc45615ba782/expert",
    environment: "aaa",
    body: {
      patch_id: "mpn-update-09042edf-3032-490d-bcaf-cc45615ba782-2",
      attribute_set_name: "attribute_attributes",
      edit: [
        {
          edit_id:
            "mpn-mgmt_prefix-update-09042edf-3032-490d-bcaf-cc45615ba782-2",
          operation: "replace",
          target: "mgmt_prefix",
          value: "newValue",
        },
      ],
      current_version: 2,
      comment: "Triggered from the console",
    },
  });
});
