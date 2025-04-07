import React from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import * as useUpdateEnvConfig from "@/Data/Managers/V2/Environment/UpdateEnvConfig/useUpdateEnvConfig"; //import with that exact path is required for mock to work correctly
import { dependencies } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { DependencyProvider } from "@/UI/Dependency";
import { ExpertBanner } from "./ExpertBanner";

const setup = (flag: boolean) => {
  dependencies.environmentModifier.useIsExpertModeEnabled = jest.fn(() => flag);
  const store = getStoreInstance();

  return (
    <MemoryRouter initialEntries={[{ search: "?env=aaa" }]}>
      <DependencyProvider
        dependencies={{
          ...dependencies,
        }}
      >
        <QueryClientProvider client={testClient}>
          <StoreProvider store={store}>
            <ExpertBanner />
          </StoreProvider>
        </QueryClientProvider>
      </DependencyProvider>
    </MemoryRouter>
  );
};

describe("Given ExpertBanner", () => {
  it("When expert_mode is set to true Then should render,", () => {
    render(setup(true));

    expect(
      screen.getByText("LSM expert mode is enabled, proceed with caution."),
    ).toBeVisible();

    expect(screen.getByText("Disable expert mode")).toBeVisible();
  });

  it("When expert_mode is set to true AND user clicks to disable expert mode it Then should fire mutation function", async () => {
    const mutateSpy = jest.fn();
    const spy = jest
      .spyOn(useUpdateEnvConfig, "useUpdateEnvConfig")
      .mockReturnValue({
        data: undefined,
        error: null,
        failureCount: 0,
        isError: false,
        isIdle: false,
        isSuccess: true,
        isPending: false,
        reset: jest.fn(),
        isPaused: false,
        context: undefined,
        variables: {
          id: "",
          updatedValue: {
            value: "",
          },
        },
        failureReason: null,
        submittedAt: 0,
        mutateAsync: jest.fn(),
        status: "success",
        mutate: mutateSpy,
      });

    render(setup(true));

    await userEvent.click(screen.getByText("Disable expert mode"));

    expect(mutateSpy).toHaveBeenCalledWith({
      id: "enable_lsm_expert_mode",
      updatedValue: { value: false },
    });
    spy.mockRestore();
  });

  it("When expert_mode is set to true AND user clicks to disable expert mode it AND something was wrong with the request Then AlertToast with error message should open", async () => {
    const server = setupServer(
      http.post(
        "/api/v2/environment_settings/enable_lsm_expert_mode",
        async () => {
          return HttpResponse.json(
            {
              message: "Request or referenced resource does not exist",
            },
            {
              status: 404,
            },
          );
        },
      ),
    );

    server.listen();
    render(setup(true));

    await userEvent.click(screen.getByText("Disable expert mode"));

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeVisible();
    });
    expect(
      screen.getByText("Request or referenced resource does not exist"),
    ).toBeVisible();

    expect(
      screen.getByText("LSM expert mode is enabled, proceed with caution."),
    ).toBeVisible();
    expect(screen.getByText("Disable expert mode")).toBeVisible();

    server.close();
  });

  it("When expert_mode is set to false Then should not render,", () => {
    render(setup(false));

    expect(
      screen.queryByText("LSM expert mode is enabled, proceed with caution."),
    ).toBeNull();
  });
});
