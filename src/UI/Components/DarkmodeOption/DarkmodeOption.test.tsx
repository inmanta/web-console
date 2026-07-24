import { render, fireEvent } from "@testing-library/react";
import { DarkmodeOption } from "./DarkmodeOption";
import { useTheme } from "./useTheme";

vi.mock("./useTheme");

describe("DarkmodeOption", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders 'Switch to light mode' when the current theme is dark", () => {
    vi.mocked(useTheme).mockReturnValue({ isDark: true, theme: "dark", setTheme: vi.fn() });
    const { getByText } = render(<DarkmodeOption />);

    expect(getByText("Switch to light mode")).toBeInTheDocument();
  });

  it("renders 'Switch to dark mode' when the current theme is light", () => {
    vi.mocked(useTheme).mockReturnValue({ isDark: false, theme: "light", setTheme: vi.fn() });
    const { getByText } = render(<DarkmodeOption />);

    expect(getByText("Switch to dark mode")).toBeInTheDocument();
  });

  it("calls setTheme with 'light' when toggled from dark", () => {
    const setTheme = vi.fn();

    vi.mocked(useTheme).mockReturnValue({ isDark: true, theme: "dark", setTheme });
    const { getByText } = render(<DarkmodeOption />);

    fireEvent.click(getByText("Switch to light mode"));

    expect(setTheme).toHaveBeenCalledWith("light");
    expect(setTheme).toHaveBeenCalledTimes(1);
  });

  it("calls setTheme with 'dark' when toggled from light", () => {
    const setTheme = vi.fn();

    vi.mocked(useTheme).mockReturnValue({ isDark: false, theme: "light", setTheme });
    const { getByText } = render(<DarkmodeOption />);

    fireEvent.click(getByText("Switch to dark mode"));

    expect(setTheme).toHaveBeenCalledWith("dark");
    expect(setTheme).toHaveBeenCalledTimes(1);
  });
});
