import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { ServiceModel } from "@inmanta/web-console-core";
import { composerFeature } from "@inmanta/web-console-feature-composer";
import { lsmFeature } from "@inmanta/web-console-feature-lsm";
import { defaultServer } from "@inmanta/web-console-feature-lsm/Slices/ServiceInstanceDetails/Test/mockServer";
import { setupServiceInstanceDetails } from "@inmanta/web-console-feature-lsm/Slices/ServiceInstanceDetails/Test/mockSetup";
import { ServiceInventory } from "@inmanta/web-console-feature-lsm/Slices/ServiceInventory/UI/ServiceInventory";
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
 * The composer adds its actions to the pages of lsm. Neither feature imports the other, so these
 * app-level tests check that they work together.
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

describe("Instance details with the composer", () => {
  const server = defaultServer;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN the instance details page WHEN opening its actions THEN the composer's action is one of them", async () => {
    render(setupServiceInstanceDetails(false, [lsmFeature, composerFeature]));

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Actions-Toggle" }));

    expect(screen.getAllByRole("menuitem")).toHaveLength(6);
    expect(screen.getByRole("menuitem", { name: "Edit in Composer" })).toBeEnabled();
  });
});
