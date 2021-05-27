import { render, screen, act } from "@testing-library/react";
import { ServiceInstance, Pagination, Resources, flushPromises } from "@/Test";
import { Either, Maybe } from "@/Core";
import userEvent from "@testing-library/user-event";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";

jest.useFakeTimers();

test("GIVEN The Service Inventory WHEN the user clicks on the resourcesTab THEN data is fetched immediately", async () => {
  const { component, scheduler, serviceInstancesFetcher, resourcesFetcher } =
    new ServiceInventoryPrepper().prep();

  render(component);

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.a, ServiceInstance.b],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  userEvent.click(screen.getAllByRole("button", { name: "Details" })[0]);
  userEvent.click(screen.getAllByRole("button", { name: "Resources" })[0]);

  expect(resourcesFetcher.getInvocations().length).toEqual(1);
  expect(resourcesFetcher.getInvocations()[0][1]).toEqual(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/resources?current_version=3"
  );

  await act(async () => {
    await resourcesFetcher.resolve(Either.right({ data: Resources.A }));
  });

  const tasks = scheduler.getTasks();
  const serviceInstancesTask = Maybe.orNull(
    tasks.get(ServiceInstance.a.service_entity)
  );
  const resourcesTask = Maybe.orNull(tasks.get(ServiceInstance.a.id));

  expect(serviceInstancesTask?.effect).not.toBeCalled();
  expect(resourcesTask?.effect).not.toBeCalled();
});

test("GIVEN The Service Inventory WHEN the user clicks on the resourcesTab THEN the Resources auto-update happens in sync with the ServiceInstances", async () => {
  const prepper = new ServiceInventoryPrepper();
  const { component, scheduler, serviceInstancesFetcher, resourcesFetcher } =
    prepper.prep();

  render(component);

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.a, ServiceInstance.b],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  userEvent.click(screen.getAllByRole("button", { name: "Details" })[0]);
  userEvent.click(screen.getAllByRole("button", { name: "Resources" })[0]);

  await act(async () => {
    await resourcesFetcher.resolve(Either.right({ data: Resources.A }));
  });

  const tasks = scheduler.getTasks();
  const serviceInstancesTask = Maybe.orNull(
    tasks.get(ServiceInstance.a.service_entity)
  );
  const resourcesTask = Maybe.orNull(tasks.get(ServiceInstance.a.id));

  jest.advanceTimersByTime(5000);
  await flushPromises();

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.a, ServiceInstance.b],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });
  await act(async () => {
    await resourcesFetcher.resolve(Either.right({ data: Resources.A }));
  });

  expect(serviceInstancesTask?.effect).toBeCalledTimes(1);
  expect(serviceInstancesTask?.update).toBeCalledTimes(1);
  expect(resourcesTask?.effect).toBeCalledTimes(1);
  expect(resourcesTask?.update).toBeCalledTimes(1);
});
