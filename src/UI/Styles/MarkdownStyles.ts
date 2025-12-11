export const MarkdownStyles = `
.markdown-body {
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  margin: 0;
  color: var(--pf-t--global--text--color--regular);
  font-family: var(--pf-t--global--font--family--body);
  font-size: inherit;
  line-height: 1.5;
  word-wrap: break-word;
  padding: 24px;
}

.markdown-body .octicon {
  display: inline-block;
  fill: currentColor;
  vertical-align: text-bottom;
}

.markdown-body h1:hover .anchor .octicon-link:before,
.markdown-body h2:hover .anchor .octicon-link:before,
.markdown-body h3:hover .anchor .octicon-link:before,
.markdown-body h4:hover .anchor .octicon-link:before,
.markdown-body h5:hover .anchor .octicon-link:before,
.markdown-body h6:hover .anchor .octicon-link:before {
  width: 16px;
  height: 16px;
  content: ' ';
  display: inline-block;
  background-color: currentColor;
  -webkit-mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>");
  mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>");
}

.markdown-body details,
.markdown-body figcaption,
.markdown-body figure {
  display: block;
}

.markdown-body summary {
  display: list-item;
}

.markdown-body [hidden] {
  display: none !important;
}

.markdown-body a {
  background-color: transparent;
  color: var(--pf-t--global--text--color--link--default);
  text-decoration: none;
}

.markdown-body abbr[title] {
  border-bottom: none;
  -webkit-text-decoration: underline dotted;
  text-decoration: underline dotted;
}

.markdown-body b,
.markdown-body strong {
  font-weight: var(--pf-t--global--font--weight--200);
}

.markdown-body dfn {
  font-style: italic;
}

.markdown-body h1 {
  margin: .67em 0;
  font-weight: var(--pf-t--global--font--weight--200);
  padding-bottom: .3em;
  font-size: var(--pf-t--global--font--size--heading--h1);
  border-bottom: 1px solid var(--pf-t--global--border--color--default);
}

.markdown-body mark {
  background-color: var(--pf-t--chart--theme--colorscales--multi-colored-ordered--colorscale--1400);
  color: var(--pf-t--chart--theme--colorscales--multi-colored-ordered--colorscale--1500);
}

.markdown-body small {
  font-size: 90%;
}

.markdown-body sub,
.markdown-body sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

.markdown-body sub {
  bottom: -0.25em;
}

.markdown-body sup {
  top: -0.5em;
}

.markdown-body img {
  border-style: none;
  max-width: 100%;
  box-sizing: content-box;
  background-color: var(--pf-t--global--background--color--primary--default);
}

.markdown-body code,
.markdown-body kbd,
.markdown-body pre,
.markdown-body samp {
  font-family: var(--pf-t--global--font--family--mono);
  font-size: 1em;
}

.markdown-body figure {
  margin: 1em 40px;
}

.markdown-body hr {
  box-sizing: content-box;
  overflow: hidden;
  background: transparent;
  border-bottom: 1px solid var(--pf-t--global--border--color--default);
  height: .25em;
  padding: 0;
  margin: 24px 0;
  background-color: var(--pf-t--global--background--color--secondary--default);
  border: 0;
}

.markdown-body input {
  font: inherit;
  margin: 0;
  overflow: visible;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

.markdown-body [type=button],
.markdown-body [type=reset],
.markdown-body [type=submit] {
  -webkit-appearance: button;
  appearance: button;
}

.markdown-body [type=checkbox],
.markdown-body [type=radio] {
  box-sizing: border-box;
  padding: 0;
}

.markdown-body [type=number]::-webkit-inner-spin-button,
.markdown-body [type=number]::-webkit-outer-spin-button {
  height: auto;
}

.markdown-body [type=search]::-webkit-search-cancel-button,
.markdown-body [type=search]::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
}

.markdown-body ::-webkit-input-placeholder {
  color: inherit;
  opacity: .54;
}

.markdown-body ::-webkit-file-upload-button {
  -webkit-appearance: button;
  appearance: button;
  font: inherit;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body ::placeholder {
  color: var(--pf-t--global--text--color--placeholder);
  opacity: 1;
}

.markdown-body hr::before {
  display: table;
  content: "";
}

.markdown-body hr::after {
  display: table;
  clear: both;
  content: "";
}

.markdown-body table {
  border-spacing: 0;
  border-collapse: collapse;
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
}

.markdown-body td,
.markdown-body th {
  padding: 0;
}

.markdown-body details {
  margin: 16px 0;
  border: 1px solid var(--pf-t--global--border--color--default);
  border-radius: var(--pf-t--global--border--radius--small);
  background-color: var(--pf-t--global--background--color--secondary--default);
}

.markdown-body details summary {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md);
  list-style: none;
  font-weight: var(--pf-t--global--font--weight--body);
  color: var(--pf-t--global--text--color--regular);
}

.markdown-body details summary::before {
  content: "";
  display: inline-block;
  flex-shrink: 0;
  width: 0.45rem;
  height: 0.45rem;
  margin-right: var(--pf-t--global--spacer--sm);
  margin-top: 0;
  border-style: solid;
  border-width: 0 2px 2px 0;
  border-color: var(--pf-t--global--icon--color--regular);
  transform-origin: center;
  /* 45deg gives a chevron similar to fa-angle-right instead of a 90deg L-shape.
     A slight vertical translation keeps it visually centered with the text line. */
  transform: translateY(-2px) rotate(45deg);
  transition: transform var(--pf-t--global--motion-duration--fast) ease-in-out;
}

.markdown-body details[open] summary::before {
  /* Rotate further to point down when expanded, preserving vertical alignment */
  transform: translateY(1px) rotate(135deg);
}

.markdown-body details summary::-webkit-details-marker,
.markdown-body details summary::marker {
  display: none;
}

.markdown-body details[open] summary {
  border-bottom: 1px solid var(--pf-t--global--border--color--default);
}

.markdown-body details>*:not(summary) {
  padding: var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md)
    var(--pf-t--global--spacer--md);
}

.markdown-body details:not([open])>*:not(summary) {
  display: none !important;
}

.markdown-body a:focus,
.markdown-body [role=button]:focus,
.markdown-body input[type=radio]:focus,
.markdown-body input[type=checkbox]:focus {
  outline: 2px solid var(--pf-t--global--border--color--clicked);
  outline-offset: -2px;
  box-shadow: none;
}

.markdown-body a:focus:not(:focus-visible),
.markdown-body [role=button]:focus:not(:focus-visible),
.markdown-body input[type=radio]:focus:not(:focus-visible),
.markdown-body input[type=checkbox]:focus:not(:focus-visible) {
  outline: solid 1px transparent;
}

.markdown-body a:focus-visible,
.markdown-body [role=button]:focus-visible,
.markdown-body input[type=radio]:focus-visible,
.markdown-body input[type=checkbox]:focus-visible {
  outline: 2px solid var(--pf-t--global--border--color--clicked);
  outline-offset: -2px;
  box-shadow: none;
}

.markdown-body a:not([class]):focus,
.markdown-body a:not([class]):focus-visible,
.markdown-body input[type=radio]:focus,
.markdown-body input[type=radio]:focus-visible,
.markdown-body input[type=checkbox]:focus,
.markdown-body input[type=checkbox]:focus-visible {
  outline-offset: 0;
}

.markdown-body kbd {
  display: inline-block;
  padding: 3px 5px;
  font: var(--pf-t--global--font--size--xs) var(--pf-t--global--font--family--mono);
  line-height: 10px;
  color: var(--pf-t--global--text--color--subtle);
  vertical-align: middle;
  background-color: var(--pf-t--global--background--color--secondary--default);
  border: solid 1px var(--pf-t--global--border--color--default);
  border-bottom-color: var(--pf-t--global--border--color--default);
  border-radius: var(--pf-t--global--border--radius--small);
  box-shadow: inset 0 -1px 0 var(--pf-t--global--box-shadow--color--md);
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: var(--pf-t--global--font--weight--200);
  line-height: 1.25;
}

.markdown-body h2 {
  font-weight: var(--pf-t--global--font--weight--200);
  padding-bottom: .3em;
  font-size: var(--pf-t--global--font--size--heading--h2);
  border-bottom: 1px solid var(--pf-t--global--border--color--default);
}

.markdown-body h3 {
  font-weight: var(--pf-t--global--font--weight--200);
  font-size: var(--pf-t--global--font--size--heading--h3);
}

.markdown-body h4 {
  font-weight: var(--pf-t--global--font--weight--200);
  font-size: var(--pf-t--global--font--size--heading--h4);
}

.markdown-body h5 {
  font-weight: var(--pf-t--global--font--weight--200);
  font-size: var(--pf-t--global--font--size--heading--h5);
}

.markdown-body h6 {
  font-weight: var(--pf-t--global--font--weight--200);
  font-size: var(--pf-t--global--font--size--heading--h6);
  color: var(--pf-t--global--text--color--disabled);
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 10px;
}

.markdown-body blockquote {
  margin: 0;
  padding: 0 1em;
  color: var(--pf-t--global--icon--color--severity--minor--default);
  border-left: .25em solid var(--pf-t--global--border--color--default);
}

.markdown-body ul,
.markdown-body ol {
  margin-top: 0;
  margin-bottom: 0;
  padding-left: 2em;
}

.markdown-body ol ol,
.markdown-body ul ol {
  list-style-type: lower-roman;
}

.markdown-body ul ul ol,
.markdown-body ul ol ol,
.markdown-body ol ul ol,
.markdown-body ol ol ol {
  list-style-type: lower-alpha;
}

.markdown-body dd {
  margin-left: 0;
}

.markdown-body tt,
.markdown-body code,
.markdown-body samp {
  font-family: var(--pf-t--global--font--family--mono);
  font-size: var(--pf-t--global--font--size--xs);
}

.markdown-body pre {
  margin-top: 0;
  margin-bottom: 0;
  font-family: var(--pf-t--global--font--family--mono);
  font-size: var(--pf-t--global--font--size--xs);
  word-wrap: normal;
}

.markdown-body .octicon {
  display: inline-block;
  overflow: visible !important;
  vertical-align: text-bottom;
  fill: currentColor;
}

.markdown-body input::-webkit-outer-spin-button,
.markdown-body input::-webkit-inner-spin-button {
  margin: 0;
  -webkit-appearance: none;
  appearance: none;
}

.markdown-body .mr-2 {
  margin-right: 8px !important;
}

.markdown-body::before {
  display: table;
  content: "";
}

.markdown-body::after {
  display: table;
  clear: both;
  content: "";
}

.markdown-body>*:first-child {
  margin-top: 0 !important;
}

.markdown-body>*:last-child {
  margin-bottom: 0 !important;
}

.markdown-body a:not([href]) {
  color: inherit;
  text-decoration: none;
}

.markdown-body .absent {
  color: var(--pf-t--global--text--color--status--danger--default);
}

.markdown-body .anchor {
  float: left;
  padding-right: 4px;
  margin-left: -20px;
  line-height: 1;
}

.markdown-body .anchor:focus {
  outline: none;
}

.markdown-body p,
.markdown-body blockquote,
.markdown-body ul,
.markdown-body ol,
.markdown-body dl,
.markdown-body table,
.markdown-body pre,
.markdown-body details {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body blockquote>:first-child {
  margin-top: 0;
}

.markdown-body blockquote>:last-child {
  margin-bottom: 0;
}

.markdown-body h1 .octicon-link,
.markdown-body h2 .octicon-link,
.markdown-body h3 .octicon-link,
.markdown-body h4 .octicon-link,
.markdown-body h5 .octicon-link,
.markdown-body h6 .octicon-link {
  color: var(--pf-t--global--text--color--subtle);
  vertical-align: middle;
  visibility: hidden;
}

.markdown-body h1:hover .anchor,
.markdown-body h2:hover .anchor,
.markdown-body h3:hover .anchor,
.markdown-body h4:hover .anchor,
.markdown-body h5:hover .anchor,
.markdown-body h6:hover .anchor {
  text-decoration: none;
}

.markdown-body h1:hover .anchor .octicon-link,
.markdown-body h2:hover .anchor .octicon-link,
.markdown-body h3:hover .anchor .octicon-link,
.markdown-body h4:hover .anchor .octicon-link,
.markdown-body h5:hover .anchor .octicon-link,
.markdown-body h6:hover .anchor .octicon-link {
  visibility: visible;
}

.markdown-body h1 tt,
.markdown-body h1 code,
.markdown-body h2 tt,
.markdown-body h2 code,
.markdown-body h3 tt,
.markdown-body h3 code,
.markdown-body h4 tt,
.markdown-body h4 code,
.markdown-body h5 tt,
.markdown-body h5 code,
.markdown-body h6 tt,
.markdown-body h6 code {
  padding: 0 .2em;
  font-size: inherit;
}

.markdown-body summary h1,
.markdown-body summary h2,
.markdown-body summary h3,
.markdown-body summary h4,
.markdown-body summary h5,
.markdown-body summary h6 {
  display: inline-block;
}

.markdown-body summary h1 .anchor,
.markdown-body summary h2 .anchor,
.markdown-body summary h3 .anchor,
.markdown-body summary h4 .anchor,
.markdown-body summary h5 .anchor,
.markdown-body summary h6 .anchor {
  margin-left: -40px;
}

.markdown-body summary h1,
.markdown-body summary h2 {
  padding-bottom: 0;
  border-bottom: 0;
}

.markdown-body ul.no-list,
.markdown-body ol.no-list {
  padding: 0;
  list-style-type: none;
}

.markdown-body ol[type="a s"] {
  list-style-type: lower-alpha;
}

.markdown-body ol[type="A s"] {
  list-style-type: upper-alpha;
}

.markdown-body ol[type="i s"] {
  list-style-type: lower-roman;
}

.markdown-body ol[type="I s"] {
  list-style-type: upper-roman;
}

.markdown-body ol[type="1"] {
  list-style-type: decimal;
}

.markdown-body div>ol:not([type]) {
  list-style-type: decimal;
}

.markdown-body ul {
  list-style-type: disc;
}

.markdown-body ul ul,
.markdown-body ul ol,
.markdown-body ol ol,
.markdown-body ol ul {
  margin-top: 0;
  margin-bottom: 0;
}

.markdown-body li>p {
  margin-top: 16px;
}

.markdown-body li+li {
  margin-top: .25em;
}

.markdown-body dl {
  padding: 0;
}

.markdown-body dl dt {
  padding: 0;
  margin-top: 16px;
  font-size: var(--pf-t--global--icon--size--font--sm);
  font-style: italic;
  font-weight: var(--pf-t--global--font--weight--200);
}

.markdown-body dl dd {
  padding: 0 16px;
  margin-bottom: 16px;
}

.markdown-body table th {
  font-weight: var(--pf-t--global--font--weight--200);
}

.markdown-body table th,
.markdown-body table td {
  padding: 6px 13px;
  border: 1px solid var(--pf-t--global--border--color--nonstatus--gray--default);
}

.markdown-body table td>:last-child {
  margin-bottom: 0;
}

.markdown-body table tr {
  background-color: var(--pf-t--global--background--color--primary--default);
  border-top: 1px solid var(--pf-t--global--border--color--nonstatus--gray--clicked);
}

.markdown-body table tr:nth-child(2n) {
  background-color: var(--pf-t--global--background--color--secondary--default);
}

.markdown-body table img {
  background-color: transparent;
}

.markdown-body img[align=right] {
  padding-left: 20px;
}

.markdown-body img[align=left] {
  padding-right: 20px;
}

.markdown-body .emoji {
  max-width: none;
  vertical-align: text-top;
  background-color: transparent;
}

.markdown-body span.frame {
  display: block;
  overflow: hidden;
}

.markdown-body span.frame>span {
  display: block;
  float: left;
  width: auto;
  padding: 7px;
  margin: 13px 0 0;
  overflow: hidden;
  border: 1px solid var(--pf-t--global--border--color--nonstatus--gray--default);
}

.markdown-body span.frame span img {
  display: block;
  float: left;
}

.markdown-body span.frame span span {
  display: block;
  padding: 5px 0 0;
  clear: both;
  color: var(--pf-t--global--icon--color--status--info--clicked);
}

.markdown-body span.align-center {
  display: block;
  overflow: hidden;
  clear: both;
}

.markdown-body span.align-center>span {
  display: block;
  margin: 13px auto 0;
  overflow: hidden;
  text-align: center;
}

.markdown-body span.align-center span img {
  margin: 0 auto;
  text-align: center;
}

.markdown-body span.align-right {
  display: block;
  overflow: hidden;
  clear: both;
}

.markdown-body span.align-right>span {
  display: block;
  margin: 13px 0 0;
  overflow: hidden;
  text-align: right;
}

.markdown-body span.align-right span img {
  margin: 0;
  text-align: right;
}

.markdown-body span.float-left {
  display: block;
  float: left;
  margin-right: 13px;
  overflow: hidden;
}

.markdown-body span.float-left span {
  margin: 13px 0 0;
}

.markdown-body span.float-right {
  display: block;
  float: right;
  margin-left: 13px;
  overflow: hidden;
}

.markdown-body span.float-right>span {
  display: block;
  margin: 13px auto 0;
  overflow: hidden;
  text-align: right;
}

.markdown-body code,
.markdown-body tt {
  padding: .2em .4em;
  margin: 0;
  font-size: 85%;
  white-space: break-spaces;
  background-color: var(--pf-t--global--background--color--secondary--default);
  color: var(--pf-t--global--text--color--regular);
  border: var(--pf-t--global--border--width--regular) solid var(--pf-t--global--border--color--nonstatus--gray--default);
}

.markdown-body code br,
.markdown-body tt br {
  display: none;
}

.markdown-body del code {
  text-decoration: inherit;
}

.markdown-body samp {
  font-size: 85%;
}

.markdown-body pre code {
  font-size: 100%;
}

.markdown-body pre>code {
  padding: 0;
  margin: 0;
  word-break: normal;
  white-space: pre;
  background: transparent;
  border: 0;
}

.markdown-body .highlight {
  margin-bottom: 16px;
}

.markdown-body .highlight pre {
  margin-bottom: 0;
  word-break: normal;
}

.markdown-body .highlight pre,
.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  color: var(--pf-t--global--text--color--regular);
  background-color: var(--pf-t--global--background--color--primary--default);
  border: var(--pf-t--global--border--width--regular) solid var(--pf-t--global--border--color--nonstatus--gray--default);
  border-radius: var(--pf-t--global--border--radius--small);
}

.markdown-body details pre {
  margin: var(--pf-t--global--spacer--sm);
}

.markdown-body pre code,
.markdown-body pre tt {
  display: inline;
  max-width: auto;
  padding: 0 var(--pf-t--global--spacer--xs);
  margin: 0;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
  background-color: transparent;
  border: 0;
}

.markdown-body .csv-data td,
.markdown-body .csv-data th {
  padding: 5px;
  overflow: hidden;
  font-size: var(--pf-t--global--font--size--body--default);
  line-height: 1;
  text-align: left;
  white-space: nowrap;
}

.markdown-body .csv-data .blob-num {
  padding: 10px 8px 9px;
  text-align: right;
  background: var(--pf-t--global--background--color--primary--default);
  border: 0;
}

.markdown-body .csv-data tr {
  border-top: 0;
}

.markdown-body .csv-data th {
  font-weight: var(--pf-t--global--font--weight--200);
  background: var(--pf-t--global--background--color--secondary--default);
  border-top: 0;
}

.markdown-body [data-footnote-ref]::before {
  content: "[";
}

.markdown-body [data-footnote-ref]::after {
  content: "]";
}

.markdown-body .footnotes {
  font-size: var(--pf-t--global--font--size--body--default);
  color: var(--pf-t--global--text--color--subtle);
  border-top: 1px solid var(--pf-t--global--border--color--default);
}

.markdown-body .footnotes ol {
  padding-left: 16px;
}

.markdown-body .footnotes ol ul {
  display: inline-block;
  padding-left: 16px;
  margin-top: 16px;
}

.markdown-body .footnotes li {
  position: relative;
}

.markdown-body .footnotes li:target::before {
  position: absolute;
  top: -8px;
  right: -8px;
  bottom: -8px;
  left: -24px;
  pointer-events: none;
  content: "";
  border: 2px solid var(--pf-t--global--border--color--nonstatus--blue--default);
  border-radius: var(--pf-t--global--border--radius--small);
}

.markdown-body .footnotes li:target {
  color: var(--pf-t--global--color--status--unread--clicked);
}

.markdown-body .footnotes .data-footnote-backref g-emoji {
  font-family: var(--pf-t--global--font--family--mono);
}

.markdown-body .pl-c {
  color: var(--pf-t--global--border--color--nonstatus--gray--hover);
}

.markdown-body .pl-c1,
.markdown-body .pl-s .pl-v {
  color: var(--pf-t--global--border--color--nonstatus--blue--hover);
}

.markdown-body .pl-e,
.markdown-body .pl-en {
  color: var(--pf-t--global--border--color--nonstatus--purple--default);
}

.markdown-body .pl-smi,
.markdown-body .pl-s .pl-s1 {
  color: var(--pf-t--chart--theme--colorscales--multi-colored-ordered--colorscale--2100);
}

.markdown-body .pl-ent {
  color: var(--pf-t--global--text--color--status--success--default);
}

.markdown-body .pl-k {
  color: var(--pf-t--global--border--color--status--danger--default);
}

.markdown-body .pl-s,
.markdown-body .pl-pds,
.markdown-body .pl-s .pl-pse .pl-s1,
.markdown-body .pl-sr,
.markdown-body .pl-sr .pl-cce,
.markdown-body .pl-sr .pl-sre,
.markdown-body .pl-sr .pl-sra {
  color: var(--pf-t--global--text--color--brand--clicked);
}

.markdown-body .pl-v,
.markdown-body .pl-smw {
  color: var(--pf-t--global--color--nonstatus--orange--default);
}

.markdown-body .pl-bu {
  color: var(--pf-t--global--color--nonstatus--red--default);
}

.markdown-body .pl-ii {
  color: var(--pf-t--global--text--color--status--danger--default);
  background-color: var(--pf-t--global--color--nonstatus--red--default);
}

.markdown-body .pl-c2 {
  color: var(--pf-t--global--text--color--status--danger--default);
  background-color: var(--pf-t--global--color--nonstatus--red--default);
}

.markdown-body .pl-sr .pl-cce {
  font-weight: var(--pf-t--global--font--weight--200);
  color: var(--pf-t--global--color--status--success--default);
}

.markdown-body .pl-ml {
  color: var(--pf-t--global--color--status--unread--attention--default);
}

.markdown-body .pl-mh,
.markdown-body .pl-mh .pl-en,
.markdown-body .pl-ms {
  font-weight: var(--pf-t--global--font--weight--200);
  color: var(--pf-t--global--color--status--unread--default);
}

.markdown-body .pl-mi {
  font-style: italic;
  color: var(--pf-t--global--color--status--unread--clicked);
}

.markdown-body .pl-mb {
  font-weight: var(--pf-t--global--font--weight--200);
  color: var(--pf-t--global--color--status--unread--clicked);
}

.markdown-body .pl-md {
  color: var(--pf-t--color--red--60);
  background-color: var(--pf-t--global--color--nonstatus--red--default);
}

.markdown-body .pl-mi1 {
  color: var(--pf-t--color--green--60);
  background-color: var(--pf-t--global--color--nonstatus--green--default);
}

.markdown-body .pl-mc {
  color: var(--pf-t--color--red--60);
  background-color: var(--pf-t--global--color--nonstatus--red--default);
}

.markdown-body .pl-mi2 {
  color: var(--pf-t--global--color--nonstatus--blue--default);
  background-color: var(--pf-t--global--color--brand--default);
}

.markdown-body .pl-mdr {
  font-weight: var(--pf-t--global--font--weight--200);
  color: var(--pf-t--global--border--color--nonstatus--purple--default);
}

.markdown-body .pl-ba {
  color: var(--pf-t--global--border--color--nonstatus--gray--hover);
}

.markdown-body .pl-sg {
  color: var(--pf-t--global--border--color--nonstatus--gray--default);
}

.markdown-body .pl-corl {
  text-decoration: underline;
  color: var(--pf-t--global--text--color--brand--clicked);
}

.markdown-body g-emoji {
  display: inline-block;
  min-width: 1ch;
  font-family: "Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  font-size: var(--pf-t--global--font--size--body--lg);
  font-style: normal !important;
  font-weight: var(--pf-t--global--font--weight--body);
  line-height: 1;
  vertical-align: -0.075em;
}

.markdown-body g-emoji img {
  width: 1em;
  height: 1em;
}

.markdown-body .task-list-item {
  list-style-type: none;
}

.markdown-body .task-list-item label {
  font-weight: var(--pf-t--global--font--weight--body);
}

.markdown-body .task-list-item.enabled label {
  cursor: pointer;
}

.markdown-body .task-list-item+.task-list-item {
  margin-top: 4px;
}

.markdown-body .task-list-item .handle {
  display: none;
}

.markdown-body .task-list-item-checkbox {
  margin: 0 .2em .25em -1.4em;
  vertical-align: middle;
}

.markdown-body .contains-task-list:dir(rtl) .task-list-item-checkbox {
  margin: 0 -1.6em .25em .2em;
}

.markdown-body .contains-task-list {
  position: relative;
}

.markdown-body .contains-task-list:hover .task-list-item-convert-container,
.markdown-body .contains-task-list:focus-within .task-list-item-convert-container {
  display: block;
  width: auto;
  height: 24px;
  overflow: visible;
  clip: auto;
}

.markdown-body ::-webkit-calendar-picker-indicator {
  filter: invert(50%);
}

.markdown-body .markdown-alert {
  padding: 8px 16px;
  margin-bottom: 16px;
  color: inherit;
  border-left: .25em solid var(--pf-t--global--border--color--default);
}

.markdown-body .markdown-alert>:first-child {
  margin-top: 0;
}

.markdown-body .markdown-alert>:last-child {
  margin-bottom: 0;
}

.markdown-body .markdown-alert .markdown-alert-title {
  display: flex;
  font-weight: var(--pf-t--global--font--weight--heading);
  align-items: center;
  line-height: 1;
}

.markdown-body .markdown-alert.markdown-alert-note {
  border-left-color: var(--pf-t--global--icon--color--brand--default);
}

.markdown-body .markdown-alert.markdown-alert-note .markdown-alert-title {
  color: var(--pf-t--global--icon--color--brand--default);
}

.markdown-body .markdown-alert.markdown-alert-important {
  border-left-color: var(--pf-t--global--border--color--status--info--default);
}

.markdown-body .markdown-alert.markdown-alert-important .markdown-alert-title {
  color: var(--pf-t--global--text--color--status--info--default);
}

.markdown-body .markdown-alert.markdown-alert-warning {
  border-left-color: var(--pf-t--global--border--color--status--warning--default);
}

.markdown-body .markdown-alert.markdown-alert-warning .markdown-alert-title {
  color: var(--pf-t--global--text--color--status--warning--default);
}

.markdown-body .markdown-alert.markdown-alert-tip {
  border-left-color: var(--pf-t--global--border--color--status--success--default);
}

.markdown-body .markdown-alert.markdown-alert-tip .markdown-alert-title {
  color: var(--pf-t--global--text--color--status--success--default);
}

.markdown-body .markdown-alert.markdown-alert-caution {
  border-left-color: var(--pf-t--global--border--color--status--danger--default);
}

.markdown-body .markdown-alert.markdown-alert-caution .markdown-alert-title {
  color: var(--pf-t--global--text--color--status--danger--default);
}
`;
