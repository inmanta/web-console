import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { InstanceAttributeModel, ServiceModel } from "@/Core";
import { AttributeSets } from "@/Slices/ServiceInstanceDetails/Utils";
import { instanceData, serviceModel } from "../../../Test/mockData";
import { SetupWrapper } from "../../../Test/mockSetup";
import { AttributesTable } from "./AttributesTable";

const setup = (
  dropdownOptions: string[] = ["candidate_attributes"],
  attributeSets: Partial<Record<AttributeSets, InstanceAttributeModel>> = {
    candidate_attributes: instanceData.candidate_attributes ?? {},
  },
  customServiceModel: ServiceModel = serviceModel
) => {
  return render(
    <SetupWrapper expertMode={false}>
      <AttributesTable
        dropdownOptions={dropdownOptions}
        attributeSets={attributeSets}
        serviceModel={customServiceModel}
      />
    </SetupWrapper>
  );
};

describe("AttributesTable", () => {
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
    setup(["active_attributes", "candidate_attributes"], {
      active_attributes: { name: "active-name" },
      candidate_attributes: { name: "candidate-name" },
    });

    expect(screen.getByText("active-name")).toBeVisible();

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /select-attributeset/i }),
      "candidate_attributes"
    );

    expect(screen.getByText("candidate-name")).toBeVisible();
  });

  // When switching versions, the previously selected attribute set may not exist in the new version's dropdown.
  it("falls back to first option when selected set is removed from dropdown", () => {
    const { rerender } = setup(["active_attributes", "candidate_attributes"], {
      active_attributes: { name: "active-name" },
      candidate_attributes: { name: "candidate-name" },
    });

    rerender(
      <SetupWrapper expertMode={false}>
        <AttributesTable
          dropdownOptions={["active_attributes"]}
          attributeSets={{ active_attributes: { name: "active-name" } }}
          serviceModel={serviceModel}
        />
      </SetupWrapper>
    );

    expect(screen.getByText("active-name")).toBeVisible();
  });

  describe("unit formatting", () => {
    const bandwidthServiceModel: ServiceModel = {
      ...serviceModel,
      attributes: [
        ...serviceModel.attributes,
        {
          name: "bandwidth",
          description: "description",
          modifier: "rw+",
          type: "int",
          default_value: null,
          default_value_set: false,
          validation_type: null,
          validation_parameters: null,
          attribute_annotations: { web_presentation: "unit", web_unit: "kbit/s" },
        },
      ],
    };

    it("renders a unit-annotated attribute in its auto-selected display unit", () => {
      setup(
        ["candidate_attributes"],
        { candidate_attributes: { bandwidth: 150000 } },
        bandwidthServiceModel
      );

      expect(screen.getByText("150 Mbit/s")).toBeVisible();
    });

    it("shows the raw value and API unit in a tooltip", async () => {
      const user = userEvent.setup();

      setup(
        ["candidate_attributes"],
        { candidate_attributes: { bandwidth: 150000 } },
        bandwidthServiceModel
      );

      await user.hover(screen.getByText("150 Mbit/s"));

      expect(await screen.findByText("150000 kbit/s")).toBeInTheDocument();
    });

    it("falls back to the plain value when web_unit is unrecognized, without crashing", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const badServiceModel: ServiceModel = {
        ...serviceModel,
        attributes: [
          ...serviceModel.attributes,
          {
            name: "bandwidth",
            description: "description",
            modifier: "rw+",
            type: "int",
            default_value: null,
            default_value_set: false,
            validation_type: null,
            validation_parameters: null,
            attribute_annotations: { web_presentation: "unit", web_unit: "parsecs" },
          },
        ],
      };

      setup(
        ["candidate_attributes"],
        { candidate_attributes: { bandwidth: 150000 } },
        badServiceModel
      );

      expect(screen.getByText("150000")).toBeVisible();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unrecognized web_unit "parsecs"')
      );

      warnSpy.mockRestore();
    });
  });
});
