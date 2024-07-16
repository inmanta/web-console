import React from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { HttpResponse, delay, http } from "msw";
import { setupServer } from "msw/node";
import { dependencies } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { testInstance, testService } from "../Diagram/Mock";
import { defineObjectsForJointJS } from "../Diagram/testSetup";
import { InstanceProvider } from "./InstanceProvider";

const setup = () => {
  const queryClient = new QueryClient();

  const component = (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <DependencyProvider dependencies={{ ...dependencies }}>
          <InstanceProvider
            label={"label"}
            services={[testService]}
            mainServiceName="mpn"
            instanceId="id"
          />
        </DependencyProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
  return component;
};
export const server = setupServer();

// Establish API mocking before all tests.
beforeAll(() => {
  defineObjectsForJointJS();
  server.listen();
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());

describe("UserManagementPage", () => {
  it("should render LoadingView when there are no responses from the endpoints yet,", async () => {
    server.use(
      http.get("/lsm/v1/service_inventory", async () => {
        await delay(1000);

        return HttpResponse.json({
          data: testInstance,
        });
      }),
      http.get("/lsm/v1/service_inventory/*/*/metadata/*", async () => {
        return HttpResponse.json({
          data: "metadata_string",
        });
      }),
    );
    render(setup());

    await waitFor(() => {
      expect(screen.getByText("Loading")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Composer-Container")).toBeInTheDocument();
    });
  });

  it("should render the ErrorView when there is an error returned from the instance endpoint", async () => {
    server.use(
      http.get("/lsm/v1/service_inventory", async () => {
        return HttpResponse.json({ message: "instance_fail" }, { status: 400 });
      }),
      http.get("/lsm/v1/service_inventory/*/*/metadata/*", async () => {
        return HttpResponse.json({
          data: "metadata_string",
        });
      }),
    );
    render(setup());

    await waitFor(() => {
      expect(screen.getByTestId("ErrorView")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          "The following error occured: Failed to fetch instance with id: id",
        ),
      ).toBeInTheDocument();
    });
  });

  it("should render the ErrorView when there is an error returned from the metadata endpoint", async () => {
    server.use(
      http.get("/lsm/v1/service_inventory", async () => {
        return HttpResponse.json({
          data: testInstance,
        });
      }),
      http.get("/lsm/v1/service_inventory/*/*/metadata/*", async () => {
        return HttpResponse.json({ message: "metadata_fail" }, { status: 400 });
      }),
    );
    render(setup());

    await waitFor(() => {
      expect(screen.getByTestId("ErrorView")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText("The following error occured: metadata_fail"),
      ).toBeInTheDocument();
    });
  });
});
