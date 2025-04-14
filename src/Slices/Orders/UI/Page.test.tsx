import React, { act } from "react";
import { Page } from "@patternfly/react-core";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { baseSetup } from "@/Test/Utils/base-setup";
import { emptyResponse, orderResponse } from "../Data/Mock";
import { OrdersPage } from ".";

expect.extend(toHaveNoViolations);

const OrderPage = (
  <Page>
    <OrdersPage />
  </Page>
);

describe("Order Page", () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen();
  });
  beforeEach(() => {
    server.resetHandlers();
  });
  afterAll(() => {
    server.close();
  });

  test("OrdersView shows empty table", async () => {
    server.use(
      http.get("/lsm/v2/order", async () => {
        await delay(200);
        return HttpResponse.json(emptyResponse);
      })
    );
    const { component } = baseSetup(OrderPage);

    render(component);

    expect(screen.getByRole("region", { name: "OrdersView-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("generic", { name: "OrdersView-Empty" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("OrdersView shows failed table", async () => {
    server.use(
      http.get("/lsm/v2/order", () => {
        return HttpResponse.json({ message: "something went wrong" }, { status: 500 });
      })
    );

    const { component } = baseSetup(OrderPage);

    render(component);

    expect(await screen.findByRole("region", { name: "OrdersView-Error" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("OrdersView shows success table", async () => {
    server.use(
      http.get("/lsm/v2/order", () => {
        return HttpResponse.json(orderResponse);
      })
    );
    const { component } = baseSetup(OrderPage);

    render(component);

    expect(await screen.findByRole("generic", { name: "OrdersView-Success" })).toBeInTheDocument();

    const rows = await screen.findAllByRole("row", {
      name: "ServiceOrderRow",
    });

    expect(rows).toHaveLength(4);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("OrdersView shows updated table", async () => {
    let counter = 0;
    server.use(
      http.get("/lsm/v2/order", () => {
        if (counter < 1) {
          counter++;
          return HttpResponse.json(emptyResponse);
        }
        return HttpResponse.json(orderResponse);
      })
    );

    const { component } = baseSetup(OrderPage);

    render(component);

    expect(await screen.findByRole("generic", { name: "OrdersView-Empty" })).toBeInTheDocument();

    await act(async () => {
      await delay(5000);
    });

    expect(await screen.findByRole("generic", { name: "OrdersView-Success" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN OrdersView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
    server.use(
      http.get("/lsm/v2/order", ({ request }) => {
        if (request.url.includes("&end=fake-first-param")) {
          return HttpResponse.json({
            ...orderResponse,
            metadata: {
              total: 103,
              before: 100,
              after: 0,
              page_size: 100,
            },
            data: orderResponse.data.slice(0, 2),
          });
        }

        return HttpResponse.json({
          ...orderResponse,
          links: {
            ...orderResponse.links,
            next: "/fake-link?end=fake-first-param",
          },
          metadata: {
            total: 103,
            before: 0,
            after: 83,
            page_size: 100,
          },
        });
      })
    );

    const { component } = baseSetup(OrderPage);

    render(component);

    const rows = await screen.findAllByRole("row", {
      name: "ServiceOrderRow",
    });

    expect(rows).toHaveLength(4);

    const nextPageButton = screen.getByLabelText("Go to next page");

    await userEvent.click(nextPageButton);

    const nextPageRows = await screen.findAllByRole("row", {
      name: "ServiceOrderRow",
    });

    expect(nextPageRows).toHaveLength(2);

    //sort on the second page
    await userEvent.click(screen.getByText("Created at"));

    const firstPageRows = await screen.findAllByRole("row", {
      name: "ServiceOrderRow",
    });

    expect(firstPageRows).toHaveLength(4);
  });
});
