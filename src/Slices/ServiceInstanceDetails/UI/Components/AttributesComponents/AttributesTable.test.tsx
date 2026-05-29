import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { instanceData, serviceModel } from "../../../Test/mockData";
import { SetupWrapper } from "../../../Test/mockSetup";
import { AttributesTable } from "./AttributesTable";

const setup = () => {
  render(
    <SetupWrapper expertMode={false}>
      <AttributesTable
        dropdownOptions={["candidate_attributes"]}
        attributeSets={{ candidate_attributes: instanceData.candidate_attributes ?? {} }}
        serviceModel={serviceModel}
      />
    </SetupWrapper>
  );
};

it("leaf attribute row should have data-expandable false", () => {
  setup();

  const nameCell = screen.getByLabelText("name_attribute");

  expect(nameCell).toHaveAttribute("data-expandable", "false");
});

it("parent attribute row with nested children should have data-expandable true", () => {
  setup();

  const siteCell = screen.getByLabelText("site_attribute");

  expect(siteCell).toHaveAttribute("data-expandable", "true");
});

it("clicking a parent attribute row expands its children", async () => {
  setup();

  expect(screen.getByText("infra_vendor")).not.toBeVisible();

  await userEvent.click(screen.getByLabelText("site_attribute"));

  expect(screen.getByText("infra_vendor")).toBeVisible();
});

it("switching the attribute set shows the data for the selected set", async () => {
  render(
    <SetupWrapper expertMode={false}>
      <AttributesTable
        dropdownOptions={["active_attributes", "candidate_attributes"]}
        attributeSets={{
          active_attributes: { name: "active-name" },
          candidate_attributes: { name: "candidate-name" },
        }}
        serviceModel={serviceModel}
      />
    </SetupWrapper>
  );

  expect(screen.getByText("active-name")).toBeVisible();

  await userEvent.selectOptions(
    screen.getByRole("combobox", { name: /select-attributeset/i }),
    "candidate_attributes"
  );

  expect(screen.getByText("candidate-name")).toBeVisible();
});
