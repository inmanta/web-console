import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Resource } from "@/Core";
import { StatusFilterSelect } from "./StatusFilterSelect";

const StatusFilterHarness: React.FC<{ initial?: string[] }> = ({ initial }) => {
    const [selected, setSelected] = useState<string[]>(initial ?? []);

    return (
        <StatusFilterSelect selectedStatuses={selected} onChange={setSelected} />
    );
};

describe("StatusFilterSelect", () => {
    it("allows including and excluding statuses while preventing conflicting selections", async () => {
        render(<StatusFilterHarness />);

        const toggle = await screen.findByRole("button", {
            name: "status-toggle",
        });

        await userEvent.click(toggle);

        // Initial state should show inactive icons.
        expect(
            await screen.findByRole("generic", {
                name: `${Resource.Status.skipped}-include-inactive`,
            })
        ).toBeVisible();
        expect(
            await screen.findByRole("generic", {
                name: `${Resource.Status.skipped}-exclude-inactive`,
            })
        ).toBeVisible();

        // Include skipped.
        await userEvent.click(
            screen.getByRole("button", {
                name: `${Resource.Status.skipped}-include-toggle`,
            })
        );

        await userEvent.click(toggle);

        expect(
            await screen.findByRole("generic", {
                name: `${Resource.Status.skipped}-include-active`,
            })
        ).toBeVisible();
        expect(
            screen.queryByRole("generic", {
                name: `${Resource.Status.skipped}-exclude-active`,
            })
        ).not.toBeInTheDocument();

        // Exclude skipped should remove the include selection.
        await userEvent.click(
            screen.getByRole("button", {
                name: `${Resource.Status.skipped}-exclude-toggle`,
            })
        );

        await userEvent.click(toggle);

        expect(
            await screen.findByRole("generic", {
                name: `${Resource.Status.skipped}-include-inactive`,
            })
        ).toBeVisible();
        expect(
            await screen.findByRole("generic", {
                name: `${Resource.Status.skipped}-exclude-active`,
            })
        ).toBeVisible();

        // Combine include for another status.
        await userEvent.click(
            screen.getByRole("button", {
                name: `${Resource.Status.deployed}-include-toggle`,
            })
        );

        await userEvent.click(toggle);

        expect(
            await screen.findByRole("generic", {
                name: `${Resource.Status.deployed}-include-active`,
            })
        ).toBeVisible();
        expect(
            await screen.findByRole("generic", {
                name: `${Resource.Status.skipped}-exclude-active`,
            })
        ).toBeVisible();

        // Clicking again removes the include selection.
        await userEvent.click(
            screen.getByRole("button", {
                name: `${Resource.Status.deployed}-include-toggle`,
            })
        );

        await userEvent.click(toggle);

        expect(
            await screen.findByRole("generic", {
                name: `${Resource.Status.deployed}-include-inactive`,
            })
        ).toBeVisible();
    });

    it("closes the select when an option is chosen", async () => {
        render(<StatusFilterHarness />);

        const toggle = screen.getByRole("button", { name: "status-toggle" });

        await userEvent.click(toggle);

        const includeButton = screen.getByRole("button", {
            name: `${Resource.Status.failed}-include-toggle`,
        });

        await userEvent.click(includeButton);

        expect(
            screen.queryByRole("generic", {
                name: `${Resource.Status.failed}-include-active`,
            })
        ).not.toBeInTheDocument();

        await userEvent.click(toggle);

        expect(
            await screen.findByRole("generic", {
                name: `${Resource.Status.failed}-include-active`,
            })
        ).toBeVisible();
    });
});


