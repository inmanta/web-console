import React, { useRef, useState } from "react";
import { Tooltip, TooltipProps } from "@patternfly/react-core";

/** Where the tooltip goes, when not right by the text itself. */
export type OverflowTooltipPlacement = Pick<TooltipProps, "position" | "flipBehavior"> & {
  /** The element the tooltip is placed against, instead of the text. */
  anchorRef?: React.RefObject<HTMLElement | null>;
};

interface Props {
  /** The whole text, for the tooltip. */
  text: string;

  /** What the element shows, when it isn't the text itself. */
  children?: React.ReactNode;
  component?: "span" | "dt" | "dd";
  className?: string;
  "data-testid"?: string;
  tooltipPlacement?: OverflowTooltipPlacement;

  /** Called when the tooltip shows or hides. */
  onTooltipVisibleChange?: (isVisible: boolean) => void;
}

/**
 * Text that its styles cut short with an ellipsis when it doesn't fit. While a cut-short text is
 * pointed at, a tooltip shows all of it. Whether it is cut short is checked when the pointer
 * enters, so the texts on the cards don't each observe their size, like PatternFly's Truncate.
 * The tooltip adds nothing for screen readers: the element holds the whole text.
 */
export const OverflowText: React.FC<Props> = ({
  text,
  children,
  component: Component = "span",
  tooltipPlacement,
  onTooltipVisibleChange,
  ...props
}) => {
  const ref = useRef<HTMLElement>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const { anchorRef, ...position } = tooltipPlacement ?? {};

  const showTooltip = (isVisible: boolean) => {
    setIsTooltipVisible(isVisible);
    onTooltipVisibleChange?.(isVisible);
  };

  const onMouseEnter = () => {
    const element = ref.current;

    showTooltip(!!element && element.scrollWidth > element.clientWidth);
  };

  return (
    <>
      <Component
        ref={ref}
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => showTooltip(false)}
        {...props}
      >
        {children ?? text}
      </Component>
      {isTooltipVisible && (
        <Tooltip
          triggerRef={anchorRef ?? ref}
          trigger="manual"
          isVisible
          content={text}
          aria="none"
          {...position}
        />
      )}
    </>
  );
};
