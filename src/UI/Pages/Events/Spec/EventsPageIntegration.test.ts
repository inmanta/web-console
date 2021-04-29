import { render, screen, act, within } from "@testing-library/react";
import userEvent, { specialChars } from "@testing-library/user-event";
import {
  Service,
  Pagination,
  instanceEvents,
  ignoredErrorNormalEvents,
} from "@/Test";
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
        Service.A
      );
      render(component);

      await act(async () => {
        await eventsFetcher.resolve(
          Either.right({
            data: instanceEvents,
            links: Pagination.links,
            metadata: Pagination.metadata,
          })
        );
      });

      const initialRows = await screen.findAllByRole("row", {
        name: "Event table row",
      });
      expect(initialRows.length).toEqual(14);

      userEvent.click(
        within(
          screen.getByRole("generic", { name: "FilterBar" })
        ).getByRole("button", { name: "EventType" })
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
        `/lsm/v1/service_inventory/${Service.A.name}/id1/events?limit=20&sort=timestamp.desc&filter.${filterUrlName}=${filterValue}`
      );

      await act(async () => {
        await eventsFetcher.resolve(
          Either.right({
            data: ignoredErrorNormalEvents,
            links: Pagination.links,
            metadata: Pagination.metadata,
          })
        );
      });

      const rowsAfter = await screen.findAllByRole("row", {
        name: "Event table row",
      });
      expect(rowsAfter.length).toEqual(3);
    }
  );
  it("When using the Date filter then the events with that Date and Operator should be fetched and shown", async () => {
    const { component, eventsFetcher } = new EventsPageComposer().compose(
      Service.A
    );
    render(component);

    await act(async () => {
      await eventsFetcher.resolve(
        Either.right({
          data: instanceEvents,
          links: Pagination.links,
          metadata: Pagination.metadata,
        })
      );
    });

    const initialRows = await screen.findAllByRole("row", {
      name: "Event table row",
    });
    expect(initialRows.length).toEqual(14);

    userEvent.click(
      within(
        screen.getByRole("generic", { name: "FilterBar" })
      ).getByRole("button", { name: "EventType" })
    );
    userEvent.click(screen.getByRole("option", { name: "Date" }));

    const input = await screen.findByLabelText("Date picker");
    userEvent.click(input);
    userEvent.type(input, `2021-04-28`);
    userEvent.click(await screen.findByText("Select an operator..."));
    userEvent.click(screen.getByRole("option", { name: "less than" }));

    expect(eventsFetcher.getInvocations()[1][1]).toEqual(
      `/lsm/v1/service_inventory/${Service.A.name}/id1/events?limit=20&sort=timestamp.desc&filter.timestamp=lt%3A2021-04-28%2B00%3A00%3A00`
    );

    await act(async () => {
      await eventsFetcher.resolve(
        Either.right({
          data: ignoredErrorNormalEvents,
          links: Pagination.links,
          metadata: Pagination.metadata,
        })
      );
    });

    const rowsAfter = await screen.findAllByRole("row", {
      name: "Event table row",
    });
    expect(rowsAfter.length).toEqual(3);
  });
});
