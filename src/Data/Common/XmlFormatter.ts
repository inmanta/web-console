import formatXml from "xml-formatter";
import { Formatter } from "@/Core";

export class XmlFormatter implements Formatter {
  format(source: string): string {
    return formatXml(source, {
      collapseContent: true,
      lineSeparator: "\n",
    });
  }
}
