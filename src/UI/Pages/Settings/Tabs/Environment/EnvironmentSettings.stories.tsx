import React from "react";
import { BrowserRouter } from "react-router-dom";
import { CommandResolverImpl } from "@/Data";
import {
  dependencies,
  DynamicCommandManagerResolver,
  Environment,
  MockCommandManager,
  Project,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { EnvironmentSettings } from "./EnvironmentSettings";

export default {
  title: "EnvironmentSettings",
  component: EnvironmentSettings,
};

export const Default = () => {
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([new MockCommandManager()])
  );
  return (
    <BrowserRouter>
      <DependencyProvider dependencies={{ ...dependencies, commandResolver }}>
        <EnvironmentSettings
          environment={Environment.filterable[0]}
          projects={Project.list}
        />
      </DependencyProvider>
    </BrowserRouter>
  );
};
