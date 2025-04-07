import React from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StoreProvider } from 'easy-peasy';
import { RemoteData, ServiceModel } from '@/Core';
import { getStoreInstance } from '@/Data';
import { AuthProvider } from '@/Data/Auth/AuthProvider';
import {
  dependencies,
  Environment,
  MockEnvironmentModifier,
  Service,
} from '@/Test';
import { DependencyProvider, EnvironmentHandlerImpl } from '@/UI/Dependency';
import { ServiceInventory } from '@S/ServiceInventory/UI/ServiceInventory';

interface Handles {
  component: React.ReactElement;
}

export class ServiceInventoryPrepper {
  prep (service: ServiceModel = Service.a): Handles {
    const client = new QueryClient();
    const store = getStoreInstance();

    const environmentHandler = EnvironmentHandlerImpl(
      useLocation,
      dependencies.routeManager,
    );

    store.dispatch.environment.setEnvironments(
      RemoteData.success(Environment.filterable),
    );
    const component = (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[{ search: '?env=123' }]}>
          <AuthProvider config={undefined}>
            <DependencyProvider
              dependencies={{
                ...dependencies,
                environmentModifier: new MockEnvironmentModifier(),
                environmentHandler,
              }}
            >
              <StoreProvider store={store}>
                <ServiceInventory
                  serviceName={service.name}
                  service={service}
                />
              </StoreProvider>
            </DependencyProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    return { component };
  }
}
