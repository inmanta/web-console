import { render, screen, waitFor } from "@testing-library/react";
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
  ...overrides,
});

function renderStateAction(targets: StateTarget[]) {
  return render(
    <ModalProvider>
      <StateAction
        targets={targets}
        instance_display_identity="ntels.com"
        instance_id="instance-id"
        service_entity="testService"
        version={1}
        collapseToggle={vi.fn()}
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
});
