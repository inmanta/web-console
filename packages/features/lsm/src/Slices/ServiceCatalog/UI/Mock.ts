import { ServiceModel } from "@inmanta/web-console-core";
import { Service } from "@inmanta/web-console-test-utils";

/** A root service in the "Network" group, ordered first. */
export const router: ServiceModel = {
  ...Service.withInstanceSummary,
  name: "router",
  entity_annotations: {
    web_title: "Router",
    web_icon: "FaRoute",
    web_group: "Network",
    web_order: 1,
    web_description: "Edge router",
  },
};

/** A root service in the "Network" group, ordered after the router. */
export const vpn: ServiceModel = {
  ...Service.withInstanceSummary,
  name: "vpn",
  entity_annotations: {
    web_title: "VPN",
    web_icon: "FaShieldAlt",
    web_group: "Network",
    web_order: 2,
    web_description: "Site-to-site VPN",
  },
};

/** A root service in the "Security" group, ordered after the "Network" group. */
export const firewall: ServiceModel = {
  ...Service.a,
  name: "firewall",
  entity_annotations: { web_title: "Firewall", web_group: "Security", web_order: 5 },
};

/** A service owned by the VPN; its `web_group` is ignored because it is not a root. */
export const vpnTunnel: ServiceModel = {
  ...Service.a,
  name: "vpn_tunnel",
  owner: vpn.name,
  entity_annotations: { web_title: "VPN tunnel", web_group: "Network" },
};

/** A root service whose instance summary counts no instances. */
export const loadBalancer: ServiceModel = {
  ...Service.a,
  name: "load_balancer",
  instance_summary: {
    by_label: { no_label: 0, success: 0, info: 0, warning: 0, danger: 0 },
    by_state: {},
    total: 0,
  },
};

/** A root service without any entity annotations or instances. */
export const linuxVm: ServiceModel = {
  ...Service.a,
  name: "linux_vm",
};
