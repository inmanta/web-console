import { render, screen } from "@testing-library/react";
import { AttributeValueCell } from "./ExpandableAttributeValue";

test("Given a long expandable value When rendered in a cell Then only the preview is in the DOM and the full value is the button's name", () => {
  const value = JSON.stringify({ description: "a".repeat(200) });

  render(
    <AttributeValueCell
      value={value}
      attribute={{ kind: "Json", key: "value", value }}
      isExpanded={false}
      onToggle={() => undefined}
    />
  );

  const button = screen.getByRole("button", { name: value });

  // No hidden copy of the full value (like PF Truncate's screen-reader text), which widened the table.
  expect(button).toHaveTextContent(/^\{"description":"a{14}…$/);
});
