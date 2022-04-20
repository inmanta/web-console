import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { act } from "react-dom/test-utils";
import { Either } from "@/Core";
import {
  CommandManagerResolver,
  CommandResolverImpl,
  getStoreInstance,
  KeycloakAuthHelper,
  QueryManagerResolver,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  Service,
  ServiceInstance,
  StaticScheduler,
} from "@/Test";
import { InterServiceRelations } from "@/Test/Data/Service";
import { DependencyProvider } from "@/UI/Dependency";
import { CreateInstance } from "./CreateInstance";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(store, apiHelper, authHelper)
  );

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
          <CreateInstance serviceEntity={Service.withRelationsOnly} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("Given the CreateInstance View When creating an instance with relations Then the correct request is fired", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await userEvent.click(screen.getByRole("button", { name: "relation1" }));
  const firstRelationFieldGroup = screen.getByRole("generic", {
    name: "RelationListFieldInput-relation1",
  });
  await userEvent.click(
    within(firstRelationFieldGroup).getByRole("button", { name: "Add" })
  );
  await userEvent.click(
    await within(firstRelationFieldGroup).findByRole("button", { name: "1" })
  );
  await act(async () => {
    apiHelper.resolve(Either.right({ data: Service.withIdentity }));
  });
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: [ServiceInstance.a, ServiceInstance.b] })
    );
  });

  const relationInputField = screen.getByPlaceholderText("Select an instance");
  await userEvent.type(relationInputField, "ab");
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/lsm/v1/service_inventory/${InterServiceRelations.editable.entity_type}?include_deployment_progress=False&limit=100&filter.order_id=a`,
    environment: "env",
  });
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: [ServiceInstance.a, ServiceInstance.b] })
    );
  });
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/lsm/v1/service_inventory/${InterServiceRelations.editable.entity_type}?include_deployment_progress=False&limit=100&filter.order_id=ab`,
    environment: "env",
  });
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: [ServiceInstance.a, ServiceInstance.b] })
    );
  });
  const option = screen.getAllByRole("option")[0];
  await userEvent.click(option);
  await userEvent.click(
    await within(firstRelationFieldGroup).findByRole("button", { name: "1" })
  );
  await userEvent.click(
    within(firstRelationFieldGroup).getByRole("button", { name: "Add" })
  );
  await userEvent.click(
    await within(firstRelationFieldGroup).findByRole("button", { name: "2" })
  );
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: [ServiceInstance.a, ServiceInstance.b] })
    );
  });
  await act(async () => {
    apiHelper.resolve(Either.right({ data: Service.withIdentity }));
  });

  const secondRelationInputField =
    screen.getByPlaceholderText("Select an instance");
  await userEvent.type(secondRelationInputField, "t");
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/lsm/v1/service_inventory/${InterServiceRelations.editable.entity_type}?include_deployment_progress=False&limit=100&filter.order_id=t`,
    environment: "env",
  });
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: [ServiceInstance.a, ServiceInstance.b] })
    );
  });
  const options = screen.getAllByRole("option");
  expect(options[0]).toHaveClass("pf-m-disabled");
  await userEvent.click(options[1]);

  await userEvent.click(screen.getByRole("button", { name: "Confirm" }));

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: `/lsm/v1/service_inventory/${Service.withRelationsOnly.name}`,
    body: {
      attributes: {
        relation1: ["service_instance_id_a", "service_instance_id_b"],
      },
    },
    environment: "env",
  });
});
