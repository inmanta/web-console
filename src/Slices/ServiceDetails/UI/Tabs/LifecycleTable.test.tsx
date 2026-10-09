import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import * as Service from "@/Test/Data/Service";
import * as State from "@/Test/Data/Service/State";
import * as Transfer from "@/Test/Data/Service/Transfer";
import { LifecycleTable } from "./LifecycleTable";

test("GIVEN LifecycleTable WHEN a transfer targets a state without annotations THEN the raw state name is shown", () => {
  render(<LifecycleTable lifecycle={Service.a.lifecycle} />);

  expect(screen.getByRole("grid", { name: "Lifecycle" })).toBeInTheDocument();
  expect(screen.getAllByText("acknowledged")[0]).toBeVisible();
});

test("GIVEN LifecycleTable WHEN a transfer's source/target state has web_label/web_icon/web_description THEN the resolved presentation is shown (issue #7094)", async () => {
  const lifecycle = {
    ...Service.a.lifecycle,
    states: Service.a.lifecycle.states.map((state) =>
      state.name === State.withAnnotations.name ? State.withAnnotations : state
    ),
    transfers: [{ ...Transfer.list[0], source: "start", target: "creating" }],
  };

  render(<LifecycleTable lifecycle={lifecycle} />);

  expect(screen.getByText("Creating")).toBeVisible();
  expect(screen.getByTestId("FaCogs")).toBeVisible();

  await userEvent.hover(screen.getByText("Creating"));

  expect(await screen.findByRole("tooltip")).toHaveTextContent(
    "The service is being deployed for the first time."
  );
});
