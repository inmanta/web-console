import * as queryModule from "@/Data/Managers/V2/helpers/useQueries";
import React, { useState } from "react";
import { AutoCompleteInputProvider } from "./AutoCompleteInputProvider";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { DependencyProvider } from "@/UI/Dependency";
import { dependencies, ServiceInstance } from "@/Test";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/Data";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/lsm/v1/service_inventory/test_entity", ({ request }) => {
    console.log(request.url);
    return HttpResponse.json({
      data: [ServiceInstance.a],
      metadata: {
        total: 0,
        before: 0,
        after: 0,
        page_size: 250,
      },
    });
  }),
);
const TestWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const [value, setValue] = useState("");
  const store = getStoreInstance();

  return (
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <DependencyProvider dependencies={dependencies}>
          <StoreProvider store={store}>
            <AutoCompleteInputProvider
              alreadySelected={[]}
              attributeName={"test_attribute"}
              attributeValue={value}
              isOptional={false}
              description={""}
              handleInputChange={setValue}
              serviceName={"test_entity"}
              multi={false}
            />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

test("Given the AutoCompleteInputProvider When typing an instance name or id Then the correct request is fired", async () => {
  server.listen();
  const mockFn = jest.fn();
  jest.spyOn(queryModule, "useGet").mockReturnValue(async (path) => {
    mockFn(path);
    const response = await fetch(path);

    return response.json();
  });

  render(<TestWrapper />);

  const relationInputField = await screen.findByPlaceholderText(
    "Select an instance of test_entity",
  );
  expect(mockFn.mock.calls[0]).toStrictEqual([
    "/lsm/v1/service_inventory/test_entity?include_deployment_progress=True&limit=250&",
  ]);

  expect(mockFn.mock.calls[1]).toStrictEqual([
    "/lsm/v1/service_inventory/test_entity?include_deployment_progress=True&limit=250&filter.id_or_service_identity=",
  ]);
  fireEvent.change(relationInputField, { target: { value: "a" } });

  expect(mockFn.mock.calls[2]).toStrictEqual([
    "/lsm/v1/service_inventory/test_entity?include_deployment_progress=True&limit=250&filter.id_or_service_identity=a",
  ]);

  fireEvent.change(relationInputField, { target: { value: "ab" } });

  expect(mockFn.mock.calls[3]).toStrictEqual([
    "/lsm/v1/service_inventory/test_entity?include_deployment_progress=True&limit=250&filter.id_or_service_identity=ab",
  ]);

  fireEvent.change(relationInputField, { target: { value: "" } });
  expect(mockFn.mock.calls[4]).toStrictEqual([
    "/lsm/v1/service_inventory/test_entity?include_deployment_progress=True&limit=250&filter.id_or_service_identity=",
  ]);

  server.close();
});
