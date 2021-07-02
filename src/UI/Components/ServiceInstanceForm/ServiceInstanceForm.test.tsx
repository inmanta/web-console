import { TextInputTypes } from "@patternfly/react-core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ServiceInstanceForm } from "./ServiceInstanceForm";
import { Field } from "@/Core";

describe("ServiceInstanceForm", () => {
  const fields: Field[] = [
    {
      kind: "Flat",
      name: "name",
      isOptional: true,
      defaultValue: "",
      inputType: TextInputTypes.text,
      type: "string?",
      description: "desc",
    },
    {
      kind: "Flat",
      name: "not_editable",
      isOptional: false,
      defaultValue: "",
      inputType: TextInputTypes.text,
      type: "string",
      description: "a non updateable attribute",
    },
    {
      kind: "Flat",
      name: "boolean",
      isOptional: true,
      defaultValue: null,
      inputType: "bool",
      type: "bool?",
      description: "desc",
    },
  ];
  it("Renders form", async () => {
    render(
      <ServiceInstanceForm
        fields={fields}
        onCancel={() => {
          return;
        }}
        onSubmit={() => {
          return;
        }}
      />
    );
    expect(await screen.findByText("not_editable")).toBeVisible();
    expect(await screen.findByText("name")).toBeVisible();
    expect(await screen.findAllByRole("textbox")).toHaveLength(2);
    expect(await screen.findAllByRole("radio")).toHaveLength(3);
  });
  it("Handles form user inputs", async () => {
    render(
      <ServiceInstanceForm
        fields={fields}
        onCancel={() => {
          return;
        }}
        onSubmit={() => {
          return;
        }}
      />
    );
    const nameTextBox = screen.getAllByRole("textbox")[0];
    userEvent.type(nameTextBox, "test text");
    expect(nameTextBox).toHaveValue("test text");
    const trueRadioButton = screen.getAllByRole("radio")[0];
    userEvent.click(trueRadioButton);
    expect(trueRadioButton).toBeChecked();
  });
  it("Handles form submission", async () => {
    render(
      <ServiceInstanceForm
        fields={fields}
        onCancel={() => {
          return;
        }}
        onSubmit={(attributes) => {
          expect(attributes).toEqual([
            {
              name: "name",
              value: "test text",
              type: "string?",
            },
            {
              name: "not_editable",
              value: "",
              type: "string",
            },
            {
              name: "boolean",
              value: true,
              type: "bool?",
            },
          ]);
        }}
      />
    );
    const nameTextBox = screen.getAllByRole("textbox")[0];
    userEvent.type(nameTextBox, "test text");
    const trueRadioButton = screen.getAllByRole("radio")[0];
    userEvent.click(trueRadioButton);
    const submitButton = screen.getByText("Confirm");
    userEvent.click(submitButton);
  });
});
