import React, { act } from "react";
import { Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider, UseQueryResult } from "@tanstack/react-query";
import { render, queries, within as baseWithin } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ServiceModel } from "@/Core";
import { InstanceWithRelations, Inventories } from "@/Data/Queries";
import { MockedDependencyProvider } from "@/Test";
import * as customQueries from "@/Test/Utils/custom-queries";
import { words } from "@/UI";
import { Canvas } from "@/UI/Components/Diagram/Canvas";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { CanvasProvider } from "./Context/CanvasProvider";
import { InstanceComposerContext } from "./Context/Context";
import { mockedInstanceTwo, mockedInstanceTwoServiceModel, serviceModels } from "./Mocks";
import "@testing-library/jest-dom";
import { defineObjectsForJointJS } from "./testSetup";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";

const allQueries = {
  ...queries,
  ...customQueries,
};
const user = userEvent.setup();
const screen = baseWithin(document.body, allQueries);

const setup = (
  mainService: ServiceModel,
  instance?: InstanceWithRelations,
  models: ServiceModel[] = serviceModels,
  editable: boolean = true
) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <TestMemoryRouter>
          <MockedDependencyProvider>
            <InstanceComposerContext.Provider
              value={{
                instance: instance || null,
                serviceModels: models,
                mainService: mainService,
                relatedInventoriesQuery: { data: {} } as UseQueryResult<Inventories, Error>,
              }}
            >
              <CanvasProvider>
                <Routes>
                  <Route path="/" element={<Canvas editable={editable} />} />
                  <Route path="/lsm/catalog/test-service/inventory" element={<></>} />
                </Routes>
              </CanvasProvider>
            </InstanceComposerContext.Provider>
          </MockedDependencyProvider>
        </TestMemoryRouter>
      </ModalProvider>
    </QueryClientProvider>
  );
};

beforeAll(() => {
  defineObjectsForJointJS();
});

describe("Canvas.tsx", () => {
  it("renders canvas correctly", async () => {
    const component = setup(mockedInstanceTwoServiceModel, mockedInstanceTwo, [
      mockedInstanceTwoServiceModel,
    ]);

    render(component);

    const leftSidebar = screen.getByTestId("left_sidebar");

    expect(screen.getByTestId("Composer-Container")).toBeVisible();
    expect(screen.getByTestId("canvas")).toBeVisible();
    expect(leftSidebar).toBeVisible();
    expect(leftSidebar.children.length).toBe(3);
    expect(leftSidebar.children[0].id).toBe("instance-stencil");
    expect(leftSidebar.children[1].id).toBe("inventory-stencil");
    expect(leftSidebar.children[2].id).toBe("tabs-toolbar");
    expect(screen.getByTestId("zoomHandler")).toBeVisible();

    const headerLabel = await screen.findByJointSelector("headerLabel");

    expect(headerLabel).toHaveTextContent("test-service");

    const header = screen.getByJointSelector("header");

    expect(header.getAttribute("fill")).toContain(
      "var(--pf-t--chart--color--yellow--300, #dca614)"
    );
  });

  it("renders shapes dict Value that can be viewed in dict Modal", async () => {
    const component = setup(mockedInstanceTwoServiceModel, mockedInstanceTwo, [
      mockedInstanceTwoServiceModel,
    ]);

    render(component);

    const dictValue = await screen.findByJointSelector("itemLabel_dictOne_value");

    await act(async () => {
      await user.click(dictValue.children[0]);
    });

    const modal = await screen.findByRole("dialog");

    expect(modal).toBeVisible();

    expect(screen.getByText(words("instanceComposer.dictModal")("dictOne"))).toBeVisible();

    expect(screen.getByText("{}")).toBeVisible();

    const copyButton = await screen.findByLabelText("Copy to clipboard");

    await act(async () => {
      await user.click(copyButton);
    });

    const clipboardItems = await navigator.clipboard.read();
    const blob = await clipboardItems[0].getType(clipboardItems[0].types[0]);
    const clipboardText = await blob.text();

    expect(clipboardText).toEqual("{}");

    const closeButton = await screen.findByLabelText("Close");

    await act(async () => {
      await user.click(closeButton);
    });

    expect(modal).not.toBeVisible();
  });

  it("renders right sidebar without buttons and left sidebar when not editable", async () => {
    const component = setup(
      mockedInstanceTwoServiceModel,
      mockedInstanceTwo,
      [mockedInstanceTwoServiceModel],
      false
    );

    render(component);
    const headerLabel = await screen.findByJointSelector("headerLabel");

    await act(async () => {
      await user.click(headerLabel);
    });

    expect(screen.queryByText("Remove")).toBeNull();
    expect(screen.queryByText("Cancel")).toBeNull();

    expect(screen.getByTestId("left_sidebar")).not.toBeVisible(); // Left sidebar is set to display:none when not editable
  });

  it("renders right sidebar with buttons when editable", async () => {
    const component = setup(
      mockedInstanceTwoServiceModel,
      mockedInstanceTwo,
      [mockedInstanceTwoServiceModel],
      true
    );

    render(component);
    const headerLabel = await screen.findByJointSelector("headerLabel");

    await act(async () => {
      await user.click(headerLabel);
    });

    expect(screen.getByText("Remove")).toBeVisible();
    expect(screen.getByText("Cancel")).toBeVisible();

    expect(screen.getByTestId("left_sidebar")).toBeVisible();
  });
});
