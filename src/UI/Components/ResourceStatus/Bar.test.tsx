import { Resource } from "@/Core";
import { infoToLegendItem, InfoWithTotal } from "./Bar";

test("GIVEN infoToLegend with info with 1 key THEN returns correct label", () => {
  const info: InfoWithTotal = {
    keys: [Resource.Status.unavailable],
    color: "red",
    total: 10,
  };
  expect(infoToLegendItem(info, () => undefined)).toMatchObject({
    id: "unavailable",
    value: 10,
    label: "unavailable",
    backgroundColor: "red",
  });
});

test("GIVEN infoToLegend with info with 2 keys THEN returns correct label", () => {
  const info: InfoWithTotal = {
    keys: [Resource.Status.unavailable, Resource.Status.cancelled],
    color: "red",
    total: 10,
  };
  expect(infoToLegendItem(info, () => undefined)).toMatchObject({
    id: "unavailable",
    value: 10,
    label: "unavailable & cancelled",
    backgroundColor: "red",
  });
});
