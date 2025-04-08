import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import {
  BaseApiHelper,
  CommandResolverImpl,
  getStoreInstance,
  HaltEnvironmentCommandManager,
  QueryResolverImpl,
  ResumeEnvironmentCommandManager,
} from "@/Data";
import { defaultAuthContext } from "@/Data/Auth/AuthContext";
import {
  EnvironmentDetailsContinuousQueryManager,
  EnvironmentDetailsUpdater,
  GetEnvironmentDetailsStateHelper,
} from "@/Slices/Settings/Data/GetEnvironmentDetails";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolverImpl,
  DynamicQueryManagerResolverImpl,
  EnvironmentDetails,
  MockEnvironmentHandler,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ModalProvider } from "../../ModalProvider";
import { EnvironmentControls } from "./EnvironmentControls";

expect.extend(toHaveNoViolations);

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const environmentDetailsStateHelper = GetEnvironmentDetailsStateHelper(store);
  const environmentDetailsQueryManager = EnvironmentDetailsContinuousQueryManager(
    store,
    apiHelper,
    scheduler
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([environmentDetailsQueryManager], scheduler)
  );

  const haltEnvironmentManager = HaltEnvironmentCommandManager(
    BaseApiHelper(undefined, defaultAuthContext),
    environmentDetailsStateHelper,
    new EnvironmentDetailsUpdater(store, apiHelper)
  );

  const resumeEnvironmentManager = ResumeEnvironmentCommandManager(
    BaseApiHelper(undefined, defaultAuthContext),
    environmentDetailsStateHelper,
    new EnvironmentDetailsUpdater(store, apiHelper)
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolverImpl([haltEnvironmentManager, resumeEnvironmentManager])
  );

  const component = (
    <ModalProvider>
      <MemoryRouter initialEntries={[{ search: "?env=123" }]}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            queryResolver,
            commandResolver,
            environmentHandler: MockEnvironmentHandler(EnvironmentDetails.a.id),
          }}
        >
          <StoreProvider store={store}>
            <EnvironmentControls />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </ModalProvider>
  );

  return {
    component,
    apiHelper,
    scheduler,
  };
}

test("GIVEN EnvironmentControls WHEN rendered THEN it should be accessible", async () => {
  const { component, apiHelper } = setup();
  const { container } = render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: EnvironmentDetails.a }));
  });

  expect(await axe(container)).toHaveNoViolations();
});

test("EnvironmentControls halt the environment when clicked and the environment is running", async () => {
  const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");

  const { component, apiHelper } = setup();

  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: EnvironmentDetails.a }));
  });
  const stopButton = await screen.findByText("STOP");

  expect(stopButton).toBeVisible();

  await userEvent.click(stopButton);

  await userEvent.click(await screen.findByText("Yes"));

  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];

  expect(receivedUrl).toEqual("http://localhost:8888/api/v2/actions/environment/halt");
  expect(requestInit?.headers?.["X-Inmanta-Tid"]).toEqual(EnvironmentDetails.a.id);
  expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
});

test("EnvironmentControls don\\t trigger backend call when dialog is not confirmed", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: EnvironmentDetails.a }));
  });

  const stopButton = await screen.findByText("STOP");

  expect(stopButton).toBeVisible();

  await userEvent.click(stopButton);

  await userEvent.click(await screen.findByText("No"));

  expect(fetchMock.mock.calls).toHaveLength(0);
});

test("EnvironmentControls resume the environment when clicked and the environment is halted", async () => {
  const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");

  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: { ...EnvironmentDetails.a, halted: true } }));
  });

  expect(await screen.findByText("Operations halted")).toBeVisible();

  const start = await screen.findByText("Resume");

  expect(start).toBeVisible();

  await userEvent.click(start);

  await userEvent.click(await screen.findByText("Yes"));

  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];

  expect(receivedUrl).toEqual("http://localhost:8888/api/v2/actions/environment/resume");
  expect(requestInit?.headers?.["X-Inmanta-Tid"]).toEqual(EnvironmentDetails.a.id);
  expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
});
