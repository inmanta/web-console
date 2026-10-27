import { Messages, registerMessages } from "@inmanta/web-console-core/I18n/Words";

/**
 * The test setup of this app, on top of the shared one in `@inmanta/web-console-test-utils`. It
 * holds what depends on the features this app ships and where they live.
 */

// Register the English messages of every layer and feature, as the shell does when the app starts.
const messageModules = import.meta.glob<Record<string, Messages>>(
  ["/src/**/messages.{ts,tsx}", "/packages/**/messages.{ts,tsx}"],
  { eager: true }
);
Object.values(messageModules).forEach((module) => Object.values(module).forEach(registerMessages));

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
