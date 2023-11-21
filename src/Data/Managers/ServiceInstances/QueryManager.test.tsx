import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import {
  DictionaryImpl,
  Either,
  Maybe,
  PageSize,
  RemoteData,
  SchedulerImpl,
  Task,
} from "@/Core";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getStoreInstance } from "@/Data/Store";
import { DeferredApiHelper, dependencies, ServiceInventory } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ServiceInstancesQueryManager } from "./QueryManager";
import { ServiceInstancesStateHelper } from "./StateHelper";

const jestOptions = { legacyFakeTimers: true };

jest.useFakeTimers(jestOptions);

const setup = () => {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const stateHelper = ServiceInstancesStateHelper(store);
  const tasks = new DictionaryImpl<Task>();
  const scheduler = new SchedulerImpl(
    5000,
    (task) => ({
      effect: jest.fn(() => task.effect()),
      update: jest.fn((result) => task.update(result)),
    }),
    tasks,
  );
  const queryManager = ServiceInstancesQueryManager(
    apiHelper,
    stateHelper,
    scheduler,
  );

  const Component: React.FC = () => {
    const [currentPageMock, setCurrentPageMock] = useUrlStateWithCurrentPage({
      route: "Inventory",
    });
    const [data] = queryManager.useContinuous({
      kind: "GetServiceInstances",
      name: "name",
      pageSize: PageSize.initial,
      currentPage: currentPageMock,
    });

    if (!RemoteData.isSuccess(data)) return null;

    const onNext = () => {
      setCurrentPageMock({
        kind: "CurrentPage",
        value: data.value.handlers.next || [],
      });
    };

    return <button onClick={onNext}>next</button>;
  };

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={dependencies}>
        <StoreProvider store={store}>
          <Component />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, tasks };
};

test("GIVEN QueryManager WHEN first page request is started and user clicks next page THEN first request update is not executed", async () => {
  const user = userEvent.setup({ delay: null });
  const { component, apiHelper, tasks } = setup();

  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);

  await act(async () => {
    await apiHelper.resolve(Either.right(ServiceInventory.pageData.first));
  });

  expect(apiHelper.pendingRequests).toHaveLength(0);

  const task1 = Maybe.orUndefined(tasks.get("GetServiceInstances_name"));
  expect(task1?.effect).not.toHaveBeenCalled();
  expect(task1?.update).not.toHaveBeenCalled();

  jest.advanceTimersByTime(5000);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(task1?.effect).toHaveBeenCalledTimes(1);
  expect(task1?.update).not.toHaveBeenCalled();

  await act(async () => {
    await apiHelper.resolve(Either.right(ServiceInventory.pageData.first));
  });

  expect(task1?.update).toHaveBeenCalledTimes(1);

  jest.advanceTimersByTime(5000);
  expect(task1?.effect).toHaveBeenCalledTimes(2);
  expect(task1?.update).toHaveBeenCalledTimes(1);

  await act(async () => {
    await user.click(screen.getByText("next"));
  });

  const task2 = Maybe.orUndefined(tasks.get("GetServiceInstances_name"));
  expect(task2?.effect).not.toHaveBeenCalled();
  expect(task2?.update).not.toHaveBeenCalled();
  expect(apiHelper.pendingRequests).toHaveLength(2);

  await act(async () => {
    await apiHelper.resolve(Either.right(ServiceInventory.pageData.first));
  });

  expect(task1?.update).toHaveBeenCalledTimes(1);

  await act(async () => {
    await apiHelper.resolve(Either.right(ServiceInventory.pageData.second));
  });

  expect(task1?.update).toHaveBeenCalledTimes(1);
  expect(task2?.effect).not.toHaveBeenCalled();
  expect(task2?.update).not.toHaveBeenCalled();
});
