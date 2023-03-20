import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
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
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { CreateInstance } from "./CreateInstance";

function setup(service) {
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
          <CreateInstance serviceEntity={service} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("Given the CreateInstance View When creating an instance with attributes Then the correct request is fired", async () => {
  const { component, apiHelper } = setup(Service.a);
  render(component);

  const bandwidthField = screen.getByText("bandwidth");
  expect(bandwidthField).toBeVisible();

  await act(async () => {
    await userEvent.type(bandwidthField, "2");
  });

  const customerLocationsField = screen.getByText("customer_locations");
  await act(async () => {
    await userEvent.type(customerLocationsField, "5");
  });

  const orderIdField = screen.getByText("order_id");
  await act(async () => {
    await userEvent.type(orderIdField, "7007");
  });

  const networkField = screen.getByText("network");
  expect(networkField).toBeValid();

  await userEvent.click(screen.getByRole("button", { name: words("confirm") }));

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: `/lsm/v1/service_inventory/${Service.a.name}`,
    body: {
      attributes: {
        bandwidth: "2",
        circuits: [
          {
            csp_endpoint: {
              attributes: "",
              cloud_service_provider: "",
              ipx_access: null,
              region: "",
            },
            customer_endpoint: {
              encapsulation: "",
              inner_vlan: null,
              ipx_access: null,
              outer_vlan: null,
            },
            service_id: null,
          },
        ],
        customer_locations: "5",
        iso_release: "",
        network: "local",
        order_id: "12347007",
      },
    },
    environment: "env",
  });
});

test("Given the CreateInstance View When creating an instance with Inter-service-relations only Then the correct request is fired", async () => {
  const { component, apiHelper } = setup(Service.withRelationsOnly);
  render(component);

  await act(async () => {
    apiHelper.resolve(Either.right({ data: Service.withIdentity }));
  });
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: [ServiceInstance.a, ServiceInstance.b] })
    );
  });

  const relationInputField = screen.getByPlaceholderText(
    words("common.serviceInstance.relation")
  );
  await act(async () => {
    await userEvent.type(relationInputField, "a");
  });
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/lsm/v1/service_inventory/${InterServiceRelations.editable.entity_type}?include_deployment_progress=False&limit=100&filter.order_id=a`,
    environment: "env",
  });
  await act(async () => {
    await apiHelper.resolve(
      Either.right({ data: [ServiceInstance.a, ServiceInstance.b] })
    );
  });
  await act(async () => {
    await userEvent.type(relationInputField, "{selectall}{backspace}ab");
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

  const options = await screen.findAllByRole("option");
  console.log(options);
  await act(async () => {
    await userEvent.click(options[0]);
  });
  await act(async () => {
    await userEvent.click(relationInputField);
  });
  const options2 = await screen.findAllByRole("option");
  expect(options2[0]).toHaveClass("pf-m-disabled");
  await act(async () => {
    await userEvent.click(options2[1]);
    await userEvent.click(
      screen.getByRole("button", { name: words("confirm") })
    );
  });

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: `/lsm/v1/service_inventory/${Service.withRelationsOnly.name}`,
    body: {
      attributes: {
        test_entity: ["service_instance_id_a", "service_instance_id_b"],
      },
    },
    environment: "env",
  });
});
