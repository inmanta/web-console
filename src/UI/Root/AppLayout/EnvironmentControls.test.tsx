import { Either } from "@/Core";
import {
  BaseApiHelper,
  CommandResolverImpl,
  EnvironmentDetailsQueryManager,
  EnvironmentDetailsStateHelper,
  getStoreInstance,
  HaltEnvironmentCommandManager,
  HaltEnvironmentPoster,
  QueryResolverImpl,
  ResumeEnvironmentCommandManager,
  ResumeEnvironmentPoster,
} from "@/Data";
import {
  DeferredFetcher,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  EnvironmentDetails,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { EnvironmentModifierImpl } from "@/UI/Dependency/EnvironmentModifier";
import { UrlManagerImpl } from "@/UI/Utils";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { EnvironmentControls } from "./EnvironmentControls";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const environmentDetailsFetcher = new DeferredFetcher<"EnvironmentDetails">();
  const environmentDetailsQueryManager = new EnvironmentDetailsQueryManager(
    environmentDetailsFetcher,
    new EnvironmentDetailsStateHelper(store, EnvironmentDetails.a.id),
    scheduler,
    EnvironmentDetails.a.id
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([environmentDetailsQueryManager])
  );

  const urlManager = new UrlManagerImpl("", EnvironmentDetails.a.id);

  const haltEnvironmentManager = new HaltEnvironmentCommandManager(
    new HaltEnvironmentPoster(new BaseApiHelper(), EnvironmentDetails.a.id)
  );

  const resumeEnvironmentManager = new ResumeEnvironmentCommandManager(
    new ResumeEnvironmentPoster(new BaseApiHelper(), EnvironmentDetails.a.id)
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      haltEnvironmentManager,
      resumeEnvironmentManager,
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          queryResolver,
          urlManager,
          commandResolver,
          environmentModifier: new EnvironmentModifierImpl(),
        }}
      >
        <StoreProvider store={store}>
          <EnvironmentControls />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );
  return {
    component,
    environmentDetailsFetcher,
    scheduler,
  };
}

test("EnvironmentControls halt the environment when clicked and the environment is running", async () => {
  const { component, environmentDetailsFetcher } = setup();
  render(component);
  await act(async () => {
    await environmentDetailsFetcher.resolve(
      Either.right({ data: EnvironmentDetails.a })
    );
  });
  const stopButton = await screen.findByText("STOP");
  expect(stopButton).toBeVisible();
  userEvent.click(stopButton);
  userEvent.click(await screen.findByText("Yes"));
  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
  expect(receivedUrl).toEqual(`/api/v2/actions/environment/halt`);
  expect(requestInit?.headers?.["X-Inmanta-Tid"]).toEqual(
    EnvironmentDetails.a.id
  );
});

test("EnvironmentControls don\\t trigger backend call when dialog is not confirmed", async () => {
  const { component, environmentDetailsFetcher } = setup();
  render(component);
  await act(async () => {
    await environmentDetailsFetcher.resolve(
      Either.right({ data: EnvironmentDetails.a })
    );
  });
  const stopButton = await screen.findByText("STOP");
  expect(stopButton).toBeVisible();
  userEvent.click(stopButton);
  userEvent.click(await screen.findByText("No"));
  expect(fetchMock.mock.calls).toHaveLength(0);
});

test("EnvironmentControls resume the environment when clicked and the environment is halted", async () => {
  const { component, environmentDetailsFetcher } = setup();
  render(component);
  await act(async () => {
    await environmentDetailsFetcher.resolve(
      Either.right({ data: { ...EnvironmentDetails.a, halted: true } })
    );
  });
  expect(await screen.findByText("Operations halted")).toBeVisible();
  const start = await screen.findByText("Resume");
  expect(start).toBeVisible();
  userEvent.click(start);
  userEvent.click(await screen.findByText("Yes"));
  const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
  expect(receivedUrl).toEqual(`/api/v2/actions/environment/resume`);
  expect(requestInit?.headers?.["X-Inmanta-Tid"]).toEqual(
    EnvironmentDetails.a.id
  );
});
