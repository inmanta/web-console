import { ServiceInstanceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Managers/V2/ServiceInstance";
import { ComposerServiceOrderItem } from "@/UI/Components/Diagram/interfaces";

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

export const testApiInstance: ComposerServiceOrderItem = {
  instance_id: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db",
  service_entity: "embedded-entity-service",
  config: {},
  action: null,
  attributes: {
    name: "test-emb",
    service_id: "ebd-123",
    should_deploy_fail: false,
  },
};

export const testEmbeddedApiInstances: ComposerServiceOrderItem[] = [
  {
    instance_id: "10591ae5-6840-4816-9851-6bee74afc2a5",
    service_entity: "vlan_assigment_r1",
    config: {},
    action: null,
    attributes: {
      address: "1.2.3.5/32",
      vlan_id: 1,
      router_ip: "1.2.3.4",
      interface_name: "eth0",
    },
    embeddedTo: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db",
  },
  {
    instance_id: "c0293b05-04d1-4fb4-93f1-f60d93d9739c",
    service_entity: "vlan_assigment_r2",
    config: {},
    action: null,
    attributes: {
      address: "1.2.3.3/32",
      vlan_id: 123,
      router_ip: "1.2.3.1",
      interface_name: "eth12",
    },
    embeddedTo: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db",
  },
];

export const testParentService: ComposerServiceOrderItem = {
  instance_id: "6af44f75-ba4b-4fba-9186-cc61c3c9463c",
  service_entity: "parent-service",
  config: {},
  action: null,
  attributes: {
    name: "test",
    service_id: "test123",
    should_deploy_fail: false,
  },
};

export const interServiceRelations: ComposerServiceOrderItem[] = [
  {
    instance_id: "13920268-cce0-4491-93b5-11316aa2fc37",
    service_entity: "child-service",
    config: {},
    action: "create",
    attributes: {
      name: "test123456789",
      service_id: "123test",
      should_deploy_fail: false,
    },
    relatedTo: new Map().set(
      "6af44f75-ba4b-4fba-9186-cc61c3c9463c",
      "parent_entity",
    ),
  },
  {
    instance_id: "a4218978-c9ad-4fd8-95e4-b9e9a8c3c653",
    service_entity: "container-service",
    config: {},
    action: "create",
    attributes: {
      name: "test12345",
      service_id: "test12345",
      should_deploy_fail: false,
    },
  },
  {
    instance_id: "0ede01ac-25c0-4029-9c7e-62ec6f1dcd54",
    service_entity: "child_container",
    config: {},
    action: "create",
    attributes: {
      name: "child123",
    },
    embeddedTo: "a4218978-c9ad-4fd8-95e4-b9e9a8c3c653",
    relatedTo: new Map().set(
      "6af44f75-ba4b-4fba-9186-cc61c3c9463c",
      "parent_entity",
    ),
  },
];

export const mockedInstanceWithRelations: InstanceWithRelations = {
  instance: {
    id: "085cdf92-0894-4b82-8d46-1dd9552e7ba3",
    environment: "efa7c243-81aa-4986-b0b1-c89583cbf846",
    service_entity: "parent-service",
    version: 4,
    config: {},
    state: "up",
    candidate_attributes: null,
    active_attributes: {
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    },
    rollback_attributes: null,
    created_at: "2023-09-19T14:39:30.770002",
    last_updated: "2023-09-19T14:39:53.389878",
    callback: [],
    deleted: false,
    deployment_progress: null,
    service_identity_attribute_value: "test12345",
    referenced_by: [],
  },
  interServiceRelations: [
    {
      id: "7cd8b669-597a-4341-9b71-07f550b89826",
      environment: "efa7c243-81aa-4986-b0b1-c89583cbf846",
      service_entity: "child-service",
      version: 4,
      config: {},
      state: "up",
      candidate_attributes: null,
      active_attributes: {
        name: "child-test",
        service_id: "123523534623",
        parent_entity: "085cdf92-0894-4b82-8d46-1dd9552e7ba3",
        should_deploy_fail: false,
      },
      rollback_attributes: null,
      created_at: "2023-09-19T14:40:08.999123",
      last_updated: "2023-09-19T14:40:36.178723",
      callback: [],
      deleted: false,
      deployment_progress: null,
      service_identity_attribute_value: "child-test",
      referenced_by: [],
    },
    {
      id: "1548332f-86ab-42fe-bd32-4f3adb9e650b",
      environment: "efa7c243-81aa-4986-b0b1-c89583cbf846",
      service_entity: "container-service",
      version: 4,
      config: {},
      state: "up",
      candidate_attributes: null,
      active_attributes: {
        name: "test-container1123",
        service_id: "123412312",
        child_container: {
          name: "123124124",
          parent_entity: "085cdf92-0894-4b82-8d46-1dd9552e7ba3",
        },
        should_deploy_fail: false,
      },
      rollback_attributes: null,
      created_at: "2023-09-19T14:39:52.566097",
      last_updated: "2023-09-19T14:40:14.861344",
      callback: [],
      deleted: false,
      deployment_progress: null,
      service_identity_attribute_value: "test-container1123",
      referenced_by: [],
    },
  ],
};

export const mockedInstanceTwo: InstanceWithRelations = {
  instance: {
    id: "085cxf92-0894-4ex2-8d46-1gd9552e7ba3",
    environment: "efa7c243-81aa-4986-b0b1-c89583cbf846",
    service_entity: "test-service",
    version: 4,
    config: {},
    state: "up",
    candidate_attributes: null,
    active_attributes: {
      name: "test12345",
      attrOne: "test12345",
      dictOne: {},
      attrTwo: "123",
      attrThree: "456",
      attrFour: "789",
      service_id: "012",
      should_deploy_fail: false,
      dictTwo: {
        data: "string",
      },
    },
    rollback_attributes: null,
    created_at: "2023-09-19T14:39:30.770002",
    last_updated: "2023-09-19T14:39:53.389878",
    callback: [],
    deleted: false,
    deployment_progress: null,
    service_identity_attribute_value: "test12345",
    referenced_by: [],
  },
  interServiceRelations: [],
};

export const mockedInstanceThree: InstanceWithRelations = {
  instance: {
    id: "085cxf92-0894-4ex2-8d46-1gd9552e7ba3",
    environment: "efa7c243-81aa-4986-b0b1-c89583cbf846",
    service_entity: "test-service",
    version: 4,
    config: {},
    state: "up",
    candidate_attributes: null,
    active_attributes: {
      name: "test12345",
      attrOne: "test12345",
      dictOne: {},
      attrTwo: "123",
      attrThree: "456",
      attrFour: "789",
      service_id: "012",
      should_deploy_fail: false,
      dictTwo: {},
    },
    rollback_attributes: null,
    created_at: "2023-09-19T14:39:30.770002",
    last_updated: "2023-09-19T14:39:53.389878",
    callback: [],
    deleted: false,
    deployment_progress: null,
    service_identity_attribute_value: "test12345",
    referenced_by: [],
  },
  interServiceRelations: [],
};
