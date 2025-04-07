import React, { act } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { StoreProvider } from 'easy-peasy';
import { EnvironmentDetails, RemoteData } from '@/Core';
import {
  CommandManagerResolverImpl,
  CommandResolverImpl,
  getStoreInstance,
} from '@/Data';
import { ServiceInventoryContext } from '@/Slices/ServiceInventory/UI/ServiceInventory';
import { DeferredApiHelper, dependencies, ServiceInstance } from '@/Test';
import { testClient } from '@/Test/Utils/react-query-setup';
import { words } from '@/UI';
import { DependencyProvider } from '@/UI/Dependency';
import { ModalProvider } from '@/UI/Root/Components/ModalProvider';
import { DestroyAction } from './DestroyAction';
const mockedMutate = jest.fn();

//mock is used to assert correct function call
jest.mock('@/Data/Managers/V2/ServiceInstance', () => ({
  useDestroyInstance: () => ({ mutate: mockedMutate }),
}));

function setup() {
  const apiHelper = new DeferredApiHelper();

  const storeInstance = getStoreInstance();

  storeInstance.dispatch.environment.setEnvironmentDetailsById({
    id: ServiceInstance.a.environment,
    value: RemoteData.success({ halted: false } as EnvironmentDetails),
  });

  dependencies.environmentModifier.setEnvironment(
    ServiceInstance.a.environment,
  );

  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolverImpl(storeInstance, apiHelper),
  );

  return {
    component: () => (
      <QueryClientProvider client={testClient}>
        <StoreProvider store={storeInstance}>
          <DependencyProvider
            dependencies={{
              ...dependencies,
              commandResolver,
            }}
          >
            <ModalProvider>
              <ServiceInventoryContext.Provider
                value={{
                  labelFiltering: {
                    danger: [],
                    warning: [],
                    success: [],
                    info: [],
                    no_label: [],
                    onClick: jest.fn(),
                  },
                }}
              >
                <DestroyAction
                  id={ServiceInstance.a.id}
                  instance_identity={
                    ServiceInstance.a.service_identity_attribute_value ??
                    ServiceInstance.a.id
                  }
                  version={ServiceInstance.a.version}
                  service_entity={ServiceInstance.a.service_entity}
                />
              </ServiceInventoryContext.Provider>
            </ModalProvider>
          </DependencyProvider>
        </StoreProvider>
      </QueryClientProvider>
    ),
    storeInstance,
  };
}

describe('DeleteModal ', () => {
  it('Shows form when clicking on modal button', async() => {
    const { component } = setup();

    render(component());
    const modalButton = await screen.findByText(
      words('inventory.destroyInstance.button'),
    );

    await userEvent.click(modalButton);

    expect(await screen.findByText(words('yes'))).toBeVisible();
    expect(await screen.findByText(words('no'))).toBeVisible();
  });

  it('Closes modal when cancelled', async() => {
    const { component } = setup();

    render(component());
    const modalButton = await screen.findByText(
      words('inventory.destroyInstance.button'),
    );

    await userEvent.click(modalButton);

    const noButton = await screen.findByText(words('no'));

    await userEvent.click(noButton);

    expect(screen.queryByText(words('yes'))).not.toBeInTheDocument();
  });

  it('Sends request when submitted', async() => {
    const { component } = setup();

    render(component());
    const modalButton = await screen.findByText(
      words('inventory.destroyInstance.button'),
    );

    await userEvent.click(modalButton);

    const yesButton = await screen.findByText(words('yes'));

    await userEvent.click(yesButton);

    expect(screen.queryByText(words('yes'))).not.toBeInTheDocument();
    expect(mockedMutate).toHaveBeenCalled();
  });

  it("Doesn't take environment halted status in account", async() => {
    const { component, storeInstance } = setup();
    const { rerender } = render(component());

    act(() => {
      storeInstance.dispatch.environment.setEnvironmentDetailsById({
        id: ServiceInstance.a.environment,
        value: RemoteData.success({ halted: true } as EnvironmentDetails),
      });
    });
    rerender(component());
    expect(
      await screen.findByText(words('inventory.destroyInstance.button')),
    ).toBeEnabled();
  });
});
