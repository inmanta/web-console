import { createStore } from "easy-peasy";
import { ResourceModel, ServiceInstanceModel } from "@/Core";
import { resourcesSlice, serviceInstancesSlice } from "@/UI";

describe("Lsm models", () => {
  describe("Service instance store", () => {
    const instances: ServiceInstanceModel[] = [
      {
        active_attributes: {},
        callback: [],
        candidate_attributes: {},
        deleted: false,
        environment: "env-id",
        id: "instance",
        last_updated: "2019-10-16T07:43:16.748302",
        created_at: "2019-10-16T07:43:16.748302",
        rollback_attributes: {},
        service_entity: "test-service",
        state: "terminated",
        version: 1,
      },
      {
        active_attributes: {},
        callback: [],
        candidate_attributes: {},
        deleted: false,
        environment: "env-id",
        id: "anotherInstance",
        last_updated: "2019-10-16T08:43:16.748302",
        created_at: "2019-10-16T08:43:16.748302",
        rollback_attributes: {},
        service_entity: "test-service",
        state: "up",
        version: 1,
      },
    ];
    const initialState = {
      allIds: ["instance", "anotherInstance"],
      byId: {
        anotherInstance: instances[1],
        instance: instances[0],
      },
    };
    it("Should add instances", () => {
      const store = createStore(serviceInstancesSlice);
      store.getActions().addInstances(instances);
      expect(store.getState().allIds).toEqual(["instance", "anotherInstance"]);
    });
    it("Should update instances", () => {
      const store = createStore(serviceInstancesSlice, { initialState });
      store.getActions().updateInstances({
        instances: [
          {
            active_attributes: {},
            callback: [],
            candidate_attributes: {},
            deleted: false,
            environment: "env-id",
            id: "instance",
            last_updated: "2019-10-16T11:43:16.748302",
            created_at: "2019-10-16T11:43:16.748302",
            rollback_attributes: {},
            service_entity: "test-service",
            state: "up",
            version: 3,
          },
        ],
        serviceName: "test-service",
      });
      expect(store.getState().byId.instance.state).toEqual("up");
    });
    it("Should not update instances, if the content is the same", () => {
      const store = createStore(serviceInstancesSlice, {
        initialState,
        mockActions: true,
      });
      const payload = { serviceName: "test-service", instances };
      store.getActions().updateInstances(payload);
      expect(store.getMockedActions()).toEqual([
        { type: "@thunk.updateInstances(start)", payload },
        { type: "@thunk.updateInstances(success)", payload },
      ]);
    });
  });
  describe("Resource store", () => {
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
    it("Should refresh single resource", () => {
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
    it("Should refresh multiple resources", () => {
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
});
