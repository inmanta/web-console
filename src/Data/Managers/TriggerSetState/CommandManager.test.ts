import { TriggerSetStateCommandManager, BaseApiHelper } from "@/Data";
import { DummyAuthHelper, ServiceInstance } from "@/Test";

test("TriggerSetStateCommandManager sends correct request with message", async () => {
  const commandManager = new TriggerSetStateCommandManager(
    new DummyAuthHelper(),
    new BaseApiHelper(),
    "env1"
  );
  const triggerFunction = commandManager.getTrigger({
    id: ServiceInstance.a.id,
    service_entity: ServiceInstance.a.service_entity,
    version: ServiceInstance.a.version,
    kind: "TriggerSetState",
  });
  await triggerFunction("up");
  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
  expect(receivedUrl).toEqual(
    `/lsm/v1/service_inventory/${ServiceInstance.a.service_entity}/${ServiceInstance.a.id}/state`
  );
  expect(requestInit?.body).toEqual(
    JSON.stringify({
      current_version: ServiceInstance.a.version,
      target_state: "up",
      message: "Triggered from the console by inmanta",
    })
  );
});
