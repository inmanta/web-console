import { ServiceModel } from "./ServiceModel";

/**
 * The full `web_*` vocabulary recognised on a lifecycle state, per the design
 * (inmanta/designs#160). Kept as a literal set here rather than derived from
 * `StateAnnotations` - this is dev-console output, not a type-level contract.
 */
const RECOGNISED_STATE_ANNOTATION_KEYS: ReadonlySet<string> = new Set([
  "web_label",
  "web_icon",
  "web_description",
]);

/** The full `web_*` vocabulary recognised on a lifecycle transfer. */
const RECOGNISED_TRANSFER_ANNOTATION_KEYS: ReadonlySet<string> = new Set([
  "web_confirm",
  "web_button_label",
  "web_icon",
  "web_button_type",
  "web_button_variant",
  "web_advanced_state",
]);

/** Module-level dedup cache so a polling refetch (`useContinuous`, every few
 * seconds) doesn't re-warn on every fetch. Tests inject their own `Set` instead
 * of relying on/mutating this singleton. */
const defaultWarnedKeys = new Set<string>();

const SUGGESTION_MAX_DISTANCE = 2;

/** Levenshtein edit distance between two strings. */
function editDistance(a: string, b: string): number {
  const distances: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) {
    distances[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    distances[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      distances[i][j] = Math.min(
        distances[i - 1][j] + 1,
        distances[i][j - 1] + 1,
        distances[i - 1][j - 1] + cost
      );
    }
  }

  return distances[a.length][b.length];
}

/**
 * Finds the recognised key closest to `key`, for a "Did you mean" suggestion.
 * Returns `undefined` when nothing is close enough to be a plausible typo.
 */
function closestKey(key: string, candidates: ReadonlySet<string>): string | undefined {
  let best: string | undefined;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    const distance = editDistance(key, candidate);

    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  return best !== undefined && bestDistance <= SUGGESTION_MAX_DISTANCE ? best : undefined;
}

/**
 * Warns for every key on `annotations` that looks like a typo'd `web_*` annotation:
 * prefixed `web_` but absent from `recognisedKeys`. Keys without the `web_` prefix
 * are silently ignored - those are explicitly none of the console's business.
 */
function warnUnrecognisedKeys(
  annotations: object | undefined,
  recognisedKeys: ReadonlySet<string>,
  location: string,
  seen: Set<string>
): void {
  if (!annotations) {
    return;
  }

  for (const key of Object.keys(annotations)) {
    if (!key.startsWith("web_") || recognisedKeys.has(key)) {
      continue;
    }

    const dedupeKey = `${location}:${key}`;

    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);

    const suggestion = closestKey(key, recognisedKeys);
    const suggestionLine = suggestion ? `\n   Did you mean "${suggestion}"?` : "";

    console.warn(
      `⚠ [lsm] unrecognised annotation key\n   "${key}" on ${location} — ignored.${suggestionLine}`
    );
  }
}

/**
 * Best-effort typo aid (issue #7097): logs a dev-console warning for every
 * unrecognised `web_*` key found on a lifecycle state or transfer annotation.
 * Non-blocking - the annotation is still passed through unchanged and the UI
 * renders normally; this is purely a developer-facing signal, gated to dev
 * builds so it never reaches production consoles.
 *
 * @param serviceModel - the service model as returned by the service catalog
 * @param seen - dedup cache keyed by (location, key); defaults to a
 * module-level singleton, override with a fresh `Set` in tests
 */
export function warnUnrecognisedAnnotations(
  serviceModel: ServiceModel | undefined,
  seen: Set<string> = defaultWarnedKeys
): void {
  if (!import.meta.env.DEV || !serviceModel) {
    return;
  }

  for (const state of serviceModel.lifecycle.states) {
    warnUnrecognisedKeys(
      state.annotations,
      RECOGNISED_STATE_ANNOTATION_KEYS,
      `state "${state.name}"`,
      seen
    );
  }

  for (const transfer of serviceModel.lifecycle.transfers) {
    warnUnrecognisedKeys(
      transfer.annotations,
      RECOGNISED_TRANSFER_ANNOTATION_KEYS,
      `transfer "${transfer.source} -> ${transfer.target}"`,
      seen
    );
  }
}
