import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { QueryControlProvider } from "@/Data/Managers/V2/helpers";
import { EnvironmentDetails } from "@/Test/Data";
import { MockEnvironmentHandler } from "@/Test/Mock";
import { DependencyProvider } from "@/UI/Dependency";
import { ModalProvider } from "../../ModalProvider";
import { EnvironmentControls } from "./EnvironmentControls";
const fetchMock = jest.fn();

global.fetch = fetchMock;

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const component = (
    <QueryClientProvider client={queryClient}>
      <QueryControlProvider>
        <ModalProvider>
          <MemoryRouter initialEntries={[{ search: "?env=123" }]}>
            <DependencyProvider
              dependencies={{
                environmentHandler: MockEnvironmentHandler(EnvironmentDetails.a.id),
              }}
            >
              <EnvironmentControls />
            </DependencyProvider>
          </MemoryRouter>
        </ModalProvider>
      </QueryControlProvider>
    </QueryClientProvider>
  );

  return {
    component,
    queryClient,
  };
}

beforeEach(() => {
  fetchMock.mockClear();
});

test("GIVEN EnvironmentControls WHEN rendered THEN it should be accessible", async () => {
  fetchMock.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: EnvironmentDetails.a }),
    })
  );

  const { component } = setup();
  const { container } = render(component);

  await act(async () => {
    expect(await axe(container)).toHaveNoViolations();
  });
});

test("EnvironmentControls shows halt button when environment is not halted", async () => {
  const { component } = setup();

  fetchMock.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: EnvironmentDetails.a }),
    })
  );

  render(component);

  expect(await screen.findByText("Halt")).toBeVisible();
});

test("EnvironmentControls shows resume button when environment is halted", async () => {
  const { component } = setup();

  fetchMock.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { ...EnvironmentDetails.a, halted: true } }),
    })
  );

  render(component);

  expect(await screen.findByText("Resume")).toBeVisible();
  expect(await screen.findByText("Operations halted")).toBeVisible();
});

test("EnvironmentControls halts the environment when clicked", async () => {
  const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");
  const { component } = setup();

  fetchMock
    .mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: EnvironmentDetails.a }),
      })
    )
    .mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

  render(component);

  const halt = await screen.findByText("Halt");

  expect(halt).toBeVisible();

  await userEvent.click(halt);
  await userEvent.click(await screen.findByText("Yes"));

  const [, haltCall] = fetchMock.mock.calls;
  const [receivedUrl, requestInit] = haltCall;

  expect(receivedUrl).toEqual("http://localhost:8888/api/v2/actions/environment/halt");
  expect(requestInit?.headers?.["X-Inmanta-Tid"]).toEqual(EnvironmentDetails.a.id);
  expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
});

test("EnvironmentControls resumes the environment when clicked and the environment is halted", async () => {
  const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");
  const { component } = setup();

  fetchMock
    .mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { ...EnvironmentDetails.a, halted: true } }),
      })
    )
    .mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

  render(component);

  const resume = await screen.findByText("Resume");

  expect(resume).toBeVisible();

  await userEvent.click(resume);
  await userEvent.click(await screen.findByText("Yes"));

  const [, resumeCall] = fetchMock.mock.calls;
  const [receivedUrl, requestInit] = resumeCall;

  expect(receivedUrl).toEqual("http://localhost:8888/api/v2/actions/environment/resume");
  expect(requestInit?.headers?.["X-Inmanta-Tid"]).toEqual(EnvironmentDetails.a.id);
  expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
});
