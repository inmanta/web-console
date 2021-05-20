import React from "react";
import { DeleteForm } from "./DeleteForm";
import { IRequestParams } from "@/UI/App/utils/fetchInmantaApi";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const requestParams: IRequestParams = {
  isEnvironmentIdRequired: true,
  environmentId: "envId1",
  urlEndpoint: "api/delete/instance",
  setErrorMessage: () => undefined,
  method: "DELETE",
};

beforeEach(() => {
  fetchMock.resetMocks();
});

test("GIVEN DeleteForm WHEN user clicks 'No' THEN closeModal is executed", () => {
  const closeModal = jest.fn();
  render(<DeleteForm requestParams={requestParams} closeModal={closeModal} />);

  userEvent.click(screen.getByRole("button", { name: "No" }));

  expect(closeModal).toBeCalledTimes(1);
  expect(fetchMock.mock.calls).toHaveLength(0);
});

test("GIVEN DeleteForm WHEN user clicks 'Yes' THEN closeModal and request is executed", () => {
  const closeModal = jest.fn();
  render(<DeleteForm requestParams={requestParams} closeModal={closeModal} />);

  userEvent.click(screen.getByRole("button", { name: "Yes" }));

  expect(closeModal).toBeCalledTimes(1);
  expect(fetchMock.mock.calls).toHaveLength(1);
  expect(fetchMock.mock.calls[0][1]?.method).toEqual("DELETE");
});
