import React from "react";
import { BrowserRouter } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { CommandResolverImpl, getStoreInstance } from "@/Data";
import {
  dependencies,
  DynamicCommandManagerResolver,
  InstantApiHelper,
  Service,
  ServiceInstance,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { TriggerInstanceUpdateCommandManager } from "@S/EditInstance/Data";
import { EditForm } from "./EditForm";

export default {
  title: "Service Inventory/EditInstanceForm",
  component: EditForm,
};
export const Default: React.FC = () => {
  const store = getStoreInstance();
  const apiHelper = new InstantApiHelper(() => ({
    kind: "Success",
    data: null,
  }));
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new TriggerInstanceUpdateCommandManager(apiHelper),
    ])
  );
  return (
    <BrowserRouter>
      <StoreProvider store={store}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            commandResolver,
          }}
        >
          <EditForm serviceEntity={Service.a} instance={ServiceInstance.a} />
        </DependencyProvider>
      </StoreProvider>
    </BrowserRouter>
  );
};
