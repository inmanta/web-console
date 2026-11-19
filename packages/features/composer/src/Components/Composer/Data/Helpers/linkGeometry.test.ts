import { CardBox, getLayoutAxis, getLinkAnchors } from "./linkGeometry";

const card = (x: number, y: number): CardBox => ({ x, y, width: 280, height: 50 });

const parent = card(0, 0);

describe("getLinkAnchors", () => {
  it("joins cards beside each other on the sides that face each other", () => {
    expect(getLinkAnchors(parent, card(400, 0), "vertical")).toEqual([
      { x: 280, y: 25, side: "right" },
      { x: 400, y: 25, side: "left" },
    ]);
    expect(getLinkAnchors(parent, card(-400, 0), "vertical")).toEqual([
      { x: 0, y: 25, side: "left" },
      { x: -120, y: 25, side: "right" },
    ]);
  });

  it("joins cards above each other on the sides that face each other", () => {
    expect(getLinkAnchors(parent, card(100, 200), "horizontal")).toEqual([
      { x: 140, y: 50, side: "bottom" },
      { x: 240, y: 200, side: "top" },
    ]);
    expect(getLinkAnchors(parent, card(0, -200), "horizontal")).toEqual([
      { x: 140, y: 0, side: "top" },
      { x: 140, y: -150, side: "bottom" },
    ]);
  });

  it("joins cards apart on both axes along the layout axis", () => {
    // Left to right: a child far below, in the next layer, is entered from the side
    const below = card(400, 500);

    expect(getLinkAnchors(parent, below, "horizontal").map(({ side }) => side)).toEqual([
      "right",
      "left",
    ]);

    // Top to bottom: a child far to the right, in the next layer, is entered from above
    const right = card(900, 170);

    expect(getLinkAnchors(parent, right, "vertical").map(({ side }) => side)).toEqual([
      "bottom",
      "top",
    ]);
  });
});

describe("getLayoutAxis", () => {
  it("reads left to right from a column of children beside the parent", () => {
    const column = [0, 90, 180, 270].map((y) => card(400, y - 135));

    expect(getLayoutAxis(column.map((child) => [parent, child]))).toBe("horizontal");
  });

  it("reads top to bottom from a row of children below the parent", () => {
    const row = [-480, -160, 160, 480].map((x) => card(x, 170));

    expect(getLayoutAxis(row.map((child) => [parent, child]))).toBe("vertical");
  });

  it("reads left to right when the links say nothing", () => {
    expect(getLayoutAxis([])).toBe("horizontal");
    expect(getLayoutAxis([[parent, card(400, 500)]])).toBe("horizontal");
  });
});
