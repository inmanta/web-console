import { Service } from "@inmanta/web-console-test-utils";
import { getMissingConnectionName } from "./getMissingConnectionName";

describe("getMissingConnectionName", () => {
  const serviceWithTitle = {
    ...Service.a,
    entity_annotations: { ...Service.EntityAnnotations.valid },
  };
  const serviceTitle = Service.EntityAnnotations.valid.web_title;
  const serviceModels = [serviceWithTitle, Service.b];

  it.each`
    case                                                    | connection                                                                | displayName
    ${"a relation to a service with a title"}               | ${{ type: "relation", entityType: Service.a.name, name: "related" }}      | ${`related (${serviceTitle})`}
    ${"a relation to a service without one"}                | ${{ type: "relation", entityType: Service.b.name, name: "related" }}      | ${`related (${Service.b.name})`}
    ${"a relation named after its service"}                 | ${{ type: "relation", entityType: Service.a.name, name: Service.a.name }} | ${`${Service.a.name} (${serviceTitle})`}
    ${"a relation named after its service without a title"} | ${{ type: "relation", entityType: Service.b.name, name: Service.b.name }} | ${Service.b.name}
    ${"a parent service with a title"}                      | ${{ type: "parent", entityType: Service.a.name, name: Service.a.name }}   | ${serviceTitle}
    ${"a parent embedded entity"}                           | ${{ type: "parent", entityType: "router", name: "router" }}               | ${"router"}
    ${"an embedded entity"}                                 | ${{ type: "embedded", entityType: "router", name: "routers" }}            | ${"routers (router)"}
  `("returns $displayName for $case", ({ connection, displayName }) => {
    expect(getMissingConnectionName(connection, serviceModels)).toEqual(displayName);
  });
});
