import { instance } from "@/Test/Data/inventory";
import { KeycloakInstance } from "keycloak-js";
import { InstanceSetStateManager } from "./InstanceSetStateManager";

const rows = [
  { ...instance, ...{ instanceSetStateTargets: ["acknowledged", "designed"] } },
];
const manager = new InstanceSetStateManager(rows, undefined);

test("InstanceSetStateManager prepares correct setStateHandler", async () => {
  const instanceId = "bd200aec-4f80-45e1-b2ad-137c442c68b8";
  const setInstanceStateHandler =
    manager.getSetInstanceStateHandler(instanceId);
  expect(setInstanceStateHandler).toBeTruthy();
  if (setInstanceStateHandler) {
    await setInstanceStateHandler(instanceId, "acknowledged", () => {
      return;
    });
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(
      "/lsm/v1/service_inventory/cloudconnectv2/bd200aec-4f80-45e1-b2ad-137c442c68b8/state?current_version=3&target_state=acknowledged&message=Triggered from the console"
    );
    expect(fetchMock.mock.calls[0][1]?.method).toEqual("POST");
  }
});

test("InstanceSetStateManager adds username to the message when keycloak is enabled", async () => {
  const managerWithMockKeycloak = new InstanceSetStateManager(rows, {
    profile: { username: "inmanta" },
  } as KeycloakInstance);
  const instanceId = "bd200aec-4f80-45e1-b2ad-137c442c68b8";
  const setInstanceStateHandler =
    managerWithMockKeycloak.getSetInstanceStateHandler(instanceId);
  expect(setInstanceStateHandler).toBeTruthy();
  if (setInstanceStateHandler) {
    await setInstanceStateHandler(instanceId, "acknowledged", () => {
      return;
    });
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(
      "/lsm/v1/service_inventory/cloudconnectv2/bd200aec-4f80-45e1-b2ad-137c442c68b8/state?current_version=3&target_state=acknowledged&message=Triggered from the console by inmanta"
    );
    expect(fetchMock.mock.calls[0][1]?.method).toEqual("POST");
  }
});

test("InstanceSetStateManager returns null if id not in the rows", async () => {
  const setInstanceStateHandler =
    manager.getSetInstanceStateHandler("NonExistingId");
  expect(setInstanceStateHandler).toBeFalsy();
});
