import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { ServiceInstance } from "@/Test";
import { PathHelper, TreeExpansionManager } from "./Helpers";
import {
  InventoryAttributeHelper,
  InventoryTreeTableHelper,
} from "./Inventory";
import { TreeTable } from "./TreeTable";

export default {
  title: "TreeTable",
  component: TreeTable,
};

const Template: Story<ComponentProps<typeof TreeTable>> = (args) => (
  <TreeTable {...args} />
);

export const Simple = Template.bind({});
Simple.args = {
  treeTableHelper: new InventoryTreeTableHelper(
    new PathHelper("$"),
    new TreeExpansionManager("$"),
    new InventoryAttributeHelper("$"),
    {
      candidate: {
        a: {
          b: {
            c: `{"attr1":["a","b"],"attr2":{"val1":"val2"},"attr10":15,"id_attr":"test1","embedded_multi":[{"attr3":0,"embedded_single":{"attr4":1}}]}`,
          },
        },
        b: 1234,
        c: false,
        d: "blabla long longlonglonglonglonglonglong value that's not a json",
        e: { f: true, g: [], h: { i: { j: 1234 } } },
        f: { g: "123" },
      },
      active: null,
      rollback: null,
    }
  ),
};

export const FlatOnly = Template.bind({});
FlatOnly.args = {
  treeTableHelper: new InventoryTreeTableHelper(
    new PathHelper("$"),
    new TreeExpansionManager("$"),
    new InventoryAttributeHelper("$"),
    {
      candidate: {
        b: 1234,
        c: false,
        d: "blabla",
      },
      active: null,
      rollback: null,
    }
  ),
};

export const RealData = Template.bind({});
RealData.args = {
  treeTableHelper: new InventoryTreeTableHelper(
    new PathHelper("$"),
    new TreeExpansionManager("$"),
    new InventoryAttributeHelper("$"),
    {
      candidate: null,
      active: ServiceInstance.a.active_attributes,
      rollback: null,
    }
  ),
};

export const MultipleAttributes = Template.bind({});
MultipleAttributes.args = {
  treeTableHelper: new InventoryTreeTableHelper(
    new PathHelper("$"),
    new TreeExpansionManager("$"),
    new InventoryAttributeHelper("$"),
    {
      candidate: {
        a: {
          b: {
            c: "candidate candidate candidate ",
            d: "candidate candidate candidate ",
          },
        },
      },
      active: { a: { b: { c: "active active active active ", d: "" } } },
      rollback: { a: { b: { c: "rollback rollback rollback ", d: "" } } },
    }
  ),
};

export const LongJsonAttributes = () => (
  <TreeTable
    treeTableHelper={
      new InventoryTreeTableHelper(
        new PathHelper("$"),
        new TreeExpansionManager("$"),
        new InventoryAttributeHelper("$"),
        {
          candidate: {
            a: {
              b: {
                c: `{"attr1":["a","b"],"attr2":{"val1":"val2"},"attr10":15,"id_attr":"test1","embedded_multi":[{"attr3":0,"embedded_single":{"attr4":1}}]}`,
              },
            },
            d: "long long long long long long long long value that's not a json",
          },
          active: null,
          rollback: null,
        }
      )
    }
  />
);

