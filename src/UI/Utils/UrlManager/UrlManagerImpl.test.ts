import { MockEditableOrchestratorProvider, MockOrchestratorProvider } from "@/Test";
import { UrlManagerImpl } from "./index";

test("GIVEN UrlManagerImpl WHEN based on internal variables THEN getDocumentationLink() return proper adequate link to docs", () => {
  const editableOrchestratorProvider = new MockEditableOrchestratorProvider();
  const urlManagerOpenSource = new UrlManagerImpl(editableOrchestratorProvider, "");
  const mockedOrchestratorProvider = new MockOrchestratorProvider();

  const urlManagerStandard = new UrlManagerImpl(mockedOrchestratorProvider, "");

  expect(urlManagerOpenSource.getDocumentationLink()).not.toMatch(
    urlManagerStandard.getDocumentationLink()
  );
  expect(urlManagerStandard.getDocumentationLink()).toContain(
    mockedOrchestratorProvider.getServerMajorVersion()
  );
  expect(urlManagerOpenSource.getDocumentationLink()).toContain(
    editableOrchestratorProvider.getServerVersion()
  );
});
