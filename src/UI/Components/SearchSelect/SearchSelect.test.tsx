import { ComponentProps, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchSelect } from "./SearchSelect";

export const TEST_IDS = {
  toggle: "swm-toggle",
  input: "swm-input",
};

const OPTIONS = ["Apple", "Banana", "Blueberry", "Cherry", "Grape"];

function Wrapper({
  initialValue = "",
  ...props
}: Partial<ComponentProps<typeof SearchSelect>> & { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);

  return <SearchSelect value={value} options={OPTIONS} onChange={setValue} {...props} />;
}

// Excludes the disabled "No results found" menuitem.
const getSelectableOptions = () =>
  screen.queryAllByRole("menuitem").filter((el) => !el.hasAttribute("disabled"));

describe("SearchSelect", () => {
  it("shows the selected value on the toggle", () => {
    render(<Wrapper initialValue="Apple" />);
    expect(screen.getByTestId(TEST_IDS.toggle)).toHaveTextContent("Apple");
  });

  it("filters options as the user types", async () => {
    render(<Wrapper />);
    await userEvent.click(screen.getByTestId(TEST_IDS.toggle));
    await userEvent.type(screen.getByRole("textbox"), "b");
    const options = getSelectableOptions();
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Banana");
    expect(options[1]).toHaveTextContent("Blueberry");
  });

  it("shows no selectable options when the search matches nothing", async () => {
    render(<Wrapper />);
    await userEvent.click(screen.getByTestId(TEST_IDS.toggle));
    await userEvent.type(screen.getByRole("textbox"), "zzz");
    expect(getSelectableOptions()).toHaveLength(0);
  });

  it("updates the toggle with the selected option", async () => {
    render(<Wrapper />);
    await userEvent.click(screen.getByTestId(TEST_IDS.toggle));
    await userEvent.click(getSelectableOptions().find((o) => o.textContent?.includes("Cherry"))!);
    expect(screen.getByTestId(TEST_IDS.toggle)).toHaveTextContent("Cherry");
  });
});
