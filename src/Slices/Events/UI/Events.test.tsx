import React, { act } from 'react';
import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { StoreProvider } from 'easy-peasy';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { Either, InstanceEvent } from '@/Core';
import { QueryResolverImpl, getStoreInstance } from '@/Data';
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolverImpl,
  Service,
  StaticScheduler,
} from '@/Test';
import { DependencyProvider } from '@/UI/Dependency';
import { EventsQueryManager, EventsStateHelper } from '@S/Events/Data';
import { Events } from './Events';

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([
      EventsQueryManager(apiHelper, EventsStateHelper(store), scheduler),
    ]),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <Events
            service={Service.a}
            instanceId={'4a4a6d14-8cd0-4a16-bc38-4b768eb004e3'}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test('EventsView shows empty table', async() => {
  const { component, apiHelper } = setup();

  render(component);

  expect(
    await screen.findByRole('region', { name: 'EventTable-Loading' }),
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
      links: { self: '' },
      metadata: { before: 0, after: 0, page_size: 20, total: 0 },
    }),
  );

  expect(
    await screen.findByRole('generic', { name: 'EventTable-Empty' }),
  ).toBeInTheDocument();

  await act(async() => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test('EventsView shows failed table', async() => {
  const { component, apiHelper } = setup();

  render(component);

  expect(
    await screen.findByRole('region', { name: 'EventTable-Loading' }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left('error'));

  expect(
    await screen.findByRole('region', { name: 'EventTable-Failed' }),
  ).toBeInTheDocument();

  await act(async() => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test('EventsView shows success table', async() => {
  const { component, apiHelper } = setup();

  render(component);

  expect(
    await screen.findByRole('region', { name: 'EventTable-Loading' }),
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [
        {
          id: '049dd20f-c432-4b93-bf1c-32c572e49cc7',
          service_instance_id: 'bd200aec-4f80-45e1-b2ad-137c442c68b8',
          service_instance_version: 3,
          timestamp: '2021-01-11T12:56:56.205131',
          source: 'creating',
          destination: 'awaiting_up',
          message:
            'Service instance bd200aec-4f80-45e1-b2ad-137c442c68b8 successfully executed transfer creating -> awaiting_up (error=False)',
          ignored_transition: false,
          event_correlation_id: '363cc930-d847-4e8a-b605-41b87a903248',
          severity: 20,
          id_compile_report: null,
          event_type: 'RESOURCE_TRANSITION',
          is_error_transition: false,
        } as InstanceEvent,
      ],
      links: { self: '' },
      metadata: { before: 0, after: 0, page_size: 20, total: 2 },
    }),
  );

  expect(
    await screen.findByRole('grid', { name: 'EventTable-Success' }),
  ).toBeInTheDocument();

  await act(async() => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test('EventsView shows updated table', async() => {
  const { component, apiHelper, scheduler } = setup();

  render(component);

  expect(
    await screen.findByRole('region', { name: 'EventTable-Loading' }),
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
      links: { self: '' },
      metadata: { before: 0, after: 0, page_size: 20, total: 0 },
    }),
  );

  expect(
    await screen.findByRole('generic', { name: 'EventTable-Empty' }),
  ).toBeInTheDocument();

  scheduler.executeAll();

  apiHelper.resolve(
    Either.right({
      data: [
        {
          id: '049dd20f-c432-4b93-bf1c-32c572e49cc7',
          service_instance_id: 'bd200aec-4f80-45e1-b2ad-137c442c68b8',
          service_instance_version: 3,
          timestamp: '2021-01-11T12:56:56.205131',
          source: 'creating',
          destination: 'awaiting_up',
          message:
            'Service instance bd200aec-4f80-45e1-b2ad-137c442c68b8 successfully executed transfer creating -> awaiting_up (error=False)',
          ignored_transition: false,
          event_correlation_id: '363cc930-d847-4e8a-b605-41b87a903248',
          severity: 20,
          id_compile_report: null,
          event_type: 'RESOURCE_TRANSITION',
          is_error_transition: false,
        } as InstanceEvent,
      ],
      links: { self: '' },
      metadata: { before: 0, after: 0, page_size: 20, total: 1 },
    }),
  );

  expect(
    await screen.findByRole('grid', { name: 'EventTable-Success' }),
  ).toBeInTheDocument();

  await act(async() => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test('GIVEN EventsView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page', async() => {
  const response = {
    data: [
      {
        id: '049dd20f-c432-4b93-bf1c-32c572e49cc7',
        service_instance_id: 'bd200aec-4f80-45e1-b2ad-137c442c68b8',
        service_instance_version: 3,
        timestamp: '2021-01-11T12:56:56.205131',
        source: 'creating',
        destination: 'awaiting_up',
        message:
          'Service instance bd200aec-4f80-45e1-b2ad-137c442c68b8 successfully executed transfer creating -> awaiting_up (error=False)',
        ignored_transition: false,
        event_correlation_id: '363cc930-d847-4e8a-b605-41b87a903248',
        severity: 20,
        id_compile_report: null,
        event_type: 'RESOURCE_TRANSITION',
        is_error_transition: false,
      } as InstanceEvent,
    ],
    links: {
      self: '',
      next: '/fake-link?end=fake-first-param',
    },
    metadata: {
      total: 103,
      before: 0,
      after: 3,
      page_size: 100,
    },
  };
  const { component, apiHelper } = setup();

  render(component);

  //mock that response has more than one site
  await act(async() => {
    apiHelper.resolve(Either.right(response));
  });

  const nextPageButton = screen.getByLabelText('Go to next page');

  expect(nextPageButton).toBeEnabled();

  await userEvent.click(nextPageButton);

  //expect the api url to contain start and end keywords that are used for pagination when we are moving to the next page
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&sort=timestamp.desc)/);

  await act(async() => {
    apiHelper.resolve(Either.right(response));
  });

  //sort on the second page
  await userEvent.click(screen.getByText('Date'));

  // expect the api url to not contain start and end keywords that are used for pagination to assert we are back on the first page.
  // we are asserting on the second request as the first request is for the updated sorting event, and second is chained to back to the first page with still correct sorting
  expect(apiHelper.pendingRequests[1].url).not.toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[1].url).toMatch(/(&sort=timestamp.asc)/);
});
