import { AttributeModel, ServiceModel } from "@/Core";
import { render, screen } from "@testing-library/react";
import React from "react";
import { CreateFormCard } from "./CreateFormCard";

describe("CreateFormCard", () => {
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
  it("Shows delete modal", async () => {
    render(
      <CreateFormCard
        serviceEntity={serviceEntity}
        handleRedirect={() => {
          return;
        }}
      />
    );
    expect(
      await screen.findByText(
        "Create a new instance of test-service with the following parameters"
      )
    ).toBeVisible();
  });
});
