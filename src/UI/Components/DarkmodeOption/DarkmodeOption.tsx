import React from "react";
import { DropdownItem } from "@patternfly/react-core";
import { MoonIcon, SunIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";
import { useTheme } from "./useTheme";

/**
 * A dropdown item that toggles between dark and light themes.
 * Theme state is owned by useTheme; this component is a pure UI trigger.
 */
export const DarkmodeOption: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <DropdownItem
      key="darkmode-toggle"
      onClick={toggleTheme}
      icon={theme === "dark" ? <SunIcon /> : <MoonIcon />}
    >
      {words("theme.toggle")(theme)}
    </DropdownItem>
  );
};
