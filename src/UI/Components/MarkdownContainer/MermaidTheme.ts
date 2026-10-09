/**
 * PatternFly theming for Mermaid diagrams: maps PatternFly design tokens onto Mermaid's
 * `base` theme variables and builds the `pf-<hue>` diagram classes.
 */
import {
  t_global_background_color_primary_default,
  t_global_background_color_secondary_default,
  t_global_background_color_tertiary_default,
  t_global_border_color_default,
  t_global_border_color_nonstatus_blue_default,
  t_global_border_color_nonstatus_gray_default,
  t_global_border_color_nonstatus_green_default,
  t_global_border_color_nonstatus_orange_default,
  t_global_border_color_nonstatus_orangered_default,
  t_global_border_color_nonstatus_purple_default,
  t_global_border_color_nonstatus_red_default,
  t_global_border_color_nonstatus_teal_default,
  t_global_border_color_nonstatus_yellow_default,
  t_global_color_nonstatus_blue_default,
  t_global_color_nonstatus_gray_default,
  t_global_color_nonstatus_green_default,
  t_global_color_nonstatus_orange_default,
  t_global_color_nonstatus_orangered_default,
  t_global_color_nonstatus_purple_default,
  t_global_color_nonstatus_red_default,
  t_global_color_nonstatus_teal_default,
  t_global_color_nonstatus_yellow_default,
  t_global_font_family_body,
  t_global_font_size_body_default,
  t_global_icon_color_subtle,
  t_global_text_color_nonstatus_on_blue_default,
  t_global_text_color_nonstatus_on_gray_default,
  t_global_text_color_nonstatus_on_green_default,
  t_global_text_color_nonstatus_on_orange_default,
  t_global_text_color_nonstatus_on_orangered_default,
  t_global_text_color_nonstatus_on_purple_default,
  t_global_text_color_nonstatus_on_red_default,
  t_global_text_color_nonstatus_on_teal_default,
  t_global_text_color_nonstatus_on_yellow_default,
  t_global_text_color_regular,
} from "@patternfly/react-tokens";

/** A PatternFly design token as exported by `@patternfly/react-tokens`. */
interface PatternFlyToken {
  name: string;
  value: string;
  var: string;
}

/**
 * Resolves PatternFly tokens against the document root, so the active light/dark theme
 * applies. The token's own `value` only holds the light theme default, so it isn't used.
 *
 * @returns A function returning the resolved value of a token, or an empty string.
 */
const tokenResolver = (): ((token: PatternFlyToken) => string) => {
  const styles = getComputedStyle(document.documentElement);

  return (token) => styles.getPropertyValue(token.name).trim();
};

/**
 * Maps PatternFly design tokens onto Mermaid's `base` theme variables. Tokens are read
 * from the document root, so the active PatternFly theme resolves at render time.
 * Empty values are dropped, so a token that doesn't resolve falls back to Mermaid's
 * own base palette instead of rendering an invisible diagram.
 *
 * @returns The themeVariables to pass to `Mermaid.initialize`.
 */
export function patternFlyThemeVariables(): Record<string, string> {
  const resolve = tokenResolver();

  const surface = resolve(t_global_background_color_primary_default);
  const secondarySurface = resolve(t_global_background_color_secondary_default);
  const text = resolve(t_global_text_color_regular);
  const border = resolve(t_global_border_color_default);

  const tertiarySurface = resolve(t_global_background_color_tertiary_default);

  // Pie slices otherwise derive from primaryColor, which is grey, so every slice comes out grey.
  const pieSlices = Object.fromEntries(
    PIE_HUES.map((hue, index) => [`pie${index + 1}`, resolve(PATTERNFLY_HUES[hue].fill)])
  );

  const variables: Record<string, string> = {
    ...pieSlices,
    // The hue fills stay light in both themes, so slice labels need the on-hue text colour.
    pieSectionTextColor: resolve(PATTERNFLY_HUES.blue.text),
    pieStrokeColor: surface,
    pieOuterStrokeColor: border,
    pieOpacity: "1",
    // ER attribute rows otherwise get a near-white fill, unreadable under dark theme text.
    rowOdd: surface,
    rowEven: tertiarySurface,
    background: surface,
    primaryColor: secondarySurface,
    secondaryColor: tertiarySurface,
    tertiaryColor: surface,
    primaryBorderColor: border,
    secondaryBorderColor: border,
    tertiaryBorderColor: border,
    nodeBorder: border,
    clusterBkg: secondarySurface,
    clusterBorder: border,
    noteBkgColor: secondarySurface,
    noteBorderColor: border,
    // The base theme hard-codes note text to #333 instead of deriving it from textColor.
    noteTextColor: text,
    edgeLabelBackground: surface,
    lineColor: resolve(t_global_icon_color_subtle),
    textColor: text,
    primaryTextColor: text,
    secondaryTextColor: text,
    tertiaryTextColor: text,
    fontFamily: resolve(t_global_font_family_body),
    fontSize: resolve(t_global_font_size_body_default),
  };

  return Object.fromEntries(Object.entries(variables).filter(([, value]) => value !== ""));
}

