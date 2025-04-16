import React, { act } from "react";
import { MemoryRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { InstanceEvent } from "@/Core";
import { getStoreInstance } from "@/Data";
import { dependencies, Service } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { DependencyProvider } from "@/UI/Dependency";
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
      <MemoryRouter>
        <DependencyProvider dependencies={dependencies}>
          <StoreProvider store={store}>
            <Events service={Service.a} instanceId={"4a4a6d14-8cd0-4a16-bc38-4b768eb004e3"} />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
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
      http.get("", () => {
        return HttpResponse.json({
          data: [],
          links: { self: "" },
          metadata: { before: 0, after: 0, page_size: 20, total: 0 },
        });
      })
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
      http.get("", () => {
        return HttpResponse.json(
          {
            message: "something went wrong",
          },
          { status: 500 }
        );
      })
    );

    const { component } = setup();

    render(component);

    expect(await screen.findByRole("region", { name: "EventTable-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("region", { name: "EventTable-Failed" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("EventsView shows success table", async () => {
    server.use(
      http.get("", () => {
        return HttpResponse.json({
          data,
          links: { self: "" },
          metadata: { before: 0, after: 0, page_size: 20, total: 2 },
        });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("region", { name: "EventTable-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("grid", { name: "EventTable-Success" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("EventsView shows updated table", async () => {
    let counter = 0;
    server.use(
      http.get("", () => {
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
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("region", { name: "EventTable-Loading" })).toBeInTheDocument();

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
          id: "049dd20f-c432-4b93-bf1c-32c572e49cc7",
          service_instance_id: "bd200aec-4f80-45e1-b2ad-137c442c68b8",
          service_instance_version: 4,
          timestamp: "2021-01-11T12:56:56.205131",
          source: "up",
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
      http.get("", ({ request }) => {
        if (request.url.includes("&end=fake-first-param")) {
          return HttpResponse.json({
            data,
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
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findAllByLabelText("Event table row")).toHaveLength(2);

    const nextPageButton = screen.getByLabelText("Go to next page");
    await userEvent.click(nextPageButton);

    expect(await screen.findAllByLabelText("Event table row")).toHaveLength(1);

    //sort on the second page
    await userEvent.click(screen.getByText("Date"));

    expect(await screen.findAllByLabelText("Event table row")).toHaveLength(2);
  });
});
