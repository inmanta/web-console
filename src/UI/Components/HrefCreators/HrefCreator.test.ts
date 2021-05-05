import { CompileReportHrefCreator } from "./CompileReportHrefCreator";
import { ModelVersionHrefCreator } from "./ModelVersionHrefCreator";
import { ResourceHrefCreatorImpl } from "./ResourceHrefCreatorImpl";

test("Compile report href creator works correctly", () => {
  expect(new CompileReportHrefCreator("env1").create()).toEqual(
    "/dashboard/#!/environment/env1/compilereport"
  );
});
test("Model version href creator works correctly", () => {
  expect(new ModelVersionHrefCreator("env1").create("4")).toEqual(
    "/dashboard/#!/environment/env1/version/4"
  );
});
test("Resource href creator works correctly", () => {
  expect(
    new ResourceHrefCreatorImpl("env1").create(
      "unittest::Resource[internal,name=0a5ec450-5f3e-4dab-81cd-60c158ffb66f],v=2"
    )
  ).toEqual(
    "/dashboard/#!/environment/env1/version/2/unittest::Resource%5Binternal,name=0a5ec450-5f3e-4dab-81cd-60c158ffb66f%5D"
  );
});
