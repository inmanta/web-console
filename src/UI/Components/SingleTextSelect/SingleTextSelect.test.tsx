import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { SingleTextSelect } from "./SingleTextSelect";

const options = [
  { children: "Apple", value: "apple" },
  { children: "Banana", value: "banana" },
  { children: "Cherry", value: "cherry" },
];

test("SingleTextSelect renders with placeholder text", () => {
  render(
    <SingleTextSelect
      selected={null}
      setSelected={vi.fn()}
      options={options}
      placeholderText="Select a fruit"
    />
  );
  expect(screen.getByPlaceholderText("Select a fruit")).toBeVisible();
});

test("SingleTextSelect opens dropdown on click", async () => {
  render(<SingleTextSelect selected={null} setSelected={vi.fn()} options={options} />);
  await userEvent.click(screen.getByRole("combobox"));
  expect(screen.getByText("Apple")).toBeVisible();
});

test("SingleTextSelect calls setSelected when selecting an option", async () => {
  const setSelected = vi.fn();

  render(<SingleTextSelect selected={null} setSelected={setSelected} options={options} />);
  await userEvent.click(screen.getByRole("combobox"));
  await userEvent.click(screen.getByText("Apple"));

  expect(setSelected).toHaveBeenCalledWith("apple");
});

test("SingleTextSelect filters options based on input", async () => {
  render(<SingleTextSelect selected={null} setSelected={vi.fn()} options={options} hasCreation />);
  await userEvent.click(screen.getByRole("combobox"));
  await userEvent.type(screen.getByRole("combobox"), "ban");

  expect(screen.getByText("Banana")).toBeVisible();
  expect(screen.queryByText("Apple")).not.toBeInTheDocument();
});

test("SingleTextSelect selects exact match on Enter regardless of casing", async () => {
  const setSelected = vi.fn();

  render(<SingleTextSelect selected={null} setSelected={setSelected} options={options} />);
  await userEvent.type(screen.getByRole("combobox"), "APPLE");
  await userEvent.keyboard("{Enter}");

  expect(setSelected).toHaveBeenCalledWith("apple");
});

test("SingleTextSelect shows Create option when hasCreation is true and no match exists", async () => {
  render(<SingleTextSelect selected={null} setSelected={vi.fn()} options={options} hasCreation />);
  await userEvent.type(screen.getByRole("combobox"), "Mango");

  expect(screen.getByText('Create "Mango"')).toBeVisible();
});

test("SingleTextSelect calls onCreate and setSelected when creating a new entry via Enter", async () => {
  const setSelected = vi.fn();
  const onCreate = vi.fn();

  render(
    <SingleTextSelect
      selected={null}
      setSelected={setSelected}
      options={options}
      hasCreation
      onCreate={onCreate}
    />
  );
  await userEvent.type(screen.getByRole("combobox"), "Mango");
  await userEvent.keyboard("{Enter}");

  expect(onCreate).toHaveBeenCalledWith("Mango");
  expect(setSelected).toHaveBeenCalledWith("Mango");
});

test("SingleTextSelect calls onCreate and setSelected when clicking the Create option", async () => {
  const setSelected = vi.fn();
  const onCreate = vi.fn();

  render(
    <SingleTextSelect
      selected={null}
      setSelected={setSelected}
      options={options}
      hasCreation
      onCreate={onCreate}
    />
  );
  await userEvent.type(screen.getByRole("combobox"), "Mango");
  await userEvent.click(screen.getByText('Create "Mango"'));

  expect(onCreate).toHaveBeenCalledWith("Mango");
  expect(setSelected).toHaveBeenCalledWith("Mango");
});

test("SingleTextSelect clears input when clear button is clicked", async () => {
  const setSelected = vi.fn();

  render(<SingleTextSelect selected={null} setSelected={setSelected} options={options} />);
  await userEvent.type(screen.getByRole("combobox"), "Apple");
  await userEvent.click(screen.getByLabelText("Clear input value"));

  expect(setSelected).toHaveBeenCalledWith("");
  expect(screen.getByRole("combobox")).toHaveValue("");
});
