import * as Test from "@inmanta/web-console-test-utils";
import { getAttributesOutsideForm } from "./getAttributesOutsideForm";

describe("getAttributesOutsideForm", () => {
  it("keeps only the attributes that have no field in the form", () => {
    const bandwidthField = { ...Test.Field.text, name: "bandwidth" };

    expect(
      getAttributesOutsideForm([bandwidthField], { blueprint: "small", bandwidth: 10 })
    ).toEqual({ blueprint: "small" });
  });
});