/**
 * The nine PatternFly nonstatus hues, the same set the Label component uses, with the
 * fill, border and on-colour text token of each. Diagram authors can apply them to nodes
 * and subgraphs as `pf-<hue>` classes, e.g. `class routerSouth pf-blue`, instead of
 * hard-coding colours in a `classDef`.
 */
const PATTERNFLY_HUES = {
  blue: {
    fill: t_global_color_nonstatus_blue_default,
    stroke: t_global_border_color_nonstatus_blue_default,
    text: t_global_text_color_nonstatus_on_blue_default,
  },
  gray: {
    fill: t_global_color_nonstatus_gray_default,
    stroke: t_global_border_color_nonstatus_gray_default,
    text: t_global_text_color_nonstatus_on_gray_default,
  },
  green: {
    fill: t_global_color_nonstatus_green_default,
    stroke: t_global_border_color_nonstatus_green_default,
    text: t_global_text_color_nonstatus_on_green_default,
  },
  orange: {
    fill: t_global_color_nonstatus_orange_default,
    stroke: t_global_border_color_nonstatus_orange_default,
    text: t_global_text_color_nonstatus_on_orange_default,
  },
  orangered: {
    fill: t_global_color_nonstatus_orangered_default,
    stroke: t_global_border_color_nonstatus_orangered_default,
    text: t_global_text_color_nonstatus_on_orangered_default,
  },
  purple: {
    fill: t_global_color_nonstatus_purple_default,
    stroke: t_global_border_color_nonstatus_purple_default,
    text: t_global_text_color_nonstatus_on_purple_default,
  },
  red: {
    fill: t_global_color_nonstatus_red_default,
    stroke: t_global_border_color_nonstatus_red_default,
    text: t_global_text_color_nonstatus_on_red_default,
  },
  teal: {
    fill: t_global_color_nonstatus_teal_default,
    stroke: t_global_border_color_nonstatus_teal_default,
    text: t_global_text_color_nonstatus_on_teal_default,
  },
  yellow: {
    fill: t_global_color_nonstatus_yellow_default,
    stroke: t_global_border_color_nonstatus_yellow_default,
    text: t_global_text_color_nonstatus_on_yellow_default,
  },
} satisfies Record<
  string,
  { fill: PatternFlyToken; stroke: PatternFlyToken; text: PatternFlyToken }
>;

/** One of the PatternFly nonstatus hues, e.g. `blue`. */
type PatternFlyHue = keyof typeof PATTERNFLY_HUES;

const HUE_SHAPES = ["rect", "polygon", "circle", "ellipse", "path"];

/** Order in which pie slices take the PatternFly hues, alternating warm and cool for contrast. */
const PIE_HUES: PatternFlyHue[] = [
  "blue",
  "orange",
  "green",
  "purple",
  "yellow",
  "teal",
  "red",
  "orangered",
  "gray",
];

/**
 * Builds the CSS for the `pf-<hue>` diagram classes, passed to Mermaid as `themeCSS`.
 * Mermaid scopes `themeCSS` under the diagram's svg id, which is needed to outrank its own
 * `#id .node rect` rules. Tokens are resolved to literal values so a downloaded SVG keeps
 * its colours. Hues whose tokens don't resolve are skipped.
 *
 * @returns The CSS rules for every resolvable hue.
 */
export function patternFlyHueCss(): string {
  const resolve = tokenResolver();

  return Object.entries(PATTERNFLY_HUES)
    .map(([hue, tokens]) => {
      const fill = resolve(tokens.fill);
      const stroke = resolve(tokens.stroke);
      const text = resolve(tokens.text);

      if (!fill || !stroke || !text) {
        return "";
      }

      const groups = [`.node.pf-${hue}`, `.cluster.pf-${hue}`];
      const shapes = groups.flatMap((group) => HUE_SHAPES.map((shape) => `${group} ${shape}`));
      const labels = groups.flatMap((group) => [`${group} .nodeLabel`, `${group} .label`]);
      const texts = groups.map((group) => `${group} text`);

      return (
        `${shapes.join(", ")} { fill: ${fill}; stroke: ${stroke}; }\n` +
        `${labels.join(", ")} { color: ${text}; }\n` +
        `${texts.join(", ")} { fill: ${text}; }`
      );
    })
    .filter((rule) => rule !== "")
    .join("\n");
}
