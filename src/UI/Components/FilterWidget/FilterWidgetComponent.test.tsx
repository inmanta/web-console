import React from "react";
import { Drawer, DrawerContent, DrawerContentBody } from "@patternfly/react-core";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { FilterField, FilterWidgetComponent, GenericFilter } from "./FilterWidgetComponent";

const TYPE_AGENT_VALUE_FIELDS: FilterField[] = [
  { label: "Type", placeholder: "Resource type...", filterKey: "type" },
  { label: "Agent(s)", placeholder: "Agent...", filterKey: "agent" },
  { label: "Value", placeholder: "Value...", filterKey: "value" },
];

const NAME_ENV_FIELDS: FilterField[] = [
  { label: "Name", placeholder: "Name...", filterKey: "name" },
  { label: "Environment", placeholder: "Environment...", filterKey: "environment" },
];

const renderWidget = (
  filter: GenericFilter,
  setFilter: (genericFilter: GenericFilter) => void,
  fields: FilterField[] = TYPE_AGENT_VALUE_FIELDS
) =>
  render(
    <Drawer isInline isExpanded>
      <DrawerContent
        panelContent={
          <FilterWidgetComponent
            onClose={vi.fn()}
            fields={fields}
            filter={filter}
            setFilter={setFilter}
            sectionTitle="Resource Id"
          />
        }
      >
        <DrawerContentBody>
          <div />
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );

describe("FilterWidgetComponent", () => {
  it("renders an input for each configured field", () => {
    renderWidget({}, vi.fn());

    expect(screen.getByPlaceholderText("Resource type...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Agent...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Value...")).toBeInTheDocument();
  });

  it("renders the section title", () => {
    renderWidget({}, vi.fn());

    expect(screen.getByRole("heading", { name: "Resource Id" })).toBeInTheDocument();
  });

  it("shows the empty state when no filters are active", () => {
    renderWidget({}, vi.fn());

    expect(screen.getByText("No filters applied")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
  });

  it("adds a value to an empty filter field", async () => {
    const setFilter = vi.fn();
    renderWidget({}, setFilter);

    await userEvent.type(screen.getByPlaceholderText("Resource type..."), "web::Server{enter}");

    expect(setFilter).toHaveBeenCalledWith({ type: ["web::Server"] });
  });

  it("appends a value to an existing filter field", async () => {
    const setFilter = vi.fn();
    renderWidget({ type: ["web::Server"] }, setFilter);

    await userEvent.type(screen.getByPlaceholderText("Resource type..."), "web::Client{enter}");

    expect(setFilter).toHaveBeenCalledWith({ type: ["web::Server", "web::Client"] });
  });

  it("adds values across multiple fields independently", async () => {
    const setFilter = vi.fn();
    renderWidget({ type: ["web::Server"] }, setFilter);

    await userEvent.type(screen.getByPlaceholderText("Agent..."), "internal{enter}");
    expect(setFilter).toHaveBeenNthCalledWith(1, {
      type: ["web::Server"],
      agent: ["internal"],
    });

    await userEvent.type(screen.getByPlaceholderText("Value..."), "myvalue{enter}");
    expect(setFilter).toHaveBeenNthCalledWith(2, {
      type: ["web::Server"],
      value: ["myvalue"],
    });
  });

  it("removes a single chip from a filter group", async () => {
    const setFilter = vi.fn();
    renderWidget({ type: ["web::Server", "web::Client"] }, setFilter);

    await userEvent.click(screen.getByLabelText(/Close web::Server/i));

    expect(setFilter).toHaveBeenCalledWith({ type: ["web::Client"] });
  });

  it("clears an entire filter group", async () => {
    const setFilter = vi.fn();
    renderWidget({ type: ["web::Server"], agent: ["internal"] }, setFilter);

    await userEvent.click(screen.getByLabelText("Remove Type filters"));

    expect(setFilter).toHaveBeenCalledWith({ type: undefined, agent: ["internal"] });
  });

  it("clears all configured filter fields", async () => {
    const setFilter = vi.fn();
    renderWidget({ type: ["web::Server"], agent: ["internal"], value: ["myvalue"] }, setFilter);

    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));

    expect(setFilter).toHaveBeenCalledWith({
      type: undefined,
      agent: undefined,
      value: undefined,
    });
  });

  it("preserves non-configured filter keys when clearing all", async () => {
    const setFilter = vi.fn();
    renderWidget(
      {
        type: ["web::Server"],
        agent: ["internal"],
        name: ["my-resource"],
        discovered_resource_id: ["res-123"],
      },
      setFilter
    );

    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));

    expect(setFilter).toHaveBeenCalledWith({
      type: undefined,
      agent: undefined,
      value: undefined,
      name: ["my-resource"],
      discovered_resource_id: ["res-123"],
    });
  });

  it("works with a different field configuration", async () => {
    const setFilter = vi.fn();
    renderWidget({ name: ["existing-name"] }, setFilter, NAME_ENV_FIELDS);

    expect(screen.getByPlaceholderText("Name...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Environment...")).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText("Environment..."), "dev{enter}");

    expect(setFilter).toHaveBeenCalledWith({
      name: ["existing-name"],
      environment: ["dev"],
    });
  });

  it("shows active filter chips for all fields with values", () => {
    renderWidget({ type: ["web::Server"], agent: ["internal"], value: ["myvalue"] }, vi.fn());

    expect(screen.getByText("web::Server")).toBeInTheDocument();
    expect(screen.getByText("internal")).toBeInTheDocument();
    expect(screen.getByText("myvalue")).toBeInTheDocument();
  });

  it("hides the empty state and shows active filters when filters are set", () => {
    renderWidget({ type: ["web::Server"] }, vi.fn());

    expect(screen.queryByText("No filters applied")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear all" })).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <Drawer isInline isExpanded>
        <DrawerContent
          panelContent={
            <FilterWidgetComponent
              onClose={onClose}
              fields={TYPE_AGENT_VALUE_FIELDS}
              filter={{}}
              setFilter={vi.fn()}
              sectionTitle="Resource Id"
            />
          }
        >
          <DrawerContentBody>
            <div />
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    );

    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
