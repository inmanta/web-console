import { MockEditableFeatureManager, MockFeatureManager } from "@/Test";
import { UrlManagerImpl } from "./index";

test("GIVEN UrlManagerImpl WHEN based on internal variables THEN getDocumentationLink() return proper adequate link to docs", () => {
  const featureManager = new MockEditableFeatureManager();
  const urlManagerOpenSource = new UrlManagerImpl(featureManager, "");
  const mockFeatureManager = new MockFeatureManager();

  const urlManagerStandard = new UrlManagerImpl(mockFeatureManager, "");

  expect(urlManagerOpenSource.getDocumentationLink()).not.toMatch(
    urlManagerStandard.getDocumentationLink()
  );
  expect(urlManagerStandard.getDocumentationLink()).toContain(
    mockFeatureManager.getServerMajorVersion()
  );
  expect(urlManagerOpenSource.getDocumentationLink()).toContain(featureManager.getServerVersion());
});
