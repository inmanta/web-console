import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { DeferredFetcher, Service, StaticScheduler } from "@/Test";
import { Either, InstanceEvent } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  DataProviderImpl,
  EventsDataManager,
  EventsStateHelper,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { Metadata } from "@/Core/Domain/Pagination";
import { EventsPage } from "./EventsPage";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredFetcher<"Events">();
  const instance = {
    id: "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
    service_entity: "vlan-assignment",
    version: 4,
    environment: "34a961ba-db3c-486e-8d85-1438d8e88909",
  };
  const dataProvider = new DataProviderImpl([
    new EventsDataManager(
      apiHelper,
      new EventsStateHelper(store),
      scheduler,
      instance.environment
    ),
  ]);

  const component = (
    <DependencyProvider dependencies={{ dataProvider }}>
      <StoreProvider store={store}>
        <EventsPage
          service={Service.A}
          instanceId={"4a4a6d14-8cd0-4a16-bc38-4b768eb004e3"}
        />
      </StoreProvider>
    </DependencyProvider>
  );

  return { component, apiHelper, scheduler };
}

test("EventsView shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("grid", { name: "EventTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({ data: [], links: { self: "" }, metadata: {} as Metadata })
  );

  expect(
    await screen.findByRole("grid", { name: "EventTable-Empty" })
  ).toBeInTheDocument();
});

test("EventsView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("grid", { name: "EventTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("grid", { name: "EventTable-Failed" })
  ).toBeInTheDocument();
});

test("EventsView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("grid", { name: "EventTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [
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
      ],
      links: { self: "" },
      metadata: {} as Metadata,
    })
  );

  expect(
    await screen.findByRole("grid", { name: "EventTable-Success" })
  ).toBeInTheDocument();
});

test("EventsView shows updated table", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  expect(
    await screen.findByRole("grid", { name: "EventTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({ data: [], links: { self: "" }, metadata: {} as Metadata })
  );

  expect(
    await screen.findByRole("grid", { name: "EventTable-Empty" })
  ).toBeInTheDocument();

  scheduler.executeAll();

  apiHelper.resolve(
    Either.right({
      data: [
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
      ],
      links: { self: "" },
      metadata: {} as Metadata,
    })
  );

  expect(
    await screen.findByRole("grid", { name: "EventTable-Success" })
  ).toBeInTheDocument();
});
