import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider, ServiceInstance } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { InstanceCellButton } from "./InstanceCellButton";

function setup(serviceName: string, id: string) {
  const handleClick = vi.fn();
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <InstanceCellButton id={id} serviceName={serviceName} onClick={handleClick} />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("InstanceCellButton", () => {
  const server = setupServer(
    http.get("/lsm/v1/service_inventory/service_name_a/service_instance_id_a", () => {
      return HttpResponse.json({ data: ServiceInstance.a });
    }),
    http.get("/lsm/v1/service_inventory/service_name_a/service_instance_id_b", () => {
      return HttpResponse.json({
        data: {
          ...ServiceInstance.b,
          service_identity_attribute_value: undefined,
        },
      });
    }),
    http.get("/lsm/v1/service_inventory/service_name_a/service_instance_id_c", () => {
      return HttpResponse.json(
        {
          message: "something happened",
        },
        {
          status: 500,
        }
      );
    })
  );

  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  test("Given the InstanceCellButton When an instance has an identity Then it is shown instead of the id", async () => {
    const { component } = setup("service_name_a", "service_instance_id_a");

    render(component);

    expect(
      await screen.findByText(ServiceInstance.a.service_identity_attribute_value as string)
    ).toBeVisible();
  });

  test("Given the InstanceCellButton When an instance doesn't have an identity Then the id is shown", async () => {
    const { component } = setup("service_name_a", "service_instance_id_b");

    render(component);

    expect(await screen.findByText("service_instance_id_b")).toBeVisible();
  });

  test("Given the InstanceCellButton When the instance request fails Then the id is shown", async () => {
    const { component } = setup("service_name_a", "service_instance_id_c");

    render(component);

    expect(await screen.findByText("service_instance_id_c")).toBeVisible();
  });
});
