import React from "react";
import { render, screen, within } from "@testing-library/react";
import { DictEditor } from "./DictEditor";
import userEvent from "@testing-library/user-event";

function setup() {
  const setValue = jest.fn();
  const setNewEntry = jest.fn();
  const isDeleteEntryAllowed = () => true;
  const component = (value: Record<string, string>) => (
    <DictEditor
      value={value}
      setValue={setValue}
      newEntry={["", ""]}
      setNewEntry={setNewEntry}
      isDeleteEntryAllowed={isDeleteEntryAllowed}
    />
  );

  return { component, setValue, setNewEntry };
}

test("GIVEN DictEditor WHEN given data THEN shows keys and values", () => {
  const { component } = setup();
  render(component({ keyA: "valA" }));

  const row = screen.getByRole("row", { name: "Row-keyA" });
  const keyInput = within(row).getByRole("textbox", { name: "editEntryKey" });
  expect(keyInput).toHaveValue("keyA");
  const valueInput = within(row).getByRole("textbox", {
    name: "editEntryValue",
  });
  expect(valueInput).toHaveValue("valA");
});

test("GIVEN DictEditor WHEN deleteEntry clicked THEN that entry is removed", () => {
  const { component, setValue } = setup();
  const { rerender } = render(component({ keyA: "valA", keyB: "valB" }));

  const rowA = screen.getByRole("row", { name: "Row-keyA" });
  const rowB = screen.getByRole("row", { name: "Row-keyB" });
  const deleteA = within(rowA).getByRole("button", {
    name: "DeleteEntryAction",
  });
  expect(deleteA).toBeEnabled();
  userEvent.click(deleteA);
  expect(setValue).toHaveBeenCalledTimes(1);
  rerender(component({ keyB: "valB" }));
  expect(rowA).not.toBeInTheDocument();
  expect(rowB).toBeInTheDocument();
});
