import React, { act } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { StoreProvider } from 'easy-peasy';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { AttributeModel, RemoteData, ServiceModel } from '@/Core';
import { getStoreInstance } from '@/Data';
import { dependencies, Service } from '@/Test';
import { multiNestedEditable } from '@/Test/Data/Service/EmbeddedEntity';
import { DependencyProvider, EnvironmentHandlerImpl } from '@/UI';
import { AttributeTable } from './AttributeTable';

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

const attribute1: AttributeModel = {
  name: 'order_id',
  type: 'int',
  description: 'The order ID of the service',
  modifier: 'rw',
  default_value_set: false,
  default_value: null,
};

const attribute2: AttributeModel = {
  name: 'service_mtu',
  type: 'int',
  description: 'The MTU that must be configured at the service provider',
  modifier: 'rw',
  default_value_set: false,
  default_value: null,
};

function setup (service: ServiceModel) {
  const store = getStoreInstance();

  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    dependencies.routeManager,
  );

  store.dispatch.environment.setEnvironments(
    RemoteData.success([
      {
        id: 'aaa',
        name: 'env-a',
        project_id: 'ppp',
        repo_branch: 'branch',
        repo_url: 'repo',
        projectName: 'project',
        halted: false,
        settings: {
          enable_lsm_expert_mode: true,
        },
      },
    ]),
  );

  const component = (
    <MemoryRouter initialEntries={[{ search: '?env=aaa' }]}>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          environmentHandler,
        }}
      >
        <StoreProvider store={store}>
          <AttributeTable service={service} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return component;
}

test('GIVEN AttributeTable WHEN passed no attributes THEN the empty container is shown', async () => {
  const component = setup({
    ...Service.a,
    attributes: [],
    embedded_entities: [],
  });

  render(component);
  expect(screen.getByText('No attributes found for the service')).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test('GIVEN AttributeTable WHEN passed 1 attribute THEN 1 row is shown', async () => {
  const component = setup({
    ...Service.a,
    attributes: [attribute1],
    embedded_entities: [],
  });

  render(component);

  expect(
    await screen.findByRole('row', { name: 'Row-order_id' }),
  ).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test('GIVEN AttributeTable WHEN passed 2 attributes THEN 2 rows are shown', async () => {
  const component = setup({
    ...Service.a,
    attributes: [attribute1, attribute2],
    embedded_entities: [],
  });

  render(component);

  expect(
    await screen.findByRole('row', { name: 'Row-order_id' }),
  ).toBeVisible();
  expect(
    await screen.findByRole('row', { name: 'Row-service_mtu' }),
  ).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test('GIVEN AttributeTable WHEN passed no attributes but some embedded entities THEN the rows are shown', async () => {
  const component = setup({
    ...Service.a,
    attributes: [],
  });

  render(component);

  expect(
    await screen.findByRole('row', { name: 'Row-circuits' }),
  ).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test('GIVEN AttributeTable WHEN passed 2 attributes THEN 2 rows are shown', async () => {
  const component = setup({
    ...Service.a,
    attributes: [attribute1, attribute2],
    embedded_entities: [],
  });

  render(component);

  expect(
    await screen.findByRole('row', { name: 'Row-order_id' }),
  ).toBeVisible();
  expect(
    await screen.findByRole('row', { name: 'Row-service_mtu' }),
  ).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test('GIVEN AttributeTable WHEN passed embedded attributes THEN expendable rows are shown and availalbe to expand/collapse one', async () => {
  const component = setup({
    ...Service.a,
    name: 'service_name_a',
    embedded_entities: multiNestedEditable,
  });

  render(component);

  //default embedded entity
  expect(
    await screen.findByRole('row', { name: 'Row-bandwidth' }),
  ).toBeVisible();

  //scenario to expand and hide one child
  const toggleButton = await screen.findByRole('button', {
    name: 'Toggle-embedded',
  });

  //show embedded entity
  await userEvent.click(toggleButton);

  const row = await screen.findByRole('row', {
    name: 'Row-embedded$embedded_single',
  });

  expect(row).toBeVisible();
  //collapse embedded entity
  await userEvent.click(toggleButton);

  expect(row).not.toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
