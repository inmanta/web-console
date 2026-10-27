import React from "react";
import { Flex } from "@patternfly/react-core";

/**
 * Places a suffix right after an inline value, both vertically centered. Without a suffix the
 * value renders on its own.
 *
 * @prop {React.ReactNode} [suffix] - The content after the value.
 * @prop {React.ReactNode} children - The value.
 */
export const WithSuffix: React.FC<React.PropsWithChildren<{ suffix?: React.ReactNode }>> = ({
  suffix,
  children,
}) =>
  suffix ? (
    <Flex
      display={{ default: "inlineFlex" }}
      gap={{ default: "gapSm" }}
      flexWrap={{ default: "nowrap" }}
      alignItems={{ default: "alignItemsCenter" }}
    >
      {children}
      {suffix}
    </Flex>
  ) : (
    <>{children}</>
  );
