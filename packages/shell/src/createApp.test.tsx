import { act } from "react";
import { FeatureModule } from "@inmanta/web-console-core";
import * as WordsModule from "@inmanta/web-console-core/I18n/Words";
import { stubRoute } from "@inmanta/web-console-test-utils/Inject/stubRoute";
import { createApp, getAuthConfig } from "./createApp";
import { shellFeature } from "./shellFeature";

const page = () => Promise.resolve(() => null);

const feature: FeatureModule = {
  id: "test",
  version: "1.0.0",
  messages: { "test.message": "A message" } as WordsModule.Messages,
  routes: [{ route: stubRoute("Dashboard"), page }],
};

describe("createApp", () => {
  afterEach(() => {
    delete globalThis.auth;
  });

  test("GIVEN features THEN the app has the shell's pages first, then the features", () => {
    const app = createApp({ features: [feature] });

    expect(app.features).toEqual([shellFeature, feature]);
    expect(app.routes.map((route) => route("").kind)).toEqual([
      ...shellFeature.routes.map(({ route }) => route("").kind),
      "Dashboard",
    ]);
  });

  test("GIVEN an app WHEN it is created THEN nothing starts until it is rendered", () => {
    const registerMessages = vi.spyOn(WordsModule, "registerMessages");

    createApp({ features: [feature] });

    expect(registerMessages).not.toHaveBeenCalled();
  });

  test("GIVEN an app WHEN it is rendered THEN it registers the messages of its features and renders into the element", async () => {
    const registerMessages = vi.spyOn(WordsModule, "registerMessages");
    const container = document.createElement("div");

    await act(async () => createApp({ features: [feature] }).render(container));

    expect(registerMessages).toHaveBeenCalledWith(feature.messages);
    expect(container).not.toBeEmptyDOMElement();
  });

  test("GIVEN no auth option or 'from-config' THEN the auth settings come from config.js", () => {
    globalThis.auth = { method: "database" };

    expect(getAuthConfig(undefined)).toEqual({ method: "database" });
    expect(getAuthConfig("from-config")).toEqual({ method: "database" });
  });

  test("GIVEN auth settings as the option THEN they are used instead of config.js", () => {
    globalThis.auth = { method: "database" };

    expect(getAuthConfig({ method: "jwt" })).toEqual({ method: "jwt" });
  });
});
