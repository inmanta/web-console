import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerContentBody } from "@patternfly/react-core";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Resource } from "@/Core";
import { words } from "@/UI";
import { FilterWidgetComponent } from "./FilterWidgetComponent";

vi.mock("@/Data/Queries", () => ({
  useGetAgents: () => ({
    useInfiniteScroll: () => ({
      data: { pages: [] },
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      fetchNextPage: vi.fn(),
    }),
  }),
}));

const renderWithDrawer = (ui: React.ReactElement) =>
  render(
    <Drawer isInline isExpanded>
      <DrawerContent panelContent={ui}>
        <DrawerContentBody>
          <div />
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );

describe("FilterWidgetComponent", () => {
  it("adds resource identifiers through provided callbacks", async () => {
    const filter: Resource.Filter = { type: ["existing"] };
    const setFilter = vi.fn();

    renderWithDrawer(
      <FilterWidgetComponent filter={filter} onClose={vi.fn()} setFilter={setFilter} />
    );

    const typeInput = screen.getByPlaceholderText(
      words("resources.filters.resource.type.placeholder")
    );
    await userEvent.type(typeInput, "new-type{enter}");

    expect(setFilter).toHaveBeenNthCalledWith(1, {
      ...filter,
      type: ["existing", "new-type"],
    });

    const valueInput = screen.getByPlaceholderText(
      words("resources.filters.resource.value.placeholder")
    );
    await userEvent.type(valueInput, "new-value{enter}");

    expect(setFilter).toHaveBeenNthCalledWith(2, {
      ...filter,
      type: ["existing"],
      value: ["new-value"],
    });

    const agentInput = screen.getByPlaceholderText(
      words("resources.filters.resource.agent.placeholder")
    );
    await userEvent.type(agentInput, "new-agent{enter}");

    expect(setFilter).toHaveBeenNthCalledWith(3, {
      ...filter,
      type: ["existing"],
      value: undefined,
      agent: ["new-agent"],
    });
  });

  it("updates status filters via the status selector", async () => {
    const setFilter = vi.fn();

    renderWithDrawer(<FilterWidgetComponent filter={{}} onClose={vi.fn()} setFilter={setFilter} />);

    await userEvent.click(screen.getByRole("tab", { name: "Status" }));

    const handlerRunToggle = screen.getByRole("button", {
      name: `${words("resources.filters.status.lastHandlerRun.label")}-toggle`,
    });
    await userEvent.click(handlerRunToggle);

    const failedIncludeToggle = screen.getByRole("button", { name: "failed-include-toggle" });
    await userEvent.click(failedIncludeToggle);

    expect(setFilter).toHaveBeenNthCalledWith(1, {
      status: ["failed"],
      disregardDefault: true,
    });
  });

  it("delegates removal and clear actions to the active filter handlers", async () => {
    const filter: Resource.Filter = {
      type: ["database", "service"],
      value: ["value-1"],
      agent: ["agent-1"],
      status: ["deployed"],
    };
    const setFilter = vi.fn();

    renderWithDrawer(
      <FilterWidgetComponent filter={filter} onClose={vi.fn()} setFilter={setFilter} />
    );

    await userEvent.click(screen.getByLabelText(/Close database/i));
    expect(setFilter).toHaveBeenNthCalledWith(1, {
      ...filter,
      type: ["service"],
    });

    await userEvent.click(screen.getByLabelText(/Close agent-1/i));
    expect(setFilter).toHaveBeenNthCalledWith(2, {
      ...filter,
      agent: [],
    });

    await userEvent.click(screen.getByLabelText(/Close value-1/i));
    expect(setFilter).toHaveBeenNthCalledWith(3, {
      ...filter,
      value: [],
    });

    await userEvent.click(screen.getByLabelText(/Close deployed/i));
    expect(setFilter).toHaveBeenNthCalledWith(4, {
      ...filter,
      status: [],
      disregardDefault: true,
    });

    await userEvent.click(screen.getByLabelText("Remove Type filters"));
    expect(setFilter).toHaveBeenNthCalledWith(5, {
      ...filter,
      type: undefined,
    });

    await userEvent.click(screen.getByLabelText("Remove Agent(s) filters"));
    expect(setFilter).toHaveBeenNthCalledWith(6, {
      ...filter,
      agent: undefined,
    });

    await userEvent.click(screen.getByLabelText("Remove Value filters"));
    expect(setFilter).toHaveBeenNthCalledWith(7, {
      ...filter,
      value: undefined,
    });

    await userEvent.click(screen.getByLabelText("Remove Status filters"));
    expect(setFilter).toHaveBeenNthCalledWith(8, {
      ...filter,
      status: undefined,
      disregardDefault: true,
    });

    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(setFilter).toHaveBeenNthCalledWith(9, {
      disregardDefault: true,
    });
  });

  it("toggles the purged status via the switch in the resource tab", async () => {
    const Wrapper = () => {
      const [filter, setFilter] = useState<Resource.Filter>({});
      return (
        <FilterWidgetComponent
          filter={filter}
          onClose={vi.fn()}
          setFilter={(update) => setFilter(update)}
        />
      );
    };

    renderWithDrawer(<Wrapper />);

    const purgedSwitch = screen.getByRole("switch", {
      name: words("resources.filters.desiredState.purged"),
    });

    expect(purgedSwitch).not.toBeChecked();

    await userEvent.click(purgedSwitch);
    expect(purgedSwitch).toBeChecked();

    await userEvent.click(purgedSwitch);
    expect(purgedSwitch).not.toBeChecked();
  });
});
