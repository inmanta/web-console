export const responseOrderFailed = {
  description: "Failed CREATE order",
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa",
  environment: "a",
  service_order_items: [
    {
      status: {
        state: "failed",
        failure_type: "INVALID_ORDER_ITEM",
        reason: "Some reason",
        direct_dependencies: {},
        validation_compile_id: "compile45322",
        instance_state_label: "",
      },
      instance_id: "failed_instance_01",
      service_entity: "basic-service",
      config: {},
      action: "create",
      attributes: {
        value: "value",
      },
    },
  ],
  created_at: "2024-01-30T10:07:53.631Z",
  completed_at: "2024-01-30T10:08:53.631Z",
  status: {
    state: "failed",
  },
};

export const responseCompletedOrder = {
  description: "Success CREATE order",
  id: "3fa85f64-5717-4562-b3fc-2c963f66afb",
  environment: "a",
  service_order_items: [
    {
      status: {
        state: "completed",
        failure_type: "",
        reason: "",
        direct_dependencies: {},
        validation_compile_id: "compile45322",
        instance_state_label: "",
      },
      instance_id: "success_instance_01",
      service_entity: "basic-service",
      config: {},
      action: "create",
      attributes: {
        value: "completed service",
      },
    },
  ],
  created_at: "2024-01-30T10:07:53.631Z",
  completed_at: "2024-01-30T10:08:53.631Z",
  status: {
    state: "success",
  },
};

export const responseInProgressOrder = {
  description: "In progress DELETE order",
  id: "3fa85f64-5717-4562-b3fc-2c963f66afc",
  environment: "a",
  service_order_items: [
    {
      status: {
        state: "in_progress",
        failure_type: "",
        reason: "",
        direct_dependencies: {},
        validation_compile_id: "",
        instance_state_label: "",
      },
      instance_id: "in_progress_instance_01",
      service_entity: "basic-service",
      config: {},
      action: "delete",
    },
  ],
  created_at: "2024-01-30T10:07:53.631Z",
  completed_at: "2024-01-30T10:08:53.631Z",
  status: {
    state: "in_progress",
  },
};
export const responsePartialOrder = {
  description: "Partial UPDATE order, with dependency",
  id: "3fa85f64-5717-4562-b3fc-2c963f66afd",
  environment: "a",
  service_order_items: [
    {
      status: {
        state: "failed",
        failure_type: "VALIDATION_COMPILE_FAILED",
        reason: "some reason",
        direct_dependencies: {
          partial_instance_02: "completed",
        },
        validation_compile_id: "compile45324",
        instance_state_label: "",
      },
      instance_id: "partial_instance_01",
      service_entity: "basic-service",
      config: {},
      action: "create",
      attributes: {
        value: "value",
      },
    },
    {
      status: {
        state: "completed",
        failure_type: "",
        reason: "",
        direct_dependencies: {},
        validation_compile_id: "compile45329",
        instance_state_label: "",
      },
      instance_id: "partial_instance_02",
      service_entity: "basic-service",
      config: {},
      action: "update",
      edits: {
        edit_id: "id145641",
      },
    },
  ],
  created_at: "2024-01-30T10:07:53.631Z",
  completed_at: "2024-01-30T10:08:53.631Z",
  status: {
    state: "partial",
  },
};
