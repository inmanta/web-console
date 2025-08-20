import { ServiceInstanceModel, ServiceModel } from "@/Core";
import { getAvailableStateTargets, getExpertStateTargets, isTransferDisabled } from "../Utils";
import { instanceData, instanceDataDeleted, serviceModel } from "./mockData";

describe("isTransferDisabled", () => {
  it("should return true when serviceEntity is undefined", () => {
    const instance: ServiceInstanceModel = instanceData;
    const result = isTransferDisabled(instance, "on_update", undefined);

    expect(result).toBe(true);
  });

  it("should return false when transfer is found for the current state and transferType", () => {
    const instance: ServiceInstanceModel = instanceData;
    const serviceEntity: ServiceModel = serviceModel;

    const result = isTransferDisabled(instance, "on_update", serviceEntity);

    expect(result).toBe(false);
  });

  it("should return true when no transfer is found for the current state and transferType", () => {
    const instance: ServiceInstanceModel = instanceDataDeleted;
    const serviceEntity: ServiceModel = serviceModel;

    const result = isTransferDisabled(instance, "on_update", serviceEntity);

    expect(result).toBe(true);
  });
});

describe("getAvailableStateTargets", () => {
  it("should return an empty array if serviceEntity is undefined", () => {
    const result = getAvailableStateTargets("up", undefined);

    expect(result).toEqual([]);
  });

  it("should return an empty array if no transfers match the current state", () => {
    const serviceEntity: ServiceModel = serviceModel;

    const result = getAvailableStateTargets("terminated", serviceEntity);

    expect(result).toEqual([]);
  });

  it("should return the target state when there is a transfer matching the current state", () => {
    const serviceEntity: ServiceModel = serviceModel;

    const result = getAvailableStateTargets("up", serviceEntity);

    expect(result).toEqual(["update_start"]);
  });

  it("should return multiple targets if there are multiple matching transfers", () => {
    const serviceEntity: ServiceModel = serviceModel;

    const result = getAvailableStateTargets("update_start", serviceEntity);

    expect(result).toEqual(["update_acknowledged", "update_acknowledged_failed"]);
  });
});

describe("getExpertStateTargets", () => {
  it("should return an empty array if serviceEntity is undefined", () => {
    const result = getExpertStateTargets(undefined);

    expect(result).toEqual([]);
  });

  it("should return all target states from the transfer models", () => {
    const serviceEntity: ServiceModel = serviceModel;

    const result = getExpertStateTargets(serviceEntity);

    expect(result).toEqual([
      "acknowledged",
      "creating",
      "deleting",
      "failed",
      "rejected",
      "rollback",
      "start",
      "terminated",
      "up",
      "update_acknowledged",
      "update_acknowledged_failed",
      "update_cleanup",
      "update_cleanup_failed",
      "update_failed",
      "update_inprogress",
      "update_rejected",
      "update_rejected_failed",
      "update_start",
      "update_start_failed",
    ]);
  });

  it("should handle an empty transfer array", () => {
    const serviceEntity: ServiceModel = serviceModel;

    serviceModel.lifecycle.transfers = [];

    const result = getExpertStateTargets(serviceEntity);

    expect(result).toEqual([]);
  });
});
