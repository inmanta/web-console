import { words } from "@/UI";
import { EmptyView, PageSectionWithTitle } from "@/UI/Components";
import React from "react";

export const Home: React.FC = () => (
  <PageSectionWithTitle title={words("home.title")}>
    <EmptyView message={words("home.empty.message")}></EmptyView>
  </PageSectionWithTitle>
);
