import { EntityAnnotations, Field } from "@/Core";
import * as Test from "@/Test";
import { words } from "@/UI/words";
import { resolveFormTabs } from "./FormTabs";

const { general, network, extras, entityAnnotations } = Test.Service.FormTabs;

test("GIVEN resolveFormTabs WHEN the entity has no annotations or no web_tabs THEN the form is untabbed", () => {
  expect(resolveFormTabs(undefined, [Test.Field.text])).toEqual({ kind: "untabbed" });
  expect(resolveFormTabs({ other_annotation: "value" }, [Test.Field.text])).toEqual({
    kind: "untabbed",
  });
});

test("GIVEN resolveFormTabs WHEN a valid catalog is provided THEN tabs are ordered by 'order' and fields without web_tab land on the default tab", () => {
  const assigned: Field = { ...Test.Field.text, tab: network.key };
  const unassigned: Field = Test.Field.bool;

  expect(resolveFormTabs(entityAnnotations, [assigned, unassigned])).toEqual({
    kind: "tabs",
    defaultKey: general.key,
    groups: [
      { tab: general, fields: [unassigned] },
      { tab: network, fields: [assigned] },
      { tab: extras, fields: [] },
    ],
  });
});

test("GIVEN resolveFormTabs WHEN tabs have equal or missing order THEN they fall back to key, never list position", () => {
  const annotations: EntityAnnotations = {
    web_tabs: [
      { key: "b", label: "B", order: 10 },
      { key: "a", label: "A", order: 10, default: true },
      { key: "d", label: "D" },
      { key: "c", label: "C" },
    ],
  };

  const resolution = resolveFormTabs(annotations, []);

  expect(resolution.kind).toEqual("tabs");

  if (resolution.kind === "tabs") {
    expect(resolution.groups.map((group) => group.tab.key)).toEqual(["a", "b", "c", "d"]);
  }
});

test("GIVEN resolveFormTabs WHEN zero or multiple tabs are marked as default THEN a model error is surfaced", () => {
  const zeroDefaults: EntityAnnotations = { web_tabs: [network, extras] };
  const twoDefaults: EntityAnnotations = {
    web_tabs: [general, { ...network, default: true }],
  };

  expect(resolveFormTabs(zeroDefaults, [])).toEqual({
    kind: "error",
    message: words("inventory.form.tabs.defaultRequired")(0),
  });
  expect(resolveFormTabs(twoDefaults, [])).toEqual({
    kind: "error",
    message: words("inventory.form.tabs.defaultRequired")(2),
  });
});

test("GIVEN resolveFormTabs WHEN a field is assigned to a key that is not in the catalog THEN a model error is surfaced", () => {
  const assigned: Field = { ...Test.Field.text, tab: "not_in_catalog" };

  expect(resolveFormTabs(entityAnnotations, [assigned])).toEqual({
    kind: "error",
    message: words("inventory.form.tabs.unknownKey")(assigned.name, "not_in_catalog"),
  });
});

test("GIVEN resolveFormTabs WHEN the catalog is malformed THEN a model error is surfaced", () => {
  const notAList = { web_tabs: "general,network" } as unknown as EntityAnnotations;
  const missingLabel = { web_tabs: [{ key: "general" }] } as unknown as EntityAnnotations;
  const duplicateKeys: EntityAnnotations = {
    web_tabs: [general, { ...network, key: general.key }],
  };
  const invalidCatalogError = {
    kind: "error",
    message: words("inventory.form.tabs.invalidCatalog"),
  };

  expect(resolveFormTabs(notAList, [])).toEqual(invalidCatalogError);
  expect(resolveFormTabs(missingLabel, [])).toEqual(invalidCatalogError);
  expect(resolveFormTabs(duplicateKeys, [])).toEqual(invalidCatalogError);
});
