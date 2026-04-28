import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { words } from "@/UI";
import { StatusFilterSelect } from "./StatusFilterSelect";

const StatusFilterHarness: React.FC<{ initial?: string[] }> = ({ initial }) => {
  const [selected, setSelected] = useState<string[]>(initial ?? []);

  return <StatusFilterSelect selectedStatuses={selected} onChange={setSelected} />;
};

describe("StatusFilterSelect", () => {
  it("allows including and excluding statuses while preventing conflicting selections", async () => {
    render(<StatusFilterHarness />);

    const handlerRunToggle = screen.getByRole("button", {
      name: `${words("resources.filters.status.lastHandlerRun.label")}-toggle`,
    });
    await userEvent.click(handlerRunToggle);

    // Initial state: both inactive
    const skippedIncludeInactive = await screen.findByRole("generic", {
      name: "skipped-include-inactive",
    });
    const skippedExcludeInactive = await screen.findByRole("generic", {
      name: "skipped-exclude-inactive",
    });
    expect(skippedIncludeInactive).toBeVisible();
    expect(skippedExcludeInactive).toBeVisible();

    // Include skipped
    const skippedIncludeToggle = screen.getByRole("button", { name: "skipped-include-toggle" });
    await userEvent.click(skippedIncludeToggle);

    const skippedIncludeActive = await screen.findByRole("generic", {
      name: "skipped-include-active",
    });
    const skippedExcludeActive = screen.queryByRole("generic", { name: "skipped-exclude-active" });
    expect(skippedIncludeActive).toBeVisible();
    expect(skippedExcludeActive).not.toBeInTheDocument();

    // Exclude skipped — should clear the include
    const skippedExcludeToggle = screen.getByRole("button", { name: "skipped-exclude-toggle" });
    await userEvent.click(skippedExcludeToggle);

    const skippedIncludeInactiveAgain = await screen.findByRole("generic", {
      name: "skipped-include-inactive",
    });
    const skippedExcludeActiveNow = await screen.findByRole("generic", {
      name: "skipped-exclude-active",
    });
    expect(skippedIncludeInactiveAgain).toBeVisible();
    expect(skippedExcludeActiveNow).toBeVisible();

    // Include failed in the same dropdown — both states visible simultaneously
    const failedIncludeToggle = screen.getByRole("button", { name: "failed-include-toggle" });
    await userEvent.click(failedIncludeToggle);

    const failedIncludeActive = await screen.findByRole("generic", {
      name: "failed-include-active",
    });
    const skippedExcludeStillActive = await screen.findByRole("generic", {
      name: "skipped-exclude-active",
    });
    expect(failedIncludeActive).toBeVisible();
    expect(skippedExcludeStillActive).toBeVisible();

    // Click failed include again — should deactivate
    await userEvent.click(failedIncludeToggle);

    const failedIncludeInactive = await screen.findByRole("generic", {
      name: "failed-include-inactive",
    });
    expect(failedIncludeInactive).toBeVisible();
  });

  it("keeps the select open when an option is chosen to allow multiple selections", async () => {
    render(<StatusFilterHarness />);

    const handlerRunToggle = screen.getByRole("button", {
      name: `${words("resources.filters.status.lastHandlerRun.label")}-toggle`,
    });
    await userEvent.click(handlerRunToggle);

    const failedIncludeToggle = screen.getByRole("button", { name: "failed-include-toggle" });
    await userEvent.click(failedIncludeToggle);

    // Dropdown stays open — active state is immediately visible
    const failedIncludeActive = await screen.findByRole("generic", {
      name: "failed-include-active",
    });
    expect(failedIncludeActive).toBeVisible();
  });

  it("allows including and excluding options from the compliance dropdown", async () => {
    render(<StatusFilterHarness />);

    const complianceToggle = screen.getByRole("button", {
      name: `${words("resources.filters.status.compliance.label")}-toggle`,
    });
    await userEvent.click(complianceToggle);

    const compliantIncludeInactive = await screen.findByRole("generic", {
      name: "compliant-include-inactive",
    });
    expect(compliantIncludeInactive).toBeVisible();

    const compliantIncludeToggle = screen.getByRole("button", { name: "compliant-include-toggle" });
    await userEvent.click(compliantIncludeToggle);

    const compliantIncludeActive = await screen.findByRole("generic", {
      name: "compliant-include-active",
    });
    expect(compliantIncludeActive).toBeVisible();

    // Exclude compliant — should clear the include
    const compliantExcludeToggle = screen.getByRole("button", { name: "compliant-exclude-toggle" });
    await userEvent.click(compliantExcludeToggle);

    const compliantIncludeInactiveAgain = await screen.findByRole("generic", {
      name: "compliant-include-inactive",
    });
    const compliantExcludeActive = await screen.findByRole("generic", {
      name: "compliant-exclude-active",
    });
    expect(compliantIncludeInactiveAgain).toBeVisible();
    expect(compliantExcludeActive).toBeVisible();
  });

  it("allows including and excluding options from the blocked dropdown", async () => {
    render(<StatusFilterHarness />);

    const blockedToggle = screen.getByRole("button", {
      name: `${words("resources.filters.status.blocked.label")}-toggle`,
    });
    await userEvent.click(blockedToggle);

    const blockedIncludeInactive = await screen.findByRole("generic", {
      name: "blocked-include-inactive",
    });
    expect(blockedIncludeInactive).toBeVisible();

    const blockedIncludeToggle = screen.getByRole("button", { name: "blocked-include-toggle" });
    await userEvent.click(blockedIncludeToggle);

    const blockedIncludeActive = await screen.findByRole("generic", {
      name: "blocked-include-active",
    });
    expect(blockedIncludeActive).toBeVisible();

    // Exclude blocked — should clear the include
    const blockedExcludeToggle = screen.getByRole("button", { name: "blocked-exclude-toggle" });
    await userEvent.click(blockedExcludeToggle);

    const blockedIncludeInactiveAgain = await screen.findByRole("generic", {
      name: "blocked-include-inactive",
    });
    const blockedExcludeActive = await screen.findByRole("generic", {
      name: "blocked-exclude-active",
    });
    expect(blockedIncludeInactiveAgain).toBeVisible();
    expect(blockedExcludeActive).toBeVisible();
  });

  it("toggles the isDeploying switch on and off", async () => {
    render(<StatusFilterHarness />);

    const isDeployingSwitch = screen.getByRole("switch", { name: "Is Deploying" });
    expect(isDeployingSwitch).not.toBeChecked();

    await userEvent.click(isDeployingSwitch);
    expect(isDeployingSwitch).toBeChecked();

    await userEvent.click(isDeployingSwitch);
    expect(isDeployingSwitch).not.toBeChecked();
  });
});
