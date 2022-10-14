import React from "react";
import { BrowserRouter } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { CommandResolverImpl, getStoreInstance } from "@/Data";
import {
  dependencies,
  DynamicCommandManagerResolver,
  InstantApiHelper,
  Service,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { CreateInstanceCommandManager } from "@S/CreateInstance/Data";
import { CreateInstance } from "./CreateInstance";

export default {
  title: "Service Inventory/CreateInstance",
  component: CreateInstance,
};

export const Default: React.FC = () => {
  const store = getStoreInstance();
  const apiHelper = new InstantApiHelper(() => ({
    kind: "Success",
    data: null,
  }));
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([CreateInstanceCommandManager(apiHelper)])
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
          <CreateInstance serviceEntity={Service.a} />
        </DependencyProvider>
      </StoreProvider>
    </BrowserRouter>
  );
};
