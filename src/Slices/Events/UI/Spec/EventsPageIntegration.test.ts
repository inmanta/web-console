import { render, screen, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Either } from "@/Core";
import { Service, Pagination } from "@/Test";
import * as InstanceEvent from "@S/Events/Data/Mock";
import { EventsPageComposer } from "./EventsPageComposer";

/** Test with the whole events page rendered */
describe("Given the Events Page", () => {
  it.each`
    filterName       | filterType  | filterValue            | placeholderText                    | filterUrlName
    ${"Source"}      | ${"select"} | ${"creating"}          | ${"Select a source state..."}      | ${"source"}
    ${"Destination"} | ${"select"} | ${"creating"}          | ${"Select a destination state..."} | ${"destination"}
    ${"EventType"}   | ${"select"} | ${"CREATE_TRANSITION"} | ${"Select an Event Type..."}       | ${"event_type"}
    ${"Version"}     | ${"number"} | ${"1"}                 | ${"Filter by version..."}          | ${"version"}
  `(
    "When using the $filterName filter of type $filterType with value $filterValue and text $placeholderText then the events with that $filterUrlName should be fetched and shown",
    async ({
      filterName,
      filterType,
      filterValue,
      placeholderText,
      filterUrlName,
    }) => {
      const { component, apiHelper } = new EventsPageComposer().compose(
        Service.a,
      );
      render(component);

      await act(async () => {
        await apiHelper.resolve(
          Either.right({
            data: InstanceEvent.listA,
            links: Pagination.links,
            metadata: Pagination.metadata,
          }),
        );
      });

      const initialRows = await screen.findAllByRole("row", {
        name: "Event table row",
      });
      expect(initialRows).toHaveLength(14);

      await act(async () => {
        await userEvent.click(
          within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
            "button",
            { name: "FilterPicker" },
          ),
        );
      });
      await act(async () => {
        await userEvent.click(screen.getByRole("option", { name: filterName }));
      });

      const input = await screen.findByPlaceholderText(placeholderText);
      await act(async () => {
        await userEvent.click(input);
      });
      if (filterType === "select") {
        const option = await screen.findByRole("option", { name: filterValue });
        await act(async () => {
          await userEvent.click(option);
        });
      } else {
        await act(async () => {
          await userEvent.type(input, `${filterValue}{enter}`);
        });
      }

      expect(apiHelper.pendingRequests[0].url).toEqual(
        `/lsm/v1/service_inventory/${Service.a.name}/id1/events?limit=20&sort=timestamp.desc&filter.${filterUrlName}=${filterValue}`,
      );

      await act(async () => {
        await apiHelper.resolve(
          Either.right({
            data: InstanceEvent.listB,
            links: Pagination.links,
            metadata: Pagination.metadata,
          }),
        );
      });

      const rowsAfter = await screen.findAllByRole("row", {
        name: "Event table row",
      });
      expect(rowsAfter).toHaveLength(3);
    },
  );
  it("When using the Date filter then the events with from and to the events in the range should be fetched and shown", async () => {
    const { component, apiHelper } = new EventsPageComposer().compose(
      Service.a,
    );
    render(component);

    await act(async () => {
      await apiHelper.resolve(
        Either.right({
          data: InstanceEvent.listA,
          links: Pagination.links,
          metadata: Pagination.metadata,
        }),
      );
    });

    const initialRows = await screen.findAllByRole("row", {
      name: "Event table row",
    });
    expect(initialRows).toHaveLength(14);

    await act(async () => {
      await userEvent.click(
        within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
          "button",
          { name: "FilterPicker" },
        ),
      );
    });
    await act(async () => {
      await userEvent.click(screen.getByRole("option", { name: "Date" }));
    });

    const fromDatePicker = await screen.findByLabelText("From Date Picker");
    await act(async () => {
      await userEvent.click(fromDatePicker);
    });
    await act(async () => {
      await userEvent.type(fromDatePicker, `2021-04-28`);
    });
    const toDatePicker = await screen.findByLabelText("To Date Picker");
    await act(async () => {
      await userEvent.click(toDatePicker);
    });
    await act(async () => {
      await userEvent.type(toDatePicker, `2021-04-30`);
    });

    await act(async () => {
      await userEvent.click(await screen.findByLabelText("Apply date filter"));
    });
    expect(apiHelper.pendingRequests[0].url).toMatch(
      `/lsm/v1/service_inventory/${Service.a.name}/id1/events?limit=20&sort=timestamp.desc&filter.timestamp=ge%3A2021-04-`,
    );

    await act(async () => {
      await apiHelper.resolve(
        Either.right({
          data: InstanceEvent.listB,
          links: Pagination.links,
          metadata: Pagination.metadata,
        }),
      );
    });

    const rowsAfter = await screen.findAllByRole("row", {
      name: "Event table row",
    });
    expect(rowsAfter).toHaveLength(3);

    // The chips are hidden in small windows, so resize it
    window = Object.assign(window, { innerWidth: 1200 });
    await act(async () => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(
      await screen.findByText("from | 2021/04/28 00:00:00", { exact: false }),
    ).toBeVisible();
    expect(
      await screen.findByText("to | 2021/04/30 00:00:00", { exact: false }),
    ).toBeVisible();
  });

  it.each`
    filterType | value           | operator | chip
    ${"From"}  | ${"2021-05-30"} | ${"ge"}  | ${"from | 2021/05/30 00:00:00"}
    ${"To"}    | ${"2021-05-30"} | ${"le"}  | ${"to | 2021/05/30 00:00:00"}
  `(
    "When using the Date filter then the events with only $filterType filter, the matching should be fetched and a chip shown",
    async ({ filterType, value, operator, chip }) => {
      const { component, apiHelper } = new EventsPageComposer().compose(
        Service.a,
      );
      render(component);

      await act(async () => {
        await apiHelper.resolve(
          Either.right({
            data: InstanceEvent.listA,
            links: Pagination.links,
            metadata: Pagination.metadata,
          }),
        );
      });

      const initialRows = await screen.findAllByRole("row", {
        name: "Event table row",
      });
      expect(initialRows).toHaveLength(14);

      await act(async () => {
        await userEvent.click(
          within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
            "button",
            { name: "FilterPicker" },
          ),
        );
      });
      await act(async () => {
        await userEvent.click(screen.getByRole("option", { name: "Date" }));
      });

      const toDatePicker = await screen.findByLabelText(
        `${filterType} Date Picker`,
      );
      await act(async () => {
        await userEvent.click(toDatePicker);
      });
      await act(async () => {
        await userEvent.type(toDatePicker, value);
      });
      await act(async () => {
        await userEvent.click(
          await screen.findByLabelText("Apply date filter"),
        );
      });

      expect(apiHelper.pendingRequests[0].url).toMatch(
        `/lsm/v1/service_inventory/${Service.a.name}/id1/events?limit=20&sort=timestamp.desc&filter.timestamp=${operator}%3A2021-05-`,
      );

      await act(async () => {
        await apiHelper.resolve(
          Either.right({
            data: InstanceEvent.listB,
            links: Pagination.links,
            metadata: Pagination.metadata,
          }),
        );
      });

      const rowsAfter = await screen.findAllByRole("row", {
        name: "Event table row",
      });
      expect(rowsAfter).toHaveLength(3);

      // The chips are hidden in small windows, so resize it
      window = Object.assign(window, { innerWidth: 1200 });
      window.dispatchEvent(new Event("resize"));

      expect(await screen.findByText(chip, { exact: false })).toBeVisible();
      await act(async () => {
        await userEvent.click(await screen.findByLabelText("close"));
      });
      expect(apiHelper.pendingRequests[0].url).toMatch(
        `/lsm/v1/service_inventory/${Service.a.name}/id1/events?limit=20&sort=timestamp.desc`,
      );
    },
  );
});
