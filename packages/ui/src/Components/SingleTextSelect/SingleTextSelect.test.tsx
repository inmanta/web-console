import { render, screen, waitFor } from "@testing-library/react";
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
  await waitFor(() => expect(screen.getByText("Apple")).toBeInTheDocument());
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

  expect(screen.getByText("Banana")).toBeInTheDocument();
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

  expect(screen.getByText('Create "Mango"')).toBeInTheDocument();
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

test("SingleTextSelect clears input when the selection is reset from outside", async () => {
  const { rerender } = render(
    <SingleTextSelect selected={null} setSelected={vi.fn()} options={options} />
  );

  await userEvent.click(screen.getByRole("combobox"));
  await userEvent.click(screen.getByText("Apple"));
  rerender(<SingleTextSelect selected="apple" setSelected={vi.fn()} options={options} />);

  expect(screen.getByRole("combobox")).toHaveValue("Apple");

  rerender(<SingleTextSelect selected={null} setSelected={vi.fn()} options={options} />);

  expect(screen.getByRole("combobox")).toHaveValue("");
});

test("SingleTextSelect keeps typed text while nothing is selected", async () => {
  const { rerender } = render(
    <SingleTextSelect selected={null} setSelected={vi.fn()} options={options} />
  );

  await userEvent.type(screen.getByRole("combobox"), "Ban");
  rerender(<SingleTextSelect selected={null} setSelected={vi.fn()} options={[...options]} />);

  expect(screen.getByRole("combobox")).toHaveValue("Ban");
});

test("SingleTextSelect drops typed text that was not picked when the menu closes", async () => {
  const setSelected = vi.fn();

  render(<SingleTextSelect selected={null} setSelected={setSelected} options={options} />);

  await userEvent.type(screen.getByRole("combobox"), "Ban");
  await userEvent.click(document.body);

  expect(screen.getByRole("combobox")).toHaveValue("");
  expect(setSelected).not.toHaveBeenCalled();
});

test("SingleTextSelect shows the selected option again when the menu closes", async () => {
  const [apple] = options;

  render(<SingleTextSelect selected={apple.value} setSelected={vi.fn()} options={options} />);

  await userEvent.clear(screen.getByRole("combobox"));
  await userEvent.type(screen.getByRole("combobox"), "Ch");
  await userEvent.keyboard("{Escape}");

  expect(screen.getByRole("combobox")).toHaveValue(apple.children);
});

test("SingleTextSelect searches for the selected value until the options give its name", () => {
  const [apple, banana] = options;
  const onSearchTextChanged = vi.fn();
  const { rerender } = render(
    <SingleTextSelect
      selected={apple.value}
      setSelected={vi.fn()}
      options={[banana]}
      onSearchTextChanged={onSearchTextChanged}
    />
  );

  expect(onSearchTextChanged).toHaveBeenLastCalledWith(apple.value);
  expect(screen.getByRole("combobox")).toHaveValue(apple.value);

  rerender(
    <SingleTextSelect
      selected={apple.value}
      setSelected={vi.fn()}
      options={[apple]}
      onSearchTextChanged={onSearchTextChanged}
    />
  );

  expect(onSearchTextChanged).toHaveBeenLastCalledWith("");
  expect(screen.getByRole("combobox")).toHaveValue(apple.children);
});

test("SingleTextSelect keeps the selected option's name when a search narrows the options without it", async () => {
  const [apple, , cherry] = options;
  const { rerender } = render(
    <SingleTextSelect selected={apple.value} setSelected={vi.fn()} options={options} />
  );

  await userEvent.clear(screen.getByRole("combobox"));
  await userEvent.type(screen.getByRole("combobox"), "Ch");
  rerender(<SingleTextSelect selected={apple.value} setSelected={vi.fn()} options={[cherry]} />);
  await userEvent.keyboard("{Escape}");

  expect(screen.getByRole("combobox")).toHaveValue(apple.children);
});
