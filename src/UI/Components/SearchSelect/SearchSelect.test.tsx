import { ComponentProps, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchSelect, TEST_IDS } from "./SearchSelect";

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

  describe("with described options", () => {
    const OPTIONS_WITH_DESCRIPTIONS = [
      { value: "Apple", description: "A red fruit" },
      { value: "Banana", description: "A yellow fruit" },
    ];

    it("renders the description of each option", async () => {
      render(<Wrapper options={OPTIONS_WITH_DESCRIPTIONS} />);
      await userEvent.click(screen.getByTestId(TEST_IDS.toggle));
      const options = getSelectableOptions();

      OPTIONS_WITH_DESCRIPTIONS.forEach((option, index) => {
        expect(options[index]).toHaveTextContent(option.value);
        expect(options[index]).toHaveTextContent(option.description);
      });
    });

    it("filters on the value only, not the description", async () => {
      render(<Wrapper options={OPTIONS_WITH_DESCRIPTIONS} />);
      await userEvent.click(screen.getByTestId(TEST_IDS.toggle));

      // "fruit" appears in every description, but in no value
      await userEvent.type(screen.getByRole("textbox"), "fruit");
      expect(getSelectableOptions()).toHaveLength(0);

      await userEvent.clear(screen.getByRole("textbox"));
      await userEvent.type(screen.getByRole("textbox"), "banana");
      const filtered = getSelectableOptions();
      expect(filtered).toHaveLength(1);
      expect(filtered[0]).toHaveTextContent(OPTIONS_WITH_DESCRIPTIONS[1].value);
    });
  });
});
