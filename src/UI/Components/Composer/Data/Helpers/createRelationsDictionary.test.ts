import { createRelationsDictionary } from './createRelationsDictionary';
import { ServiceModel, EmbeddedEntity, InterServiceRelation } from '@/Core/Domain/ServiceModel';

// Helper function to create a basic service model
const createServiceModel = (name: string, overrides: Partial<ServiceModel> = {}): ServiceModel => ({
    name,
    environment: 'test',
    lifecycle: {
        initial_state: 'active',
        states: [
            { name: 'active', deleted: false, export_resources: false, purge_resources: false }
        ],
        transfers: []
    },
    attributes: [],
    config: {},
    embedded_entities: [],
    inter_service_relations: [],
    owned_entities: [],
    owner: null,
    ...overrides
});

// Helper function to create an embedded entity
const createEmbeddedEntity = (name: string, type: string, overrides: Partial<EmbeddedEntity> = {}): EmbeddedEntity => ({
    name,
    type,
    lower_limit: 1,
    upper_limit: 1,
    modifier: 'rw',
    attributes: [],
    embedded_entities: [],
    inter_service_relations: [],
    ...overrides
});

// Helper function to create an inter-service relation
const createInterServiceRelation = (name: string, entityType: string = 'service'): InterServiceRelation => ({
    name,
    entity_type: entityType,
    lower_limit: 1,
    upper_limit: 1,
    modifier: 'rw'
});

describe('createRelationsDictionary', () => {
    it('should create bidirectional relations for direct inter-service relations', () => {
        const catalog: ServiceModel[] = [
            createServiceModel('ServiceA', {
                inter_service_relations: [createInterServiceRelation('ServiceB')]
            }),
            createServiceModel('ServiceB')
        ];

        const result = createRelationsDictionary(catalog);

        expect(result['ServiceA']['ServiceB']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceB']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
    });

    it('should handle services with no relations', () => {
        const catalog: ServiceModel[] = [createServiceModel('ServiceA')];

        const result = createRelationsDictionary(catalog);

        expect(result['ServiceA']).toBeUndefined();
    });

    it('should include embedded entities as relations', () => {
        const catalog: ServiceModel[] = [
            createServiceModel('ServiceA', {
                embedded_entities: [createEmbeddedEntity('EmbeddedEntity1', 'EntityType1')]
            })
        ];

        const result = createRelationsDictionary(catalog);

        expect(result['ServiceA']['EmbeddedEntity1']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['EmbeddedEntity1']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
    });

    it('should include inter-service relations from embedded entities', () => {
        const catalog: ServiceModel[] = [
            createServiceModel('ServiceA', {
                embedded_entities: [
                    createEmbeddedEntity('EmbeddedEntity1', 'EntityType1', {
                        inter_service_relations: [createInterServiceRelation('ServiceB')]
                    })
                ]
            }),
            createServiceModel('ServiceB')
        ];

        const result = createRelationsDictionary(catalog);

        expect(result['ServiceA']['EmbeddedEntity1']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceA']['ServiceB']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['EmbeddedEntity1']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceB']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
    });

    it('should handle deep nested embedded entities recursively', () => {
        const catalog: ServiceModel[] = [
            createServiceModel('ServiceA', {
                inter_service_relations: [createInterServiceRelation('ServiceD')],
                embedded_entities: [
                    createEmbeddedEntity('Level1Entity', 'Level1Type', {
                        inter_service_relations: [createInterServiceRelation('ServiceC')],
                        embedded_entities: [
                            createEmbeddedEntity('Level2Entity', 'Level2Type', {
                                embedded_entities: [
                                    createEmbeddedEntity('Level3Entity', 'Level3Type', {
                                        inter_service_relations: [createInterServiceRelation('ServiceB')]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            createServiceModel('ServiceB'),
            createServiceModel('ServiceC'),
            createServiceModel('ServiceD')
        ];

        const result = createRelationsDictionary(catalog);

        // ServiceA should be related to all entities and services found in its hierarchy with default limits
        expect(result['ServiceA']['ServiceD']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceA']['Level1Entity']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceA']['ServiceC']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceA']['Level2Entity']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceA']['Level3Entity']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceA']['ServiceB']).toEqual({ lower_limit: 1, upper_limit: 1 });

        // Verify bidirectional relationships
        expect(result['ServiceD']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Level1Entity']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceC']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Level2Entity']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Level3Entity']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceB']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
    });

    it('should handle multiple embedded entities at the same level', () => {
        const catalog: ServiceModel[] = [
            createServiceModel('ServiceA', {
                embedded_entities: [
                    createEmbeddedEntity('EmbeddedEntity1', 'EntityType1', {
                        inter_service_relations: [createInterServiceRelation('ServiceB')]
                    }),
                    createEmbeddedEntity('EmbeddedEntity2', 'EntityType2', {
                        inter_service_relations: [createInterServiceRelation('ServiceC')]
                    })
                ]
            }),
            createServiceModel('ServiceB'),
            createServiceModel('ServiceC')
        ];

        const result = createRelationsDictionary(catalog);

        expect(result['ServiceA']['EmbeddedEntity1']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceA']['ServiceB']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceA']['EmbeddedEntity2']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceA']['ServiceC']).toEqual({ lower_limit: 1, upper_limit: 1 });

        expect(result['EmbeddedEntity1']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceB']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['EmbeddedEntity2']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceC']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
    });

    it('should handle empty embedded entities arrays', () => {
        const catalog: ServiceModel[] = [
            createServiceModel('ServiceA', {
                inter_service_relations: [createInterServiceRelation('ServiceB')]
            })
        ];

        const result = createRelationsDictionary(catalog);

        expect(result['ServiceA']['ServiceB']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceB']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
    });

    it('should handle complex mixed scenarios', () => {
        const catalog: ServiceModel[] = [
            createServiceModel('MainService', {
                inter_service_relations: [createInterServiceRelation('GatewayService')],
                embedded_entities: [
                    createEmbeddedEntity('ConfigEntity', 'Config', {
                        embedded_entities: [
                            createEmbeddedEntity('DatabaseConfig', 'Database', {
                                inter_service_relations: [createInterServiceRelation('DatabaseService')]
                            })
                        ]
                    }),
                    createEmbeddedEntity('AuthEntity', 'Auth', {
                        inter_service_relations: [createInterServiceRelation('AuthService')]
                    })
                ]
            }),
            createServiceModel('DatabaseService'),
            createServiceModel('AuthService'),
            createServiceModel('GatewayService')
        ];

        const result = createRelationsDictionary(catalog);

        expect(result['MainService']['GatewayService']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['MainService']['ConfigEntity']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['MainService']['DatabaseConfig']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['MainService']['DatabaseService']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['MainService']['AuthEntity']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['MainService']['AuthService']).toEqual({ lower_limit: 1, upper_limit: 1 });

        // Verify all bidirectional relationships
        expect(result['GatewayService']['MainService']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ConfigEntity']['MainService']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['DatabaseConfig']['MainService']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['DatabaseService']['MainService']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['AuthEntity']['MainService']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['AuthService']['MainService']).toEqual({ lower_limit: 1, upper_limit: 1 });
    });
});
