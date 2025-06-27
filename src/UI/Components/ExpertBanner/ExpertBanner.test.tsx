import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as useUpdateEnvironmentSettingModule from "@/Data/Queries/Slices/Environment/UpdateEnvironmentSetting/useUpdateEnvironmentSetting";
import { EnvironmentDetails, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ExpertBanner } from "./ExpertBanner";

// Mock useUpdateEnvironmentSetting before the test
vi.mock(
  "@/Data/Queries/Slices/Environment/UpdateEnvironmentSetting/useUpdateEnvironmentSetting",
  () => ({
    useUpdateEnvironmentSetting: vi.fn(),
  })
);

const setup = (flag: boolean) => {
  return (
    <TestMemoryRouter initialEntries={["/?env=aaa"]}>
      <MockedDependencyProvider
        env={{
          ...EnvironmentDetails.env,
          settings: { ...EnvironmentDetails.env.settings, enable_lsm_expert_mode: flag },
        }}
      >
        <QueryClientProvider client={testClient}>
          <ExpertBanner />
        </QueryClientProvider>
      </MockedDependencyProvider>
    </TestMemoryRouter>
  );
};

describe("Given ExpertBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("When expert_mode is set to true Then should render,", () => {
    vi.mocked(useUpdateEnvironmentSettingModule.useUpdateEnvironmentSetting).mockReturnValue({
      data: undefined,
      error: null,
      failureCount: 0,
      isError: false,
      isIdle: false,
      isSuccess: true,
      isPending: false,
      reset: vi.fn(),
      isPaused: false,
      context: undefined,
      variables: {
        id: "",
        value: false,
      },
      failureReason: null,
      submittedAt: 0,
      mutateAsync: vi.fn(),
      status: "success",
      mutate: vi.fn(),
    });

    render(setup(true));

    expect(screen.getByText("LSM expert mode is enabled, proceed with caution.")).toBeVisible();

    expect(screen.getByText("Disable expert mode")).toBeVisible();
  });

  it("When expert_mode is set to true AND user clicks to disable expert mode it Then should fire mutation function", async () => {
    const mutateSpy = vi.fn();

    vi.mocked(useUpdateEnvironmentSettingModule.useUpdateEnvironmentSetting).mockReturnValue({
      data: undefined,
      error: null,
      failureCount: 0,
      isError: false,
      isIdle: false,
      isSuccess: true,
      isPending: false,
      reset: vi.fn(),
      isPaused: false,
      context: undefined,
      variables: {
        id: "",
        value: false,
      },
      failureReason: null,
      submittedAt: 0,
      mutateAsync: vi.fn(),
      status: "success",
      mutate: mutateSpy,
    });

    render(setup(true));

    await userEvent.click(screen.getByText("Disable expert mode"));

    expect(mutateSpy).toHaveBeenCalledWith({
      id: "enable_lsm_expert_mode",
      value: false,
    });
  });

  it("When expert_mode is set to true AND user clicks to disable expert mode it AND something was wrong with the request Then AlertToast with error message should open", async () => {
    let onErrorCallback: ((error: { message: string }) => void) | undefined;

    vi.mocked(useUpdateEnvironmentSettingModule.useUpdateEnvironmentSetting).mockImplementation(
      (options) => {
        if (options?.onError) {
          onErrorCallback = options.onError;
        }

        return {
          data: undefined,
          error: null,
          failureCount: 0,
          isError: false,
          isIdle: false,
          isSuccess: true,
          isPending: false,
          reset: vi.fn(),
          isPaused: false,
          context: undefined,
          variables: {
            id: "enable_lsm_expert_mode",
            value: false,
          },
          failureReason: null,
          submittedAt: 0,
          mutateAsync: vi.fn(),
          status: "success",
          mutate: vi.fn(() => {
            // Simulate the error callback being triggered
            setTimeout(() => {
              onErrorCallback?.({ message: "Request or referenced resource does not exist" });
            }, 0);
          }),
        };
      }
    );

    render(setup(true));

    await userEvent.click(screen.getByText("Disable expert mode"));

    await act(async () => {
      // Wait for the setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    await waitFor(() => {
      expect(screen.getByTestId("ToastAlert")).toBeVisible();
      expect(screen.getByText("Something went wrong")).toBeVisible();
      expect(screen.getByText("Request or referenced resource does not exist")).toBeVisible();
    });

    expect(screen.getByText("LSM expert mode is enabled, proceed with caution.")).toBeVisible();
    expect(screen.getByText("Disable expert mode")).toBeVisible();
  });

  it("When expert_mode is set to false Then should not render,", () => {
    vi.mocked(useUpdateEnvironmentSettingModule.useUpdateEnvironmentSetting).mockReturnValue({
      data: undefined,
      error: null,
      failureCount: 0,
      isError: false,
      isIdle: false,
      isSuccess: true,
      isPending: false,
      reset: vi.fn(),
      isPaused: false,
      context: undefined,
      variables: {
        id: "",
        value: false,
      },
      failureReason: null,
      submittedAt: 0,
      mutateAsync: vi.fn(),
      status: "success",
      mutate: vi.fn(),
    });

    render(setup(false));

    expect(screen.queryByText("LSM expert mode is enabled, proceed with caution.")).toBeNull();
  });
});
