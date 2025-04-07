import formatXml from "xml-formatter";
import { Formatter } from "@/Core";

export class XmlFormatter implements Formatter {
  format(source: string): string {
    try {
      return formatXml(source, {
        collapseContent: true,
        lineSeparator: "\n",
      });
    } catch {
      return source;
    }
  }
}
