import { render, screen } from "@testing-library/react";
import { EnvironmentSettings } from "@/Core";
import { words } from "@/UI";
import { ProtectedMessage } from "./ProtectedMessage";

// Helper function to create mock InputInfo
const createMockInputInfo = (
  overrides: Partial<EnvironmentSettings.InputInfo> = {}
): EnvironmentSettings.InputInfo =>
  ({
    name: "test_setting",
    type: "bool",
    default: false,
    doc: "Test setting",
    recompile: false,
    update_model: false,
    agent_restart: false,
    section: "test",
    protected: false,
    protected_by: null,
    initial: false,
    value: false,
    set: vi.fn(),
    update: vi.fn(),
    reset: vi.fn(),
    isUpdateable: vi.fn(),
    ...overrides,
  }) as EnvironmentSettings.BooleanInputInfo;

describe("ProtectedMessage", () => {
  it("GIVEN protected input with protected_by THEN shows protected message with protected_by", () => {
    const mockInfo = createMockInputInfo({
      protected: true,
      protected_by: "environment variable",
    });

    render(<ProtectedMessage info={mockInfo} />);

    const expectedMessage = words("settings.protected.message")("environment variable");
    expect(screen.getByText(expectedMessage)).toBeVisible();
  });

  it("GIVEN protected input without protected_by THEN shows default protected message", () => {
    const mockInfo = createMockInputInfo({
      protected: true,
      protected_by: null,
    });

    render(<ProtectedMessage info={mockInfo} />);

    const expectedMessage = words("settings.protected.message.default");
    expect(screen.getByText(expectedMessage)).toBeVisible();
  });

  it("GIVEN non-protected input THEN does not render", () => {
    const mockInfo = createMockInputInfo({
      protected: false,
      protected_by: null,
    });

    const { container } = render(<ProtectedMessage info={mockInfo} />);

    expect(container.firstChild).toBeNull();
  });
});
