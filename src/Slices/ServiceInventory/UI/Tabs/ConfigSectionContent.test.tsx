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
import { InstanceDetailsContext } from "@/Slices/ServiceInstanceDetails/Core/Context";
import { Service, ServiceInstance, MockedDependencyProvider, EnvironmentDetails } from "@/Test";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ConfigSectionContent } from "./ConfigSectionContent";

// Mock useGet from @/Data/Queries
const mockMutate = vi.fn();

// Create mutable data that can be updated by mutations
let mockConfigData = {
  auto_creating: false,
  auto_designed: false,
  auto_update_designed: false,
  auto_update_inprogress: false,
};

// Add a subscription mechanism to simulate refetch
let refetchSubscribers: (() => void)[] = [];
function subscribeRefetch(cb: () => void) {
  refetchSubscribers.push(cb);
}
function triggerRefetch() {
  refetchSubscribers.forEach((cb) => cb());
}

vi.mock("@/Data/Queries", () => ({
  useGet: () => async (path: string) => {
    const response = await fetch(path);
    return response.json();
  },
  useGetInstanceConfig: () => ({
    useOneTime: () => {
      const [_, setRerender] = require("react").useState({});
      // Subscribe to refetch so we can force rerender
      require("react").useEffect(() => {
        const cb = () => setRerender({});
        subscribeRefetch(cb);
        return () => {
          // Remove on unmount
          refetchSubscribers = refetchSubscribers.filter((f) => f !== cb);
        };
      }, []);
      return {
        data: mockConfigData,
        isSuccess: true,
        isError: false,
        error: null,
        refetch: triggerRefetch,
      };
    },
  }),
  usePostInstanceConfig: () => ({
    mutate: (params: any) => {
      mockMutate(params);
      if (params.values) {
        mockConfigData = { ...mockConfigData, ...params.values };
        triggerRefetch();
      }
    },
  }),
}));

function setup(halted: boolean = false) {
  const client = new QueryClient();

  const instanceIdentifier: VersionedServiceInstanceIdentifier = {
    id: ServiceInstance.a.id,
    service_entity: Service.a.name,
    version: ServiceInstance.a.version,
  };

  const component = (
    <QueryClientProvider client={client}>
      <TestMemoryRouter initialEntries={["/?env=aaa"]}>
        <MockedDependencyProvider env={{ ...EnvironmentDetails.env, halted }}>
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

describe("ConfigSectionContent", () => {
  const server = setupServer(
    http.get("/lsm/v1/service_inventory/service_name_a/service_instance_id_a/config", () => {
      return HttpResponse.json({
        data: mockConfigData,
      });
    })
  );

  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    // Reset mock data to initial state
    mockConfigData = {
      auto_creating: false,
      auto_designed: false,
      auto_update_designed: false,
      auto_update_inprogress: false,
    };
    // Clear mock function calls
    mockMutate.mockClear();
  });

  afterAll(() => {
    server.close();
  });

  test("ConfigTab can reset all settings", async () => {
    const { component } = setup();

    render(component);

    const resetButton = await screen.findByRole("button", {
      name: words("config.reset"),
    });

    expect(resetButton).toBeVisible();

    expect(screen.getByRole("switch", { name: "auto_creating-False" })).toBeVisible();

    await userEvent.click(resetButton, { skipHover: true });

    expect(mockMutate).toHaveBeenCalledWith({
      current_version: 3,
      values: {
        auto_creating: true,
        auto_designed: true,
        auto_update_designed: true,
        auto_update_inprogress: true,
      },
    });
    expect(await screen.findByRole("switch", { name: "auto_creating-True" })).toBeVisible();
  });

  test("ConfigTab can change 1 toggle", async () => {
    mockConfigData = {
      auto_creating: false,
      auto_designed: true,
      auto_update_designed: false,
      auto_update_inprogress: false,
    };
    const { component } = setup();

    render(component);

    const toggle = await screen.findByRole("switch", {
      name: "auto_designed-True",
    });

    expect(toggle).toBeVisible();

    await userEvent.click(toggle, { skipHover: true });

    expect(mockMutate).toHaveBeenCalledWith({
      current_version: 3,
      values: {
        auto_designed: false,
      },
    });
  });

  test("ConfigTab handles hooks with environment modifier correctly", async () => {
    const { component } = setup(true);

    render(component);

    const toggle = await screen.findByRole("switch", {
      name: "auto_designed-False",
    });

    expect(toggle).toBeVisible();
    expect(toggle).toBeDisabled();
  });
});
