import React, { ComponentProps } from "react";
import {
  DeleteServiceCommandManager,
  BaseApiHelper,
  CommandResolverImpl,
} from "@/Data";
import { Service, DynamicCommandManagerResolver, dependencies } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Details } from "./Details";

export default {
  title: "Details",
  component: Details,
};

const Template: React.FC<ComponentProps<typeof Details>> = (args) => {
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new DeleteServiceCommandManager(new BaseApiHelper()),
    ])
  );

  return (
    <DependencyProvider dependencies={{ ...dependencies, commandResolver }}>
      <Details {...args} />
    </DependencyProvider>
  );
};

export const Empty: React.FC = () => (
  <Template serviceName={Service.withInstanceSummary.name} />
);

export const Zeroes: React.FC = () => (
  <Template
    serviceName={Service.withInstanceSummary.name}
    instanceSummary={{
      by_label: { danger: 0, warning: 0, no_label: 0, success: 0, info: 0 },
      total: 0,
      by_state: {},
    }}
  />
);

export const Full: React.FC = () => (
  <Template
    serviceName={Service.withInstanceSummary.name}
    instanceSummary={Service.withInstanceSummary.instance_summary}
  />
);

export const CategoriesZero: React.FC = () => (
  <Template
    serviceName={Service.withInstanceSummary.name}
    instanceSummary={{
      by_label: { danger: 10, warning: 2, no_label: 1, success: 0, info: 0 },
      total: 13,
      by_state: {},
    }}
  />
);
