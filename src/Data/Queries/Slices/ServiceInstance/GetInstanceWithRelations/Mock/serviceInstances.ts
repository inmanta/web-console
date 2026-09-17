import { ServiceInstanceModel } from "@/Core";

export const testInstance: ServiceInstanceModel = {
  id: "d938d5bb-8bf1-4b41-9e17-ae0b5069cbbf",
  environment: "ff6dd80a-e18b-4a06-85fc-9a5cf4b45d0b",
  service_entity: "mpn",
  version: 4,
  config: {},
  state: "up",
  candidate_attributes: null,
  active_attributes: {
    mcc: "001",
    mnc: "01",
    name: "bart",
    site: "mpn_site",
    tenant: "mpn",
    peerings: [
      {
        vlan: 20,
        routes: ["10.0.20.128/32,10.0.20.1", "10.0.20.144/32,10.0.20.1"],
        switch: "switch-1",
        peer_asn: 64999,
        port_name: "xe-0/0/7",
        peer_address: "10.0.20.1",
        local_address: "10.0.20.0/31",
      },
    ],
    mgmt_prefix: "172.26.100.0/24",
    tenant_group: "mpn_group",
  },
  rollback_attributes: null,
  created_at: "2023-05-16T07:40:28.868598",
  last_updated: "2023-05-16T07:49:41.067413",
  callback: [],
  referenced_by: [],
  deleted: false,
  deployment_progress: {
    total: 335,
    failed: 0,
    deployed: 335,
    waiting: 0,
  },
  service_identity_attribute_value: "bart",
};
