import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  UseInfiniteQueryResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import {
  EnvironmentDetails,
  EnvironmentModifier,
  RemoteData,
  ServiceModel,
  VersionedServiceInstanceIdentifier,
} from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import { getStoreInstance } from "@/Data";
import * as queryModule from "@/Data/Managers/V2/helpers/useQueries";
import { InstanceDetailsContext } from "@/Slices/ServiceInstanceDetails/Core/Context";

import {
  dependencies,
  MockEnvironmentHandler,
  MockEnvironmentModifier,
  Service,
  ServiceInstance,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { EnvironmentModifierImpl } from "@/UI/Dependency/EnvironmentModifier";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ConfigSectionContent } from "./ConfigSectionContent";

function setup(environmentModifier: EnvironmentModifier = new MockEnvironmentModifier()) {
  const client = new QueryClient();
  const store = getStoreInstance();

  const instanceIdentifier: VersionedServiceInstanceIdentifier = {
    id: ServiceInstance.a.id,
    service_entity: Service.a.name,
    version: ServiceInstance.a.version,
  };

  const component = (
    <QueryClientProvider client={client}>
      <TestMemoryRouter initialEntries={["/?env=aaa"]}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            environmentModifier,
            environmentHandler: MockEnvironmentHandler(Service.a.environment),
          }}
        >
          <StoreProvider store={store}>
            <InstanceDetailsContext.Provider
              value={{
                instance: ServiceInstance.a,
                logsQuery: {} as unknown as UseInfiniteQueryResult<InstanceLog[], Error>,
                serviceModelQuery: {
                  data: Service.a,
                  isLoading: false,
                  isError: false,
                  isSuccess: true,
                } as UseQueryResult<ServiceModel, Error>,
              }}
            >
              <ConfigSectionContent serviceInstanceIdentifier={instanceIdentifier} />
            </InstanceDetailsContext.Provider>
          </StoreProvider>
        </DependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
    store,
  };
}
let data = {
  auto_creating: false,
  auto_designed: false,
  auto_update_designed: false,
  auto_update_inprogress: false,
};

describe("ConfigSectionContent", () => {
  const server = setupServer(
    http.get("/lsm/v1/service_inventory/service_name_a/service_instance_id_a/config", () => {
      return HttpResponse.json({
        data,
      });
    })
  );

  beforeAll(() => {
    server.listen();
  });
  afterAll(() => {
    server.close();
  });

  test("ConfigTab can reset all settings", async () => {
    const mockFn = jest.fn().mockImplementation((_url, body) => {
      data = {
        ...data,
        ...body.values,
      };
    });

    jest.spyOn(queryModule, "usePost").mockReturnValue(mockFn);
    const { component } = setup();

    render(component);

    const resetButton = await screen.findByRole("button", {
      name: words("config.reset"),
    });

    expect(resetButton).toBeVisible();

    expect(screen.getByRole("switch", { name: "auto_creating-False" })).toBeVisible();

    await userEvent.click(resetButton, { skipHover: true });

    expect(mockFn).toHaveBeenCalledWith(
      "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/config",
      {
        current_version: 3,
        values: {
          auto_creating: true,
          auto_designed: true,
          auto_update_designed: true,
          auto_update_inprogress: true,
        },
      }
    );
    expect(await screen.findByRole("switch", { name: "auto_creating-True" })).toBeVisible();
  });

  test("ConfigTab can change 1 toggle", async () => {
    data = {
      auto_creating: false,
      auto_designed: true,
      auto_update_designed: false,
      auto_update_inprogress: false,
    };
    const mockFn = jest.fn().mockImplementation((_url, body) => {
      data = {
        ...data,
        ...body.values,
      };
    });

    jest.spyOn(queryModule, "usePost").mockReturnValue(mockFn);
    const { component } = setup();

    render(component);

    const toggle = await screen.findByRole("switch", {
      name: "auto_designed-True",
    });

    expect(toggle).toBeVisible();

    await userEvent.click(toggle, { skipHover: true });

    expect(mockFn).toHaveBeenCalledWith(
      "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/config",
      {
        current_version: 3,
        values: {
          auto_designed: false,
        },
      }
    );
  });

  test("ConfigTab handles hooks with environment modifier correctly", async () => {
    const environmentModifier = EnvironmentModifierImpl();

    environmentModifier.setEnvironment(Service.a.environment);
    const { component, store } = setup(environmentModifier);

    store.dispatch.environment.setEnvironmentDetailsById({
      id: Service.a.environment,
      value: RemoteData.success({ halted: true } as EnvironmentDetails),
    });
    render(component);

    const toggle = await screen.findByRole("switch", {
      name: "auto_designed-False",
    });

    expect(toggle).toBeVisible();
    expect(toggle).toBeDisabled();
  });
});
