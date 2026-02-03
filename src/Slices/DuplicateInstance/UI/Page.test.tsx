const mockUseParams = vi.hoisted(() => vi.fn());
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: mockUseParams,
  };
});

import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider, Service, ServiceInstance } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Page } from "./Page";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

// Mock usePost for the duplicate form
const mockPostFn = vi.hoisted(() => vi.fn());
vi.mock("@/Data/Queries/Slices/ServiceInstance/PostInstance", () => ({
  usePostInstance: () => ({ mutate: mockPostFn }),
}));

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <Page />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("DuplicateInstancePage", () => {
  const instance = "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3";
  const server = setupServer(
    http.get("/lsm/v1/service_catalog/service_name_a", () => {
      return HttpResponse.json({ data: Service.a });
    }),
    http.get("/lsm/v1/service_catalog/service_name_all_attrs", () => {
      return HttpResponse.json({ data: Service.ServiceWithAllAttrs });
    })
  );

  beforeEach(() => {
    mockPostFn.mockClear();
  });

  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => server.close());

  test("Duplicate Instance View shows failed state", async () => {
    mockUseParams.mockReturnValue({ service: "service_name_a", instance });

    server.use(
      http.get(
        "/lsm/v1/service_inventory/service_name_a/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
        () => {
          return HttpResponse.json({ message: "something went wrong" }, { status: 500 });
        }
      )
    );
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("region", { name: "DuplicateInstance-Failed" })
    ).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("DuplicateInstance View shows success form", async () => {
    mockUseParams.mockReturnValue({ service: "service_name_a", instance });

    server.use(
      http.get(
        "/lsm/v1/service_inventory/service_name_a/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
        () => {
          return HttpResponse.json({ data: ServiceInstance.a });
        }
      )
    );
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("region", { name: "DuplicateInstance-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("generic", { name: "DuplicateInstance-Success" })
    ).toBeInTheDocument();

    const bandwidthField = screen.getByText("bandwidth");

    expect(bandwidthField).toBeVisible();

    await userEvent.type(bandwidthField, "3");

    await userEvent.click(screen.getByText(words("confirm")));

    expect(mockPostFn).toHaveBeenCalledWith({
      fields: expect.any(Array),
      attributes: {
        bandwidth: "3",
        circuits: [
          {
            csp_endpoint: {
              attributes: { owner_account_id: "666023226898" },
              cloud_service_provider: "AWS",
              ipx_access: [1000010782, 1000013639],
              region: "us-east-1",
            },
            customer_endpoint: {
              encapsulation: "qinq",
              inner_vlan: 567,
              ipx_access: 1000312922,
              outer_vlan: 1234,
            },
            service_id: 9489784960,
          },
          {
            csp_endpoint: {
              attributes: { owner_account_id: "666023226898" },
              cloud_service_provider: "AWS",
              ipx_access: [1000010782, 1000013639],
              region: "us-east-1",
            },
            customer_endpoint: {
              encapsulation: "qinq",
              inner_vlan: 567,
              ipx_access: 1000312923,
              outer_vlan: 1234,
            },
            service_id: 5527919402,
          },
        ],
        customer_locations: "",
        iso_release: "",
        network: "local",
        order_id: 9764848531585,
      },
    });

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the DuplicateInstance View When changing a embedded entity Then the correct request is fired", async () => {
    mockUseParams.mockReturnValue({ service: "service_name_a", instance });

    server.use(
      http.get(
        "/lsm/v1/service_inventory/service_name_a/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
        () => {
          return HttpResponse.json({ data: ServiceInstance.a });
        }
      )
    );

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", { name: "DuplicateInstance-Success" })
    ).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    await userEvent.click(screen.getByRole("button", { name: "circuits" }));

    await userEvent.click(screen.getByRole("button", { name: "1" }));

    await userEvent.click(screen.getByRole("button", { name: "csp_endpoint" }));

    const bandwidthField = screen.getByText("bandwidth");

    expect(bandwidthField).toBeVisible();

    const firstCloudServiceProviderField = screen.getAllByText("cloud_service_provider")[0];

    await userEvent.type(firstCloudServiceProviderField, "2");

    await userEvent.type(bandwidthField, "22");

    await userEvent.click(screen.getByText(words("confirm")));
    expect(mockPostFn).toHaveBeenCalledWith({
      fields: expect.any(Array),
      attributes: {
        bandwidth: "22",
        circuits: [
          {
            csp_endpoint: {
              attributes: { owner_account_id: "666023226898" },
              cloud_service_provider: "AWS",
              ipx_access: [1000010782, 1000013639],
              region: "us-east-1",
            },
            customer_endpoint: {
              encapsulation: "qinq",
              inner_vlan: 567,
              ipx_access: 1000312922,
              outer_vlan: 1234,
            },
            service_id: 9489784960,
          },
          {
            csp_endpoint: {
              attributes: { owner_account_id: "666023226898" },
              cloud_service_provider: "AWS2",
              ipx_access: [1000010782, 1000013639],
              region: "us-east-1",
            },
            customer_endpoint: {
              encapsulation: "qinq",
              inner_vlan: 567,
              ipx_access: 1000312923,
              outer_vlan: 1234,
            },
            service_id: 5527919402,
          },
        ],
        customer_locations: "",
        iso_release: "",
        network: "local",
        order_id: 9764848531585,
      },
    });
  });

  test("GIVEN DuplicateInstance page WHEN user submits form THEN instance is duplicated", async () => {
    mockUseParams.mockReturnValue({ service: "service_name_a", instance });

    server.use(
      http.get(
        "/lsm/v1/service_inventory/service_name_a/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
        () => {
          return HttpResponse.json({ data: ServiceInstance.a });
        }
      )
    );

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", { name: "DuplicateInstance-Success" })
    ).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    await userEvent.click(screen.getByText(words("confirm")));

    expect(mockPostFn).toHaveBeenCalledWith({
      fields: expect.any(Array),
      attributes: {
        bandwidth: "",
        circuits: [
          {
            csp_endpoint: {
              attributes: { owner_account_id: "666023226898" },
              cloud_service_provider: "AWS",
              ipx_access: [1000010782, 1000013639],
              region: "us-east-1",
            },
            customer_endpoint: {
              encapsulation: "qinq",
              inner_vlan: 567,
              ipx_access: 1000312922,
              outer_vlan: 1234,
            },
            service_id: 9489784960,
          },
          {
            csp_endpoint: {
              attributes: { owner_account_id: "666023226898" },
              cloud_service_provider: "AWS",
              ipx_access: [1000010782, 1000013639],
              region: "us-east-1",
            },
            customer_endpoint: {
              encapsulation: "qinq",
              inner_vlan: 567,
              ipx_access: 1000312923,
              outer_vlan: 1234,
            },
            service_id: 5527919402,
          },
        ],
        customer_locations: "",
        iso_release: "",
        network: "local",
        order_id: 9764848531585,
      },
    });
  });
});
