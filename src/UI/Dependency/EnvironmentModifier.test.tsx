import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { EnvironmentModifier, RemoteData } from '@/Core';
import { DefinitionMap } from '@/Core/Domain/EnvironmentSettings';
import { getStoreInstance } from '@/Data';
import { EnvironmentDetails, EnvironmentSettings } from '@/Test';
import { EnvironmentModifierImpl } from './EnvironmentModifier';

const DummyComponent: React.FC<{
  environmentModifier: EnvironmentModifier;
}> = ({ environmentModifier }) => {
  return environmentModifier.useIsServerCompileEnabled() ? (
    <div data-testid="server-compile-enabled" />
  ) : (
    <div data-testid="server-compile-disabled" />
  );
};

function setup (definition: DefinitionMap) {
  const environmentId = 'env';
  const store = getStoreInstance();

  store.dispatch.environment.setSettingsData({
    environment: environmentId,
    value: RemoteData.success({
      settings: {},
      definition,
    }),
  });
  const environmentModifier = EnvironmentModifierImpl();

  environmentModifier.setEnvironment(environmentId);
  const component = (
    <StoreProvider store={store}>
      <DummyComponent environmentModifier={environmentModifier} />
    </StoreProvider>
  );

  return { component, store, environmentId };
}

test('Given the environmentModifier When the server compile setting is requested Then returns the correct value', async () => {
  const { component, store, environmentId } = setup(
    EnvironmentSettings.definition,
  );

  // No setting is specified, and the default is true
  store.dispatch.environment.setEnvironmentDetailsById({
    id: environmentId,
    value: RemoteData.success({ ...EnvironmentDetails.a, settings: {} }),
  });

  render(component);

  expect(await screen.findByTestId('server-compile-enabled')).toBeVisible();

  // Set the option explicitly to false
  await act(async () => {
    store.dispatch.environment.setEnvironmentDetailsById({
      id: environmentId,
      value: RemoteData.success({
        ...EnvironmentDetails.a,
        settings: { server_compile: false },
      }),
    });
  });
  expect(await screen.findByTestId('server-compile-disabled')).toBeVisible();

  // Set the option explicitly to true
  await act(async () => {
    store.dispatch.environment.setEnvironmentDetailsById({
      id: environmentId,
      value: RemoteData.success({
        ...EnvironmentDetails.a,
        settings: { server_compile: true },
      }),
    });
  });
  expect(await screen.findByTestId('server-compile-enabled')).toBeVisible();
});

test('Given the environmentModifier When the missing setting is requested Then render component as the value would be false without throwing an error', async () => {
  const consoleError = jest.spyOn(console, 'error');

  delete EnvironmentSettings.definition.server_compile;
  const { component, store, environmentId } = setup(
    EnvironmentSettings.definition,
  );

  // No setting is specified, and the dafault is missing
  store.dispatch.environment.setEnvironmentDetailsById({
    id: environmentId,
    value: RemoteData.success({ ...EnvironmentDetails.a, settings: {} }),
  });

  render(component);
  //expect to see div element that indicates false value of the setting by its aria-label instead of error boundary pa
  expect(await screen.findByTestId('server-compile-disabled')).toBeVisible();
  expect(
    screen.queryByLabelText('server-compile-enabled'),
  ).not.toBeInTheDocument();
  expect(consoleError).not.toHaveBeenCalled();
});
