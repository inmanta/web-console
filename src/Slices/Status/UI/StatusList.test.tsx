import React from "react";
import { render, screen, within } from "@testing-library/react";
import { ServerStatus } from "@/Core";
import { dependencies } from "@/Test";
import { DependencyProvider } from "@/UI";
import { StatusList } from "./StatusList";

const status: ServerStatus = {
  product: "Inmanta Service Orchestrator",
  edition: "Standard",
  version: "1.0.0",
  license: "Inmanta EULA",
  extensions: [
    {
      name: "core",
      version: "1.1.1",
      package: "core",
    },
  ],
  slices: [
    {
      name: "lsm.order",
      status: {},
    },
    {
      name: "core.transport",
      status: {
        inflight: 2,
        running: true,
        sockets: ["0.0.0.0:8888"],
      },
    },
    {
      name: "core.scheduler_manager",
      status: {
        resource_facts: 28,
        sessions: 7,
        database: "inmanta",
        host: "localhost",
        total: {
          connected: true,
          max_pool: 9,
          open_connections: 3,
          free_connections: 4,
          pool_exhaustion_count: 209,
        },
        prod: {
          connected: true,
          max_pool: 3,
          open_connections: 1,
          free_connections: 2,
          pool_exhaustion_count: 209,
        },
      },
    },
  ],
  features: [],
};

describe("Given StatusList", () => {
  it("WHEN receiving status object THEN should render correctly list", () => {
    render(
      <DependencyProvider dependencies={dependencies}>
        <StatusList status={status} apiUrl="test" />
      </DependencyProvider>
    );

    expect(screen.getByRole("list", { name: "StatusList" })).toBeVisible();

    const orchestratorItem = screen.getByRole("listitem", {
      name: "StatusItem-Inmanta Service Orchestrator",
    });

    expect(orchestratorItem).toBeVisible();
    expect(screen.getByText("Inmanta Service Orchestrator")).toBeVisible();

    expect(screen.getByText("edition")).toBeVisible();
    expect(screen.getByText("Standard")).toBeVisible();

    expect(within(orchestratorItem).getByText("version")).toBeVisible();
    expect(screen.getByText("1.0.0")).toBeVisible();

    expect(screen.getByText("license")).toBeVisible();
    expect(screen.getByText("Inmanta EULA")).toBeVisible();

    const coreItem = screen.getByRole("listitem", {
      name: "StatusItem-core",
    });

    expect(coreItem).toBeVisible();

    expect(within(coreItem).getByRole("heading", { name: "core" })).toBeVisible();
    expect(within(coreItem).getByText("extension")).toBeVisible();

    expect(within(coreItem).getByText("version")).toBeVisible();
    expect(within(coreItem).getByText("1.1.1")).toBeVisible();

    expect(within(coreItem).getByText("package")).toBeVisible();
    expect(within(coreItem).getAllByText("core")[1]).toBeVisible(); //the first core component is heading

    const lsmOrderItem = screen.getByRole("listitem", {
      name: "StatusItem-lsm.order",
    });

    expect(lsmOrderItem).toBeVisible();

    expect(within(lsmOrderItem).getByText("lsm.order")).toBeVisible();
    expect(within(lsmOrderItem).getByText("component")).toBeVisible();

    const coreTransportItem = screen.getByRole("listitem", {
      name: "StatusItem-core.transport",
    });

    expect(coreTransportItem).toBeVisible();

    within(coreTransportItem);
    expect(within(coreTransportItem).getByText("core.transport")).toBeVisible();
    expect(within(coreTransportItem).getByText("component")).toBeVisible();

    expect(within(coreTransportItem).getByText("inflight")).toBeVisible();
    expect(within(coreTransportItem).getByText("2")).toBeVisible();

    expect(within(coreTransportItem).getByText("running")).toBeVisible();
    expect(within(coreTransportItem).getByText("true")).toBeVisible();

    expect(within(coreTransportItem).getByText("sockets")).toBeVisible();
    expect(within(coreTransportItem).getByText("0.0.0.0:8888")).toBeVisible();

    const coreSchedulerManagerItem = screen.getByRole("listitem", {
      name: "StatusItem-core.scheduler_manager",
    });

    expect(coreSchedulerManagerItem).toBeVisible();

    expect(within(coreSchedulerManagerItem).getByText("core.scheduler_manager")).toBeVisible();
    expect(within(coreSchedulerManagerItem).getByText("component")).toBeVisible();

    expect(within(coreSchedulerManagerItem).getByText("resource_facts")).toBeVisible();
    expect(within(coreSchedulerManagerItem).getByText("28")).toBeVisible();

    expect(within(coreSchedulerManagerItem).getByText("sessions")).toBeVisible();
    expect(within(coreSchedulerManagerItem).getByText("7")).toBeVisible();

    expect(within(coreSchedulerManagerItem).getByText("database")).toBeVisible();
    expect(within(coreSchedulerManagerItem).getByText("inmanta")).toBeVisible();

    expect(within(coreSchedulerManagerItem).getByText("host")).toBeVisible();
    expect(within(coreSchedulerManagerItem).getByText("localhost")).toBeVisible();

    expect(within(coreSchedulerManagerItem).getByText("total")).toBeVisible();

    const totalNestedListItem = screen.getByLabelText("StatusNestedListItem-total");

    expect(totalNestedListItem).toBeVisible();
    expect(within(totalNestedListItem).getByText("total")).toBeVisible();

    expect(within(totalNestedListItem).getByText("connected")).toBeVisible();
    expect(within(totalNestedListItem).getByText("true")).toBeVisible();

    expect(within(totalNestedListItem).getByText("max_pool")).toBeVisible();
    expect(within(totalNestedListItem).getByText("9")).toBeVisible();

    expect(within(totalNestedListItem).getByText("open_connections")).toBeVisible();
    expect(within(totalNestedListItem).getByText("3")).toBeVisible();

    expect(within(totalNestedListItem).getByText("free_connections")).toBeVisible();
    expect(within(totalNestedListItem).getByText("4")).toBeVisible();

    expect(within(totalNestedListItem).getByText("pool_exhaustion_count")).toBeVisible();
    expect(within(totalNestedListItem).getByText("209")).toBeVisible();

    const prodNestedListItem = screen.getByLabelText("StatusNestedListItem-prod");

    expect(prodNestedListItem).toBeVisible();
    expect(within(prodNestedListItem).getByText("prod")).toBeVisible();

    expect(within(prodNestedListItem).getByText("connected")).toBeVisible();
    expect(within(prodNestedListItem).getByText("true")).toBeVisible();

    expect(within(prodNestedListItem).getByText("max_pool")).toBeVisible();
    expect(within(prodNestedListItem).getByText("3")).toBeVisible();

    expect(within(prodNestedListItem).getByText("open_connections")).toBeVisible();
    expect(within(prodNestedListItem).getByText("1")).toBeVisible();

    expect(within(prodNestedListItem).getByText("free_connections")).toBeVisible();
    expect(within(prodNestedListItem).getByText("2")).toBeVisible();

    expect(within(prodNestedListItem).getByText("pool_exhaustion_count")).toBeVisible();
    expect(within(prodNestedListItem).getByText("209")).toBeVisible();
  });
});
