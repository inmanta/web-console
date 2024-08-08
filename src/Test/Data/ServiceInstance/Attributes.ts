import { InstanceAttributeModel } from "@/Core";

export const a: InstanceAttributeModel = {
  circuits: [
    {
      sirius: {
        allocated_resources: {
          csp: {
            l2serv: "ServiceCircuit:9752044105474558994",
            offnet: "Off_netConnection:9471938946361154586",
            subintf: "VLANSub_Interface:9451362773897813937",
            supplier_info: "SupplierInfo:9278636080794640185",
          },
          customer: {
            l2serv: "ServiceCircuit:9394936770390002751",
            subintf: "VLANSub_Interface:9828995368058681852",
          },
          mpls: "Pseudowire:9612436223370978017",
          serv: "ServiceCircuit:9964037042282377708",
        },
      },
      allocated: { vc_id: 308024 },
      service_id: 9489784960,
      csp_endpoint: {
        region: "us-east-1",
        allocated: {
          attributes: {
            interconnect_connection_id: "dxcon-fgyqb722",
          },
          encapsulation: "dot1q",
          inner_vlan: 0,
          ipx_access: 1000010782,
          outer_vlan: 1761,
          router_chassis: "A77501",
          router_mgmt_ip: "10.244.255.227",
          router_name: "bru-23-r309",
          router_port: "1/1/c5/1",
          router_system_ip: "10.244.255.227",
          router_vendor: "Nokia",
          tunnel_side: "A",
        },
        attributes: {
          owner_account_id: "666023226898",
        },
        ipx_access: [1000010782, 1000013639],
        cloud_service_provider: "AWS",
      },
      customer_endpoint: {
        allocated: {
          router_chassis: "A77501",
          router_mgmt_ip: "10.244.255.228",
          router_name: "bru-23-r310",
          router_port: "1/1/c4/1",
          router_system_ip: "10.244.255.228",
          router_vendor: "Nokia",
          tunnel_side: "B",
        },
        inner_vlan: 567,
        ipx_access: 1000312922,
        outer_vlan: 1234,
        encapsulation: "qinq",
      },
    },
    {
      sirius: {
        allocated_resources: {
          csp: {
            l2serv: "ServiceCircuit:9909096021283094023",
            offnet: "Off_netConnection:9925350937850106458",
            subintf: "VLANSub_Interface:9945864435085319126",
            supplier_info: "SupplierInfo:9945766338877253645",
          },
          customer: {
            l2serv: "ServiceCircuit:9013077512666553361",
            subintf: "VLANSub_Interface:9205033890908733782",
          },
          mpls: "Pseudowire:9071307534774858439",
          serv: "ServiceCircuit:9682657472594612412",
        },
      },
      allocated: { vc_id: 306319 },
      service_id: 5527919402,
      csp_endpoint: {
        region: "us-east-1",
        allocated: {
          attributes: { interconnect_connection_id: "dxcon-fgyqb722" },
          encapsulation: "dot1q",
          inner_vlan: 0,
          ipx_access: 1000013639,
          outer_vlan: 1762,
          router_chassis: "AL77503E",
          router_mgmt_ip: "10.244.255.228",
          router_name: "bru-23-r310",
          router_port: "1/1/c2/1",
          router_system_ip: "10.244.255.228",
          router_vendor: "Nokia",
          tunnel_side: "A",
        },
        attributes: {
          owner_account_id: "666023226898",
        },
        ipx_access: [1000010782, 1000013639],
        cloud_service_provider: "AWS",
      },
      customer_endpoint: {
        allocated: {
          router_chassis: "A77501",
          router_mgmt_ip: "10.244.255.227",
          router_name: "bru-23-r309",
          router_port: "1/1/c6/1",
          router_system_ip: "10.244.255.227",
          router_vendor: "Nokia",
          tunnel_side: "B",
        },
        inner_vlan: 567,
        ipx_access: 1000312923,
        outer_vlan: 1234,
        encapsulation: "qinq",
      },
    },
  ],
  customer: "BEL/INMANT",
  order_id: 9764848531585,
  service_mtu: 1500,
  end_customer: "m1demo",
  protection_scheme: "CC_PROTECTED",
  service_bandwidth: 50000,
  customer_locations: "",
  iso_release: "",
  network: "local",
};

const attrsValues = {
  string: "string",
  editableString: "editableString",
  "string?": "string?",
  "editableString?": "editableString?",
  bool: true,
  editableBool: true,
  "bool?": true,
  "editableBool?": true,
  "string[]": ["string"],
  "editableString[]": ["editable", "String"],
  "string[]?": ["string?"],
  "editableString[]?": ["editable", "String?"],
  enum: "OPTION_ONE",
  editableEnum: "OPTION_ONE",
  "enum?": "OPTION_ONE",
  "editableEnum?": "OPTION_ONE",
  dict: { test: "value" },
  editableDict: { test: "value" },
  "dict?": { test: "value" },
  "editableDict?": { test: "value" },
};
const embedded = {
  ...attrsValues,
  embedded: [attrsValues],
  editableEmbedded: [attrsValues],
  "embedded?": [attrsValues],
  "editableEmbedded?": [attrsValues],
};
export const b: InstanceAttributeModel = {
  ...attrsValues,
  embedded_base: [embedded],
  editableEmbedded_base: [embedded],
  optionalEmbedded_base: [embedded],
  editableOptionalEmbedded_base: [embedded],
};
