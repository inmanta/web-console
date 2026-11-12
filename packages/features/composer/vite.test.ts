import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { canvasPackages, composerSharedModules, packageOf } from "./vite.js";

describe("packageOf", () => {
  it.each([
    ["react", "react"],
    ["react-dom/client", "react-dom"],
    ["@xyflow/react", "@xyflow/react"],
    ["@xyflow/react/dist/style.css", "@xyflow/react"],
    ["use-sync-external-store/shim/with-selector.js", "use-sync-external-store"],
  ])("names the package of %s", (specifier, name) => {
    expect(packageOf(specifier)).toBe(name);
  });
});

describe("canvasPackages", () => {
  it("bundles the canvas libraries and what they depend on, not what the app provides", () => {
    const { packages, shared } = canvasPackages();

    expect(packages).toEqual(expect.arrayContaining(["@xyflow/react", "@dagrejs/dagre"]));
    expect(packages).not.toContain("react");
    expect(packages).not.toContain("use-sync-external-store");
    expect(shared).toEqual(
      expect.arrayContaining([
        "react",
        "react-dom",
        "use-sync-external-store/shim/with-selector.js",
      ])
    );
  });
});

describe("composerSharedModules", () => {
  let root: string;

  /**
   * Writes the files of a module graph to the temporary folder.
   */
  const write = (files: Record<string, string>) =>
    Object.entries(files).forEach(([path, source]) => {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), source);
    });

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "composer-shared-"));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("shares what the code imports at runtime, following its own modules", () => {
    write({
      "entry.ts": [
        'import React from "react";',
        'import type { ServiceModel } from "@inmanta/web-console-core";',
        'import { ReactFlow } from "@xyflow/react";',
        'import "@xyflow/react/dist/style.css";',
        'import "./style.css";',
        'import icon from "./icon.svg";',
        'export { Card } from "./Card";',
        'export type { Props } from "./types";',
        'const lazy = () => import("./Lazy");',
      ].join("\n"),
      "Card/index.tsx": 'import { Button } from "@patternfly/react-core";',
      "Lazy.ts": 'import { words } from "@inmanta/web-console-core";',
      "types.ts": 'import { Unused } from "only-in-types";',
    });

    const shared = composerSharedModules(join(root, "entry.ts"));

    expect(shared).toEqual(
      expect.arrayContaining([
        "react",
        "react/jsx-runtime",
        "@patternfly/react-core",
        "@inmanta/web-console-core",
        ...canvasPackages().shared,
      ])
    );
    // Canvas libraries, stylesheets and type-only imports aren't shared
    expect(shared.some((specifier) => specifier.startsWith("@xyflow/"))).toBe(false);
    expect(shared.some((specifier) => specifier.endsWith(".css"))).toBe(false);
    expect(shared).not.toContain("only-in-types");
  });

  it("fails on an import() with a computed specifier", () => {
    write({ "entry.ts": 'const name = "x";\nimport(`./${name}`);' });

    expect(() => composerSharedModules(join(root, "entry.ts"))).toThrow(/computed specifier/);
  });

  it("fails on one of its own modules that isn't TypeScript", () => {
    write({ "entry.ts": 'import "./legacy";', "legacy.js": "" });

    expect(() => composerSharedModules(join(root, "entry.ts"))).toThrow(
      /can't resolve \.\/legacy to a file of the composer/
    );
  });
});
