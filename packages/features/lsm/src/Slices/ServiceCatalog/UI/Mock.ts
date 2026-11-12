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

/**
 * A root service that owns a three-level tree, modeled on the pxsdc catalog. The services in the
 * tree share a lifecycle with a state for every label.
 */
export const deployment: ServiceModel = {
  ...Service.withEachLabel,
  name: "deployment",
  owned_entities: ["avi_load_balancer_cluster", "dns_record"],
  entity_annotations: { web_title: "Deployment", web_order: 1 },
};

/**
 * A service owned by the deployment that owns a service itself; ordered after the DNS record.
 * All its instances are in a "success" state.
 */
export const aviLoadBalancerCluster: ServiceModel = {
  ...Service.withEachLabel,
  name: "avi_load_balancer_cluster",
  owner: deployment.name,
  owned_entities: ["avi_virtual_ip"],
  entity_annotations: { web_title: "Load balancer cluster", web_order: 2 },
  instance_summary: {
    by_label: { no_label: 0, success: 3, info: 0, warning: 0, danger: 0 },
    by_state: { up: 3 },
    total: 3,
  },
};

/**
 * A service owned by the deployment, ordered first among its siblings. One instance is in
 * progress and some failed.
 */
export const dnsRecord: ServiceModel = {
  ...Service.withEachLabel,
  name: "dns_record",
  owner: deployment.name,
  entity_annotations: { web_title: "DNS record", web_order: 1 },
  instance_summary: {
    by_label: { no_label: 0, success: 2, info: 1, warning: 0, danger: 3 },
    by_state: { up: 2, creating: 1, failed: 3 },
    total: 6,
  },
};

/** A service on the third level, owned by the load balancer cluster, with failed instances. */
export const aviVirtualIp: ServiceModel = {
  ...Service.withEachLabel,
  name: "avi_virtual_ip",
  owner: aviLoadBalancerCluster.name,
  entity_annotations: { web_title: "Virtual IP" },
  instance_summary: {
    by_label: { no_label: 4, success: 0, info: 0, warning: 0, danger: 2 },
    by_state: { failed: 2, start: 4 },
    total: 6,
  },
};

/** The pxsdc-like tree: the deployment and every service it owns, at any depth. */
export const deploymentTree: ServiceModel[] = [
  aviVirtualIp,
  aviLoadBalancerCluster,
  dnsRecord,
  deployment,
];

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
