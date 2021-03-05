import { InstanceLog } from "@/Core";
import * as ServiceInstance from "./ServiceInstance";

const base: InstanceLog = {
  ...ServiceInstance.A,
  version: 1,
  service_instance_id: ServiceInstance.A.id,
  events: [],
  timestamp: "2021-01-11T12:55:25.961567",
};

export const A = base;
export const B = { ...base, version: 2 };
export const C = { ...base, version: 3 };
export const list = [A, B, C];

export const list2 = [
  {
    service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
    environment: "919f42ca-22c2-4791-9965-2b8927e93550",
    service_entity: "cbci",
    version: 3,
    timestamp: "2021-02-15T14:27:54.609061",
    config: {},
    state: "creating",
    candidate_attributes: null,
    active_attributes: {
      vc_id: 10000,
      csp_port: "ge-0/0/2",
      customer: "BEL/HOMME",
      csp_port_id: "12",
      csp_vlan_id: 1760,
      service_mtu: 1500,
      azure_region: "WestEurope",
      customer_port: "GigabitEthernet0/0/0/2",
      csp_router_name: "prs-eqx-r1",
      customer_port_id: 3,
      customer_vlan_id: 123,
      authorization_key: "3c1a0b9b-36ed-4dbd-a42e-405421868b03",
      csp_router_vendor: "Juniper",
      service_bandwidth: 50000,
      csp_router_mgmt_ip: "10.244.255.229",
      csp_router_system_ip: "10.244.255.229",
      customer_router_name: "bru-ixn-r1",
      csp_inventory_port_id: 24,
      csp_inventory_vlan_id: 341,
      customer_router_vendor: "CiscoXR",
      customer_router_mgmt_ip: "10.244.255.228",
      customer_router_system_ip: "10.244.255.228",
      allocated_customer_vlan_id: 123,
      customer_inventory_port_id: 10,
      customer_inventory_vlan_id: 342,
    },
    rollback_attributes: null,
    created_at: "2021-02-15T14:27:34.719859",
    last_updated: "2021-02-15T14:27:53.667393",
    callback: [],
    deleted: false,
    events: [
      {
        id: "9abc7b8a-5964-4e16-a40b-1a9ba099046c",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 2,
        timestamp: "2021-02-15T14:27:54.641052",
        source: "allocating",
        destination: "creating",
        message:
          "Service instance 5537c397-3771-4713-838d-7ff14442fe0c successfully executed transfer allocating -> creating (error=False)",
        ignored_transition: false,
        event_correlation_id: "998892e0-8900-4371-be22-5b512d8cd581",
        severity: 20,
        id_compile_report: null,
        event_type: "AUTO_TRANSITION",
        is_error_transition: false,
      },
      {
        id: "5ac2bf61-1ea0-40d8-811b-67a2f84dbc11",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 2,
        timestamp: "2021-02-15T14:27:54.620056",
        source: "allocating",
        destination: "creating",
        message:
          "compile request queued with id e8cf8a6c-7b4a-49a2-be3a-3613faa6426f",
        ignored_transition: false,
        event_correlation_id: "998892e0-8900-4371-be22-5b512d8cd581",
        severity: 20,
        id_compile_report: "e8cf8a6c-7b4a-49a2-be3a-3613faa6426f",
        event_type: "AUTO_TRANSITION",
        is_error_transition: false,
      },
      {
        id: "7a07884e-391d-4f09-b3ae-d9678d71b767",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 2,
        timestamp: "2021-02-15T14:27:45.971959",
        source: "allocating",
        destination: "creating",
        message:
          "Validation compile request queued with id 3777db4e-3250-4021-9502-b1c5bc126356",
        ignored_transition: false,
        event_correlation_id: "998892e0-8900-4371-be22-5b512d8cd581",
        severity: 20,
        id_compile_report: "3777db4e-3250-4021-9502-b1c5bc126356",
        event_type: "AUTO_TRANSITION",
        is_error_transition: false,
      },
      {
        id: "96d93bf1-711f-4a61-8ede-a23fff92cc8e",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 2,
        timestamp: "2021-02-15T14:27:45.946909",
        source: "allocating",
        destination: "creating",
        message:
          "Auto transition triggered for service instance 5537c397-3771-4713-838d-7ff14442fe0c in environment demo (919f42ca-22c2-4791-9965-2b8927e93550)",
        ignored_transition: false,
        event_correlation_id: "998892e0-8900-4371-be22-5b512d8cd581",
        severity: 20,
        id_compile_report: null,
        event_type: "AUTO_TRANSITION",
        is_error_transition: false,
      },
    ],
  },
  {
    service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
    environment: "919f42ca-22c2-4791-9965-2b8927e93550",
    service_entity: "cbci",
    version: 4,
    timestamp: "2021-02-15T14:29:18.968061",
    config: {},
    state: "create_failed",
    candidate_attributes: null,
    active_attributes: {
      vc_id: 10000,
      csp_port: "ge-0/0/2",
      customer: "BEL/HOMME",
      csp_port_id: "12",
      csp_vlan_id: 1760,
      service_mtu: 1500,
      azure_region: "WestEurope",
      customer_port: "GigabitEthernet0/0/0/2",
      csp_router_name: "prs-eqx-r1",
      customer_port_id: 3,
      customer_vlan_id: 123,
      authorization_key: "3c1a0b9b-36ed-4dbd-a42e-405421868b03",
      csp_router_vendor: "Juniper",
      service_bandwidth: 50000,
      csp_router_mgmt_ip: "10.244.255.229",
      csp_router_system_ip: "10.244.255.229",
      customer_router_name: "bru-ixn-r1",
      csp_inventory_port_id: 24,
      csp_inventory_vlan_id: 341,
      customer_router_vendor: "CiscoXR",
      customer_router_mgmt_ip: "10.244.255.228",
      customer_router_system_ip: "10.244.255.228",
      allocated_customer_vlan_id: 123,
      customer_inventory_port_id: 10,
      customer_inventory_vlan_id: 342,
    },
    rollback_attributes: null,
    created_at: "2021-02-15T14:27:34.719859",
    last_updated: "2021-02-15T14:27:53.667393",
    callback: [],
    deleted: false,
    events: [
      {
        id: "3d186ea2-bcb4-4bbc-a1e9-4a9d3c2f62a1",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 3,
        timestamp: "2021-02-15T14:29:18.997648",
        source: "creating",
        destination: "create_failed",
        message:
          "Service instance 5537c397-3771-4713-838d-7ff14442fe0c successfully executed transfer creating -> create_failed (error=True)",
        ignored_transition: false,
        event_correlation_id: "560bd89c-b475-4aa2-bbde-e1cf896322a4",
        severity: 20,
        id_compile_report: null,
        event_type: "RESOURCE_TRANSITION",
        is_error_transition: true,
      },
      {
        id: "485807be-88ee-4bf5-acda-cdb683f70d85",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 3,
        timestamp: "2021-02-15T14:29:18.992382",
        source: "creating",
        destination: "create_failed",
        message:
          "compile request queued with id 5f1dba58-b070-422a-966b-34c9519ee7b2",
        ignored_transition: false,
        event_correlation_id: "560bd89c-b475-4aa2-bbde-e1cf896322a4",
        severity: 20,
        id_compile_report: "5f1dba58-b070-422a-966b-34c9519ee7b2",
        event_type: "RESOURCE_TRANSITION",
        is_error_transition: true,
      },
      {
        id: "ccaad662-8ecb-42b0-a13e-778f6d0bead8",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 3,
        timestamp: "2021-02-15T14:29:18.920200",
        source: "creating",
        destination: "create_failed",
        message:
          "Resource-based transition triggered for service instance 5537c397-3771-4713-838d-7ff14442fe0c in environment demo (919f42ca-22c2-4791-9965-2b8927e93550)",
        ignored_transition: false,
        event_correlation_id: "560bd89c-b475-4aa2-bbde-e1cf896322a4",
        severity: 20,
        id_compile_report: null,
        event_type: "RESOURCE_TRANSITION",
        is_error_transition: true,
      },
    ],
  },
  {
    service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
    environment: "919f42ca-22c2-4791-9965-2b8927e93550",
    service_entity: "cbci",
    version: 5,
    timestamp: "2021-02-15T14:29:38.019725",
    config: {},
    state: "awaiting_up",
    candidate_attributes: null,
    active_attributes: {
      vc_id: 10000,
      csp_port: "ge-0/0/2",
      customer: "BEL/HOMME",
      csp_port_id: "12",
      csp_vlan_id: 1760,
      service_mtu: 1500,
      azure_region: "WestEurope",
      customer_port: "GigabitEthernet0/0/0/2",
      csp_router_name: "prs-eqx-r1",
      customer_port_id: 3,
      customer_vlan_id: 123,
      authorization_key: "3c1a0b9b-36ed-4dbd-a42e-405421868b03",
      csp_router_vendor: "Juniper",
      service_bandwidth: 50000,
      csp_router_mgmt_ip: "10.244.255.229",
      csp_router_system_ip: "10.244.255.229",
      customer_router_name: "bru-ixn-r1",
      csp_inventory_port_id: 24,
      csp_inventory_vlan_id: 341,
      customer_router_vendor: "CiscoXR",
      customer_router_mgmt_ip: "10.244.255.228",
      customer_router_system_ip: "10.244.255.228",
      allocated_customer_vlan_id: 123,
      customer_inventory_port_id: 10,
      customer_inventory_vlan_id: 342,
    },
    rollback_attributes: null,
    created_at: "2021-02-15T14:27:34.719859",
    last_updated: "2021-02-15T14:27:53.667393",
    callback: [],
    deleted: false,
    events: [
      {
        id: "818d7c55-1bd7-4862-9b51-8306855678bb",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 4,
        timestamp: "2021-02-15T14:29:38.144234",
        source: "create_failed",
        destination: "awaiting_up",
        message:
          "Service instance 5537c397-3771-4713-838d-7ff14442fe0c successfully executed transfer create_failed -> awaiting_up (error=False)",
        ignored_transition: false,
        event_correlation_id: "40c9e012-8b1c-4308-b2ef-a495ab2b4aea",
        severity: 20,
        id_compile_report: null,
        event_type: "RESOURCE_TRANSITION",
        is_error_transition: false,
      },
      {
        id: "f8f6be97-57d5-4488-ba98-c7cbda0061bf",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 4,
        timestamp: "2021-02-15T14:29:38.123177",
        source: "create_failed",
        destination: "awaiting_up",
        message:
          "compile request queued with id c8ee3e84-a528-4c78-83f1-43035c11b87d",
        ignored_transition: false,
        event_correlation_id: "40c9e012-8b1c-4308-b2ef-a495ab2b4aea",
        severity: 20,
        id_compile_report: "c8ee3e84-a528-4c78-83f1-43035c11b87d",
        event_type: "RESOURCE_TRANSITION",
        is_error_transition: false,
      },
      {
        id: "16927f9e-baf9-4df2-91d1-b8dc8a683063",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 4,
        timestamp: "2021-02-15T14:29:37.990109",
        source: "create_failed",
        destination: "awaiting_up",
        message:
          "Resource-based transition triggered for service instance 5537c397-3771-4713-838d-7ff14442fe0c in environment demo (919f42ca-22c2-4791-9965-2b8927e93550)",
        ignored_transition: false,
        event_correlation_id: "40c9e012-8b1c-4308-b2ef-a495ab2b4aea",
        severity: 20,
        id_compile_report: null,
        event_type: "RESOURCE_TRANSITION",
        is_error_transition: false,
      },
    ],
  },
  {
    service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
    environment: "919f42ca-22c2-4791-9965-2b8927e93550",
    service_entity: "cbci",
    version: 6,
    timestamp: "2021-02-15T14:30:25.915593",
    config: {},
    state: "up",
    candidate_attributes: null,
    active_attributes: {
      vc_id: 10000,
      csp_port: "ge-0/0/2",
      customer: "BEL/HOMME",
      csp_port_id: "12",
      csp_vlan_id: 1760,
      service_mtu: 1500,
      azure_region: "WestEurope",
      customer_port: "GigabitEthernet0/0/0/2",
      csp_router_name: "prs-eqx-r1",
      customer_port_id: 3,
      customer_vlan_id: 123,
      authorization_key: "3c1a0b9b-36ed-4dbd-a42e-405421868b03",
      csp_router_vendor: "Juniper",
      service_bandwidth: 50000,
      csp_router_mgmt_ip: "10.244.255.229",
      csp_router_system_ip: "10.244.255.229",
      customer_router_name: "bru-ixn-r1",
      csp_inventory_port_id: 24,
      csp_inventory_vlan_id: 341,
      customer_router_vendor: "CiscoXR",
      customer_router_mgmt_ip: "10.244.255.228",
      customer_router_system_ip: "10.244.255.228",
      allocated_customer_vlan_id: 123,
      customer_inventory_port_id: 10,
      customer_inventory_vlan_id: 342,
    },
    rollback_attributes: null,
    created_at: "2021-02-15T14:27:34.719859",
    last_updated: "2021-02-15T14:27:53.667393",
    callback: [],
    deleted: false,
    events: [
      {
        id: "efd08231-9ea4-4050-b88b-6ffd9c1a537a",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 5,
        timestamp: "2021-02-15T14:30:25.966525",
        source: "awaiting_up",
        destination: "up",
        message:
          "Service instance 5537c397-3771-4713-838d-7ff14442fe0c successfully executed transfer awaiting_up -> up (error=False)",
        ignored_transition: false,
        event_correlation_id: "573d6f9e-2d93-44b3-a868-65f42491062f",
        severity: 20,
        id_compile_report: null,
        event_type: "RESOURCE_TRANSITION",
        is_error_transition: false,
      },
      {
        id: "c0bde8f7-1918-4226-8541-2908d194d8e6",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 5,
        timestamp: "2021-02-15T14:30:25.933476",
        source: "awaiting_up",
        destination: "up",
        message:
          "compile request queued with id b5b4139c-94df-48da-8ea3-f76ea02120e6",
        ignored_transition: false,
        event_correlation_id: "573d6f9e-2d93-44b3-a868-65f42491062f",
        severity: 20,
        id_compile_report: "b5b4139c-94df-48da-8ea3-f76ea02120e6",
        event_type: "RESOURCE_TRANSITION",
        is_error_transition: false,
      },
      {
        id: "d84edf39-0923-4f24-8a86-ea33809d9d9f",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 5,
        timestamp: "2021-02-15T14:30:25.890436",
        source: "awaiting_up",
        destination: "up",
        message:
          "Resource-based transition triggered for service instance 5537c397-3771-4713-838d-7ff14442fe0c in environment demo (919f42ca-22c2-4791-9965-2b8927e93550)",
        ignored_transition: false,
        event_correlation_id: "573d6f9e-2d93-44b3-a868-65f42491062f",
        severity: 20,
        id_compile_report: null,
        event_type: "RESOURCE_TRANSITION",
        is_error_transition: false,
      },
    ],
  },
  {
    service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
    environment: "919f42ca-22c2-4791-9965-2b8927e93550",
    service_entity: "cbci",
    version: 2,
    timestamp: "2021-02-15T14:27:45.928622",
    config: {},
    state: "allocating",
    candidate_attributes: {
      vc_id: 10000,
      csp_port: "ge-0/0/2",
      customer: "BEL/HOMME",
      csp_port_id: "12",
      csp_vlan_id: 1760,
      service_mtu: 1500,
      azure_region: "WestEurope",
      customer_port: "GigabitEthernet0/0/0/2",
      csp_router_name: "prs-eqx-r1",
      customer_port_id: 3,
      customer_vlan_id: 123,
      authorization_key: "3c1a0b9b-36ed-4dbd-a42e-405421868b03",
      csp_router_vendor: "Juniper",
      service_bandwidth: 50000,
      csp_router_mgmt_ip: "10.244.255.229",
      csp_router_system_ip: "10.244.255.229",
      customer_router_name: "bru-ixn-r1",
      csp_inventory_port_id: 24,
      csp_inventory_vlan_id: 341,
      customer_router_vendor: "CiscoXR",
      customer_router_mgmt_ip: "10.244.255.228",
      customer_router_system_ip: "10.244.255.228",
      allocated_customer_vlan_id: 123,
      customer_inventory_port_id: 10,
      customer_inventory_vlan_id: 342,
    },
    active_attributes: null,
    rollback_attributes: null,
    created_at: "2021-02-15T14:27:34.719859",
    last_updated: "2021-02-15T14:27:44.696080",
    callback: [],
    deleted: false,
    events: [
      {
        id: "97e3ba82-223d-4367-92f5-4b771a0ec3cf",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 1,
        timestamp: "2021-02-15T14:27:45.930959",
        source: "ordered",
        destination: "allocating",
        message:
          "Service instance 5537c397-3771-4713-838d-7ff14442fe0c successfully executed transfer ordered -> allocating (error=False)",
        ignored_transition: false,
        event_correlation_id: "05b8856e-e4ab-444a-acaa-d41ad7b84470",
        severity: 20,
        id_compile_report: null,
        event_type: "AUTO_TRANSITION",
        is_error_transition: false,
      },
      {
        id: "d43964ee-eb4f-47dc-aa10-08e9b7485cc7",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 1,
        timestamp: "2021-02-15T14:27:34.777465",
        source: "ordered",
        destination: "allocating",
        message:
          "Validation compile request queued with id 05ebe146-ed10-4a6b-a005-612c61efc886",
        ignored_transition: false,
        event_correlation_id: "05b8856e-e4ab-444a-acaa-d41ad7b84470",
        severity: 20,
        id_compile_report: "05ebe146-ed10-4a6b-a005-612c61efc886",
        event_type: "AUTO_TRANSITION",
        is_error_transition: false,
      },
      {
        id: "611b5d8d-7e63-4357-a72c-286f3af45522",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 1,
        timestamp: "2021-02-15T14:27:34.744928",
        source: "ordered",
        destination: "allocating",
        message:
          "Auto transition triggered for service instance 5537c397-3771-4713-838d-7ff14442fe0c in environment demo (919f42ca-22c2-4791-9965-2b8927e93550)",
        ignored_transition: false,
        event_correlation_id: "05b8856e-e4ab-444a-acaa-d41ad7b84470",
        severity: 20,
        id_compile_report: null,
        event_type: "AUTO_TRANSITION",
        is_error_transition: false,
      },
    ],
  },
  {
    service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
    environment: "919f42ca-22c2-4791-9965-2b8927e93550",
    service_entity: "cbci",
    version: 1,
    timestamp: "2021-02-15T14:27:34.722210",
    // config: {},
    state: "ordered",
    candidate_attributes: {
      customer: "BEL/HOMME",
      service_mtu: 1500,
      azure_region: "WestEurope",
      customer_port_id: 3,
      customer_vlan_id: 123,
      authorization_key: "3c1a0b9b-36ed-4dbd-a42e-405421868b03",
      service_bandwidth: 50000,
    },
    active_attributes: null,
    rollback_attributes: null,
    created_at: "2021-02-15T14:27:34.719859",
    last_updated: "2021-02-15T14:27:34.719859",
    // callback: [],
    deleted: false,
    events: [
      {
        id: "43457a06-cf7c-4d1b-9b2a-189024d714af",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 0,
        timestamp: "2021-02-15T14:27:34.729371",
        source: null,
        destination: "ordered",
        message: "Creation complete",
        ignored_transition: false,
        event_correlation_id: "198d8281-71e7-4288-9cf0-1b3b29077330",
        severity: 20,
        id_compile_report: null,
        event_type: "CREATE_TRANSITION",
        is_error_transition: false,
      },
      {
        id: "c6b691dd-2d26-43e5-8d4e-e469965b228e",
        service_instance_id: "5537c397-3771-4713-838d-7ff14442fe0c",
        service_instance_version: 0,
        timestamp: "2021-02-15T14:27:34.700043",
        source: null,
        destination: "ordered",
        message:
          "Creation trigger received for service instance 5537c397-3771-4713-838d-7ff14442fe0c.",
        ignored_transition: false,
        event_correlation_id: "198d8281-71e7-4288-9cf0-1b3b29077330",
        severity: 20,
        id_compile_report: null,
        event_type: "CREATE_TRANSITION",
        is_error_transition: false,
      },
    ],
  },
] as InstanceLog[];
