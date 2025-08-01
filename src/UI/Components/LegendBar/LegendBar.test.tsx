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

  await userEvent.click(screen.getByRole("generic", { name: "LegendItem-test" }));

  expect(onClick).toHaveBeenCalledWith("test");
});
