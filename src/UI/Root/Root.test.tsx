import React, { act } from 'react';
import { MemoryRouter } from 'react-router';
import { useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Either } from '@/Core';
import {
  QueryResolverImpl,
  getStoreInstance,
  GetServerStatusOneTimeQueryManager,
  GetServerStatusStateHelper,
  GetEnvironmentsStateHelper,
  GetEnvironmentsQueryManager,
} from '@/Data';
import { defaultAuthContext } from '@/Data/Auth/AuthContext';
import {
  GetEnvironmentsContinuousQueryManager,
  GetEnvironmentsContinuousStateHelper,
} from '@/Data/Managers/GetEnvironmentsContinuous';
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolverImpl,
  Project,
  ServerStatus,
  StaticScheduler,
} from '@/Test';
import { DependencyProvider, EnvironmentHandlerImpl } from '@/UI/Dependency';
import { Root } from './Root';

function setup() {
  const queryClient = new QueryClient();

  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const environmentsStateHelper = GetEnvironmentsStateHelper(store);
  const environmentManagerOneTime = GetEnvironmentsQueryManager(
    apiHelper,
    environmentsStateHelper,
  );

  const environmentsManager = GetEnvironmentsContinuousQueryManager(
    apiHelper,
    scheduler,
    GetEnvironmentsContinuousStateHelper(store),
  );

  const getServerStatusManager = GetServerStatusOneTimeQueryManager(
    apiHelper,
    GetServerStatusStateHelper(store),
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([
      environmentsManager,
      environmentManagerOneTime,
      getServerStatusManager,
    ]),
  );

  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    dependencies.routeManager,
  );

  const component = (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <StoreProvider store={store}>
          <DependencyProvider
            dependencies={{
              ...dependencies,
              queryResolver,
              environmentHandler,
              authHelper: {
                ...defaultAuthContext,
                getUser: () => 'mocked_user',
                getToken: () => 'mocked_token',
              },
            }}
          >
            <Root />
          </DependencyProvider>
        </StoreProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
    apiHelper,
  };
}

expect.extend(toHaveNoViolations);

test('GIVEN the app THEN the app should be accessible', async() => {
  fetchMock.mockResponse(JSON.stringify({}));
  const { component, apiHelper } = setup();

  render(component);

  await act(async() => {
    await apiHelper.resolve(Either.right({ data: ServerStatus.withLsm }));
    await apiHelper.resolve(Either.right({ data: Project.list }));
  });

  await act(async() => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test('GIVEN the app THEN the navigation toggle button should be visible', async() => {
  fetchMock.mockResponse(JSON.stringify({}));
  const { component, apiHelper } = setup();

  render(component);

  await act(async() => {
    await apiHelper.resolve(Either.right({ data: ServerStatus.withLsm }));
    await apiHelper.resolve(Either.right({ data: Project.list }));
  });

  expect(screen.getByRole('button', { name: 'Main Navigation' })).toBeVisible();
});

test('GIVEN the app THEN the documentation link should be visible', async() => {
  fetchMock.mockResponse(JSON.stringify({}));
  const { component, apiHelper } = setup();

  render(component);

  await act(async() => {
    await apiHelper.resolve(Either.right({ data: ServerStatus.withLsm }));
    await apiHelper.resolve(Either.right({ data: Project.list }));
  });

  expect(
    screen.getByRole('button', { name: 'documentation link' }),
  ).toBeVisible();
});
