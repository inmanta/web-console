import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import { baseSetup } from "@/Test/Utils/base-setup";
import { emptyResponse, orderResponse } from "../Data/Mock";
import { OrdersPage } from ".";

expect.extend(toHaveNoViolations);

const OrderPage = <OrdersPage />;

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
