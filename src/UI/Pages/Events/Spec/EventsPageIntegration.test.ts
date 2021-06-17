import { render, screen, act, within } from "@testing-library/react";
import userEvent, { specialChars } from "@testing-library/user-event";
import { Service, Pagination, Event } from "@/Test";
import { Either } from "@/Core";
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
      const { component, eventsFetcher } = new EventsPageComposer().compose(
        Service.a
      );
      render(component);

      await act(async () => {
        await eventsFetcher.resolve(
          Either.right({
            data: Event.listA,
            links: Pagination.links,
            metadata: Pagination.metadata,
          })
        );
      });

      const initialRows = await screen.findAllByRole("row", {
        name: "Event table row",
      });
      expect(initialRows).toHaveLength(14);

      userEvent.click(
        within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
          "button",
          { name: "EventType" }
        )
      );
      userEvent.click(screen.getByRole("option", { name: filterName }));

      const input = await screen.findByPlaceholderText(placeholderText);
      userEvent.click(input);
      if (filterType === "select") {
        const option = await screen.findByRole("option", { name: filterValue });
        await userEvent.click(option);
      } else {
        userEvent.type(input, `${filterValue}${specialChars.enter}`);
      }

      expect(eventsFetcher.getInvocations()[1][1]).toEqual(
        `/lsm/v1/service_inventory/${Service.a.name}/id1/events?limit=20&sort=timestamp.desc&filter.${filterUrlName}=${filterValue}`
      );

      await act(async () => {
        await eventsFetcher.resolve(
          Either.right({
            data: Event.listB,
            links: Pagination.links,
            metadata: Pagination.metadata,
          })
        );
      });

      const rowsAfter = await screen.findAllByRole("row", {
        name: "Event table row",
      });
      expect(rowsAfter).toHaveLength(3);
    }
  );
  it("When using the Date filter then the events with from and to the events in the range should be fetched and shown", async () => {
    const { component, eventsFetcher } = new EventsPageComposer().compose(
      Service.a
    );
    render(component);

    await act(async () => {
      await eventsFetcher.resolve(
        Either.right({
          data: Event.listA,
          links: Pagination.links,
          metadata: Pagination.metadata,
        })
      );
    });

    const initialRows = await screen.findAllByRole("row", {
      name: "Event table row",
    });
    expect(initialRows).toHaveLength(14);

    userEvent.click(
      within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
        "button",
        { name: "EventType" }
      )
    );
    userEvent.click(screen.getByRole("option", { name: "Date" }));

    const fromDatePicker = await screen.findByLabelText("From Date Picker");
    userEvent.click(fromDatePicker);
    userEvent.type(fromDatePicker, `2021-04-28`);
    const toDatePicker = await screen.findByLabelText("To Date Picker");
    userEvent.click(toDatePicker);
    userEvent.type(toDatePicker, `2021-04-30`);

    userEvent.click(await screen.findByLabelText("Apply date filter"));

    expect(eventsFetcher.getInvocations()[1][1]).toMatch(
      `/lsm/v1/service_inventory/${Service.a.name}/id1/events?limit=20&sort=timestamp.desc&filter.timestamp=ge%3A2021-04-`
    );

    await act(async () => {
      await eventsFetcher.resolve(
        Either.right({
          data: Event.listB,
          links: Pagination.links,
          metadata: Pagination.metadata,
        })
      );
    });

    const rowsAfter = await screen.findAllByRole("row", {
      name: "Event table row",
    });
    expect(rowsAfter).toHaveLength(3);
  });

  it("When using the Date filter then the events with only to filter, the matching should be fetched and shown", async () => {
    const { component, eventsFetcher } = new EventsPageComposer().compose(
      Service.a
    );
    render(component);

    await act(async () => {
      await eventsFetcher.resolve(
        Either.right({
          data: Event.listA,
          links: Pagination.links,
          metadata: Pagination.metadata,
        })
      );
    });

    const initialRows = await screen.findAllByRole("row", {
      name: "Event table row",
    });
    expect(initialRows).toHaveLength(14);

    userEvent.click(
      within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
        "button",
        { name: "EventType" }
      )
    );
    userEvent.click(screen.getByRole("option", { name: "Date" }));

    const toDatePicker = await screen.findByLabelText("To Date Picker");
    userEvent.click(toDatePicker);
    userEvent.type(toDatePicker, `2021-05-30`);

    userEvent.click(await screen.findByLabelText("Apply date filter"));

    expect(eventsFetcher.getInvocations()[1][1]).toMatch(
      `/lsm/v1/service_inventory/${Service.a.name}/id1/events?limit=20&sort=timestamp.desc&filter.timestamp=le%3A2021-05-`
    );

    await act(async () => {
      await eventsFetcher.resolve(
        Either.right({
          data: Event.listB,
          links: Pagination.links,
          metadata: Pagination.metadata,
        })
      );
    });

    const rowsAfter = await screen.findAllByRole("row", {
      name: "Event table row",
    });
    expect(rowsAfter).toHaveLength(3);
  });
});
