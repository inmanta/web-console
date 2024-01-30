import React from "react";
import { act, render, screen } from "@testing-library/react";
import { Either } from "@/Core";
import { baseSetup } from "@/Test/Utils/base-setup";
import {
  responseCompletedOrder,
  responseInProgressOrder,
  responseOrderFailed,
  responsePartialOrder,
} from "../Data/Mock";
import { OrderDetailsPage } from ".";

const DetailsPage = <OrderDetailsPage />;

test("OrderDetailsView shows failed view", async () => {
  const { component, apiHelper } = baseSetup(DetailsPage);
  render(component);

  expect(
    await screen.findByRole("generic", { name: "OrderDetailsView-Loading" }),
  ).toBeInTheDocument();

  expect(apiHelper.pendingRequests).toHaveLength(1);

  await act(async () => {
    await apiHelper.resolve(Either.left("error"));
  });

  expect(
    await screen.findByRole("generic", { name: "OrderDetailsView-Failed" }),
  ).toBeInTheDocument();
});

test("OrderDetailsView shows view for a failed order", async () => {
  const { component, apiHelper } = baseSetup(DetailsPage);
  render(component);

  expect(
    await screen.findByRole("generic", { name: "OrderDetailsView-Loading" }),
  ).toBeInTheDocument();

  expect(apiHelper.pendingRequests).toHaveLength(1);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: responseOrderFailed }));
  });

  expect(
    await screen.findByRole("generic", { name: "OrderDetailsView-Success" }),
  ).toBeInTheDocument();

  expect(
    await screen.findByLabelText("OrderDetails-Heading"),
  ).toBeInTheDocument();

  const orderStatus = await screen.findByLabelText("OrderState");
  expect(orderStatus).toHaveTextContent(/failed/);

  const orderDescription = await screen.findByLabelText("OrderDescription");
  expect(orderDescription).toHaveTextContent(/Failed CREATE order/);

  const serviceOrderItemRows = await screen.findAllByRole("row", {
    name: "ServiceOrderDetailsRow",
  });
  expect(serviceOrderItemRows).toHaveLength(1);
});

test("OrderDetailsView shows view for a partial order", async () => {
  const { component, apiHelper } = baseSetup(DetailsPage);
  render(component);

  expect(
    await screen.findByRole("generic", { name: "OrderDetailsView-Loading" }),
  ).toBeInTheDocument();

  expect(apiHelper.pendingRequests).toHaveLength(1);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: responsePartialOrder }));
  });

  expect(
    await screen.findByRole("generic", { name: "OrderDetailsView-Success" }),
  ).toBeInTheDocument();

  const statusDescription = await screen.findByLabelText("OrderState");
  expect(statusDescription).toHaveTextContent(/partial/);

  const orderDescription = await screen.findByLabelText("OrderDescription");
  expect(orderDescription).toHaveTextContent(
    /Partial UPDATE order, with dependency/,
  );

  const serviceOrderItemRows = await screen.findAllByRole("row", {
    name: "ServiceOrderDetailsRow",
  });
  expect(serviceOrderItemRows).toHaveLength(2);
});

test("OrderDetailsView shows view for a in progress order", async () => {
  const { component, apiHelper } = baseSetup(DetailsPage);
  render(component);

  expect(
    await screen.findByRole("generic", { name: "OrderDetailsView-Loading" }),
  ).toBeInTheDocument();

  expect(apiHelper.pendingRequests).toHaveLength(1);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: responseInProgressOrder }));
  });

  expect(
    await screen.findByRole("generic", { name: "OrderDetailsView-Success" }),
  ).toBeInTheDocument();

  const statusDescription = await screen.findByLabelText("OrderState");
  expect(statusDescription).toHaveTextContent(/in progress/);

  const orderDescription = await screen.findByLabelText("OrderDescription");
  expect(orderDescription).toHaveTextContent(/In progress DELETE order/);

  const serviceOrderItemRows = await screen.findAllByRole("row", {
    name: "ServiceOrderDetailsRow",
  });
  expect(serviceOrderItemRows).toHaveLength(1);
});

test("OrderDetailsView shows view for completed order", async () => {
  const { component, apiHelper } = baseSetup(DetailsPage);
  render(component);

  expect(
    await screen.findByRole("generic", { name: "OrderDetailsView-Loading" }),
  ).toBeInTheDocument();

  expect(apiHelper.pendingRequests).toHaveLength(1);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: responseCompletedOrder }));
  });

  expect(
    await screen.findByRole("generic", { name: "OrderDetailsView-Success" }),
  ).toBeInTheDocument();

  const statusDescription = await screen.findByLabelText("OrderState");
  expect(statusDescription).toHaveTextContent(/success/);

  const orderDescription = await screen.findByLabelText("OrderDescription");
  expect(orderDescription).toHaveTextContent(/Success CREATE order/);

  const serviceOrderItemRows = await screen.findAllByRole("row", {
    name: "ServiceOrderDetailsRow",
  });
  expect(serviceOrderItemRows).toHaveLength(1);
});
