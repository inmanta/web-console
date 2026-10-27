/**
 * Test helper for styles that refer to PatternFly design tokens. PatternFly's CSS isn't loaded in
 * unit tests, so a `var(--pf-t--…)` token resolves to nothing unless the test defines it.
 */

/**
 * A PatternFly design token as exported by `@patternfly/react-tokens`.
 */
interface PatternFlyToken {
  /** The CSS custom property name, such as `--pf-t--global--font--family--mono`. */
  name: string;

  /** The value PatternFly's CSS gives that property. */
  value: string;
}

/**
 * Defines a PatternFly token on the document root for the current test, and removes it again when
 * the test finishes. Call it inside a test, before rendering.
 *
 * @example definePatternFlyToken(t_global_font_family_mono) makes `var(--pf-t--global--font--family--mono)` resolve to "Red Hat Mono", … for this test
 */
export const definePatternFlyToken = (token: PatternFlyToken): void => {
  document.documentElement.style.setProperty(token.name, token.value);
  onTestFinished(() => {
    document.documentElement.style.removeProperty(token.name);
  });
};
