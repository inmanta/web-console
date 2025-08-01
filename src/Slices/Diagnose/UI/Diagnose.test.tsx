import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { configureAxe } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider, Service } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { failureAndRejection } from "@S/Diagnose/Data/Mock";
import { Diagnose } from "./Diagnose";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <Diagnose
            serviceName={Service.a.name}
            lookBehind="1"
            instanceId={"4a4a6d14-8cd0-4a16-bc38-4b768eb004e3"}
            instanceIdentity={"4a4a6d14-8cd0-4a16-bc38-4b768eb004e3"}
          />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

const server = setupServer(
  http.get(
    "/lsm/v1/service_inventory/service_name_a/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3/diagnose",
    () => {
      return HttpResponse.json({
        data: {
          failures: [],
          rejections: [],
        },
      });
    }
  )
);

describe("Diagnose", () => {
  // Establish API mocking before all tests.
  beforeAll(() => server.listen());
  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  afterEach(() => server.resetHandlers());
  // Clean up after the tests are finished.
  afterAll(() => server.close());

  test("Diagnose View shows empty table", async () => {
    const { component } = setup();

    render(component);

    expect(screen.getByRole("region", { name: "Diagnostics-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("generic", { name: "Diagnostics-Empty" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Diagnose View shows failed table", async () => {
    server.use(
      http.get(
        "/lsm/v1/service_inventory/service_name_a/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3/diagnose",
        () => {
          return HttpResponse.json(
            {
              message: "Something went wrong",
            },
            {
              status: 400,
            }
          );
        }
      )
    );

    const { component } = setup();

    render(component);

    expect(await screen.findByRole("region", { name: "Diagnostics-Error" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Diagnose View shows success table", async () => {
    server.use(
      http.get(
        "/lsm/v1/service_inventory/service_name_a/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3/diagnose",
        () => {
          return HttpResponse.json({ data: failureAndRejection });
        }
      )
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("generic", { name: "Diagnostics-Success" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
