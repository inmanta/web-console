import { Service } from "@/Test";
import { getActiveLabel, getLabelStates } from "./labelFilter";

const { states } = Service.withInstanceSummary.lifecycle;

describe("getActiveLabel", () => {
  it("returns the label whose states match the filter exactly", () => {
    const infoStates = getLabelStates(states, "info");

    expect(getActiveLabel(states, [...infoStates].reverse())).toBe("info");
  });

  it("returns null when the filter holds only part of a label's states", () => {
    const infoStates = getLabelStates(states, "info");

    expect(getActiveLabel(states, infoStates.slice(1))).toBeNull();
  });

  it("returns null when there is no state filter", () => {
    expect(getActiveLabel(states, undefined)).toBeNull();
  });
});
