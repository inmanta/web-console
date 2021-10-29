import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { DictEditor } from "./DictEditor";
import { DependencyProvider } from "@/UI/Dependency";
import { InstantFileFetcher } from "@/Test";

export default {
  title: "DictEditor",
  component: DictEditor,
};

const Template: Story<ComponentProps<typeof DictEditor>> = (args) => (
  <DependencyProvider dependencies={{ fileFetcher: new InstantFileFetcher() }}>
    <DictEditor {...args} />
  </DependencyProvider>
);

export const Default = Template.bind({});
Default.args = {
  value: {
    internal: "local:",
    openstack: "local:",
    "devil.inmanta.com": "ssh://root@192.168.19.100:22?python=python",
    "mon.ii.inmanta.com": "ssh://root@192.168.22.11:22?python=python3",
    "file.ii.inmanta.com": "ssh://root@192.168.22.17:22?python=python3",
    "mgmt.ii.inmanta.com": "ssh://root@192.168.22.10:22?python=python",
    "gitlab-1.htz.inmanta.com": "ssh://root@159.69.44.247:22?python=python3",
    "nokia-demo--192.168.2.52": "ssh://centos@192.168.2.52:22?python=python3",
    "5g on node2.ii.inmanta.com": "local:",
    "demo-nokia-2--192.168.2.51": "ssh://centos@192.168.2.51:22?python=python3",
    "examplestest.ii.inmanta.com": "ssh://centos@192.168.2.98:22?python=python",
    "bart on node2.ii.inmanta.com": "local:",
    "bics on node2.ii.inmanta.com": "local:",
    "bics-lab-1.ci.ii.inmanta.com":
      "ssh://root@192.168.26.207:22?python=python",
    "devlab-1.bics.ii.inmanta.com": "ssh://root@192.168.4.155:22?python=python",
    "uc1-demo.bics.ii.inmanta.com": "ssh://root@192.168.4.162:22?python=python",
    "admin on node1.ii.inmanta.com": "local:",
    "infra on node1.ii.inmanta.com": "local:",
  },
  setValue: () => undefined,
  newEntry: ["", ""],
  setNewEntry: () => undefined,
  isDeleteEntryAllowed: () => true,
};
