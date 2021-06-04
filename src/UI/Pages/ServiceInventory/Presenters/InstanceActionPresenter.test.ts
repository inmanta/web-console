import { ServiceModel } from "@/Core";
import { ServiceInstance } from "@/Test";
import { InstanceActionPresenter } from "./InstanceActionPresenter";

const instances = [ServiceInstance.a];

describe("InstanceActionPresenter ", () => {
  it("returns disabled for transfers which are not in the lifecycle", () => {
    const partialEntity = {
      name: "cloudconnectv2",
      lifecycle: {
        states: [{ name: "creating", label: "info" }],
        transfers: [{}],
      },
    } as ServiceModel;
    const actionPresenter = new InstanceActionPresenter(
      instances,
      partialEntity
    );
    const editDisabled = actionPresenter.isTransferDisabled(
      instances[0].id,
      "on_update"
    );

    expect(editDisabled).toBeTruthy();

    const deleteDisabled = actionPresenter.isTransferDisabled(
      instances[0].id,
      "on_delete"
    );

    expect(deleteDisabled).toBeTruthy();
  });

  it("returns enabled for update transfers which are in the lifecycle", () => {
    const partialEntity = {
      name: "cloudconnectv2",
      lifecycle: {
        states: [{ name: "creating", label: "info" }],
        transfers: [{ source: "creating", on_update: true }],
      },
    } as ServiceModel;
    const actionPresenter = new InstanceActionPresenter(
      instances,
      partialEntity
    );
    const editDisabled = actionPresenter.isTransferDisabled(
      instances[0].id,
      "on_update"
    );

    expect(editDisabled).toBeFalsy();

    const deleteDisabled = actionPresenter.isTransferDisabled(
      instances[0].id,
      "on_delete"
    );
    expect(deleteDisabled).toBeTruthy();
  });

  it("returns enabled for delete transfers which are in the lifecycle", () => {
    const partialEntity = {
      name: "cloudconnectv2",
      lifecycle: {
        states: [{ name: "creating", label: "info" }],
        transfers: [{ source: "creating", on_delete: true }],
      },
    } as ServiceModel;
    const actionPresenter = new InstanceActionPresenter(
      instances,
      partialEntity
    );
    const editDisabled = actionPresenter.isTransferDisabled(
      instances[0].id,
      "on_update"
    );

    expect(editDisabled).toBeTruthy();

    const deleteDisabled = actionPresenter.isTransferDisabled(
      instances[0].id,
      "on_delete"
    );

    expect(deleteDisabled).toBeFalsy();
  });
});
