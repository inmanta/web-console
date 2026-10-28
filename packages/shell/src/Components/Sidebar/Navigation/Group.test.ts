import { FeatureModule, getFeatureRoutes } from "@inmanta/web-console-core";
import { PrimaryRouteManager } from "@inmanta/web-console-core/Routing/PrimaryRouteManager";
import { MockOrchestratorProvider } from "@inmanta/web-console-test-utils";
import { stubRoute } from "@inmanta/web-console-test-utils/Inject/stubRoute";
import { getGroups } from "./Group";

const page = () => Promise.resolve(() => null);

const environment: FeatureModule = {
  id: "environment",
  version: "1.0.0",
  routes: [
    { route: stubRoute("Dashboard"), page },
    { route: stubRoute("Settings"), page },
  ],
  navigation: [
    { kind: "Dashboard", group: "environment" },
    { kind: "Settings", group: "environment" },
  ],
};

const resources: FeatureModule = {
  id: "resource-manager",
  version: "1.0.0",
  routes: [
    { route: stubRoute("Resources"), page },
    { route: stubRoute("Agents"), page },
  ],
  navigation: [
    { kind: "Resources", group: "resourceManager" },
    { kind: "Agents", group: "resourceManager" },
  ],
};

const features = [environment, resources];
const routeManager = PrimaryRouteManager("", getFeatureRoutes(features));
const orchestratorProvider = new MockOrchestratorProvider();

const groupsOf = (...args: Parameters<typeof getGroups>) =>
  getGroups(...args).map(({ id, links }) => ({ id, links: links.map(({ label }) => label) }));

describe("getGroups", () => {
  test("GIVEN no sidebar options THEN every entry shows, in the default group order", () => {
    expect(groupsOf(features, routeManager, orchestratorProvider, true)).toEqual([
      { id: "environment", links: ["Dashboard", "Settings"] },
      { id: "resourceManager", links: ["Resources", "Agents"] },
    ]);
  });

  test("GIVEN a group order THEN those groups come first and the others follow", () => {
    const groups = groupsOf(features, routeManager, orchestratorProvider, true, {
      groupOrder: ["resourceManager"],
    });

    expect(groups.map(({ id }) => id)).toEqual(["resourceManager", "environment"]);
  });

  test("GIVEN a group listed twice in the group order THEN it shows once", () => {
    const groups = groupsOf(features, routeManager, orchestratorProvider, true, {
      groupOrder: ["resourceManager", "environment", "resourceManager"],
    });

    expect(groups.map(({ id }) => id)).toEqual(["resourceManager", "environment"]);
  });

  test("GIVEN hidden entries THEN they are left out, and a group left empty is not shown", () => {
    const groups = groupsOf(features, routeManager, orchestratorProvider, true, {
      hiddenEntries: ["Settings", "Resources", "Agents"],
    });

    expect(groups).toEqual([{ id: "environment", links: ["Dashboard"] }]);
  });

  test("GIVEN app links THEN they follow the entries of their group and open in a new tab", () => {
    const groups = getGroups(features, routeManager, orchestratorProvider, false, {
      appLinks: [
        { group: "environment", label: "Documentation", href: "https://docs.inmanta.com" },
      ],
    });

    expect(groups[0].links.map(({ label }) => label)).toEqual([
      "Dashboard",
      "Settings",
      "Documentation",
    ]);
    // Without an environment, the feature links are locked, but the app link isn't.
    expect(groups[0].links.at(-1)).toEqual({
      id: "https://docs.inmanta.com",
      label: "Documentation",
      url: "https://docs.inmanta.com",
      external: true,
      locked: false,
      statusIndication: false,
    });
    expect(groups[0].links[0].locked).toBe(true);
  });

  test("GIVEN an app link in a group no feature fills THEN that group shows", () => {
    const groups = groupsOf([environment], routeManager, orchestratorProvider, true, {
      appLinks: [{ group: "orchestrationEngine", label: "Runbook", href: "https://example.com" }],
    });

    expect(groups.map(({ id }) => id)).toEqual(["environment", "orchestrationEngine"]);
  });

  test("GIVEN an entry whose route is not registered THEN it is left out", () => {
    const partialRouteManager = PrimaryRouteManager("", getFeatureRoutes([environment]));

    expect(groupsOf(features, partialRouteManager, orchestratorProvider, true)).toEqual([
      { id: "environment", links: ["Dashboard", "Settings"] },
    ]);
  });

  test("GIVEN a feature whose licensed feature is not enabled THEN its entries are left out", () => {
    vi.spyOn(orchestratorProvider, "isLicencedFeatureEnabled").mockReturnValue(false);

    const groups = groupsOf(
      [environment, { ...resources, licensedFeature: "ui.ui" }],
      routeManager,
      orchestratorProvider,
      true
    );

    expect(groups.map(({ id }) => id)).toEqual(["environment"]);
  });

  test("GIVEN an entry that is not visible THEN it is left out", () => {
    const hidden: FeatureModule = {
      ...resources,
      navigation: [
        { kind: "Resources", group: "resourceManager" },
        { kind: "Agents", group: "resourceManager", isVisible: () => false },
      ],
    };

    expect(groupsOf([environment, hidden], routeManager, orchestratorProvider, true)).toEqual([
      { id: "environment", links: ["Dashboard", "Settings"] },
      { id: "resourceManager", links: ["Resources"] },
    ]);
  });
});
