import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DeployingAnimationBanner,
  MANY_DEPLOYING_THRESHOLD,
  NORMAL_DEPLOYING_THRESHOLD,
} from "./DeployingAnimationBanner";

vi.mock("@/UI/words", () => ({
  words: (key: string) => {
    if (key === "resources.banner.manyDeploying") {
      return (count: number) => `manyDeploying:${count}`;
    }

    return key;
  },
}));

const setReducedAnimations = vi.fn();

vi.mock("@/UI/Components/ReducedAnimations/useReducedAnimations", () => ({
  useReducedAnimations: () => mockUseReducedAnimations(),
}));

let mockReducedAnimations = false;
const mockUseReducedAnimations = () => ({
  reducedAnimations: mockReducedAnimations,
  setReducedAnimations,
});

describe("DeployingAnimationBanner", () => {
  beforeEach(() => {
    mockReducedAnimations = false;
    setReducedAnimations.mockClear();
  });

  it("renders nothing when animations aren't reduced and deploying count is below the threshold", () => {
    const { container } = render(
      <DeployingAnimationBanner deployingCount={MANY_DEPLOYING_THRESHOLD - 1} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("offers to reduce animations once deploying count reaches the threshold", async () => {
    render(<DeployingAnimationBanner deployingCount={MANY_DEPLOYING_THRESHOLD} />);

    expect(screen.getByText(`manyDeploying:${MANY_DEPLOYING_THRESHOLD}`)).toBeInTheDocument();

    await userEvent.click(screen.getByText("resources.banner.disableAnimations"));
    expect(setReducedAnimations).toHaveBeenCalledWith(true);
  });

  it("renders nothing once reduced while deploying count is still above the normal threshold", () => {
    mockReducedAnimations = true;

    const { container } = render(
      <DeployingAnimationBanner deployingCount={NORMAL_DEPLOYING_THRESHOLD + 1} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("offers to turn animations back on once deploy load returns to the normal threshold", async () => {
    mockReducedAnimations = true;
    render(<DeployingAnimationBanner deployingCount={NORMAL_DEPLOYING_THRESHOLD} />);

    expect(screen.getByText("resources.banner.backToNormal")).toBeInTheDocument();

    await userEvent.click(screen.getByText("resources.banner.enableAnimations"));
    expect(setReducedAnimations).toHaveBeenCalledWith(false);
  });
});
