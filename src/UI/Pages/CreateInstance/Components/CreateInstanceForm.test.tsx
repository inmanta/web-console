import { AttributeModel, ServiceModel } from "@/Core";
import { render, screen } from "@testing-library/react";
import React from "react";
import { CreateInstanceForm } from "./CreateInstanceForm";

describe("CreateInstanceForm", () => {
  const attributes: AttributeModel[] = [
    {
      name: "name",
      type: "string?",
      description: "name",
      modifier: "rw+",
      default_value_set: false,
      default_value: null,
    },
    {
      name: "not_editable",
      type: "string",
      description: "a non updateable attribute",
      modifier: "rw",
      default_value_set: false,
      default_value: null,
    },
    {
      name: "read_only",
      type: "string",
      description: "a read-only",
      modifier: "r",
      default_value_set: false,
      default_value: null,
    },
  ];
  const serviceEntity: ServiceModel = {
    name: "test-service",
    attributes: attributes,
    environment: "env",
    lifecycle: { initial_state: "start", states: [], transfers: [] },
    config: {},
  };
  it("Shows create form ", async () => {
    render(
      <CreateInstanceForm
        serviceEntity={serviceEntity}
        handleRedirect={() => {
          return;
        }}
        onSubmit={async () => {
          return;
        }}
      />
    );
    expect(screen.getByRole("textbox", { name: "name" })).toBeVisible();
  });
});
