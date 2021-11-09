import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Either, Maybe } from "@/Core";
import { ServiceInstance, Pagination, InstanceResource } from "@/Test";
import { ServiceInventoryPrepper } from "./ServiceInventoryPrepper";

jest.useFakeTimers("modern");

test("GIVEN The Service Inventory WHEN the user clicks on the resourcesTab THEN data is fetched immediately", async () => {
  const { component, scheduler, apiHelper } =
    new ServiceInventoryPrepper().prep();

  render(component);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: [ServiceInstance.a, ServiceInstance.b],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  userEvent.click(screen.getAllByRole("button", { name: "Details" })[0]);
  await act(async () => {
    userEvent.click(screen.getAllByRole("button", { name: "Resources" })[0]);
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0].url).toEqual(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/resources?current_version=3"
  );

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: InstanceResource.listA }));
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
  const { component, scheduler, apiHelper } = prepper.prep();

  render(component);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: [ServiceInstance.a, ServiceInstance.b],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  userEvent.click(screen.getAllByRole("button", { name: "Details" })[0]);
  await act(async () => {
    userEvent.click(screen.getAllByRole("button", { name: "Resources" })[0]);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: InstanceResource.listA }));
  });

  const tasks = scheduler.getTasks();
  const serviceInstancesTask = Maybe.orNull(
    tasks.get(ServiceInstance.a.service_entity)
  );
  const resourcesTask = Maybe.orNull(tasks.get(ServiceInstance.a.id));

  jest.advanceTimersByTime(5000);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: [ServiceInstance.a, ServiceInstance.b],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: InstanceResource.listA }));
  });

  expect(serviceInstancesTask?.effect).toBeCalledTimes(1);
  expect(serviceInstancesTask?.update).toBeCalledTimes(1);
  expect(resourcesTask?.effect).toBeCalledTimes(1);
  expect(resourcesTask?.update).toBeCalledTimes(1);
});
