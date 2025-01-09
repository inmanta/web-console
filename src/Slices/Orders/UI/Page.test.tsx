import React, { act } from "react";
import { Page } from "@patternfly/react-core";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import { baseSetup } from "@/Test/Utils/base-setup";
import { emptyResponse, orderResponse } from "../Data/Mock";
import { OrdersPage } from ".";

expect.extend(toHaveNoViolations);

const OrderPage = (
  <Page>
    <OrdersPage />
  </Page>
);

test("OrdersView shows empty table", async () => {
  const { component, apiHelper } = baseSetup(OrderPage);

  render(component);

  expect(
    await screen.findByRole("region", { name: "OrdersView-Loading" }),
  ).toBeInTheDocument();

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/lsm/v2/order?limit=20&sort=created_at.desc",
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(emptyResponse));
  });

  expect(
    await screen.findByRole("generic", { name: "OrdersView-Empty" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("OrdersView shows failed table", async () => {
  const { component, apiHelper } = baseSetup(OrderPage);

  render(component);

  expect(
    await screen.findByRole("region", { name: "OrdersView-Loading" }),
  ).toBeInTheDocument();

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/lsm/v2/order?limit=20&sort=created_at.desc",
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(Either.left("error"));
  });

  expect(
    await screen.findByRole("region", { name: "OrdersView-Failed" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("OrdersView shows success table", async () => {
  const { component, apiHelper } = baseSetup(OrderPage);

  render(component);

  expect(
    await screen.findByRole("region", { name: "OrdersView-Loading" }),
  ).toBeInTheDocument();

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/lsm/v2/order?limit=20&sort=created_at.desc",
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(orderResponse));
  });

  expect(
    await screen.findByRole("generic", { name: "OrdersView-Success" }),
  ).toBeInTheDocument();

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
  const { component, apiHelper, scheduler } = baseSetup(OrderPage);

  render(component);

  expect(
    await screen.findByRole("region", { name: "OrdersView-Loading" }),
  ).toBeInTheDocument();

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/lsm/v2/order?limit=20&sort=created_at.desc",
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(emptyResponse));
  });

  expect(
    await screen.findByRole("generic", { name: "OrdersView-Empty" }),
  ).toBeInTheDocument();

  scheduler.executeAll();

  await act(async () => {
    await apiHelper.resolve(Either.right(orderResponse));
  });

  expect(
    await screen.findByRole("generic", { name: "OrdersView-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN OrdersView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
  const { component, apiHelper } = baseSetup(OrderPage);

  render(component);

  //mock that response has more than one site
  await act(async () => {
    apiHelper.resolve(
      Either.right({
        ...orderResponse,
        links: {
          ...orderResponse.links,
          next: "/fake-link?end=fake-first-param",
        },
        metadata: {
          total: 103,
          before: 0,
          after: 3,
          page_size: 100,
        },
      }),
    );
  });

  const nextPageButton = screen.getByLabelText("Go to next page");

  expect(nextPageButton).toBeEnabled();

  await userEvent.click(nextPageButton);

  //expect the api url to contain start and end keywords that are used for pagination when we are moving to the next page
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&sort=created_at.desc)/);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        ...orderResponse,
        metadata: {
          total: 103,
          before: 100,
          after: 0,
          page_size: 100,
        },
      }),
    );
  });

  //sort on the second page
  await userEvent.click(screen.getByText("Created at"));

  // expect the api url to not contain start and end keywords that are used for pagination to assert we are back on the first page.
  // we are asserting on the second request as the first request is for the updated sorting event, and second is chained to back to the first page with still correct sorting
  expect(apiHelper.pendingRequests[1].url).not.toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[1].url).toMatch(/(&sort=created_at.asc)/);
});
