import React from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { RemoteData, ServiceInstanceModel } from '@/Core';
import { getStoreInstance } from '@/Data/Store';
import { dependencies } from '@/Test';
import { DependencyProvider, EnvironmentHandlerImpl } from '@/UI';
import {
  childModel,
  testInstance,
  testService,
} from '@/UI/Components/Diagram/Mocks';
import { useGetInstanceWithRelations } from './useGetInstanceWithRelations';

export const server = setupServer(
  http.get('/lsm/v1/service_inventory', async (params) => {
    if (params.request.url.match(/test_id/)) {
      return HttpResponse.json({
        data: {
          ...testInstance,
          id: 'test_id',
          referenced_by: ['test_mpn_id'],
        },
      });
    }

    if (params.request.url.match(/child_id/)) {
      return HttpResponse.json({
        data: {
          id: 'child_id',
          environment: 'env',
          service_entity: 'child-service',
          version: 4,
          config: {},
          state: 'up',
          candidate_attributes: null,
          active_attributes: {
            name: 'child-test',
            service_id: '123523534623',
            parent_entity: 'test_mpn_id',
            should_deploy_fail: false,
          },
          rollback_attributes: null,
          created_at: '2023-09-19T14:40:08.999123',
          last_updated: '2023-09-19T14:40:36.178723',
          callback: [],
          deleted: false,
          deployment_progress: null,
          service_identity_attribute_value: 'child-test',
          referenced_by: [],
        },
      });
    }

    return HttpResponse.json({
      data: { ...testInstance, id: 'test_mpn_id' },
    });
  }),
);

const createWrapper = () => {
  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    dependencies.routeManager,
  );
  const store = getStoreInstance();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const env = {
    id: 'aaa',
    name: 'env-a',
    project_id: 'ppp',
    repo_branch: 'branch',
    repo_url: 'repo',
    projectName: 'project',
    halted: false,
    settings: {},
  };

  store.dispatch.environment.setEnvironments(RemoteData.success([env]));

  store.dispatch.environment.setEnvironmentDetailsById({
    id: 'aaa',
    value: RemoteData.success(env),
  });

  return ({ children }) => (
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/',
          search: '?env=aaa',
        },
      ]}
    >
      <QueryClientProvider client={queryClient}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            environmentHandler,
          }}
        >
          <StoreProvider store={store}>{children}</StoreProvider>
        </DependencyProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('useGetInstanceWithRelations', () => {
  // Establish API mocking before all tests.
  beforeAll(() => server.listen());
  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  afterEach(() => server.resetHandlers());
  // Clean up after the tests are finished.
  afterAll(() => server.close());
  test('if the fetched instance has referenced instance(s), then query will return the given instance with that related instance(s)', async () => {
    const { result } = renderHook(
      () =>
        useGetInstanceWithRelations('test_id', false, testService).useOneTime(),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.instance.id).toEqual('test_id');
    expect(result.current.data?.interServiceRelations).toHaveLength(1);
    expect(
      (result.current.data?.interServiceRelations as ServiceInstanceModel[])[0]
        .id,
    ).toEqual('test_mpn_id');
  });

  test('if the fetched instance has inter-service relation(s) in the model, then query will return the given instance with that related instance(s)', async () => {
    const { result } = renderHook(
      () =>
        useGetInstanceWithRelations('child_id', false, childModel).useOneTime(),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.instance.id).toEqual('child_id');
    expect(result.current.data?.interServiceRelations).toHaveLength(1);
    expect(
      (result.current.data?.interServiceRelations as ServiceInstanceModel[])[0]
        .id,
    ).toEqual('test_mpn_id');
  });

  test('if the fetched instance has inter-service relation(s) in the model, and they are stored in the array in the instance, then query will return the given instance with that related instance(s)', async () => {
    server.use(
      http.get('/lsm/v1/service_inventory', async (params) => {
        if (params.request.url.match(/test_id/)) {
          return HttpResponse.json({
            data: {
              ...testInstance,
              id: 'test_id',
              referenced_by: ['test_mpn_id'],
            },
          });
        }

        if (params.request.url.match(/child_id/)) {
          return HttpResponse.json({
            data: {
              id: 'child_id',
              environment: 'env',
              service_entity: 'child-service',
              version: 4,
              config: {},
              state: 'up',
              candidate_attributes: null,
              active_attributes: {
                name: 'child-test',
                service_id: '123523534623',
                parent_entity: ['test_mpn_id'],
                should_deploy_fail: false,
              },
              rollback_attributes: null,
              created_at: '2023-09-19T14:40:08.999123',
              last_updated: '2023-09-19T14:40:36.178723',
              callback: [],
              deleted: false,
              deployment_progress: null,
              service_identity_attribute_value: 'child-test',
              referenced_by: [],
            },
          });
        }

        return HttpResponse.json({
          data: { ...testInstance, id: 'test_mpn_id' },
        });
      }),
    );
    const { result } = renderHook(
      () =>
        useGetInstanceWithRelations('child_id', false, childModel).useOneTime(),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.instance.id).toEqual('child_id');
    expect(result.current.data?.interServiceRelations).toHaveLength(1);
    expect(
      (result.current.data?.interServiceRelations as ServiceInstanceModel[])[0]
        .id,
    ).toEqual('test_mpn_id');
  });

  test('when instance returned has not referenced instance(s), then the query will return the given instance without interServiceRelations', async () => {
    const { result } = renderHook(
      () =>
        useGetInstanceWithRelations(
          'test_mpn_id',
          false,
          testService,
        ).useOneTime(),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.instance.id).toEqual('test_mpn_id');
    expect(result.current.data?.interServiceRelations).toHaveLength(0);
  });
});
