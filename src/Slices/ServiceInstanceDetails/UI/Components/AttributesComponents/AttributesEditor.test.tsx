import { UseInfiniteQueryResult, UseQueryResult } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import { InstanceDetailsContext } from "@/Slices/ServiceInstanceDetails/Core/Context";
import { AttributeSets } from "@/Slices/ServiceInstanceDetails/Utils";
import { instanceData } from "../../../Test/mockData";
import { SetupWrapper } from "../../../Test/mockSetup";
import { AttributesEditor } from "./AttributesEditor";

// Monaco can't run in JSDOM, so the editor is stubbed to capture the data it receives.
const { JSONEditorMock } = vi.hoisted(() => ({
  JSONEditorMock: vi.fn(({ data }: { data: string }) => <pre>{data}</pre>),
}));

vi.mock("@/UI/Components/JSONEditor", () => ({ JSONEditor: JSONEditorMock }));

const setup = (
  dropdownOptions: string[],
  attributeSets: Partial<Record<AttributeSets, InstanceAttributeModel>>
) => (
  <SetupWrapper expertMode={false}>
    <InstanceDetailsContext.Provider
      value={{
        instance: instanceData,
        logsQuery: {} as UseInfiniteQueryResult<InstanceLog[], Error>,
        serviceModelQuery: {} as UseQueryResult<ServiceModel, Error>,
      }}
    >
      <AttributesEditor
        dropdownOptions={dropdownOptions}
        attributeSets={attributeSets}
        service_entity={instanceData.service_entity}
        selectedVersion={String(instanceData.version)}
      />
    </InstanceDetailsContext.Provider>
  </SetupWrapper>
);

describe("AttributesEditor", () => {
  afterEach(() => {
    JSONEditorMock.mockClear();
  });

  // When switching versions, the previously selected attribute set may not exist in the new version's dropdown.
  it("falls back to first option when selected set is removed from dropdown", async () => {
    const { rerender } = render(
      setup(["active_attributes", "candidate_attributes"], {
        active_attributes: { name: "active-name" },
        candidate_attributes: { name: "candidate-name" },
      })
    );

    const select = screen.getByRole("combobox", { name: /select-attributeset/i });

    await userEvent.selectOptions(select, "candidate_attributes");

    rerender(setup(["active_attributes"], { active_attributes: { name: "active-name" } }));

    expect(select).toHaveValue("active_attributes");
    expect(JSONEditorMock.mock.calls.map(([props]) => props.data)).not.toContain(undefined);
  });

  it("restores the selected set when it is available again", async () => {
    const bothOptions = ["active_attributes", "candidate_attributes"];
    const bothSets = {
      active_attributes: { name: "active-name" },
      candidate_attributes: { name: "candidate-name" },
    };
    const { rerender } = render(setup(bothOptions, bothSets));

    const select = screen.getByRole("combobox", { name: /select-attributeset/i });

    await userEvent.selectOptions(select, "candidate_attributes");

    rerender(setup(["active_attributes"], { active_attributes: bothSets.active_attributes }));
    rerender(setup(bothOptions, bothSets));

    expect(select).toHaveValue("candidate_attributes");
    expect(JSONEditorMock.mock.lastCall?.[0].data).toEqual(
      JSON.stringify(bothSets.candidate_attributes, null, 2)
    );
  });

  it("passes the selected attribute set to the editor", async () => {
    const candidate = { name: "candidate-name" };

    render(
      setup(["active_attributes", "candidate_attributes"], {
        active_attributes: { name: "active-name" },
        candidate_attributes: candidate,
      })
    );

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /select-attributeset/i }),
      "candidate_attributes"
    );

    expect(JSONEditorMock.mock.lastCall?.[0].data).toEqual(JSON.stringify(candidate, null, 2));
  });
});
