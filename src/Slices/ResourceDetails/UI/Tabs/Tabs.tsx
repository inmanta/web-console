import React, { useCallback, useEffect, useRef } from "react";
import {
  ColumnsIcon,
  HistoryIcon,
  LinkIcon,
  ListIcon,
  ModuleIcon,
  TableIcon,
} from "@patternfly/react-icons";
import { Details } from "@/Core/Domain/Resource/Resource";
import { useUrlStateWithExpansion } from "@/Data";
import { IconTabs, TabDescriptor } from "@/UI/Components";
import { words } from "@/UI/words";
import { AttributesTab } from "./AttributesTab";
import { FactsTab } from "./FactsTab";
import { ResourceHistoryView } from "./HistoryTab/ResourceHistoryView";
import { ResourceLogView } from "./LogTab";
import { ReferencesTab } from "./ReferencesTab";
import { RequiresTab } from "./RequiresTab";

export enum TabKey {
  Requires = "Requires",
  Attributes = "Attributes",
  References = "References",
  History = "History",
  Logs = "Logs",
  Facts = "Facts",
}

interface Props {
  id: string;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  data: Details;
}

export const REFERENCES_EXPANSION_KEY = "references-expansion";

export const Tabs: React.FC<Props> = ({ id, activeTab, setActiveTab, data }) => {
  const [isReferenceExpanded, onReferenceExpansion] = useUrlStateWithExpansion({
    route: "ResourceDetails",
    key: REFERENCES_EXPANSION_KEY,
  });
  const pendingExpandRef = useRef<string | null>(null);

  const onNavigateToReference = useCallback(
    (referenceId: string) => {
      pendingExpandRef.current = referenceId;
      setActiveTab(TabKey.References);
    },
    [setActiveTab]
  );

  /**
   * `setActiveTab` and `onReferenceExpansion` both write to the URL via
   * `react-router`'s `replace`, each based on the location captured at
   * render time. Calling them in the same tick makes the second overwrite
   * the first. We therefore defer the expansion to a follow-up render once
   * the tab change has landed in the URL.
   */
  useEffect(() => {
    const pending = pendingExpandRef.current;

    if (pending === null) {
      return;
    }
    if (isReferenceExpanded(pending)) {
      pendingExpandRef.current = null;

      return;
    }
    pendingExpandRef.current = null;
    onReferenceExpansion(pending)();
  }, [isReferenceExpanded, onReferenceExpansion]);

  return (
    <IconTabs
      activeTab={activeTab}
      onChange={setActiveTab}
      tabs={[
        attributesTab(data, onNavigateToReference),
        referencesTab(data),
        requiresTab(data),
        historyTab(id, data),
        logTab(id),
        factsTab(id),
      ]}
    />
  );
};

const requiresTab = (data: Details): TabDescriptor<TabKey> => ({
  id: TabKey.Requires,
  title: words("resources.requires.title"),
  icon: <ModuleIcon />,
  view: <RequiresTab details={data} />,
});

const attributesTab = (
  data: Details,
  onNavigateToReference: (id: string) => void
): TabDescriptor<TabKey> => ({
  id: TabKey.Attributes,
  title: words("resources.attributes.title"),
  icon: <ListIcon />,
  view: <AttributesTab details={data} onNavigateToReference={onNavigateToReference} />,
});

const referencesTab = (data: Details): TabDescriptor<TabKey> => ({
  id: TabKey.References,
  title: words("resources.references.title"),
  icon: <LinkIcon />,
  view: <ReferencesTab details={data} />,
});

const historyTab = (id: string, data: Details): TabDescriptor<TabKey> => ({
  id: TabKey.History,
  title: words("resources.history.title"),
  icon: <HistoryIcon />,
  view: <ResourceHistoryView resourceId={id} details={data} />,
});

const logTab = (id: string): TabDescriptor<TabKey> => ({
  id: TabKey.Logs,
  title: words("resources.logs.title"),
  icon: <TableIcon />,
  view: <ResourceLogView resourceId={id} />,
});

const factsTab = (id: string): TabDescriptor<TabKey> => ({
  id: TabKey.Facts,
  title: words("resources.facts.title"),
  icon: <ColumnsIcon />,
  view: <FactsTab resourceId={id} />,
});