export const RealDataJson = () => (
  <TreeTable
    treeTableHelper={
      new InventoryTreeTableHelper(
        new PathHelper("$"),
        new TreeExpansionManager("$"),
        new InventoryAttributeHelper("$"),
        {
          candidate: {
            circuits: [
              {
                endpoints: [
                  {
                    uni: { href: "ipxa://1000320447" },
                    side: "a",
                    inner_vlan: null,
                    outer_vlan: 650,
                  },
                  {
                    uni: { href: "ipxa://1000327471" },
                    side: "z",
                    inner_vlan: null,
                    outer_vlan: 651,
                  },
                ],
                qos_class: "default",
                service_id: 4795749073,
                service_bandwidth: 2000000,
              },
            ],
            order_id: 1001,
            allocated: {
              "circuits[service_id=4795749073].vcid": 10100,
              "circuits[service_id=4795749073].l2vpn":
                '{"id": 9561868387881770947, "name": "epipe-BEL/INMANT-4795749073"}',
              "circuits[service_id=4795749073].service_circuit":
                '{"id": 9668042517975422586, "name": "R subscriber-south-west-2 VPOP-R subscriber-north-east-2 VPOP L2SERV1"}',
              "circuits[service_id=4795749073].endpoints[side=a].uni._uni":
                '{"id": "ipxa://1000320447", "es_id": null, "es_name": null, "ports": [{"id": "9651489808241967142", "name": "1/1/c2/1", "network_element": {"id": "9159672031749792578", "name": "router-south", "router_ip": "10.255.255.3", "device": {"mgmt_ip": "172.20.20.13", "mgmt_port": 830, "vendor": "Nokia", "model": "A77501", "os": "TiMos", "version": "20.10", "username_env": "NETCONF_DEVICE_USER", "password_env": "NETCONF_DEVICE_PASSWORD"}}, "codif": {"local_name": "router-south", "remote_name": "r subscriber-south-west-2 vpop", "customer_ethlink": {"id": 9769645223853247591}, "customer_ne": {"id": 9858767581050034131, "name": "subscriber-south-west-2"}, "port": {"id": 9651489808241967142, "name": "100GbE/1/1/c2/1"}, "ne": {"id": 9159672031749792578, "name": "router-south"}, "location": {"id": 9997112119000885336, "name": "router-south"}, "operator": {"id": 9148951446513867319, "name": "BEL/BICS BE0000"}, "op_ne": {"id": 9723071869272127746, "name": "R subscriber-south-west-2 VPOP"}, "op_location": {"id": 9356657313768267965, "name": "R subscriber-south-west-2 VPOP"}, "op_operator": {"id": 9148951446513860728, "name": "BEL/Proximus BE0120"}, "men": {"id": 9923504255782224945, "name": "router-south"}, "mesh": {"id": 9074251386478655766}}, "service_circuit": {"id": 9720363570628586309, "name": "router-south-R subscriber-south-west-2 VPOP L2SERV1"}}, {"id": "9937856101488768433", "name": "1/1/c6/1", "network_element": {"id": "9436964716780040219", "name": "router-west", "router_ip": "10.255.255.4", "device": {"mgmt_ip": "172.20.20.14", "mgmt_port": 830, "vendor": "Nokia", "model": "A77501", "os": "TiMos", "version": "20.10", "username_env": "NETCONF_DEVICE_USER", "password_env": "NETCONF_DEVICE_PASSWORD"}}, "codif": {"local_name": "router-west", "remote_name": "r subscriber-south-west-2 vpop", "customer_ethlink": {"id": 9769645223853247591}, "customer_ne": {"id": 9858767581050034131, "name": "subscriber-south-west-2"}, "port": {"id": 9937856101488768433, "name": "100GbE/1/1/c6/1"}, "ne": {"id": 9436964716780040219, "name": "router-west"}, "location": {"id": 9498625933532097489, "name": "router-west"}, "operator": {"id": 9148951446513867319, "name": "BEL/BICS BE0000"}, "op_ne": {"id": 9723071869272127746, "name": "R subscriber-south-west-2 VPOP"}, "op_location": {"id": 9356657313768267965, "name": "R subscriber-south-west-2 VPOP"}, "op_operator": {"id": 9148951446513860728, "name": "BEL/Proximus BE0120"}, "men": {"id": 9693495423555424091, "name": "router-west"}, "mesh": {"id": 9074251386478655766}}, "service_circuit": {"id": 9410738338013876128, "name": "router-west-R subscriber-south-west-2 VPOP L2SERV1"}}]}',
              "circuits[service_id=4795749073].endpoints[side=z].uni._uni":
                '{"id": "ipxa://1000327688", "es_id": null, "es_name": null, "ports": [{"id": "9942737502596509440", "name": "1/1/c3/1", "network_element": {"id": "9286592103331157484", "name": "router-north", "router_ip": "10.255.255.1", "device": {"mgmt_ip": "172.20.20.11", "mgmt_port": 830, "vendor": "Nokia", "model": "A77501", "os": "TiMos", "version": "20.10", "username_env": "NETCONF_DEVICE_USER", "password_env": "NETCONF_DEVICE_PASSWORD"}}, "codif": {"local_name": "router-north", "remote_name": "r subscriber-north-east-2 vpop", "customer_ethlink": {"id": 9232006973908880707}, "customer_ne": {"id": 9103008257421989756, "name": "subscriber-north-east-2"}, "port": {"id": 9942737502596509440, "name": "100GbE/1/1/c3/1"}, "ne": {"id": 9286592103331157484, "name": "router-north"}, "location": {"id": 9883364087992358283, "name": "router-north"}, "operator": {"id": 9148951446513867319, "name": "BEL/BICS BE0000"}, "op_ne": {"id": 9030420414464323925, "name": "R subscriber-north-east-2 VPOP"}, "op_location": {"id": 9385805273649257538, "name": "R subscriber-north-east-2 VPOP"}, "op_operator": {"id": 9148951446513860728, "name": "BEL/Proximus BE0120"}, "men": {"id": 9079304936290764865, "name": "router-north"}, "mesh": {"id": 9239456323707937007}}, "service_circuit": {"id": 9787594031072990122, "name": "router-north-R subscriber-north-east-2 VPOP L2SERV1"}}, {"id": "9999394907738809821", "name": "1/1/c7/1", "network_element": {"id": "9667516357637756042", "name": "router-east", "router_ip": "10.255.255.2", "device": {"mgmt_ip": "172.20.20.12", "mgmt_port": 830, "vendor": "Nokia", "model": "A77501", "os": "TiMos", "version": "20.10", "username_env": "NETCONF_DEVICE_USER", "password_env": "NETCONF_DEVICE_PASSWORD"}}, "codif": {"local_name": "router-east", "remote_name": "r subscriber-north-east-2 vpop", "customer_ethlink": {"id": 9232006973908880707}, "customer_ne": {"id": 9103008257421989756, "name": "subscriber-north-east-2"}, "port": {"id": 9999394907738809821, "name": "100GbE/1/1/c7/1"}, "ne": {"id": 9667516357637756042, "name": "router-east"}, "location": {"id": 9096536557796798536, "name": "router-east"}, "operator": {"id": 9148951446513867319, "name": "BEL/BICS BE0000"}, "op_ne": {"id": 9030420414464323925, "name": "R subscriber-north-east-2 VPOP"}, "op_location": {"id": 9385805273649257538, "name": "R subscriber-north-east-2 VPOP"}, "op_operator": {"id": 9148951446513860728, "name": "BEL/Proximus BE0120"}, "men": {"id": 9019452374982241979, "name": "router-east"}, "mesh": {"id": 9239456323707937007}}, "service_circuit": {"id": 9344830815923002143, "name": "router-east-R subscriber-north-east-2 VPOP L2SERV1"}}]}',
            },
            documentation: { customer: "BEL/INMANT", end_customer: "Inmanta" },
          },
          active: {
            circuits: [
              {
                endpoints: [
                  {
                    uni: { href: "ipxa://1000320447" },
                    side: "a",
                    inner_vlan: null,
                    outer_vlan: 650,
                  },
                  {
                    uni: { href: "ipxa://1000327688" },
                    side: "z",
                    inner_vlan: null,
                    outer_vlan: 651,
                  },
                ],
                qos_class: "default",
                service_id: 4795749073,
                service_bandwidth: 2000000,
              },
            ],
            order_id: 1001,
            allocated: {
              "circuits[service_id=4795749073].vcid": 10100,
              "circuits[service_id=4795749073].l2vpn":
                '{"id": 9561868387881770947, "name": "epipe-BEL/INMANT-4795749073"}',
              "circuits[service_id=4795749073].service_circuit":
                '{"id": 9668042517975422586, "name": "R subscriber-south-west-2 VPOP-R subscriber-north-east-2 VPOP L2SERV1"}',
              "circuits[service_id=4795749073].endpoints[side=a].uni._uni":
                '{"id": "ipxa://1000320447", "es_id": null, "es_name": null, "ports": [{"id": "9651489808241967142", "name": "1/1/c2/1", "network_element": {"id": "9159672031749792578", "name": "router-south", "router_ip": "10.255.255.3", "device": {"mgmt_ip": "172.20.20.13", "mgmt_port": 830, "vendor": "Nokia", "model": "A77501", "os": "TiMos", "version": "20.10", "username_env": "NETCONF_DEVICE_USER", "password_env": "NETCONF_DEVICE_PASSWORD"}}, "codif": {"local_name": "router-south", "remote_name": "r subscriber-south-west-2 vpop", "customer_ethlink": {"id": 9769645223853247591}, "customer_ne": {"id": 9858767581050034131, "name": "subscriber-south-west-2"}, "port": {"id": 9651489808241967142, "name": "100GbE/1/1/c2/1"}, "ne": {"id": 9159672031749792578, "name": "router-south"}, "location": {"id": 9997112119000885336, "name": "router-south"}, "operator": {"id": 9148951446513867319, "name": "BEL/BICS BE0000"}, "op_ne": {"id": 9723071869272127746, "name": "R subscriber-south-west-2 VPOP"}, "op_location": {"id": 9356657313768267965, "name": "R subscriber-south-west-2 VPOP"}, "op_operator": {"id": 9148951446513860728, "name": "BEL/Proximus BE0120"}, "men": {"id": 9923504255782224945, "name": "router-south"}, "mesh": {"id": 9074251386478655766}}, "service_circuit": {"id": 9720363570628586309, "name": "router-south-R subscriber-south-west-2 VPOP L2SERV1"}}, {"id": "9937856101488768433", "name": "1/1/c6/1", "network_element": {"id": "9436964716780040219", "name": "router-west", "router_ip": "10.255.255.4", "device": {"mgmt_ip": "172.20.20.14", "mgmt_port": 830, "vendor": "Nokia", "model": "A77501", "os": "TiMos", "version": "20.10", "username_env": "NETCONF_DEVICE_USER", "password_env": "NETCONF_DEVICE_PASSWORD"}}, "codif": {"local_name": "router-west", "remote_name": "r subscriber-south-west-2 vpop", "customer_ethlink": {"id": 9769645223853247591}, "customer_ne": {"id": 9858767581050034131, "name": "subscriber-south-west-2"}, "port": {"id": 9937856101488768433, "name": "100GbE/1/1/c6/1"}, "ne": {"id": 9436964716780040219, "name": "router-west"}, "location": {"id": 9498625933532097489, "name": "router-west"}, "operator": {"id": 9148951446513867319, "name": "BEL/BICS BE0000"}, "op_ne": {"id": 9723071869272127746, "name": "R subscriber-south-west-2 VPOP"}, "op_location": {"id": 9356657313768267965, "name": "R subscriber-south-west-2 VPOP"}, "op_operator": {"id": 9148951446513860728, "name": "BEL/Proximus BE0120"}, "men": {"id": 9693495423555424091, "name": "router-west"}, "mesh": {"id": 9074251386478655766}}, "service_circuit": {"id": 9410738338013876128, "name": "router-west-R subscriber-south-west-2 VPOP L2SERV1"}}]}',
              "circuits[service_id=4795749073].endpoints[side=z].uni._uni":
                '{"id": "ipxa://1000327688", "es_id": null, "es_name": null, "ports": [{"id": "9942737502596509440", "name": "1/1/c3/1", "network_element": {"id": "9286592103331157484", "name": "router-north", "router_ip": "10.255.255.1", "device": {"mgmt_ip": "172.20.20.11", "mgmt_port": 830, "vendor": "Nokia", "model": "A77501", "os": "TiMos", "version": "20.10", "username_env": "NETCONF_DEVICE_USER", "password_env": "NETCONF_DEVICE_PASSWORD"}}, "codif": {"local_name": "router-north", "remote_name": "r subscriber-north-east-2 vpop", "customer_ethlink": {"id": 9232006973908880707}, "customer_ne": {"id": 9103008257421989756, "name": "subscriber-north-east-2"}, "port": {"id": 9942737502596509440, "name": "100GbE/1/1/c3/1"}, "ne": {"id": 9286592103331157484, "name": "router-north"}, "location": {"id": 9883364087992358283, "name": "router-north"}, "operator": {"id": 9148951446513867319, "name": "BEL/BICS BE0000"}, "op_ne": {"id": 9030420414464323925, "name": "R subscriber-north-east-2 VPOP"}, "op_location": {"id": 9385805273649257538, "name": "R subscriber-north-east-2 VPOP"}, "op_operator": {"id": 9148951446513860728, "name": "BEL/Proximus BE0120"}, "men": {"id": 9079304936290764865, "name": "router-north"}, "mesh": {"id": 9239456323707937007}}, "service_circuit": {"id": 9787594031072990122, "name": "router-north-R subscriber-north-east-2 VPOP L2SERV1"}}, {"id": "9999394907738809821", "name": "1/1/c7/1", "network_element": {"id": "9667516357637756042", "name": "router-east", "router_ip": "10.255.255.2", "device": {"mgmt_ip": "172.20.20.12", "mgmt_port": 830, "vendor": "Nokia", "model": "A77501", "os": "TiMos", "version": "20.10", "username_env": "NETCONF_DEVICE_USER", "password_env": "NETCONF_DEVICE_PASSWORD"}}, "codif": {"local_name": "router-east", "remote_name": "r subscriber-north-east-2 vpop", "customer_ethlink": {"id": 9232006973908880707}, "customer_ne": {"id": 9103008257421989756, "name": "subscriber-north-east-2"}, "port": {"id": 9999394907738809821, "name": "100GbE/1/1/c7/1"}, "ne": {"id": 9667516357637756042, "name": "router-east"}, "location": {"id": 9096536557796798536, "name": "router-east"}, "operator": {"id": 9148951446513867319, "name": "BEL/BICS BE0000"}, "op_ne": {"id": 9030420414464323925, "name": "R subscriber-north-east-2 VPOP"}, "op_location": {"id": 9385805273649257538, "name": "R subscriber-north-east-2 VPOP"}, "op_operator": {"id": 9148951446513860728, "name": "BEL/Proximus BE0120"}, "men": {"id": 9019452374982241979, "name": "router-east"}, "mesh": {"id": 9239456323707937007}}, "service_circuit": {"id": 9344830815923002143, "name": "router-east-R subscriber-north-east-2 VPOP L2SERV1"}}]}',
            },
            documentation: { customer: "BEL/INMANT", end_customer: "Inmanta" },
          },
          rollback: null,
        }
      )
    }
  />
);
