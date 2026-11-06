import { render, screen } from "@testing-library/react";
import { words } from "@inmanta/web-console-core";
import { Service } from "@inmanta/web-console-test-utils";
import { Wrapper } from "./Wrapper";

test.each`
  case                  | service                                                                  | serviceTitle
  ${"has a web_title"}  | ${{ ...Service.a, entity_annotations: Service.EntityAnnotations.valid }} | ${Service.EntityAnnotations.valid.web_title}
  ${"has no web_title"} | ${Service.a}                                                             | ${Service.a.name}
  ${"is still loading"} | ${undefined}                                                             | ${Service.a.name}
`(
  "GIVEN the Service Details Wrapper WHEN the service $case THEN the title names it by $serviceTitle",
  ({ service, serviceTitle }) => {
    render(<Wrapper name={Service.a.name} service={service} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      words("ServiceDetails.title")(serviceTitle)
    );
  }
);
