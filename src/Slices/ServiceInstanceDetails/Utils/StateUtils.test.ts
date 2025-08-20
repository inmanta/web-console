import { ServiceInstanceModel, ServiceModel, TransferModel } from "@/Core";
import { getAvailableStateTargets, getExpertStateTargets, isTransferDisabled } from "./StateUtils";

// Helper to create transfer objects with minimal properties
const createTransfer = (
  source: string,
  target: string,
  options: Partial<TransferModel> = {}
): TransferModel => ({
  source,
  target,
  error: null,
  on_update: false,
  on_delete: false,
  api_set_state: false,
  resource_based: false,
  auto: false,
  validate: false,
  config_name: null,
  description: "",
  target_operation: null,
  error_operation: null,
  ...options,
});

// Helper to create service model with transfers
const createServiceModel = (transfers: TransferModel[] = []): ServiceModel => ({
  name: "testService",
  environment: "test-env",
  lifecycle: { initial_state: "start", states: [], transfers },
  attributes: [],
  config: {},
  embedded_entities: [],
  inter_service_relations: [],
  owner: null,
  owned_entities: [],
});

// Helper to create instance in specific state
const createInstance = (state: string): ServiceInstanceModel => ({
  id: "test-instance",
  environment: "test-env",
  service_entity: "testService",
  service_entity_version: 1,
  version: 1,
  desired_state_version: 1,
  config: {},
  state,
  candidate_attributes: {},
  active_attributes: {},
  rollback_attributes: null,
  created_at: "2023-01-01T00:00:00Z",
  last_updated: "2023-01-01T00:00:00Z",
  callback: [],
  deleted: false,
  deployment_progress: { deployed: 1, waiting: 0, failed: 0, total: 1 },
  service_identity_attribute_value: "test",
  referenced_by: null,
  transfer_context: "stable",
});

// mocked Transfers
const mockTransfers = [
  createTransfer("up", "update_start", { on_update: true, api_set_state: true }),
  createTransfer("up", "deleting", { on_delete: true }),
  createTransfer("update_start", "update_acknowledged", {
    api_set_state: true,
    error: "update_rejected",
  }),
  createTransfer("update_start", "update_acknowledged_failed", {
    api_set_state: true,
    error: "update_rejected_failed",
  }),
  createTransfer("rejected", "start", { on_update: true }),
  createTransfer("failed", "up", { error: "failed" }),
];

const mockServiceModel = createServiceModel(mockTransfers);
const mockServiceModelEmpty = createServiceModel([]);
const mockInstance = createInstance("up");
const mockInstanceRejected = createInstance("rejected");
const mockInstanceTerminated = createInstance("terminated");
const mockInstanceUnknown = createInstance("unknown_state");

describe("StateUtils", () => {
  describe("isTransferDisabled", () => {
    it("should return true when serviceEntity is undefined", () => {
      expect(isTransferDisabled(mockInstance, "on_update", undefined)).toBe(true);
    });

    it("should return false when transfer exists for the current state and transfer type", () => {
      expect(isTransferDisabled(mockInstance, "on_update", mockServiceModel)).toBe(false);
      expect(isTransferDisabled(mockInstance, "on_delete", mockServiceModel)).toBe(false);
      expect(isTransferDisabled(mockInstanceRejected, "on_update", mockServiceModel)).toBe(false);
    });

    it("should return true when no transfer exists for the current state and transfer type", () => {
      expect(isTransferDisabled(mockInstanceTerminated, "on_update", mockServiceModel)).toBe(true);
      expect(isTransferDisabled(mockInstanceTerminated, "on_delete", mockServiceModel)).toBe(true);
      expect(isTransferDisabled(mockInstanceUnknown, "on_update", mockServiceModel)).toBe(true);
      expect(isTransferDisabled(mockInstance, "on_update", mockServiceModelEmpty)).toBe(true);
    });
  });

  describe("getAvailableStateTargets", () => {
    it("should return empty array when serviceEntity is undefined or has no matching transfers", () => {
      expect(getAvailableStateTargets("up", undefined)).toEqual([]);
      expect(getAvailableStateTargets("up", mockServiceModelEmpty)).toEqual([]);
      expect(getAvailableStateTargets("nonexistent_state", mockServiceModel)).toEqual([]);
    });

    it("should only include transfers with api_set_state: true", () => {
      const serviceModel = createServiceModel([
        createTransfer("test_state", "target1", { api_set_state: false }),
        createTransfer("test_state", "target2", { api_set_state: true }),
      ]);
      expect(getAvailableStateTargets("test_state", serviceModel)).toEqual(["target2"]);
    });

    it("should return sorted array of available targets", () => {
      expect(getAvailableStateTargets("up", mockServiceModel)).toEqual(["update_start"]);
      expect(getAvailableStateTargets("update_start", mockServiceModel)).toEqual([
        "update_acknowledged",
        "update_acknowledged_failed",
      ]);

      const serviceModel = createServiceModel([
        createTransfer("test_state", "zebra", { api_set_state: true }),
        createTransfer("test_state", "alpha", { api_set_state: true }),
        createTransfer("test_state", "beta", { api_set_state: true }),
      ]);
      expect(getAvailableStateTargets("test_state", serviceModel)).toEqual([
        "alpha",
        "beta",
        "zebra",
      ]);
    });

    it("should handle duplicate targets and special characters", () => {
      const serviceModel = createServiceModel([
        createTransfer("test_state", "same_target", { api_set_state: true }),
        createTransfer("test_state", "same_target", { api_set_state: true }),
      ]);
      expect(getAvailableStateTargets("test_state", serviceModel)).toEqual([
        "same_target",
        "same_target",
      ]);
    });
  });

  describe("getExpertStateTargets", () => {
    it("should return empty array when serviceEntity is undefined or has no transfers", () => {
      expect(getExpertStateTargets(undefined)).toEqual([]);
      expect(getExpertStateTargets(mockServiceModelEmpty)).toEqual([]);
    });

    it("should return all unique target and error states sorted", () => {
      const result = getExpertStateTargets(mockServiceModel);
      const expectedStates = [
        "deleting",
        "failed",
        "start",
        "up",
        "update_acknowledged",
        "update_acknowledged_failed",
        "update_rejected",
        "update_rejected_failed",
        "update_start",
      ];
      expect(result).toEqual(expectedStates);
    });

    it("should include error states but filter out null values", () => {
      const serviceModel = createServiceModel([
        createTransfer("state1", "target1", { error: "error1" }),
        createTransfer("state2", "target2", { error: null }),
      ]);
      const result = getExpertStateTargets(serviceModel);
      expect(result).toContain("error1");
      expect(result).toContain("target1");
      expect(result).toContain("target2");
      expect(result).not.toContain(null);
    });

    it("should remove duplicates and sort alphabetically", () => {
      const serviceModel = createServiceModel([
        createTransfer("state1", "duplicate_state", { error: "duplicate_error" }),
        createTransfer("state2", "duplicate_state", { error: "duplicate_error" }),
        createTransfer("state3", "zebra", { error: "alpha" }),
      ]);
      const result = getExpertStateTargets(serviceModel);
      expect(result).toEqual(["alpha", "duplicate_error", "duplicate_state", "zebra"]);
      expect(result.filter((state) => state === "duplicate_state")).toHaveLength(1);
    });
  });
});
