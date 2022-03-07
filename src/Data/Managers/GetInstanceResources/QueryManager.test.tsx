import React, { useContext } from "react";
import { render } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { QueryManagerResolver, QueryResolverImpl } from "@/Data/Resolvers";
import { getStoreInstance } from "@/Data/Store";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import { DependencyContext, DependencyProvider } from "@/UI";
import { RemoteDataView } from "@/UI/Components";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );
  const component = (
    <StoreProvider store={store}>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <Dummy />
      </DependencyProvider>
    </StoreProvider>
  );

  return { component, apiHelper };
}

const Dummy: React.FC = ({}) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useContinuous<"GetInstanceResources">({
    kind: "GetInstanceResources",
    id: "abc",
    service_entity: "service",
    version: 1,
  });
  return (
    <RemoteDataView
      data={data}
      SuccessView={() => <label aria-label="success">success</label>}
    />
  );
};

test("Given the InstanceResourceQueryManager When used Then handles 409", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
});
