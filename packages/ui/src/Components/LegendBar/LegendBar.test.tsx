import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { LegendBar } from "./LegendBar";

test("GIVEN LegendBar WHEN items have an onClick handler THEN handler is executed on click", async () => {
  const onClick = vi.fn();

  render(
    <LegendBar
      items={[
        {
          id: "test",
          backgroundColor: "black",
          value: 10,
          label: "test",
          onClick,
        },
      ]}
    />
  );

  expect(onClick).not.toHaveBeenCalled();

  await userEvent.click(screen.getByRole("button", { name: "LegendItem-test" }));

  expect(onClick).toHaveBeenCalledWith("test");
});

test("GIVEN LegendBar WHEN a clickable item is focused THEN Enter and Space execute the handler", async () => {
  const onClick = vi.fn();

  render(
    <LegendBar
      items={[
        {
          id: "test",
          backgroundColor: "black",
          value: 10,
          label: "test",
          onClick,
        },
      ]}
    />
  );

  await userEvent.tab();
  expect(screen.getByRole("button", { name: "LegendItem-test" })).toHaveFocus();

  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard(" ");

  expect(onClick).toHaveBeenCalledTimes(2);
});

test("GIVEN LegendBar WHEN items have no onClick handler THEN they are not exposed as buttons", () => {
  render(
    <LegendBar
      items={[
        {
          id: "test",
          backgroundColor: "black",
          value: 10,
          label: "test",
          isActive: true,
        },
      ]}
    />
  );

  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(screen.getByLabelText("LegendItem-test")).not.toHaveAttribute("aria-pressed");
});
