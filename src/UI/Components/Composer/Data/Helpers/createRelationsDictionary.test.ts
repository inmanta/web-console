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
const createInterServiceRelation = (
    name: string,
    entityType?: string,
    overrides: Partial<InterServiceRelation> = {}
): InterServiceRelation => ({
    name,
    entity_type: entityType ?? name,
    lower_limit: 1,
    upper_limit: 1,
    modifier: 'rw',
    ...overrides
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

    it('should use entity_type as the dictionary key when it differs from relation name', () => {
        const catalog: ServiceModel[] = [
            createServiceModel('ServiceA', {
                inter_service_relations: [createInterServiceRelation('uni', 'UserNetworkInterface')]
            }),
            createServiceModel('UserNetworkInterface')
        ];

        const result = createRelationsDictionary(catalog);

        expect(result['ServiceA']['UserNetworkInterface']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['UserNetworkInterface']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceA'].uni).toBeUndefined();
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

        expect(result['ServiceA']['EntityType1']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['EntityType1']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
    });

    it('should not enforce parent lower limits on embedded entities', () => {
        const catalog: ServiceModel[] = [
            createServiceModel('ServiceA', {
                embedded_entities: [createEmbeddedEntity('Endpoints', 'Endpoint', { lower_limit: 2 })]
            })
        ];

        const result = createRelationsDictionary(catalog);

        expect(result['ServiceA']['Endpoint']).toEqual({ lower_limit: 2, upper_limit: 1 });
        expect(result['Endpoint']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
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

        expect(result['ServiceA']['EntityType1']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['EntityType1']['ServiceB']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceB']['EntityType1']).toEqual({ lower_limit: 1, upper_limit: 1 });
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

        expect(result['ServiceA']['ServiceD']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceA']['Level1Type']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Level1Type']['ServiceC']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Level1Type']['Level2Type']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Level2Type']['Level3Type']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Level3Type']['ServiceB']).toEqual({ lower_limit: 1, upper_limit: 1 });

        expect(result['ServiceD']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Level1Type']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceC']['Level1Type']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Level2Type']['Level1Type']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Level3Type']['Level2Type']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceB']['Level3Type']).toEqual({ lower_limit: 1, upper_limit: 1 });
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

        expect(result['ServiceA']['EntityType1']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceA']['EntityType2']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['EntityType1']['ServiceB']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['EntityType2']['ServiceC']).toEqual({ lower_limit: 1, upper_limit: 1 });
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
        expect(result['MainService']['Config']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Config']['Database']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Database']['DatabaseService']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Auth']['AuthService']).toEqual({ lower_limit: 1, upper_limit: 1 });

        expect(result['GatewayService']['MainService']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Config']['MainService']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['Database']['Config']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['DatabaseService']['Database']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['AuthService']['Auth']).toEqual({ lower_limit: 1, upper_limit: 1 });
    });

    it('should skip read-only embedded entities and their relations', () => {
        const catalog: ServiceModel[] = [
            createServiceModel('ServiceA', {
                embedded_entities: [
                    createEmbeddedEntity('Details', 'Details', { modifier: 'r', lower_limit: 1, upper_limit: 1 })
                ]
            })
        ];

        const result = createRelationsDictionary(catalog);

        expect(result['ServiceA']).toBeUndefined();
        expect(result['Details']).toBeUndefined();
    });

    it('should skip read-only inter-service relations', () => {
        const catalog: ServiceModel[] = [
            createServiceModel('ServiceA', {
                embedded_entities: [
                    createEmbeddedEntity('Endpoints', 'Endpoint', {
                        inter_service_relations: [createInterServiceRelation('ReadonlyRelation', 'Other', { modifier: 'r' })]
                    })
                ]
            }),
            createServiceModel('Other')
        ];

        const result = createRelationsDictionary(catalog);

        expect(result['ServiceA']['Endpoint']).toEqual({ lower_limit: 1, upper_limit: 1 });
        expect(result['ServiceA']['ReadonlyRelation']).toBeUndefined();
        expect(result['Other']).toBeUndefined();
    });

    it('should keep null upper limits as null (no maximum)', () => {
        const catalog: ServiceModel[] = [
            createServiceModel('ServiceA', {
                embedded_entities: [
                    createEmbeddedEntity('UnlimitedEntity', 'Unlimited', {
                        upper_limit: null
                    })
                ]
            })
        ];

        const result = createRelationsDictionary(catalog);

        expect(result['ServiceA']['Unlimited']).toEqual({ lower_limit: 1, upper_limit: null });
        expect(result['Unlimited']['ServiceA']).toEqual({ lower_limit: 1, upper_limit: null });
    });
});
