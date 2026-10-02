import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { InstancesByLabel } from "@/Core";
import { words } from "@/UI/words";
import { InstanceSummaryLabels } from "./InstanceSummaryLabels";

const byLabel: InstancesByLabel = { danger: 3, warning: 0, success: 116, info: 0, no_label: 4 };

test("GIVEN InstanceSummaryLabels THEN only the non-zero counts are shown, most severe first", () => {
  render(<InstanceSummaryLabels byLabel={byLabel} />);

  const labels = within(screen.getByLabelText(words("catalog.summary.title"))).getAllByText(
    /^\d+$/
  );

  expect(labels.map((label) => label.textContent)).toEqual([
    String(byLabel.danger),
    String(byLabel.success),
    String(byLabel.no_label),
  ]);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("GIVEN InstanceSummaryLabels with filtering WHEN a label is clicked THEN it is toggled", async () => {
  const onToggle = vi.fn();

  render(
    <InstanceSummaryLabels byLabel={byLabel} filtering={{ activeLabel: "danger", onToggle }} />
  );

  expect(
    screen.getByRole("button", { name: `danger: ${byLabel.danger}`, pressed: true })
  ).toBeVisible();

  await userEvent.click(
    screen.getByRole("button", {
      name: `${words("catalog.summary.noLabel")}: ${byLabel.no_label}`,
      pressed: false,
    })
  );

  expect(onToggle).toHaveBeenCalledWith("no_label");
});
