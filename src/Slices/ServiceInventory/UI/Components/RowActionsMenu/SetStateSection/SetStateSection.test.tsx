import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { TransferModel } from "@/Core";
import { StateTarget } from "@/Slices/ServiceInstanceDetails/Utils";
import { MockedDependencyProvider, ServiceInstance, EnvironmentDetails } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { SetStateSection } from "./SetStateSection";

const mockedMutate = vi.hoisted(() => vi.fn());

vi.mock("@/Data/Queries/Slices/ServiceInstance", () => ({
  usePostStateTransfer: () => ({ mutate: mockedMutate }),
}));

const baseTransfer: TransferModel = {
  source: "up",
  target: "update_acknowledged",
  error: null,
  on_update: false,
  on_delete: false,
  api_set_state: true,
  resource_based: false,
  auto: false,
  validate: false,
  config_name: null,
  description: "",
  target_operation: null,
  error_operation: null,
};

const buildTarget = (overrides: Partial<StateTarget> = {}): StateTarget => ({
  target: "update_acknowledged",
  transfer: baseTransfer,
  buttonLabel: "update_acknowledged",
  advanced: false,
  ...overrides,
});

function renderSetStateSection(targets: StateTarget[] | null) {
  return render(
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider env={{ ...EnvironmentDetails.env, halted: false }}>
        <ModalProvider>
          <SetStateSection
            id={ServiceInstance.a.id}
            instance_identity={
              ServiceInstance.a.service_identity_attribute_value ?? ServiceInstance.a.id
            }
            version={ServiceInstance.a.version}
            service_entity={ServiceInstance.a.service_entity}
            targets={targets}
            onClose={vi.fn()}
          />
        </ModalProvider>
      </MockedDependencyProvider>
    </QueryClientProvider>
  );
}

describe("SetStateSection", () => {
  it("renders one item per target, using the resolved buttonLabel as the item text", () => {
    renderSetStateSection([
      buildTarget({ target: "a", buttonLabel: "a" }),
      buildTarget({ target: "b", buttonLabel: "b" }),
    ]);

    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
  });

  it("renders both entries when two targets share the same target state but come from differently-annotated transfers", () => {
    renderSetStateSection([
      buildTarget({
        target: "update_acknowledged",
        buttonLabel: "Acknowledge (fast)",
        transfer: { ...baseTransfer, target: "update_acknowledged", error: "fast_rejected" },
      }),
      buildTarget({
        target: "update_acknowledged",
        buttonLabel: "Acknowledge (slow)",
        transfer: { ...baseTransfer, target: "update_acknowledged", error: "slow_rejected" },
      }),
    ]);

    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    expect(screen.getByRole("menuitem", { name: "Acknowledge (fast)" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Acknowledge (slow)" })).toBeVisible();
  });
});
