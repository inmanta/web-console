import type { MarkdownIt, StateCore, Token } from "markdown-it";

const SCROLL_WRAPPER_CLASS = "pf-v6-c-scroll-inner-wrapper";
const TABLE_CLASS = "pf-v6-c-table pf-m-grid-md pf-m-compact";
const THEAD_CLASS = "pf-v6-c-table__thead";
const TBODY_CLASS = "pf-v6-c-table__tbody";
const TR_CLASS = "pf-v6-c-table__tr";
const TH_CLASS = "pf-v6-c-table__th pf-m-wrap";
const TD_CLASS = "pf-v6-c-table__td pf-m-wrap";

/**
 * Returns the text of an inline token with its markup stripped, e.g. `**Name**` becomes `Name`.
 *
 * @param token - The inline token following a `th_open` / `td_open` token.
 * @returns The concatenated content of the token's children, or an empty string.
 */
const inlineText = (token: Token | undefined): string =>
  token?.children?.map((child) => child.content).join("") ?? "";

/**
 * Markdown-it plugin: stamps PatternFly table classes onto the generated table tokens,
 * so markdown tables render as `pf-v6-c-table` and are styled by PatternFly's own stylesheet.
 *
 * Every cell gets `pf-m-wrap`, because PatternFly truncates cells by default and markdown
 * tables carry no column widths. Body cells also get a `data-label` with their column header,
 * which PatternFly prints in the stacked layout below the md breakpoint.
 *
 * Each table is wrapped in PatternFly's scroll wrapper, the same one `InnerScrollContainer`
 * renders, so a table wider than the markdown body (long unbreakable values, many columns)
 * scrolls instead of overflowing.
 *
 * @param md - The markdown-it instance to register the core rule on.
 */
export default function patternFlyTablePlugin(md: MarkdownIt): void {
  md.renderer.rules.table_open = (tokens, idx, options, _env, self) =>
    `<div class="${SCROLL_WRAPPER_CLASS}">\n${self.renderToken(tokens, idx, options)}`;
  md.renderer.rules.table_close = (tokens, idx, options, _env, self) =>
    `${self.renderToken(tokens, idx, options)}</div>\n`;

  md.core.ruler.push("patternfly_table", (state: StateCore) => {
    let headers: string[] = [];
    let column = 0;
    let inHeader = false;

    state.tokens.forEach((token, index) => {
      switch (token.type) {
        case "table_open":
          token.attrJoin("class", TABLE_CLASS);
          headers = [];
          break;
        case "thead_open":
          token.attrJoin("class", THEAD_CLASS);
          inHeader = true;
          break;
        case "thead_close":
          inHeader = false;
          break;
        case "tbody_open":
          token.attrJoin("class", TBODY_CLASS);
          break;
        case "tr_open":
          token.attrJoin("class", TR_CLASS);
          column = 0;
          break;
        case "th_open":
        case "td_open":
          token.attrJoin("class", token.type === "th_open" ? TH_CLASS : TD_CLASS);

          if (inHeader) {
            headers[column] = inlineText(state.tokens[index + 1]);
          } else if (headers[column]) {
            token.attrSet("data-label", headers[column]);
          }

          column += 1;
          break;
      }
    });
  });
}
