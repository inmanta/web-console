import assert from "assert";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { words } from "@inmanta/web-console-core";
import { Service } from "@inmanta/web-console-test-utils";
import { InstanceSummaryLabels } from "./InstanceSummaryLabels";
import { SummaryLabel } from "./types";

const { lifecycle, instance_summary: summary } = Service.withEachLabel;
const states = lifecycle.states;

assert(summary);

test("GIVEN InstanceSummaryLabels THEN only the non-zero counts are shown, most severe first", () => {
  render(<InstanceSummaryLabels summary={summary} states={states} />);

  const labels = within(screen.getByLabelText(words("catalog.summary.title"))).getAllByText(
    /^\d+$/
  );

  const expectedLabels: SummaryLabel[] = ["danger", "info", "success", "no_label"];

  expect(labels.map((label) => label.textContent)).toEqual(
    expectedLabels.map((label) => String(summary.by_label[label]))
  );
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("GIVEN InstanceSummaryLabels WHEN a label is hovered THEN its tooltip lists the count per state", async () => {
  render(<InstanceSummaryLabels summary={summary} states={states} />);

  await userEvent.hover(screen.getByText(String(summary.by_label.info)));

  const tooltip = await screen.findByRole("tooltip");
  const infoStates = states.filter((state) => state.label === "info");

  expect(within(tooltip).getByText(words("catalog.summary.label.info"))).toBeInTheDocument();
  infoStates.forEach((state) => {
    const stateDisplayName = state.annotations?.web_label || state.name;

    expect(within(tooltip).getByText(stateDisplayName).nextElementSibling).toHaveTextContent(
      String(summary.by_state[state.name])
    );
  });
});

test("GIVEN InstanceSummaryLabels WHEN a label gets keyboard focus THEN its tooltip opens", async () => {
  render(<InstanceSummaryLabels summary={summary} states={states} />);

  const dangerLabel = screen.getByText(String(summary.by_label.danger)).closest("[tabindex]");

  await userEvent.tab();

  expect(dangerLabel).toHaveFocus();
  expect(
    within(await screen.findByRole("tooltip")).getByText(words("catalog.summary.label.danger"))
  ).toBeInTheDocument();
});

test("GIVEN InstanceSummaryLabels with filtering WHEN a label is clicked THEN it is toggled", async () => {
  const onToggle = vi.fn();

  render(
    <InstanceSummaryLabels
      summary={summary}
      states={states}
      filtering={{ activeLabel: "danger", onToggle }}
    />
  );

  expect(
    screen.getByRole("button", {
      name: `${words("catalog.summary.label.danger")}: ${summary.by_label.danger}`,
      pressed: true,
    })
  ).toBeVisible();

  await userEvent.click(
    screen.getByRole("button", {
      name: `${words("catalog.summary.label.no_label")}: ${summary.by_label.no_label}`,
      pressed: false,
    })
  );

  expect(onToggle).toHaveBeenCalledWith("no_label");
});
