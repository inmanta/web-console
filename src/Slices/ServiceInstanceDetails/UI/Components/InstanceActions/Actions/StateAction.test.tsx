import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { TransferModel } from "@/Core";
import { StateTarget } from "@/Slices/ServiceInstanceDetails/Utils";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { StateAction } from "./StateAction";

const baseTransfer: TransferModel = {
  source: "up",
  target: "setting_start",
  error: null,
  on_update: false,
  on_delete: false,
  api_set_state: true,
  resource_based: false,
  auto: false,
  validate: false,
  config_name: null,
  description: "push settings to the running service",
  target_operation: null,
  error_operation: null,
};

const buildTarget = (overrides: Partial<StateTarget> = {}): StateTarget => ({
  target: "setting_start",
  transfer: baseTransfer,
  buttonLabel: "setting_start",
  advanced: false,
  ...overrides,
});

function renderStateAction(
  targets: StateTarget[],
  advancedTargets: StateTarget[] = [],
  collapseToggle = vi.fn()
) {
  return render(
    <ModalProvider>
      <StateAction
        targets={targets}
        advancedTargets={advancedTargets}
        instance_display_identity="ntels.com"
        instance_id="instance-id"
        service_entity="testService"
        version={1}
        collapseToggle={collapseToggle}
        setInterfaceBlocked={vi.fn()}
      />
    </ModalProvider>
  );
}

describe("StateAction", () => {
  it("renders the resolved buttonLabel as the item text, without an icon, when there is no icon annotation", () => {
    renderStateAction([buildTarget({ buttonLabel: "setting_start" })]);

    const item = screen.getByRole("menuitem", { name: "setting_start" });

    expect(item).toBeVisible();
    expect(item.querySelector("svg")).not.toBeInTheDocument();
  });

  it("renders the transfer's web_icon", () => {
    renderStateAction([buildTarget({ buttonLabel: "Push settings", buttonIcon: "FaSlidersH" })]);

    const item = screen.getByRole("menuitem", { name: "Push settings" });

    expect(screen.getByTestId("FaSlidersH")).toBeInTheDocument();
    expect(item).toContainElement(screen.getByTestId("FaSlidersH"));
  });

  it("applies PatternFly's danger styling to the text, plus an explicit icon color since isDanger alone leaves the icon uncolored", async () => {
    renderStateAction([
      buildTarget({
        buttonLabel: "Delete everything",
        buttonIcon: "FaTrash",
        buttonVariant: "danger",
      }),
    ]);

    const item = screen.getByRole("menuitem", { name: "Delete everything" });
    const listItem = item.closest("li") as HTMLElement;

    // PatternFly's own isDanger modifier (colors the text)
    expect(listItem).toHaveClass("pf-m-danger");
    // PatternFly's Icon sets its own color default on the icon wrapper, shadowing any
    // inherited/CSS-variable color, so the icon is colored via an explicit inline
    // style instead (the only override react-icons honors). DynamicFAIcon loads the
    // icon lazily, so the <svg> only appears after that resolves.
    await waitFor(() => expect(item.querySelector("svg")).not.toBeNull());
    const svg = item.querySelector("svg") as SVGElement;

    expect(svg.style.color).toBe("var(--pf-t--global--icon--color--status--danger--default)");
  });

  it("colors both the icon and the text for a warning-variant transfer, unlike the design mock which only tints the icon", async () => {
    renderStateAction([
      buildTarget({
        buttonLabel: "Push settings",
        buttonIcon: "FaSlidersH",
        buttonVariant: "warning",
      }),
    ]);

    const item = screen.getByRole("menuitem", { name: "Push settings" });
    const listItem = item.closest("li") as HTMLElement;

    expect(listItem).not.toHaveClass("pf-m-danger");
    // text color: no PatternFly modifier exists for warning, so it's set via our own override
    expect(getComputedStyle(listItem).getPropertyValue("--pf-v6-c-menu__item--Color")).toContain(
      "--pf-t--global--text--color--status--warning--default"
    );
    // icon color: set via the same inline-style mechanism as danger
    await waitFor(() => expect(item.querySelector("svg")).not.toBeNull());
    const svg = item.querySelector("svg") as SVGElement;

    expect(svg.style.color).toBe("var(--pf-t--global--icon--color--status--warning--default)");
  });

  it("renders one item per target", () => {
    renderStateAction([
      buildTarget({ target: "a", buttonLabel: "a" }),
      buildTarget({ target: "b", buttonLabel: "b" }),
    ]);

    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
  });

  it("renders both entries when two targets share the same target state but come from differently-annotated transfers", () => {
    renderStateAction([
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

  it("does not render an Advanced item when there are no advanced targets", () => {
    renderStateAction([buildTarget()]);

    expect(screen.queryByRole("menuitem", { name: "Advanced" })).not.toBeInTheDocument();
  });

  it("hides an advanced target behind a collapsed Advanced disclosure until it is clicked", async () => {
    renderStateAction(
      [buildTarget()],
      [
        buildTarget({
          target: "maintenance",
          buttonLabel: "Enter maintenance mode",
          advanced: true,
        }),
      ]
    );

    expect(
      screen.queryByRole("menuitem", { name: "Enter maintenance mode" })
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("menuitem", { name: "Advanced" }));

    expect(screen.getByRole("menuitem", { name: "Enter maintenance mode" })).toBeVisible();
  });

  it("does not collapse the outer Actions dropdown when the Advanced disclosure is toggled, unlike selecting a target", async () => {
    const collapseToggle = vi.fn();

    renderStateAction(
      [],
      [
        buildTarget({
          target: "maintenance",
          buttonLabel: "Enter maintenance mode",
          advanced: true,
        }),
      ],
      collapseToggle
    );

    await userEvent.click(screen.getByRole("menuitem", { name: "Advanced" }));

    // expanding the disclosure itself is not a state-transfer selection, so it must not
    // collapse the outer Actions dropdown the way selecting a target does
    expect(collapseToggle).not.toHaveBeenCalled();
    expect(screen.getByRole("menuitem", { name: "Enter maintenance mode" })).toBeVisible();
  });
});
