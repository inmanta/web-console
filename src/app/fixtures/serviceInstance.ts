import { IServiceInstanceModel } from "@app/Models/LsmModels";

export const serviceInstance = ({
  id: "bd200aec-4f80-45e1-b2ad-137c442c68b8",
  environment: "621129e4-7fe8-434c-b6cb-ea31d36e1bbc",
  service_entity: "cloudconnectv2",
  version: 3,
  config: {},
  state: "creating",
  candidate_attributes: null,
  active_attributes: {
    circuits: [
      {
        sirius: {},
        allocated: {},
        service_id: 9489784960,
        csp_endpoint: {
          region: "us-east-1",
          allocated: {},
          attributes: {
            owner_account_id: "666023226898",
          },
          ipx_access: [1000010782, 1000013639],
          cloud_service_provider: "AWS",
        },
        customer_endpoint: {
          allocated: {},
          inner_vlan: 567,
          ipx_access: 1000312922,
          outer_vlan: 1234,
          encapsulation: "qinq",
        },
      },
      {
        sirius: {},
        allocated: {},
        service_id: 5527919402,
        csp_endpoint: {
          region: "us-east-1",
          allocated: {},
          attributes: {
            owner_account_id: "666023226898",
          },
          ipx_access: [1000010782, 1000013639],
          cloud_service_provider: "AWS",
        },
        customer_endpoint: {
          allocated: {},
          inner_vlan: 567,
          ipx_access: 1000312923,
          outer_vlan: 1234,
          encapsulation: "qinq",
        },
      },
    ],
    customer: "BEL/INMANT",
    order_id: 9764848531585023834,
    service_mtu: 1500,
    end_customer: "m1demo",
    protection_scheme: "CC_PROTECTED",
    service_bandwidth: 50000,
    allocated_attributes_storage: {
      "circuits.0.allocated.vc_id": 308024,
      "circuits.1.allocated.vc_id": 306319,
      "circuits.0.sirius.allocated_resources.mpls":
        "Pseudowire:9612436223370978017",
      "circuits.0.sirius.allocated_resources.serv":
        "ServiceCircuit:9964037042282377708",
      "circuits.1.sirius.allocated_resources.mpls":
        "Pseudowire:9071307534774858439",
      "circuits.1.sirius.allocated_resources.serv":
        "ServiceCircuit:9682657472594612412",
      "circuits.0.csp_endpoint.allocated.inner_vlan": 0,
      "circuits.0.csp_endpoint.allocated.ipx_access": 1000010782,
      "circuits.0.csp_endpoint.allocated.outer_vlan": 1761,
      "circuits.1.csp_endpoint.allocated.inner_vlan": 0,
      "circuits.1.csp_endpoint.allocated.ipx_access": 1000013639,
      "circuits.1.csp_endpoint.allocated.outer_vlan": 1762,
      "circuits.0.csp_endpoint.allocated.router_name": "bru-23-r309",
      "circuits.0.csp_endpoint.allocated.router_port": "1/1/c5/1",
      "circuits.0.csp_endpoint.allocated.tunnel_side": "A",
      "circuits.1.csp_endpoint.allocated.router_name": "bru-23-r310",
      "circuits.1.csp_endpoint.allocated.router_port": "1/1/c2/1",
      "circuits.1.csp_endpoint.allocated.tunnel_side": "A",
      "circuits.0.csp_endpoint.allocated.encapsulation": "dot1q",
      "circuits.0.csp_endpoint.allocated.router_vendor": "Nokia",
      "circuits.1.csp_endpoint.allocated.encapsulation": "dot1q",
      "circuits.1.csp_endpoint.allocated.router_vendor": "Nokia",
      "circuits.0.csp_endpoint.allocated.router_chassis": "A77501",
      "circuits.0.csp_endpoint.allocated.router_mgmt_ip": "10.244.255.227",
      "circuits.1.csp_endpoint.allocated.router_chassis": "AL77503E",
      "circuits.1.csp_endpoint.allocated.router_mgmt_ip": "10.244.255.228",
      "circuits.0.sirius.allocated_resources.csp\\.l2serv":
        "ServiceCircuit:9752044105474558994",
      "circuits.0.sirius.allocated_resources.csp\\.offnet":
        "Off_netConnection:9471938946361154586",
      "circuits.1.sirius.allocated_resources.csp\\.l2serv":
        "ServiceCircuit:9909096021283094023",
      "circuits.1.sirius.allocated_resources.csp\\.offnet":
        "Off_netConnection:9925350937850106458",
      "circuits.0.csp_endpoint.allocated.router_system_ip": "10.244.255.227",
      "circuits.0.customer_endpoint.allocated.router_name": "bru-23-r310",
      "circuits.0.customer_endpoint.allocated.router_port": "1/1/c4/1",
      "circuits.0.customer_endpoint.allocated.tunnel_side": "B",
      "circuits.0.sirius.allocated_resources.csp\\.subintf":
        "VLANSub_Interface:9451362773897813937",
      "circuits.1.csp_endpoint.allocated.router_system_ip": "10.244.255.228",
      "circuits.1.customer_endpoint.allocated.router_name": "bru-23-r309",
      "circuits.1.customer_endpoint.allocated.router_port": "1/1/c6/1",
      "circuits.1.customer_endpoint.allocated.tunnel_side": "B",
      "circuits.1.sirius.allocated_resources.csp\\.subintf":
        "VLANSub_Interface:9945864435085319126",
      "circuits.0.customer_endpoint.allocated.router_vendor": "Nokia",
      "circuits.1.customer_endpoint.allocated.router_vendor": "Nokia",
      "circuits.0.customer_endpoint.allocated.router_chassis": "A77501",
      "circuits.0.customer_endpoint.allocated.router_mgmt_ip": "10.244.255.228",
      "circuits.1.customer_endpoint.allocated.router_chassis": "A77501",
      "circuits.1.customer_endpoint.allocated.router_mgmt_ip": "10.244.255.227",
      "circuits.0.sirius.allocated_resources.customer\\.l2serv":
        "ServiceCircuit:9394936770390002751",
      "circuits.1.sirius.allocated_resources.customer\\.l2serv":
        "ServiceCircuit:9013077512666553361",
      "circuits.0.customer_endpoint.allocated.router_system_ip":
        "10.244.255.228",
      "circuits.0.sirius.allocated_resources.customer\\.subintf":
        "VLANSub_Interface:9828995368058681852",
      "circuits.1.customer_endpoint.allocated.router_system_ip":
        "10.244.255.227",
      "circuits.1.sirius.allocated_resources.customer\\.subintf":
        "VLANSub_Interface:9205033890908733782",
      "circuits.0.sirius.allocated_resources.csp\\.supplier_info":
        "SupplierInfo:9278636080794640185",
      "circuits.1.sirius.allocated_resources.csp\\.supplier_info":
        "SupplierInfo:9945766338877253645",
      "circuits.0.csp_endpoint.allocated.attributes.interconnect_connection_id":
        "dxcon-fgyqb722",
      "circuits.1.csp_endpoint.allocated.attributes.interconnect_connection_id":
        "dxcon-fgyqb722",
    },
  },
  rollback_attributes: null,
  created_at: "2021-01-11T12:55:25.961567",
  last_updated: "2021-01-11T12:55:52.180900",
  callback: [],
  deleted: false,
} as unknown) as IServiceInstanceModel;
