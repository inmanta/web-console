import { createStore } from "easy-peasy";
import { ResourceModel } from "@/Core";
import { resourcesSlice } from "./ResourcesSlice";

describe("ResourcesSlice", () => {
  const resources: ResourceModel[] = [
    {
      instanceId: "instance",
      resource_id:
        "fortigate::Config[fg101,config_id=system_dhcp_server_1],v=469",
      resource_state: "deployed",
    },
    {
      instanceId: "anotherInstance",
      resource_id: "openstack::VirtualMachine[openstack,name=fg101],v=469",
      resource_state: "deployed",
    },
  ];
  const initialState = {
    allIds: [
      "fortigate::Config[fg101,config_id=system_dhcp_server_1],v=469",
      "openstack::VirtualMachine[openstack,name=fg101],v=469",
    ],
    byId: {
      "fortigate::Config[fg101,config_id=system_dhcp_server_1],v=469":
        resources[0],
      "openstack::VirtualMachine[openstack,name=fg101],v=469": resources[1],
    },
  };
  it("Should add resources", () => {
    const store = createStore(resourcesSlice);
    const singleResource: ResourceModel[] = [resources[0]];
    store
      .getActions()
      .addResources({ instanceId: "instance", resources: singleResource });
    expect(store.getState().allIds).toEqual([
      "fortigate::Config[fg101,config_id=system_dhcp_server_1],v=469",
    ]);
  });
  it("Should filter resources of a specific instance", () => {
    const store = createStore(resourcesSlice, { initialState });
    expect(store.getState().resourcesOfInstance("instance")).toEqual([
      resources[0],
    ]);
  });
  it.skip("Should refresh single resource", () => {
    const refreshedResource = {
      instanceId: "instance",
      resource_id:
        "fortigate::Config[fg101,config_id=system_dhcp_server_1],v=471",
      resource_state: "deployed",
    };
    const store = createStore(resourcesSlice);
    const singleResource: ResourceModel[] = [resources[0]];
    store
      .getActions()
      .addResources({ instanceId: "instance", resources: singleResource });
    expect(store.getState().allIds).toEqual([
      "fortigate::Config[fg101,config_id=system_dhcp_server_1],v=469",
    ]);
    store.getActions().addResources({
      instanceId: "instance",
      resources: [refreshedResource],
    });
    expect(store.getState().allIds).toEqual([refreshedResource.resource_id]);
    expect(store.getState().allIds).toHaveLength(1);
  });
  it.skip("Should refresh multiple resources", () => {
    const updatedResources = [
      {
        instanceId: "instance",
        resource_id:
          "fortigate::Config[fg101,config_id=system_dhcp_server_1],v=471",
        resource_state: "deployed",
      },
      {
        instanceId: "instance",
        resource_id: "openstack::VirtualMachine[openstack,name=fg101],v=471",
        resource_state: "deployed",
      },
    ];
    const store = createStore(resourcesSlice);
    const singleResource: ResourceModel[] = [resources[0]];
    store
      .getActions()
      .addResources({ instanceId: "instance", resources: singleResource });
    expect(store.getState().allIds).toEqual([
      "fortigate::Config[fg101,config_id=system_dhcp_server_1],v=469",
    ]);
    store
      .getActions()
      .addResources({ instanceId: "instance", resources: updatedResources });
    expect(store.getState().allIds).toEqual([
      updatedResources[0].resource_id,
      updatedResources[1].resource_id,
    ]);
    expect(store.getState().allIds).toHaveLength(2);
    expect(Object.keys(store.getState().byId)).toHaveLength(2);
  });
});
