import { render, screen } from "@testing-library/react";
import { AttributeValueCell } from "./ExpandableAttributeValue";

test("Given a long expandable value When rendered in a cell Then the preview holds the value once, without a hidden full copy", () => {
  const value = JSON.stringify({ description: "a".repeat(200) });

  render(
    <AttributeValueCell
      value={value}
      attribute={{ kind: "Json", key: "value", value, rawValue: value }}
      isExpanded={false}
      onToggle={() => undefined}
    />
  );

  // The preview is cut with CSS. Truncate's maxCharsDisplayed would split the text and add a
  // screen-reader copy of the rest that never wraps and widens the table.
  const button = screen.getByRole("button", { name: value });

  expect(button).toHaveTextContent(value);
  expect(button).not.toHaveTextContent("…");
});
