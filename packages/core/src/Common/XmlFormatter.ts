import formatXml from "xml-formatter";
import { Formatter } from "@inmanta/web-console-core";

export class XmlFormatter implements Formatter {
  format(source: string): string {
    try {
      return formatXml(source, {
        collapseContent: true,
        lineSeparator: "\n",
        indentation: "  ",
      });
    } catch {
      return source;
    }
  }
}
