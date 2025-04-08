import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Table /* data-codemods */, Tbody, Tr } from "@patternfly/react-table";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import { dependencies, ServiceInstance } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TreeTableCellContext } from "@/UI/Components/TreeTable/RowReferenceContext";
import { DependencyProvider } from "@/UI/Dependency";
import { CellWithCopy } from "./CellWithCopy";

function setup(props) {
  const store = getStoreInstance();

  const onClickFn = jest.fn();

  const component = (
    <QueryClientProvider client={testClient}>
      <MemoryRouter>
        <DependencyProvider dependencies={dependencies}>
          <StoreProvider store={store}>
            <TreeTableCellContext.Provider value={{ onClick: onClickFn }}>
              <Table>
                <Tbody>
                  <Tr>
                    <CellWithCopy {...props} />
                  </Tr>
                </Tbody>
              </Table>
            </TreeTableCellContext.Provider>
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { component, onClickFn };
}
describe("CellWithCopy", () => {
  const server = setupServer(
    http.get("/lsm/v1/service_inventory/test_service/someValue", () => {
      return HttpResponse.json({
        data: {
          ...ServiceInstance.a,
          service_identity_attribute_value: "someValue",
          name: "test_service",
          id: "someValue",
        },
      });
    }),
    http.get("/lsm/v1/service_inventory/test_service/someOtherValue", () => {
      return HttpResponse.json({
        data: {
          ...ServiceInstance.a,
          service_identity_attribute_value: "someOtherValue",
          name: "test_service2",
          id: "someOtherValue",
        },
      });
    })
  );

  beforeAll(() => {
    server.listen();
  });
  afterAll(() => {
    server.close();
  });

  test("Given CellWithCopy When a cell has a simple value only Then it is shown", async () => {
    const props = { label: "attribute", value: "someValue" };
    const { component } = setup(props);

    render(component);

    expect(await screen.findByText(props.value)).toBeVisible();
  });

  test("Given CellWithCopy When a cell has on click Then it is rendered as a link", async () => {
    const props = { label: "attribute", value: "someValue", hasRelation: true };
    const { component, onClickFn } = setup(props);

    render(component);
    const cell = await screen.findByText(props.value);

    expect(cell).toBeVisible();

    await userEvent.click(cell);

    expect(onClickFn).toHaveBeenCalledWith(props.value);
  });

  test("Given CellWithCopy When a cell has entity and on click Then it is rendered as a link", async () => {
    const props = {
      label: "attribute",
      value: "someValue",
      hasRelation: true,
      serviceName: "test_service",
    };
    const { component, onClickFn } = setup(props);

    render(component);

    const cell = await screen.findByText(props.value);

    expect(cell).toBeVisible();

    await userEvent.click(cell);

    expect(onClickFn).toHaveBeenCalledWith(props.value, props.serviceName);
  });

  test("Given CellWithCopy When a cell has entity, multiple values and on click Then multiple links are rendered", async () => {
    const [someValue, someOtherValue] = ["someValue", "someOtherValue"];
    const props = {
      label: "attribute",
      value: "someValue,someOtherValue",
      hasRelation: true,
      serviceName: "test_service",
    };
    const { component, onClickFn } = setup(props);

    render(component);

    const firstCell = await screen.findByText(someValue);

    expect(firstCell).toBeVisible();

    await userEvent.click(firstCell);

    expect(onClickFn).toHaveBeenCalledWith(someValue, props.serviceName);

    const otherCell = await screen.findByText(someOtherValue);

    expect(otherCell).toBeVisible();

    await userEvent.click(otherCell);

    expect(onClickFn).toHaveBeenCalledWith(someOtherValue, props.serviceName);
  });
});
