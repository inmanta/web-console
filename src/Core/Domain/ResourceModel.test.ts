import { isListEqual, ResourceModel } from "./ResourceModel";

test("isListEqual returns true for equal lists", () => {
  const a: ResourceModel[] = [
    { resource_id: "aaa", resource_state: "rejected" },
  ];
  const b: ResourceModel[] = [
    { resource_id: "aaa", resource_state: "rejected" },
  ];

  expect(isListEqual(a, b)).toBeTruthy();
});

test("isListEqual returns false for different lists (simple)", () => {
  const a: ResourceModel[] = [
    { resource_id: "aaa", resource_state: "rejected" },
  ];
  const b: ResourceModel[] = [
    { resource_id: "aaa", resource_state: "finished" },
  ];

  expect(isListEqual(a, b)).toBeFalsy();
});

test("isListEqual returns false for different lists (different length)", () => {
  const a: ResourceModel[] = [
    { resource_id: "aaa", resource_state: "rejected" },
    { resource_id: "bbb", resource_state: "rejected" },
  ];
  const b: ResourceModel[] = [
    { resource_id: "aaa", resource_state: "rejected" },
  ];

  expect(isListEqual(a, b)).toBeFalsy();
});

test("isListEqual returns false for different lists (complex)", () => {
  const a: ResourceModel[] = [
    { resource_id: "aaa", resource_state: "rejected" },
    { resource_id: "bbb", resource_state: "rejected" },
  ];
  const b: ResourceModel[] = [
    { resource_id: "aaa", resource_state: "rejected" },
    { resource_id: "bbb", resource_state: "finished" },
  ];

  expect(isListEqual(a, b)).toBeFalsy();
});
