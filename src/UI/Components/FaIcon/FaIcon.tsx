import React, { CSSProperties, SVGAttributes } from "react";
import { IconContext } from "react-icons";
import loadable from "@loadable/component";
import { Icon } from "@patternfly/react-core";
import * as fa from "react-icons/fa";

interface Props {
  icon: string;
  color?: string;
  size?: string;
  className?: string;
  style?: CSSProperties;
  attr?: SVGAttributes<SVGElement>;
}

/**
 * Component that renders a dynamic Font Awesome icon.
 *
 * @param props - The properties of the component.
 *  @prop icon - The name of the icon. It needs to be the React Icons name.
 *  @prop color - The color of the icon.
 *  @prop size - The size of the icon.
 *  @prop className - The class name of the icon.
 *  @prop style - The style of the icon.
 *  @prop attr - The attributes of the icon.
 *
 * @returns A React component that renders a dynamic Font Awesome icon.
 */
export const DynamicFAIcon = ({ ...props }: Props) => {
  const FAIcon = loadable(() =>
    Promise.resolve(
      // eslint-disable-next-line import/namespace
      fa[props.icon as keyof typeof fa] || fa["FaQuestionCircle"],
    ),
  );

  const value: IconContext = {
    color: props.color,
    size: props.size,
    className: props.className,
    style: props.style,
    attr: props.attr,
  };

  return (
    <Icon data-testid={props.icon}>
      <IconContext.Provider value={value}>
        <FAIcon />
      </IconContext.Provider>
    </Icon>
  );
};
