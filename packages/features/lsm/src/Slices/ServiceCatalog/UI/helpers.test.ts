import { ServiceModel, words } from "@inmanta/web-console-core";
import { Service } from "@inmanta/web-console-test-utils";
import {
  aviLoadBalancerCluster,
  aviVirtualIp,
  deployment,
  deploymentTree,
  dnsRecord,
  firewall,
  linuxVm,
  router,
  vpn,
  vpnTunnel,
} from "./Mock";
import {
  createCatalogSections,
  formatDescriptionLine,
  getAllCatalogServices,
  getSectionInstanceCount,
  getSectionTitle,
} from "./helpers";
import { CatalogSection, CatalogService } from "./types";

const getServiceNames = (section: CatalogSection): string[] =>
  section.services.map(({ serviceModel }) => serviceModel.name);

const getOwnedServiceNames = (service: CatalogService): string[] =>
  service.ownedServices.map(({ serviceModel }) => serviceModel.name);

describe("createCatalogSections", () => {
  it("groups root services by web_group and puts ungrouped services last", () => {
    const sections = createCatalogSections([linuxVm, firewall, vpn, router]);

    expect(sections.map(getSectionTitle)).toEqual([
      router.entity_annotations?.web_group,
      firewall.entity_annotations?.web_group,
      words("catalog.section.ungrouped"),
    ]);
    expect(getServiceNames(sections[0])).toEqual([router.name, vpn.name]);
    expect(getServiceNames(sections[1])).toEqual([firewall.name]);
    expect(getServiceNames(sections[2])).toEqual([linuxVm.name]);
  });

  it("nests owned services under their owner and ignores their web_group", () => {
    const sections = createCatalogSections([vpn, vpnTunnel]);

    expect(sections).toHaveLength(1);
    expect(getServiceNames(sections[0])).toEqual([vpn.name]);
    expect(getOwnedServiceNames(sections[0].services[0])).toEqual([vpnTunnel.name]);
  });

  it("nests owned services over multiple levels, siblings ordered by web_order", () => {
    const sections = createCatalogSections(deploymentTree);

    expect(getServiceNames(sections[0])).toEqual([deployment.name]);

    const [deploymentService] = sections[0].services;

    expect(getOwnedServiceNames(deploymentService)).toEqual([
      dnsRecord.name,
      aviLoadBalancerCluster.name,
    ]);
    expect(getOwnedServiceNames(deploymentService.ownedServices[1])).toEqual([aviVirtualIp.name]);
  });

  it("lists a service whose owner is not in the catalog as a root", () => {
    const sections = createCatalogSections([aviVirtualIp]);

    expect(getServiceNames(sections[0])).toEqual([aviVirtualIp.name]);
  });

  it("orders a group by the lowest web_order of its services", () => {
    const lateNetworkService: ServiceModel = {
      ...router,
      entity_annotations: { ...router.entity_annotations, web_order: 10 },
    };
    const sections = createCatalogSections([lateNetworkService, vpn, firewall]);

    expect(sections.map(getSectionTitle)).toEqual([
      vpn.entity_annotations?.web_group,
      firewall.entity_annotations?.web_group,
    ]);
  });

  it("puts groups without any web_order after ordered groups, sorted by name", () => {
    const storage: ServiceModel = {
      ...linuxVm,
      name: "storage",
      entity_annotations: { web_group: "Storage" },
    };
    const backup: ServiceModel = {
      ...linuxVm,
      name: "backup",
      entity_annotations: { web_group: "Backup" },
    };
    const sections = createCatalogSections([storage, backup, firewall]);

    expect(sections.map(getSectionTitle)).toEqual([
      firewall.entity_annotations?.web_group,
      backup.entity_annotations?.web_group,
      storage.entity_annotations?.web_group,
    ]);
  });

  it("returns a single ungrouped section when no service has a group", () => {
    const sections = createCatalogSections([Service.b, Service.a]);

    expect(sections).toHaveLength(1);
    expect(sections[0].kind).toBe("Ungrouped");
    expect(getServiceNames(sections[0])).toEqual([Service.a.name, Service.b.name]);
  });

  it("returns no sections for an empty catalog", () => {
    expect(createCatalogSections([])).toEqual([]);
  });
});

describe("getAllCatalogServices", () => {
  it("returns every service at any depth, each owner before its owned services", () => {
    const allServices = getAllCatalogServices(createCatalogSections([linuxVm, ...deploymentTree]));

    expect(allServices.map(({ serviceModel }) => serviceModel.name)).toEqual([
      deployment.name,
      dnsRecord.name,
      aviLoadBalancerCluster.name,
      aviVirtualIp.name,
      linuxVm.name,
    ]);
  });
});

describe("formatDescriptionLine", () => {
  it("joins a multi-line description into one line", () => {
    expect(formatDescriptionLine("Edge router.\n\n  Handles   uplinks.")).toBe(
      "Edge router. Handles uplinks."
    );
  });
});

describe("getSectionInstanceCount", () => {
  it("sums the instance totals of the services in a section", () => {
    const [networkSection] = createCatalogSections([router, vpn]);

    expect(getSectionInstanceCount(networkSection)).toBe(
      Number(router.instance_summary?.total) + Number(vpn.instance_summary?.total)
    );
  });

  it("counts a service without an instance summary as 0", () => {
    const [securitySection] = createCatalogSections([firewall]);

    expect(firewall.instance_summary).toBeUndefined();
    expect(getSectionInstanceCount(securitySection)).toBe(0);
  });
});
