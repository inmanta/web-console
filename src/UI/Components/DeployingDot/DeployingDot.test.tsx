import { render } from "@testing-library/react";
import { DeployingDot } from "./DeployingDot";

describe("BlinkingDot", () => {
  it("renders", () => {
    const { container } = render(<DeployingDot />);
    expect(container.querySelector("span")).toBeTruthy();
  });

  it("applies custom size", () => {
    const { container } = render(<DeployingDot size={24} />);
    const dot = container.querySelector("span")!;
    expect(dot.style.width).toBe("1.5rem");
    expect(dot.style.height).toBe("1.5rem");
  });
});
