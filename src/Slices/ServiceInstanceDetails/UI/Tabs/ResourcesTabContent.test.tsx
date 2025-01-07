import React from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { ServiceInstanceModel, ServiceModel } from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";

import { InstanceDetailsContext } from "../../Core/Context";
import { instanceData } from "../../Test/mockData";
import {
  errorServerInstance,
  emptyResourcesServer,
  defaultServer,
} from "../../Test/mockServer";
import { SetupWrapper } from "../../Test/mockSetup";
import { ResourcesTabContent } from "./ResourcesTabContent";

const setup = (instance: ServiceInstanceModel) => {
  return (
    <SetupWrapper expertMode={false}>
      <InstanceDetailsContext.Provider
        value={{
          instance,
          logsQuery: {} as UseQueryResult<InstanceLog[], Error>,
          serviceModelQuery: {} as UseQueryResult<ServiceModel, Error>,
        }}
      >
        <ResourcesTabContent />
      </InstanceDetailsContext.Provider>
    </SetupWrapper>
  );
};

//Note: success view is test in the Page.test.tsx file as we cover there logic for redirecting to the proper tab when changing version

it("should render error view correctly", async () => {
  const server = errorServerInstance;

  server.listen();

  render(setup(instanceData));

  expect(
    await screen.findByLabelText("Error_view-Resources-content"),
  ).toBeVisible();
  expect(screen.getByText("Something went wrong")).toBeVisible();
  expect(
    screen.getByText(
      "Failed to fetch service instance resources for instance of id: 1d96a1ab",
    ),
  ).toBeVisible();

  server.close();
});

it("should render information about no resources correctly", async () => {
  const server = emptyResourcesServer;

  server.listen();

  render(setup({ ...instanceData, deployment_progress: null }));

  expect(await screen.findByText("No resources found")).toBeVisible();
  expect(
    screen.getByText("No resources could be found for this instance."),
  ).toBeVisible();

  server.close();
});

it("should render information about no deployment progress data correctly", async () => {
  const server = defaultServer;

  server.listen();

  render(setup({ ...instanceData, deployment_progress: undefined }));

  expect(
    await screen.findByText("There is no data about deployment progress."),
  ).toBeVisible();

  server.close();
});
