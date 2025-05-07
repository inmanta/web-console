import React, { act, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import * as queryModule from "@/Data/Managers/V2/helpers/useQueries";
import { dependencies, ServiceInstance } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { DependencyProvider } from "@/UI/Dependency";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { AutoCompleteInputProvider } from "./AutoCompleteInputProvider";

const server = setupServer(
  http.get("/lsm/v1/service_inventory/test_entity", () => {
    return HttpResponse.json({
      data: [ServiceInstance.a],
      metadata: {
        total: 0,
        before: 0,
        after: 0,
        page_size: 250,
      },
    });
  })
);
const TestWrapper = () => {
  const [value, setValue] = useState("");
  const store = getStoreInstance();

  return (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
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
              isDisabled={false}
              multi={false}
            />
          </StoreProvider>
        </DependencyProvider>
      </TestMemoryRouter>
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
    "Select an instance of test_entity"
  );

  expect(mockFn.mock.calls[0]).toStrictEqual([
    "/lsm/v1/service_inventory/test_entity?include_deployment_progress=True&limit=250&",
  ]);

  expect(mockFn.mock.calls[1]).toStrictEqual([
    "/lsm/v1/service_inventory/test_entity?include_deployment_progress=True&limit=250&filter.id_or_service_identity=",
  ]);

  //fireEvents in that scenario triggers update in the components which then triggers "act warning"
  await act(async () => {
    fireEvent.change(relationInputField, { target: { value: "a" } });
  });

  expect(mockFn.mock.calls[2]).toStrictEqual([
    "/lsm/v1/service_inventory/test_entity?include_deployment_progress=True&limit=250&filter.id_or_service_identity=a",
  ]);

  await act(async () => {
    fireEvent.change(relationInputField, { target: { value: "ab" } });
  });

  expect(mockFn.mock.calls[3]).toStrictEqual([
    "/lsm/v1/service_inventory/test_entity?include_deployment_progress=True&limit=250&filter.id_or_service_identity=ab",
  ]);

  await act(async () => {
    fireEvent.change(relationInputField, { target: { value: "" } });
  });

  expect(mockFn.mock.calls[4]).toStrictEqual([
    "/lsm/v1/service_inventory/test_entity?include_deployment_progress=True&limit=250&filter.id_or_service_identity=",
  ]);

  server.close();
});
