/**
 * Testing the Monaco Editor in Jest is hardly possible, therefore the editor will be tested in the E2E tests.
 * The JSDOM environment doesn't work with the different features of the Monaco Editor.
 * Making it a requirement to mock every feature of the Monaco Editor.
 * This would defeat the purpose of the testing.
 * Only the loading and hook are tested here.
 */

import React, { act } from "react";
import "@testing-library/jest-dom";
import { Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  BooleanField,
  DictListField,
  EnumField,
  InstanceAttributeModel,
  NestedField,
  TextField,
  Textarea,
} from "@/Core";
import { getStoreInstance, QueryResolverImpl, QueryManagerResolverImpl } from "@/Data";
import * as Test from "@/Test";
import { DeferredApiHelper, StaticScheduler, dependencies } from "@/Test";
import { DependencyProvider } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ServiceInstanceForm } from "./ServiceInstanceForm";

const setup = (
  fields: (TextField | BooleanField | NestedField | DictListField | EnumField | Textarea)[],
  func: undefined | jest.Mock = undefined,
  isEdit = false,
  originalAttributes: InstanceAttributeModel | undefined = undefined
) => {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler)
  );

  const queryClient = new QueryClient();

  const component = (
    <QueryClientProvider client={queryClient}>
      <TestMemoryRouter>
        <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
          <StoreProvider store={store}>
            <Routes>
              <Route
                path="/"
                element={
                  <ServiceInstanceForm
                    fields={fields}
                    onCancel={jest.fn()}
                    onSubmit={func ? func : jest.fn()}
                    isEdit={isEdit}
                    originalAttributes={originalAttributes}
                    service_entity="service_entity"
                    isDirty={false}
                    setIsDirty={jest.fn()}
                  />
                }
              />
            </Routes>
          </StoreProvider>
        </DependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component, apiHelper, scheduler };
};

it("GIVEN the ServiceInstanceForm WHEN using the JSON Editor THEN View loads without errors", async () => {
  // Provide the server-side API with the request handlers to get the schema
  const server = setupServer(
    http.get("/lsm/v1/service_catalog/:id/schema", async ({ params }) => {
      expect(params.id).toEqual("service_entity");

      return HttpResponse.json({
        data: {
          $defs: {},
          additionalProperties: false,
          properties: {
            name: {
              maxLength: 12,
              minLength: 2,
              title: "Name",
              type: "string",
            },
          },
          required: ["name"],
          title: "service_entity",
          type: "object",
        },
      });
    })
  );

  // Start the interception.
  server.listen();

  const { component } = setup([Test.Field.text]);

  render(component);

  expect(
    screen.getByRole("generic", {
      name: `TextFieldInput-${Test.Field.text.name}`,
    })
  ).toBeVisible();

  const EditorToggle = screen.getByRole("button", { name: "JSON-Editor" });

  await act(async () => {
    fireEvent.click(EditorToggle);
  });

  // Expect the view to display a spinner.
  expect(screen.getByTestId("loading-spinner")).toBeVisible();

  server.close();
});
