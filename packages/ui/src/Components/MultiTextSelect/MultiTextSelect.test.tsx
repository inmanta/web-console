import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MultiTextSelect } from "./MultiTextSelect";

const options = [
  { children: "Apple", value: "apple" },
  { children: "Banana", value: "banana" },
  { children: "Cherry", value: "cherry" },
];

test("MultiTextSelect shows the picked options as labels", () => {
  const [apple, banana] = options;

  render(
    <MultiTextSelect
      selected={[apple.value, banana.value]}
      setSelected={vi.fn()}
      options={options}
      hasChips
    />
  );

  expect(screen.getByText(apple.children)).toBeVisible();
  expect(screen.getByText(banana.children)).toBeVisible();
});

test("MultiTextSelect keeps the names of picked options when a search narrows the options without them", () => {
  const [apple, , cherry] = options;
  const { rerender } = render(
    <MultiTextSelect selected={[apple.value]} setSelected={vi.fn()} options={options} hasChips />
  );

  rerender(
    <MultiTextSelect selected={[apple.value]} setSelected={vi.fn()} options={[cherry]} hasChips />
  );

  expect(screen.getByText(apple.children)).toBeVisible();
});

test("MultiTextSelect keeps typed text while picking and drops it when the menu closes", async () => {
  const [, banana] = options;
  const setSelected = vi.fn();

  render(<MultiTextSelect selected={[]} setSelected={setSelected} options={options} />);

  await userEvent.type(screen.getByRole("combobox"), "an");
  await userEvent.click(screen.getByRole("option", { name: banana.value }));

  expect(setSelected).toHaveBeenCalledWith(banana.value);
  expect(screen.getByRole("combobox")).toHaveValue("an");

  await userEvent.keyboard("{Escape}");

  expect(screen.getByRole("combobox")).toHaveValue("");
});
