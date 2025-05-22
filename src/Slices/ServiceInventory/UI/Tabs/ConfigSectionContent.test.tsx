import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  UseInfiniteQueryResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { ServiceModel, VersionedServiceInstanceIdentifier } from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import * as queryModule from "@/Data/Queries/Helpers";
import { InstanceDetailsContext } from "@/Slices/ServiceInstanceDetails/Core/Context";
import { Service, ServiceInstance, MockedDependencyProvider } from "@/Test";
import { words } from "@/UI";
import * as envModifier from "@/UI/Dependency/EnvironmentModifier";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ConfigSectionContent } from "./ConfigSectionContent";

function setup() {
  const client = new QueryClient();

  const instanceIdentifier: VersionedServiceInstanceIdentifier = {
    id: ServiceInstance.a.id,
    service_entity: Service.a.name,
    version: ServiceInstance.a.version,
  };

  const component = (
    <QueryClientProvider client={client}>
      <TestMemoryRouter initialEntries={["/?env=aaa"]}>
        <MockedDependencyProvider>
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
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
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
    jest.spyOn(envModifier, "useEnvironmentModifierImpl").mockReturnValue({
      ...jest.requireActual("@/UI/Dependency/EnvironmentModifier"),
      useIsHalted: () => true,
    });

    const { component } = setup();

    render(component);

    const toggle = await screen.findByRole("switch", {
      name: "auto_designed-False",
    });

    expect(toggle).toBeVisible();
    expect(toggle).toBeDisabled();
  });
});
