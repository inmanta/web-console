import React, { useRef, useState } from "react";
import { Tooltip } from "@patternfly/react-core";

interface Props {
  /** The whole text, for the tooltip. */
  text: string;

  /** What the element shows, when it isn't the text itself. */
  children?: React.ReactNode;
  component?: "span" | "dt" | "dd";
  className?: string;
  "data-testid"?: string;
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
  ...props
}) => {
  const ref = useRef<HTMLElement>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const onMouseEnter = () => {
    const element = ref.current;

    setIsTooltipVisible(!!element && element.scrollWidth > element.clientWidth);
  };

  return (
    <>
      <Component
        ref={ref}
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => setIsTooltipVisible(false)}
        {...props}
      >
        {children ?? text}
      </Component>
      {isTooltipVisible && (
        <Tooltip triggerRef={ref} trigger="manual" isVisible content={text} aria="none" />
      )}
    </>
  );
};
