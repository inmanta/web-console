import { PositionTracker } from "./positionTracker";

describe("PositionTracker", () => {
    it("should reserve positions without overlaps", () => {
        const tracker = new PositionTracker();
        const y1 = tracker.findNextYPosition(100);
        tracker.reserve("shape-1", 100, y1, 100, 50);

        const y2 = tracker.findNextYPosition(100);
        expect(y2).toBeGreaterThanOrEqual(y1 + 200);
    });

    it("should allow positions on different columns without shifting", () => {
        const tracker = new PositionTracker();
        tracker.reserve("shape-1", 100, 0, 100, 50);

        const y = tracker.findNextYPosition(500);
        expect(y).toBe(0);
    });

    it("should respect exclusions when checking overlaps", () => {
        const tracker = new PositionTracker();
        tracker.reserve("shape-1", 100, 0, 100, 50);

        const y = tracker.findNextYPosition(100, 100, 50, 0, "shape-1");
        expect(y).toBe(0);
    });

    it("should update existing positions", () => {
        const tracker = new PositionTracker();
        tracker.reserve("shape-1", 100, 0, 100, 50);
        tracker.updatePosition("shape-1", 150, 300, 100, 50);

        const position = tracker.getPosition("shape-1");
        expect(position).toEqual({ x: 150, y: 300, width: 100, height: 50 });
    });

    it("should clear positions", () => {
        const tracker = new PositionTracker();
        tracker.reserve("shape-1", 100, 0, 100, 50);
        tracker.clear();

        expect(tracker.getPosition("shape-1")).toBeUndefined();
    });
});

