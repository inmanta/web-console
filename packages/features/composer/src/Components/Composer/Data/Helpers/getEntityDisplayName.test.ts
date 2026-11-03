import { Service } from "@inmanta/web-console-test-utils";
import { embedded_base } from "@inmanta/web-console-test-utils/Data/Service/EmbeddedEntity";
import { getEntityDisplayName } from "./getEntityDisplayName";

describe("getEntityDisplayName", () => {
  it.each`
    case                                 | entity                                                                   | displayName
    ${"a service with web_title"}        | ${{ ...Service.a, entity_annotations: Service.EntityAnnotations.valid }} | ${Service.EntityAnnotations.valid.web_title}
    ${"a service without web_title"}     | ${Service.a}                                                             | ${Service.a.name}
    ${"an embedded entity with a type"}  | ${{ ...embedded_base, type: "router" }}                                  | ${`router - ${embedded_base.name}`}
    ${"an embedded entity without type"} | ${{ ...embedded_base, type: null }}                                      | ${embedded_base.name}
  `("returns $displayName for $case", ({ entity, displayName }) => {
    expect(getEntityDisplayName(entity)).toEqual(displayName);
  });
});
