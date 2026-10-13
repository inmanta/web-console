#!/usr/bin/env node
/**
 * Fails when the runtime import graph of src/ gains a circular dependency.
 *
 * Import cycles make module initialisation order-dependent: a module can be
 * evaluated before the module it imports from, so a value it uses at load
 * time is still undefined. They also defeat code splitting, since every file
 * in a cycle ends up in the same chunk.
 *
 * Only runtime imports count: type-only imports are erased by the compiler,
 * and dynamic imports (lazy-loaded pages) don't run at load time. Test files
 * are left out.
 *
 * The codebase still has cycles, so the check compares against a baseline
 * (scripts/circular-deps-baseline.txt): the list of import edges ("a -> b")
 * that sit on a cycle. The check fails when an edge on a cycle is not in the
 * baseline (a new cycle), and when a baseline edge is no longer on a cycle
 * (the baseline is outdated). Comparing edges instead of madge's list of
 * cycles keeps the result stable when unrelated imports change.
 *
 * Usage:
 *   yarn check-circular-deps            check against the baseline
 *   yarn check-circular-deps --update   rewrite the baseline
 *
 * Only run --update to record cycles you removed or files you moved. A new
 * cycle should be fixed, not added to the baseline.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import madge from "madge";

const baselineFile = "scripts/circular-deps-baseline.txt";
const update = process.argv.includes("--update");

// The madge config lives in package.json, so running madge by hand (e.g. to
// draw a graph) sees the same graph as this check.
const { madge: config } = JSON.parse(readFileSync("package.json", "utf8"));

const result = await madge("src", config);
const graph = result.obj();

/**
 * Tarjan's algorithm, iterative so deep import chains can't overflow the stack.
 * Returns a map from file to the id of its strongly connected component.
 */
const getComponents = () => {
  const index = new Map();
  const lowLink = new Map();
  const component = new Map();
  const stack = [];
  const onStack = new Set();
  let counter = 0;

  for (const root of Object.keys(graph)) {
    if (index.has(root)) {
      continue;
    }
    const work = [{ node: root, next: 0 }];

    while (work.length) {
      const frame = work[work.length - 1];
      const { node } = frame;

      if (frame.next === 0) {
        index.set(node, counter);
        lowLink.set(node, counter);
        counter++;
        stack.push(node);
        onStack.add(node);
      }

      const deps = graph[node] || [];

      if (frame.next < deps.length) {
        const dep = deps[frame.next++];

        if (!index.has(dep)) {
          work.push({ node: dep, next: 0 });
        } else if (onStack.has(dep)) {
          lowLink.set(node, Math.min(lowLink.get(node), index.get(dep)));
        }
        continue;
      }

      work.pop();
      if (work.length) {
        const parent = work[work.length - 1].node;

        lowLink.set(parent, Math.min(lowLink.get(parent), lowLink.get(node)));
      }

      if (lowLink.get(node) === index.get(node)) {
        let member;

        do {
          member = stack.pop();
          onStack.delete(member);
          component.set(member, node);
        } while (member !== node);
      }
    }
  }

  return component;
};

const component = getComponents();

// An edge is on a cycle when both ends are in the same component.
const cycleEdges = Object.entries(graph)
  .flatMap(([from, deps]) =>
    deps.filter((to) => component.get(from) === component.get(to)).map((to) => `${from} -> ${to}`)
  )
  .sort();

/**
 * Shortest import path from `from` back to `to`, to show a cycle an edge closes.
 */
const findPath = (from, to) => {
  const previous = new Map([[from, null]]);
  const queue = [from];

  while (queue.length) {
    const node = queue.shift();

    if (node === to) {
      const path = [];

      for (let step = to; step !== null; step = previous.get(step)) {
        path.unshift(step);
      }

      return path;
    }
    for (const dep of graph[node] || []) {
      if (!previous.has(dep)) {
        previous.set(dep, node);
        queue.push(dep);
      }
    }
  }

  return [from, to];
};

const fileCount = Object.keys(graph).length;
const cycleFileCount = new Set(cycleEdges.map((edge) => edge.split(" -> ")[0])).size;

console.log(
  `Processed ${fileCount} files, ${cycleFileCount} are in an import cycle (${cycleEdges.length} import edges).`
);

if (update) {
  const header = [
    "# Import edges that sit on a circular dependency, recorded by scripts/check-circular-deps.js.",
    "# Regenerate with `yarn check-circular-deps --update`; don't add new cycles here, fix them.",
  ];

  writeFileSync(baselineFile, [...header, ...cycleEdges, ""].join("\n"));
  console.log(`Wrote ${cycleEdges.length} edges to ${baselineFile}.`);
  process.exit(0);
}

const baseline = existsSync(baselineFile)
  ? readFileSync(baselineFile, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
  : [];
const baselineSet = new Set(baseline);
const cycleEdgeSet = new Set(cycleEdges);

const added = cycleEdges.filter((edge) => !baselineSet.has(edge));
const removed = baseline.filter((edge) => !cycleEdgeSet.has(edge));

if (added.length) {
  console.error(
    `\nERROR: ${added.length} import(s) are on a circular dependency that isn't in the baseline:`
  );
  for (const edge of added) {
    const [from, to] = edge.split(" -> ");

    console.error(`\n  ${edge}`);
    console.error(`    cycle: ${[from, ...findPath(to, from)].join(" > ")}`);
  }
  console.error(
    "\nBreak the cycle, e.g. use `import type` for type-only imports or import from the module instead of its index."
  );
}

if (removed.length) {
  console.error(`\nERROR: ${removed.length} baseline edge(s) are no longer on a cycle:`);
  for (const edge of removed) {
    console.error(`  ${edge}`);
  }
  console.error(
    added.length
      ? "\nOnce the new cycles above are fixed, run `yarn check-circular-deps --update` and commit the baseline."
      : "\nRun `yarn check-circular-deps --update` and commit the baseline."
  );
}

if (added.length || removed.length) {
  process.exit(1);
}

console.log("OK: no new circular dependencies.");
