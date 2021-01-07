import { createStore } from 'easy-peasy';
import {
  serviceDictState,
  IServiceModel,
  IServiceInstanceModel,
  instanceDictState,
  resourceDictState,
  IResourceModel
} from './LsmModels';

describe('Lsm models', () => {
  describe('Service store', () => {
    const serviceModels: IServiceModel[] = [
      {
        attributes: [],
        environment: 'env-id',
        lifecycle: { initialState: '', states: [], transfers: [] },
        name: 'test_service'
      },
      {
        attributes: [],
        environment: 'env-id',
        lifecycle: { initialState: '', states: [], transfers: [] },
        name: 'another_test_service'
      }
    ];
    const initialState = {
      allIds: ['test_service', 'another_test_service'],
      byId: {
        another_test_service: serviceModels[1],
        test_service: serviceModels[0]
      }
    };

    it('Should add services to the store', () => {
      const store = createStore(serviceDictState);
      store.getActions().addServices(serviceModels);
      expect(store.getState().allIds).toEqual(['test_service', 'another_test_service']);
    });

    it('Should update services if updated content is different', () => {
      const updatedContent = [
        {
          attributes: [],
          environment: 'env-id',
          lifecycle: { initialState: 'initial_state', states: [], transfers: [] },
          name: 'test_service'
        }
      ];
      const store = createStore(serviceDictState, { initialState });
      store.getActions().updateServices(updatedContent);
      expect(store.getState().allIds).toEqual(['test_service']);
      expect(Object.keys(store.getState().byId)).toEqual(['test_service']);
    });

    it('Should not update services if updated content is the same', () => {
      const store = createStore(serviceDictState, { initialState, mockActions: true });
      store.getActions().updateServices(serviceModels);

      expect(store.getMockedActions()).toEqual([
        { type: '@thunk.updateServices(start)', payload: serviceModels },
        { type: '@thunk.updateServices(success)', payload: serviceModels }
      ]);
    });
    it('Should remove service from the store', () => {
      const store = createStore(serviceDictState);
      store.getActions().addServices(serviceModels);
      expect(store.getState().allIds).toEqual(['test_service', 'another_test_service']);
      store.getActions().removeSingleService('test_service');
      expect(store.getState().allIds).toEqual(['another_test_service']);
    });
  });
  describe('Service instance store', () => {
    const instances: IServiceInstanceModel[] = [
      {
        active_attributes: {},
        callback: [],
        candidate_attributes: {},
        deleted: false,
        environment: 'env-id',
        id: 'instance',
        last_updated: '2019-10-16T07:43:16.748302',
        rollback_attributes: {},
        service_entity: 'test-service',
        state: 'terminated',
        version: 1
      },
      {
        active_attributes: {},
        callback: [],
        candidate_attributes: {},
        deleted: false,
        environment: 'env-id',
        id: 'anotherInstance',
        last_updated: '2019-10-16T08:43:16.748302',
        rollback_attributes: {},
        service_entity: 'test-service',
        state: 'up',
        version: 1
      }
    ];
    const initialState = {
      allIds: ['instance', 'anotherInstance'],
      byId: {
        anotherInstance: instances[1],
        instance: instances[0]
      }
    };
    it('Should add instances', () => {
      const store = createStore(instanceDictState);
      store.getActions().addInstances(instances);
      expect(store.getState().allIds).toEqual(['instance', 'anotherInstance']);
    });
    it('Should update instances', () => {
      const store = createStore(instanceDictState, { initialState });
      store.getActions().updateInstances({
        instances: [
          {
            active_attributes: {},
            callback: [],
            candidate_attributes: {},
            deleted: false,
            environment: 'env-id',
            id: 'instance',
            last_updated: '2019-10-16T11:43:16.748302',
            rollback_attributes: {},
            service_entity: 'test-service',
            state: 'up',
            version: 3
          }
        ],
        serviceName: 'test-service'
      });
      expect(store.getState().byId.instance.state).toEqual('up');
    });
    it('Should not update instances, if the content is the same', () => {
      const store = createStore(instanceDictState, { initialState, mockActions: true });
      const payload = { serviceName: 'test-service', instances };
      store.getActions().updateInstances(payload);
      expect(store.getMockedActions()).toEqual([
        { type: '@thunk.updateInstances(start)', payload },
        { type: '@thunk.updateInstances(success)', payload }
      ]);
    });
  });
  describe('Resource store', () => {
    const resources: IResourceModel[] = [
      {
        instanceId: 'instance',
        resource_id: 'fortigate::Config[fg101,config_id=system_dhcp_server_1],v=469',
        resource_state: 'deployed'
      },
      {
        instanceId: 'anotherInstance',
        resource_id: 'openstack::VirtualMachine[openstack,name=fg101],v=469',
        resource_state: 'deployed'
      }
    ];
    const initialState = {
      allIds: [
        'fortigate::Config[fg101,config_id=system_dhcp_server_1],v=469',
        'openstack::VirtualMachine[openstack,name=fg101],v=469'
      ],
      byId: {
        'fortigate::Config[fg101,config_id=system_dhcp_server_1],v=469': resources[0],
        'openstack::VirtualMachine[openstack,name=fg101],v=469': resources[1]
      }
    };
    it('Should add resources', () => {
      const store = createStore(resourceDictState);
      const singleResource: IResourceModel[] = [resources[0]];
      store.getActions().addResources({ instanceId: 'instance', resources: singleResource });
      expect(store.getState().allIds).toEqual(['fortigate::Config[fg101,config_id=system_dhcp_server_1],v=469']);
    });
    it('Should filter resources of a specific instance', () => {
      const store = createStore(resourceDictState, { initialState });
      expect(store.getState().resourcesOfInstance('instance')).toEqual([resources[0]]);
    });
    it('Should refresh single resource', () => {
      const refreshedResource = {
        instanceId: 'instance',
        resource_id: 'fortigate::Config[fg101,config_id=system_dhcp_server_1],v=471',
        resource_state: 'deployed'
      };
      const store = createStore(resourceDictState);
      const singleResource: IResourceModel[] = [resources[0]];
      store.getActions().addResources({ instanceId: 'instance', resources: singleResource });
      expect(store.getState().allIds).toEqual(['fortigate::Config[fg101,config_id=system_dhcp_server_1],v=469']);
      store.getActions().addResources({ instanceId: 'instance', resources: [refreshedResource] });
      expect(store.getState().allIds).toEqual([refreshedResource.resource_id]);
      expect(store.getState().allIds).toHaveLength(1);
    });
    it('Should refresh multiple resources', () => {
      const updatedResources = [
        {
          instanceId: 'instance',
          resource_id: 'fortigate::Config[fg101,config_id=system_dhcp_server_1],v=471',
          resource_state: 'deployed'
        },
        {
          instanceId: 'instance',
          resource_id: 'openstack::VirtualMachine[openstack,name=fg101],v=471',
          resource_state: 'deployed'
        }
      ];
      const store = createStore(resourceDictState);
      const singleResource: IResourceModel[] = [resources[0]];
      store.getActions().addResources({ instanceId: 'instance', resources: singleResource });
      expect(store.getState().allIds).toEqual(['fortigate::Config[fg101,config_id=system_dhcp_server_1],v=469']);
      store.getActions().addResources({ instanceId: 'instance', resources: updatedResources });
      expect(store.getState().allIds).toEqual([updatedResources[0].resource_id, updatedResources[1].resource_id]);
      expect(store.getState().allIds).toHaveLength(2);
      expect(Object.keys(store.getState().byId)).toHaveLength(2);
    });
  });
});
