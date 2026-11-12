import assert from "assert";
import { Service } from "@inmanta/web-console-test-utils";
import { getStateCounts } from "./helpers";

const { lifecycle, instance_summary: summary } = Service.withEachLabel;

assert(summary);

describe("getStateCounts", () => {
  it("orders the counted states by label, most severe first, then in lifecycle order", () => {
    expect(
      getStateCounts(summary, lifecycle.states).map(({ stateName, label }) => [stateName, label])
    ).toEqual([
      ["failed", "danger"],
      ["creating", "info"],
      ["update_inprogress", "info"],
      ["up", "success"],
      ["start", "no_label"],
    ]);
  });

  it("uses the web_label as display name, falling back to the state name", () => {
    const stateCounts = getStateCounts(summary, lifecycle.states);

    expect(stateCounts.find(({ stateName }) => stateName === "creating")?.stateDisplayName).toBe(
      lifecycle.states.find(({ name }) => name === "creating")?.annotations?.web_label
    );
    expect(
      stateCounts.find(({ stateName }) => stateName === "update_inprogress")?.stateDisplayName
    ).toBe("update_inprogress");
  });

  it("leaves out states that are not in the lifecycle", () => {
    expect(
      getStateCounts(
        { ...summary, by_state: { ...summary.by_state, removed: 3 } },
        lifecycle.states
      )
    ).toEqual(getStateCounts(summary, lifecycle.states));
  });
});
