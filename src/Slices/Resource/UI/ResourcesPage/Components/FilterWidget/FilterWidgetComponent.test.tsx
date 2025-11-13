import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Resource } from "@/Core";

vi.mock("@patternfly/react-core", async () => {
    const actual = await vi.importActual<typeof import("@patternfly/react-core")>(
        "@patternfly/react-core"
    );

    const Passthrough: React.FC<{ children?: React.ReactNode }> = ({
        children,
    }) => <div>{children}</div>;

    const FragmentWrapper: React.FC<{ children?: React.ReactNode }> = ({
        children,
    }) => <>{children}</>;

    return {
        ...actual,
        DrawerPanelContent: Passthrough,
        DrawerHead: Passthrough,
        DrawerActions: Passthrough,
        DrawerPanelBody: Passthrough,
        DrawerCloseButton: ({ onClick }: { onClick: () => void }) => (
            <button type="button" onClick={onClick}>
                close
            </button>
        ),
        Stack: Passthrough,
        StackItem: Passthrough,
        Tabs: Passthrough,
        Tab: Passthrough,
        TabTitleText: FragmentWrapper,
        Divider: () => null,
        Title: FragmentWrapper,
    };
});

import { FilterWidgetComponent } from "./FilterWidgetComponent";

describe("FilterWidgetComponent", () => {
    it("adds resource identifiers through provided callbacks", async () => {
        const filter: Resource.Filter = { type: ["existing"] };
        const setFilter = vi.fn();

        render(
            <FilterWidgetComponent filter={filter} onClose={vi.fn()} setFilter={setFilter} />
        );

        await userEvent.type(
            screen.getByPlaceholderText("Resource type..."),
            "new-type{enter}"
        );
        expect(setFilter).toHaveBeenNthCalledWith(1, {
            ...filter,
            type: ["existing", "new-type"],
        });

        await userEvent.type(
            screen.getByPlaceholderText("Value..."),
            "new-value{enter}"
        );
        expect(setFilter).toHaveBeenNthCalledWith(2, {
            ...filter,
            type: ["existing"],
            value: ["new-value"],
        });

        await userEvent.type(
            screen.getByPlaceholderText("Agent..."),
            "new-agent{enter}"
        );
        expect(setFilter).toHaveBeenNthCalledWith(3, {
            ...filter,
            type: ["existing"],
            value: undefined,
            agent: ["new-agent"],
        });
    });

    it("updates status filters via the status selector", async () => {
        const setFilter = vi.fn();

        render(
            <FilterWidgetComponent filter={{}} onClose={vi.fn()} setFilter={setFilter} />
        );

        await userEvent.click(screen.getByRole("button", { name: "status-toggle" }));
        await userEvent.click(screen.getByRole("button", { name: "failed-include-toggle" }));

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

        render(
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

        await userEvent.click(screen.getByLabelText("Remove Deploy State filters"));
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
});



