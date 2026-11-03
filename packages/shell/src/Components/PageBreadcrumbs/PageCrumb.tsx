import React from "react";
import { NavLink } from "react-router";
import { BreadcrumbItem, BreadcrumbItemProps } from "@patternfly/react-core";
import { Crumb } from "@inmanta/web-console-core";

/**
 * The crumb to show, the search to keep on its link, and the divider prop that the PatternFly
 * `Breadcrumb` passes to each of its children.
 */
interface Props extends Pick<BreadcrumbItemProps, "showDivider"> {
  crumb: Crumb;

  /** The search string the link keeps, already sanitized for the route of the crumb. */
  search: string;
}

/**
 * One item of the page breadcrumbs. Its label comes from the `useLabel` hook of the crumb, so a
 * route can show data the app loads, such as the title of a service.
 *
 * @props {Props} props - The props of the component.
 *  @prop {Crumb} crumb - The crumb to show.
 *  @prop {string} search - The search string the link keeps.
 *  @prop {boolean} [showDivider] - Whether a divider shows before the item, set by `Breadcrumb`.
 */
export const PageCrumb: React.FC<Props> = ({ crumb, search, showDivider }) => {
  const label = crumb.useLabel(crumb.params);

  return (
    <BreadcrumbItem isActive={crumb.active} showDivider={showDivider} aria-label="BreadcrumbItem">
      {crumb.active ? label : <NavLink to={{ pathname: crumb.url, search }}>{label}</NavLink>}
    </BreadcrumbItem>
  );
};
