import React from "react";
import { render, screen } from "@testing-library/react";
import { SubscriptionComponent } from "./SubscriptionComponent";
import { ServicesContext } from "./ServicesContext";
import { HookedDataManagerImpl } from "./HookedDataManagerImpl";
import { StateHelperImpl } from "./StateHelperImpl";
import { getStoreInstance } from "./Store";
import { DummySubscriptionHelper, DummyApiHelper } from "@/Test";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";

interface Tools {
  apiHelper: DummyApiHelper;
  subscriptionHelper: DummySubscriptionHelper;
  component: React.ReactElement;
}

function setup(): Tools {
  const storeInstance = getStoreInstance();
  const apiHelper = new DummyApiHelper();
  const subscriptionHelper = new DummySubscriptionHelper(apiHelper);
  const services = {
    dataManager: new HookedDataManagerImpl(
      new StateHelperImpl(storeInstance),
      subscriptionHelper
    ),
  };

  const component = (
    <ServicesContext.Provider value={services}>
      <StoreProvider store={storeInstance}>
        <SubscriptionComponent id="abc" />
      </StoreProvider>
    </ServicesContext.Provider>
  );

  return { component, apiHelper, subscriptionHelper };
}

test("SubscriptionComponent initially shows loading", async () => {
  const { component } = setup();
  render(component);
  expect(screen.getByText("loading")).toBeInTheDocument();
});

test("SubscriptionComponent initially shows data", async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(Either.right({ id: "abc", value: 2 }));
  expect(await screen.findByText(`success, value: 2`)).toBeInTheDocument();
});

test("SubscriptionComponent initially shows updated data", async () => {
  const { component, apiHelper, subscriptionHelper } = setup();
  render(component);
  apiHelper.resolve(Either.right({ id: "abc", value: 2 }));
  subscriptionHelper.executeAll();
  apiHelper.resolve(Either.right({ id: "abc", value: 3 }));
  expect(await screen.findByText(`success, value: 3`)).toBeInTheDocument();
});

test("SubscriptionComponent initially shows failed data", async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(Either.left("error message"));
  expect(await screen.findByText(`failed: error message`)).toBeInTheDocument();
});

test("SubscriptionComponent initially shows updated failed data", async () => {
  const { component, apiHelper, subscriptionHelper } = setup();
  render(component);
  apiHelper.resolve(Either.right({ id: "abc", value: 2 }));
  subscriptionHelper.executeAll();
  apiHelper.resolve(Either.left("error message"));
  expect(await screen.findByText(`failed: error message`)).toBeInTheDocument();
});
