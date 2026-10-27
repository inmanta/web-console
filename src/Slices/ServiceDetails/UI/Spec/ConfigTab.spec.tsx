import { Route, Routes } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { Page } from "@S/ServiceDetails/UI/Page";
import { TestMemoryRouter } from "@inmanta/web-console-core/Routing/TestMemoryRouter";
import { MockedDependencyProvider, Service } from "@inmanta/web-console-test-utils";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={[`/lsm/catalog/${Service.a.name}/details`]}>
        <MockedDependencyProvider>
          <Routes>
            <Route path="/lsm/catalog/:service/details" element={<Page />} />
          </Routes>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
  };
}
describe("ServiceCatalog", () => {
  const server = setupServer();

  beforeAll(() => {
    server.use(
      http.get("/lsm/v1/service_catalog/service_name_a", () => {
        return HttpResponse.json({ data: Service.a });
      }),
      http.get("/lsm/v1/service_catalog/service_name_a/config", () => {
        return HttpResponse.json({ data: { test: Service.a.config } });
      })
    );
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  test("GIVEN ServiceCatalog WHEN click on config tab THEN shows config tab", async () => {
    const { component } = setup();

    render(component);

    const configButton = await screen.findByRole("tab", { name: "Config" });

    await userEvent.click(configButton);

    expect(screen.getByTestId("ServiceConfig")).toBeVisible();
  });

  test("GIVEN ServiceCatalog WHEN config tab is active THEN shows SettingsList", async () => {
    const { component } = setup();

    render(component);
    const configButton = await screen.findByRole("tab", { name: "Config" });

    await userEvent.click(configButton);

    expect(await screen.findByRole("generic", { name: "SettingsList" })).toBeVisible();
  });
});
