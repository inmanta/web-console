import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { composerFeature } from "@/Features/Composer";
import { lsmFeature } from "@/Features/Lsm";
import { ServiceInventory } from "@S/ServiceInventory/UI/ServiceInventory";
import { ServiceModel } from "@inmanta/web-console-core";
import {
  MockedDependencyProvider,
  ModalProvider,
  Pagination,
  Service,
  ServiceInstance,
} from "@inmanta/web-console-test-utils";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";

/**
 * The composer adds its actions to the service inventory of lsm. Neither feature imports the
 * other, so this app-level test checks that they work together.
 */
function setup(service: ServiceModel = Service.a) {
  return (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={["/?env=aaa"]}>
        <MockedDependencyProvider features={[lsmFeature, composerFeature]}>
          <ModalProvider>
            <Page>
              <ServiceInventory serviceName={service.name} service={service} />
            </Page>
          </ModalProvider>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
}

describe("ServiceInventory with the composer", () => {
  const server = setupServer(
    http.get("/lsm/v1/service_inventory/service_name_a", () => {
      return HttpResponse.json({
        data: [{ ...ServiceInstance.a, id: "a" }],
        links: Pagination.links,
        metadata: Pagination.metadata,
      });
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    testClient.clear();
  });
  afterAll(() => server.close());

  test("ServiceInventory shows enabled composer buttons for root instances ", async () => {
    render(setup(Service.a));

    await userEvent.click(await screen.findByRole("button", { name: "AddInstanceToggle" }));

    expect(await screen.findByText("Add in Composer")).toBeEnabled();

    const menuToggle = await screen.findByRole("button", {
      name: "row actions toggle",
    });

    await userEvent.click(menuToggle);

    expect(await screen.findByText("Edit in Composer")).toBeEnabled();

    expect(screen.queryByText("Show in Composer")).toBeEnabled();
  });

  test("ServiceInventory shows only button to display instance in the composer for non-root", async () => {
    render(setup({ ...Service.a, owner: "owner" }));

    await userEvent.click(await screen.findByRole("button", { name: "AddInstanceToggle" }));

    expect(screen.getByText("Add in Composer")).toBeInTheDocument();

    const menuToggle = await screen.findByRole("button", {
      name: "row actions toggle",
    });

    await userEvent.click(menuToggle);

    expect(await screen.findByText("Show in Composer")).toBeEnabled();

    expect(screen.getByText("Edit in Composer")).toBeInTheDocument();
  });
});
