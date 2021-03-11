import { ServiceModel } from "@/Core";

const base = ({
  environment: "environment_id_a",
  name: "service_name_a",
  attributes: [
    {
      name: "bandwidth",
      type: "e2e::bandwidth_t",
      modifier: "rw+",
      description: "The bandwidth of the e-line",
    },
    {
      name: "customer_locations",
      type: "string",
      modifier: "rw",
      description:
        "A list of customer location IDS where the service should be delivered.",
    },
    {
      name: "order_id",
      type: "string",
      modifier: "rw",
      description: "ID of the service",
    },
  ],
  lifecycle: {
    states: [
      {
        name: "start",
        export_resources: false,
        purge_resources: false,
        deleted: false,
        label: "info",
      },
      { name: "creating", label: "info" },
      {
        name: "acknowledged",
        export_resources: false,
        purge_resources: false,
        deleted: false,
        label: "info",
      },
      {
        name: "rejected",
        export_resources: false,
        purge_resources: false,
        deleted: false,
        label: "warning",
      },
      {
        name: "terminated",
        export_resources: false,
        purge_resources: false,
        deleted: true,
        label: "warning",
      },
    ],
    transfers: [
      {
        source: "start",
        target: "acknowledged",
        error: "rejected",
        on_update: false,
        on_delete: false,
        api_set_state: false,
        resource_based: false,
        auto: true,
        validate: true,
        config_name: null,
        description: "initial validation",
        target_operation: null,
        error_operation: null,
      },
      {
        source: "start",
        target: "terminated",
        error: null,
        on_update: false,
        on_delete: true,
        api_set_state: false,
        resource_based: false,
        auto: false,
        validate: false,
        config_name: null,
        description: "delete while starting",
        target_operation: null,
        error_operation: null,
      },
    ],
    initial_state: "start",
  },
  config: {
    auto_creating: true,
    auto_designed: true,
    auto_update_designed: true,
    auto_update_inprogress: true,
  },
} as unknown) as ServiceModel;

export const A = base;

export const ServiceWithIdentity = {
  ...base,
  service_identity: "order_id",
  service_identity_display_name: "Order ID",
};
