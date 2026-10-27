/**
 * Mocks the composer needs in every test, registered as a Vitest setup file next to the shared
 * one in `@inmanta/web-console-test-utils`.
 */

// Composer mocks - must use function (not arrow) for Vitest 4 constructor compatibility
const linkShapeMock = vi.hoisted(() => ({
  LinkShape: vi.fn().mockImplementation(function () {
    return {
      source: vi.fn().mockReturnThis(),
      target: vi.fn().mockReturnThis(),
      router: vi.fn().mockReturnThis(),
      connector: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
    };
  }),
}));

// Mock Composer LinkShape (used by linkUtils, initializeCanvasFromInstance, and other Composer tests)
vi.mock("@/UI/Components/Composer/UI/JointJsShapes/LinkShape", () => linkShapeMock);
