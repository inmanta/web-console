import React, { act } from 'react';
import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { StoreProvider } from 'easy-peasy';
import { Either } from '@/Core';
import { QueryResolverImpl, getStoreInstance } from '@/Data';
import {
  Resource,
  DynamicQueryManagerResolverImpl,
  StaticScheduler,
  DeferredApiHelper,
  dependencies,
} from '@/Test';
import { DependencyProvider } from '@/UI/Dependency';
import {
  ResourceLogsQueryManager,
  ResourceLogsStateHelper,
} from '@S/ResourceDetails/Data';
import { ResourceLogs } from '@S/ResourceDetails/Data/Mock';
import { View } from './View';

function setup () {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const resourceLogsStateHelper = ResourceLogsStateHelper(store);
  const resourceLogsQueryManager = ResourceLogsQueryManager(
    apiHelper,
    resourceLogsStateHelper,
    new StaticScheduler(),
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([resourceLogsQueryManager]),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <View resourceId={Resource.id} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    apiHelper,
  };
}

test('GIVEN ResourceLogsView THEN shows resource logs', async () => {
  const { component, apiHelper } = setup();

  render(component);

  expect(
    screen.getByRole('region', { name: 'ResourceLogs-Loading' }),
  ).toBeVisible();

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    environment: 'env',
    url: `/api/v2/resource/${Resource.encodedId}/logs?limit=100&sort=timestamp.desc`,
    method: 'GET',
  });

  await act(async () => {
    apiHelper.resolve(Either.right(ResourceLogs.response));
  });

  expect(
    await screen.findByRole('grid', { name: 'ResourceLogsTable' }),
  ).toBeVisible();

  const rows = await screen.findAllByRole('rowgroup', {
    name: 'ResourceLogRow',
  });

  expect(rows).toHaveLength(3);
});

test('GIVEN ResourceLogsView WHEN filtered on message THEN only shows relevant logs', async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    apiHelper.resolve(Either.right(ResourceLogs.response));
  });

  const messageFilter = screen.getByRole('textbox', {
    name: 'MessageFilter',
  });

  await userEvent.type(messageFilter, 'failed{enter}');

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        ...ResourceLogs.response,
        data: [ResourceLogs.response.data[0]],
      }),
    );
  });

  const row = await screen.findByRole('rowgroup', {
    name: 'ResourceLogRow',
  });

  expect(row).toBeInTheDocument();
});

test('GIVEN ResourceLogsView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page', async () => {
  const { component, apiHelper } = setup();

  render(component);

  //mock that response has more than one site
  await act(async () => {
    apiHelper.resolve(
      Either.right({
        ...ResourceLogs.response,
        metadata: {
          total: 103,
          before: 0,
          after: 3,
          page_size: 100,
        },
      }),
    );
  });

  expect(screen.getByLabelText('Go to next page')).toBeEnabled();

  await userEvent.click(screen.getByLabelText('Go to next page'));

  //expect the api url to contain start and end keywords that are used for pagination when we are moving to the next page
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&sort=timestamp.desc)/);

  await act(async () => {
    apiHelper.resolve(Either.right(ResourceLogs.response));
  });

  //sort on the second page
  await userEvent.click(screen.getByText('Timestamp'));

  // expect the api url to not contain start and end keywords that are used for pagination to assert we are back on the first page.
  // we are asserting on the second request as the first request is for the updated sorting event, and second is chained to back to the first page with still correct sorting
  expect(apiHelper.pendingRequests[1].url).not.toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[1].url).toMatch(/(&sort=timestamp.asc)/);
});
