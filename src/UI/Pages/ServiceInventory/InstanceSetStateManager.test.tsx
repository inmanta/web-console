import { ServiceInstance } from "@/Test";
import { KeycloakInstance } from "keycloak-js";
import { InstanceSetStateManager } from "./InstanceSetStateManager";

const rows = [ServiceInstance.a];
const manager = new InstanceSetStateManager(rows, undefined);
const { id, service_entity, version } = ServiceInstance.a;

test("InstanceSetStateManager prepares correct setStateHandler", async () => {
  const setInstanceStateHandler = manager.getSetInstanceStateHandler(id);
  expect(setInstanceStateHandler).toBeTruthy();
  if (setInstanceStateHandler) {
    await setInstanceStateHandler(id, "acknowledged", () => {
      return;
    });
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(
      `/lsm/v1/service_inventory/${service_entity}/${id}/state?current_version=${version}&target_state=acknowledged&message=Triggered from the console`
    );
    expect(fetchMock.mock.calls[0][1]?.method).toEqual("POST");
  }
});

test("InstanceSetStateManager adds username to the message when keycloak is enabled", async () => {
  const managerWithMockKeycloak = new InstanceSetStateManager(rows, {
    profile: { username: "inmanta" },
  } as KeycloakInstance);
  const setInstanceStateHandler =
    managerWithMockKeycloak.getSetInstanceStateHandler(id);
  expect(setInstanceStateHandler).toBeTruthy();
  if (setInstanceStateHandler) {
    await setInstanceStateHandler(id, "acknowledged", () => {
      return;
    });
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(
      `/lsm/v1/service_inventory/${service_entity}/${id}/state?current_version=${version}&target_state=acknowledged&message=Triggered from the console by inmanta`
    );
    expect(fetchMock.mock.calls[0][1]?.method).toEqual("POST");
  }
});

test("InstanceSetStateManager returns null if id not in the rows", async () => {
  const setInstanceStateHandler =
    manager.getSetInstanceStateHandler("NonExistingId");
  expect(setInstanceStateHandler).toBeFalsy();
});
