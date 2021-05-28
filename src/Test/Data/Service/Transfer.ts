import { TransferModel } from "@/Core";

export const a: TransferModel = {
  source: "start",
  target: "acknowledged",
  error: "rejected",
  on_update: false,
  on_delete: false,
  api_set_state: false,
  resource_based: false,
  auto: true,
  validate: true,
  config_name: "auto_creating",
  description: "initial validation",
  target_operation: null,
  error_operation: null,
};

export const b: TransferModel = {
  source: "start",
  target: "acknowledged",
  error: "rejected",
  on_update: false,
  on_delete: false,
  api_set_state: false,
  resource_based: false,
  auto: true,
  validate: true,
  config_name: "auto_designed",
  description: "initial validation",
  target_operation: null,
  error_operation: null,
};

export const c: TransferModel = {
  source: "start",
  target: "acknowledged",
  error: "rejected",
  on_update: false,
  on_delete: false,
  api_set_state: false,
  resource_based: false,
  auto: true,
  validate: true,
  config_name: "auto_update_designed",
  description: "initial validation",
  target_operation: null,
  error_operation: null,
};

export const d: TransferModel = {
  source: "start",
  target: "terminated",
  error: "rejected",
  on_update: false,
  on_delete: true,
  api_set_state: false,
  resource_based: false,
  auto: false,
  validate: false,
  config_name: "auto_update_inprogress",
  description: "delete while starting",
  target_operation: null,
  error_operation: null,
};

export const list = [a, b, c, d];
