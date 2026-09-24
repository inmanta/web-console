import React from "react";
import { ApolloProvider } from "@apollo/client/react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Resource } from "@/Core";
import { createApolloClient } from "@/Data/Apollo";
import { Resource as ResourceData } from "@/Test";
import { AppAlertProvider } from "@/UI/Root/Components/AppAlertProvider";
import { words } from "@/UI/words";
import { ResourceHealthDemoButton } from "./ResourceHealthDemoButton";
import { ResourceTableRow_Fragment } from "./ResourceTableRow";

const [{ node }] = ResourceData.response.data.resources.edges;

function setup() {
  const client = createApolloClient({ getToken: () => null });

  client.cache.writeFragment({
    fragment: ResourceTableRow_Fragment,
    data: node,
  });

  render(
    <ApolloProvider client={client}>
      <AppAlertProvider>
        <ResourceHealthDemoButton resourceId={node.resourceId} />
      </AppAlertProvider>
    </ApolloProvider>
  );

  const readState = () =>
    client.cache.readFragment({
      fragment: ResourceTableRow_Fragment,
      id: client.cache.identify({ __typename: "Resource", resourceId: node.resourceId }),
    })?.state;

  return { client, readState };
}

describe("ResourceHealthDemoButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("toggles the resource between all red and all green in the cache without a request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { client, readState } = setup();

    await userEvent.click(
      screen.getByRole("button", { name: words("resources.demoMutation.markFailing") })
    );

    await waitFor(() =>
      expect(readState()).toMatchObject({
        lastHandlerRun: Resource.LAST_HANDLER_RUN.failed,
        compliance: Resource.COMPLIANCE.undefined,
        blocked: Resource.BLOCKED.blocked,
      })
    );
    expect(
      await screen.findByText(words("resources.demoMutation.success")(node.resourceId, false))
    ).toBeVisible();

    await userEvent.click(
      screen.getByRole("button", { name: words("resources.demoMutation.markHealthy") })
    );

    await waitFor(() =>
      expect(readState()).toMatchObject({
        lastHandlerRun: Resource.LAST_HANDLER_RUN.successful,
        compliance: Resource.COMPLIANCE.compliant,
        blocked: Resource.BLOCKED.not_blocked,
      })
    );
    expect(
      await screen.findByText(words("resources.demoMutation.success")(node.resourceId, true))
    ).toBeVisible();
    expect(fetchSpy).not.toHaveBeenCalled();

    client.stop();
  });
});
