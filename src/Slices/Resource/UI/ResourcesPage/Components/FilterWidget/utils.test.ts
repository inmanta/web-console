import { invertFilter, removeInvertedSelection } from "./utils";

describe("Filter widget utilities", () => {
    describe("invertFilter", () => {
        it("adds an exclamation mark when not present", () => {
            expect(invertFilter("deployed")).toEqual("!deployed");
        });

        it("removes an exclamation mark when present", () => {
            expect(invertFilter("!failed")).toEqual("failed");
        });
    });

    describe("removeInvertedSelection", () => {
        it("removes the inverse selection if it exists", () => {
            const selected = ["deployed", "!failed"];

            expect(removeInvertedSelection("!deployed", selected)).toEqual([
                "!failed",
            ]);
            expect(removeInvertedSelection("failed", selected)).toEqual(["deployed"]);
        });

        it("returns the original list when no inverse is found", () => {
            const selected = ["deployed", "!failed"];

            expect(removeInvertedSelection("!skipped", selected)).toBe(selected);
        });
    });
});


