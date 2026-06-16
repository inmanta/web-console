import { ComponentProps, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchSelect, TEST_IDS } from "./SearchSelect";

const OPTIONS = [
  { value: "Apple" },
  { value: "Banana" },
  { value: "Blueberry" },
  { value: "Cherry" },
  { value: "Grape" },
];

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

  describe("with children", () => {
    const OPTIONS_WITH_CHILDREN = [
      {
        value: "Apple",
        children: (
          <>
            Apple <span>A red fruit</span>
          </>
        ),
      },
      {
        value: "Banana",
        children: (
          <>
            Banana <span>A yellow fruit</span>
          </>
        ),
      },
    ];

    it("renders the children of each option", async () => {
      render(<Wrapper options={OPTIONS_WITH_CHILDREN} />);
      await userEvent.click(screen.getByTestId(TEST_IDS.toggle));
      const options = getSelectableOptions();

      expect(options[0]).toHaveTextContent("Apple");
      expect(options[0]).toHaveTextContent("A red fruit");
      expect(options[1]).toHaveTextContent("Banana");
      expect(options[1]).toHaveTextContent("A yellow fruit");
    });

    it("shows the full children on the toggle after selection", async () => {
      render(<Wrapper options={OPTIONS_WITH_CHILDREN} />);
      await userEvent.click(screen.getByTestId(TEST_IDS.toggle));
      await userEvent.click(getSelectableOptions().find((o) => o.textContent?.includes("Banana"))!);
      const toggle = screen.getByTestId(TEST_IDS.toggle);
      expect(toggle).toHaveTextContent("Banana");
      expect(toggle).toHaveTextContent("A yellow fruit");
    });

    it("filters on the value only, not the children content", async () => {
      render(<Wrapper options={OPTIONS_WITH_CHILDREN} />);
      await userEvent.click(screen.getByTestId(TEST_IDS.toggle));

      // "fruit" appears in every children, but in no value
      await userEvent.type(screen.getByRole("textbox"), "fruit");
      expect(getSelectableOptions()).toHaveLength(0);

      await userEvent.clear(screen.getByRole("textbox"));
      await userEvent.type(screen.getByRole("textbox"), "banana");
      const filtered = getSelectableOptions();
      expect(filtered).toHaveLength(1);
      expect(filtered[0]).toHaveTextContent(OPTIONS_WITH_CHILDREN[1].value);
    });
  });
});
