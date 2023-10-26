import React from "react";
import { Divider, DrilldownMenu, MenuItem } from "@patternfly/react-core";
import {
  ExternalLinkAltIcon,
  FileMedicalAltIcon,
  HistoryIcon,
  PortIcon,
} from "@patternfly/react-icons";
import { RouteManager } from "@/Core";
import { words } from "@/UI";
import { Link } from "@/UI/Components";
import { ServiceInstanceForAction } from "@/UI/Presenters";

interface Props {
  instance: ServiceInstanceForAction;
  diagnoseDisabled: boolean;
  routeManager: RouteManager;
}

export const NavigationDrillDown: React.FunctionComponent<Props> = ({
  instance,
  diagnoseDisabled,
  routeManager,
}) => {
  return (
    <MenuItem
      itemId="group:navigate"
      direction="down"
      icon={<ExternalLinkAltIcon />}
      drilldownMenu={
        <DrilldownMenu
          id="navigateDrillDown"
          style={{ insetBlockStart: "-100%" }}
        >
          <MenuItem
            itemId="group:navigate_breadcrumb"
            direction="up"
            aria-hidden
            icon={<ExternalLinkAltIcon />}
          >
            Navigate to:
          </MenuItem>
          <Divider component="li" />
          <Link
            pathname={routeManager.getUrl("Diagnose", {
              service: instance.service_entity,
              instance: instance.id,
            })}
            isDisabled={diagnoseDisabled}
          >
            <MenuItem itemId="diagnose" icon={<FileMedicalAltIcon />}>
              {words("inventory.statustab.diagnose")}
            </MenuItem>
          </Link>
          <Link
            pathname={routeManager.getUrl("History", {
              service: instance.service_entity,
              instance: instance.id,
            })}
          >
            <MenuItem itemId="history" icon={<HistoryIcon />}>
              {words("inventory.statusTab.history")}
            </MenuItem>
          </Link>
          <Link
            pathname={routeManager.getUrl("Events", {
              service: instance.service_entity,
              instance: instance.id,
            })}
          >
            <MenuItem itemId="events" icon={<PortIcon />}>
              {words("inventory.statusTab.events")}
            </MenuItem>
          </Link>
        </DrilldownMenu>
      }
    >
      Navigate
    </MenuItem>
  );
};
