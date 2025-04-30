import React, { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { InstanceEvent } from "@/Core";
import { getStoreInstance } from "@/Data";
import { MockedDependencyProvider, Service } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Events } from "./Events";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const store = getStoreInstance();

  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <StoreProvider store={store}>
            <Events service={Service.a} instanceId={"4a4a6d14-8cd0-4a16-bc38-4b768eb004e3"} />
          </StoreProvider>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("Events Page", () => {
  const data = [
    {
      id: "049dd20f-c432-4b93-bf1c-32c572e49cc7",
      service_instance_id: "bd200aec-4f80-45e1-b2ad-137c442c68b8",
      service_instance_version: 3,
      timestamp: "2021-01-11T12:56:56.205131",
      source: "creating",
      destination: "awaiting_up",
      message:
        "Service instance bd200aec-4f80-45e1-b2ad-137c442c68b8 successfully executed transfer creating -> awaiting_up (error=False)",
      ignored_transition: false,
      event_correlation_id: "363cc930-d847-4e8a-b605-41b87a903248",
      severity: 20,
      id_compile_report: null,
      event_type: "RESOURCE_TRANSITION",
      is_error_transition: false,
    } as InstanceEvent,
  ];
  const server = setupServer();

  beforeAll(() => {
    server.listen();
  });
  beforeEach(() => {
    server.resetHandlers();
  });
  afterAll(() => {
    server.close();
  });

  test("EventsView shows empty table", async () => {
    server.use(
      http.get(
        "/lsm/v1/service_inventory/service_name_a/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3/events",
        () => {
          return HttpResponse.json({
            data: [],
            links: { self: "" },
            metadata: { before: 0, after: 0, page_size: 20, total: 0 },
          });
        }
      )
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("region", { name: "EventTable-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("generic", { name: "EventTable-Empty" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("EventsView shows failed table", async () => {
    server.use(
      http.get(
        "/lsm/v1/service_inventory/service_name_a/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3/events",
        () => {
          return HttpResponse.json(
            {
              message: "something went wrong",
            },
            { status: 500 }
          );
        }
      )
    );

    const { component } = setup();

    render(component);

    expect(await screen.findByRole("region", { name: "EventTable-Error" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("EventsView shows success table", async () => {
    server.use(
      http.get(
        "/lsm/v1/service_inventory/service_name_a/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3/events",
        () => {
          return HttpResponse.json({
            data,
            links: { self: "" },
            metadata: { before: 0, after: 0, page_size: 20, total: 2 },
          });
        }
      )
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("grid", { name: "EventTable-Success" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("EventsView shows updated table", async () => {
    let counter = 0;
    server.use(
      http.get(
        "/lsm/v1/service_inventory/service_name_a/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3/events",
        () => {
          if (counter > 0) {
            return HttpResponse.json({
              data,
              links: { self: "" },
              metadata: { before: 0, after: 0, page_size: 20, total: 2 },
            });
          }
          counter++;
          return HttpResponse.json({
            data: [],
            links: { self: "" },
            metadata: { before: 0, after: 0, page_size: 20, total: 0 },
          });
        }
      )
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("generic", { name: "EventTable-Empty" })).toBeInTheDocument();

    await act(async () => {
      await delay(5000);
    });

    expect(await screen.findByRole("grid", { name: "EventTable-Success" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN EventsView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
    const response = {
      data: [
        {
          id: "049dd20f-c432-4b93-bf1c-32c572e35cc7",
          service_instance_id: "bd200aec-4f80-45e1-b2ad-137c442c68b8",
          service_instance_version: 3,
          timestamp: "2021-01-11T12:56:56.205131",
          source: "creating",
          destination: "awaiting_up",
          message:
            "Service instance bd200aec-4f80-45e1-b2ad-137c442c68b8 successfully executed transfer creating -> awaiting_up (error=False)",
          ignored_transition: false,
          event_correlation_id: "363cc930-d847-4e8a-b605-41b87a903248",
          severity: 20,
          id_compile_report: null,
          event_type: "RESOURCE_TRANSITION",
          is_error_transition: false,
        } as InstanceEvent,
      ],
      links: {
        self: "",
        next: "/fake-link?end=fake-first-param",
      },
      metadata: {
        total: 103,
        before: 0,
        after: 83,
        page_size: 100,
      },
    };
    server.use(
      http.get(
        "/lsm/v1/service_inventory/service_name_a/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3/events",
        ({ request }) => {
          if (request.url.includes("&end=fake-first-param")) {
            return HttpResponse.json({
              data: [
                {
                  id: "6342b9aa-f077-4527-9aab-60dbdbc271a1",
                  service_instance_id: "2b716f3d-aaff-4f27-a0db-226fa3054408",
                  service_instance_version: 6,
                  service_desired_state_version: 6,
                  timestamp: "2025-04-16T11:09:26.499222+00:00",
                  source: "up",
                  destination: "up",
                  message:
                    "Resource-based transition requested for service instance 2b716f3d-aaff-4f27-a0db-226fa3054408 in environment test (cd9db453-35db-40b6-af3b-e3eb9f247f25).  No transition because source up equals up",
                  ignored_transition: true,
                  event_correlation_id: "1d3b37ac-c850-4515-8a0c-c8ab50eacb74",
                  severity: 20,
                  severity_text: "INFO",
                  id_compile_report: null,
                  event_type: "RESOURCE_TRANSITION",
                  is_error_transition: false,
                },
                {
                  id: "1e6c0f68-e808-44ff-938d-0d9197faf3b0",
                  service_instance_id: "2b716f3d-aaff-4f27-a0db-226fa3054408",
                  service_instance_version: 4,
                  service_desired_state_version: 4,
                  timestamp: "2025-04-16T11:08:57.254939+00:00",
                  source: "update_start",
                  destination: "update_inprogress",
                  message: "compile request queued with id 808c1ca9-fed4-46a8-bfa5-a7d71361975a",
                  ignored_transition: false,
                  event_correlation_id: "95e1ff14-b091-4dfd-831f-95351680e9fc",
                  severity: 20,
                  severity_text: "INFO",
                  id_compile_report: "808c1ca9-fed4-46a8-bfa5-a7d71361975a",
                  event_type: "AUTO_TRANSITION",
                  is_error_transition: false,
                },
              ],
              links: {
                self: "",
                next: "",
              },
              metadata: {
                total: 103,
                before: 0,
                after: 83,
                page_size: 100,
              },
            });
          }
          return HttpResponse.json(response);
        }
      )
    );
    const { component } = setup();

    render(component);

    expect(await screen.findAllByLabelText("Event table row")).toHaveLength(1);

    const nextPageButton = screen.getByLabelText("Go to next page");
    await userEvent.click(nextPageButton);

    expect(await screen.findAllByLabelText("Event table row")).toHaveLength(2);

    //sort on the second page
    await userEvent.click(screen.getByText("Date"));

    expect(await screen.findAllByLabelText("Event table row")).toHaveLength(1);
  });
});
