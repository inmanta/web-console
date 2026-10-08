import React, { useEffect, useRef, useState } from "react";
import {
  Content,
  Divider,
  Flex,
  FlexItem,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Label,
  MenuSearch,
  MenuSearchInput,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";
import styled from "styled-components";
import { Spinner } from "@/UI/Components/Spinner";
import { CustomDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";

const datePresenter = new CustomDatePresenter();

/**
 * The colour for the muted parts of a version (the arrow, the detail, the date): subtle, or the
 * disabled colour in a disabled option, since Content sets its own colour and would otherwise not
 * grey out with the rest of the option.
 *
 * @example mutedStyle(true) // { color: "var(--pf-t--global--text--color--disabled)" }
 */
const mutedStyle = (isDisabled: boolean | undefined): React.CSSProperties => ({
  color: `var(--pf-t--global--text--color--${isDisabled ? "disabled" : "subtle"})`,
});

// PatternFly sizes the toggle's text slot to its content and offers no prop to stretch it, so the
// slot is grown here to let the selected version's date sit at the end of the line. A grown slot
// would centre its text like any button, so it is aligned to the start. Coupled to the PF v6
// menu-toggle class name.
const FullWidthTextToggle = styled(MenuToggle)`
  .pf-v6-c-menu-toggle__text {
    flex-grow: 1;
    text-align: start;
  }
`;

/**
 * One selectable version, with the status label shown next to it. The optional detail follows
 * the version (e.g. the model version an instance version maps to), and a disabled version is
 * listed but can't be picked.
 */
export interface VersionOption {
  version: number;
  date: string;
  status: React.ReactNode;
  detail?: string;
  isDisabled?: boolean;
}

/**
 * A message under the select: why it is locked, why a version can't be used, or why the versions
 * are missing.
 */
export interface VersionNotice {
  variant: "warning" | "error";
  text: string;
}

interface Props {
  id: string;
  options: VersionOption[];
  shown: VersionOption | undefined;
  format: (version: string) => string;
  onSelect: (option: VersionOption) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onReachEnd: () => void;
  isLoadingMore: boolean;
  listError: string | undefined;
  isDisabled: boolean;
  isLoading: boolean;
  notice: VersionNotice | undefined;
}

/**
 * A select of versions with a search box in its menu and a list that asks for more versions when
 * scrolled to its end, so a long history stays reachable. The toggle shows the version in use
 * with its date at the end. Opening the menu focuses the search box, and Down moves from there
 * into the list.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} id - The toggle's id, for the form label to point at
 *  @prop {VersionOption[]} options - The listed versions
 *  @prop {VersionOption | undefined} shown - The version in the toggle, undefined when there is none yet
 *  @prop {(version: string) => string} format - How a version number reads, e.g. "v8" or "instance v3"
 *  @prop {(option: VersionOption) => void} onSelect - Called with the picked version
 *  @prop {string} search - The text in the search box
 *  @prop {(search: string) => void} onSearchChange - Called when the search text changes
 *  @prop {() => void} onReachEnd - Called when the list is scrolled to its end
 *  @prop {boolean} isLoadingMore - Shows a loading row at the end of the list
 *  @prop {string | undefined} listError - Shows this error at the end of the list, e.g. a failed lookup
 *  @prop {boolean} isDisabled - Disables the toggle
 *  @prop {boolean} isLoading - Shows a loading label in the toggle while there is nothing to show yet
 *  @prop {VersionNotice | undefined} notice - A message under the select
 *
 * @returns {React.FC<Props>} The select and its notice
 */
export const VersionSelect: React.FC<Props> = ({
  id,
  options,
  shown,
  format,
  onSelect,
  search,
  onSearchChange,
  onReachEnd,
  isLoadingMore,
  listError,
  isDisabled,
  isLoading,
  notice,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // The menu renders after it opens, so the search box is focused on the next tick, like
  // PatternFly's own focus on open.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const timeout = setTimeout(() => searchRef.current?.focus(), 0);

    return () => clearTimeout(timeout);
  }, [isOpen]);

  // The menu's arrow keys only move between options, so Down from the search box is handled here,
  // and kept from the menu, which would otherwise move on to the second option.
  const onSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowDown") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    listRef.current?.querySelector<HTMLElement>("li button:not(:disabled)")?.focus();
  };

  const label = (option: VersionOption) => (
    <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
      {option.status}
      <span>{format(String(option.version))}</span>
      {option.detail && (
        // The font's own arrow, at the detail's size, points at the middle of its letters. Each
        // sits in a FlexItem, since Content drops its bottom margin only as a last child, and the
        // two stay together when a narrow line wraps.
        <Flex
          alignItems={{ default: "alignItemsCenter" }}
          flexWrap={{ default: "nowrap" }}
          gap={{ default: "gapSm" }}
        >
          <FlexItem>
            <Content component="small" aria-hidden style={mutedStyle(option.isDisabled)}>
              {words("resources.resourceActions.confirm.version.arrow")}
            </Content>
          </FlexItem>
          <FlexItem>
            <Content component="small" style={mutedStyle(option.isDisabled)}>
              {option.detail}
            </Content>
          </FlexItem>
        </Flex>
      )}
    </Flex>
  );

  const toggleContent = () => {
    if (shown) {
      return (
        <Flex
          justifyContent={{ default: "justifyContentSpaceBetween" }}
          alignItems={{ default: "alignItemsCenter" }}
          flexWrap={{ default: "nowrap" }}
          gap={{ default: "gapMd" }}
        >
          {label(shown)}
          <Content component="small">{datePresenter.getFull(shown.date)}</Content>
        </Flex>
      );
    }
    if (isLoading) {
      // A label like the one that replaces it, so the toggle keeps its height once the versions load.
      return (
        <Label variant="outline" icon={<Spinner aria-hidden />}>
          {words("loading")}
        </Label>
      );
    }

    return words("resources.resourceActions.confirm.version.placeholder");
  };

  const onListScroll = (event: React.UIEvent<HTMLUListElement>) => {
    const list = event.currentTarget;

    if (list.scrollHeight - list.scrollTop <= list.clientHeight + 10) {
      onReachEnd();
    }
  };

  const listEnd = () => {
    if (isLoadingMore) {
      return (
        <SelectOption isDisabled icon={<Spinner aria-hidden />}>
          {words("loading")}
        </SelectOption>
      );
    }
    if (listError) {
      return (
        <SelectOption isDisabled>
          <HelperText>
            <HelperTextItem variant="error">{listError}</HelperTextItem>
          </HelperText>
        </SelectOption>
      );
    }
    if (options.length === 0) {
      return (
        <SelectOption isDisabled>
          {words("resources.resourceActions.confirm.version.noResults")}
        </SelectOption>
      );
    }

    return null;
  };

  const optionItems = () =>
    options.map((option) => (
      <SelectOption
        key={option.version}
        value={String(option.version)}
        isDisabled={option.isDisabled}
      >
        {/* The date sits in the option itself rather than its description, to keep a small gap
            below the status label. */}
        <Flex direction={{ default: "column" }} gap={{ default: "gapXs" }}>
          {label(option)}
          <Content component="small" style={mutedStyle(option.isDisabled)}>
            {datePresenter.getFull(option.date)}
          </Content>
        </Flex>
      </SelectOption>
    ));

  const toggle = (ref: React.Ref<MenuToggleElement>) => (
    <FullWidthTextToggle
      ref={ref}
      id={id}
      isFullWidth
      isExpanded={isOpen}
      isDisabled={isDisabled}
      onClick={() => setIsOpen(!isOpen)}
    >
      {toggleContent()}
    </FullWidthTextToggle>
  );

  return (
    <>
      <Select
        isOpen={isOpen}
        selected={shown === undefined ? undefined : String(shown.version)}
        onOpenChange={(open) => setIsOpen(open)}
        onSelect={(_event, value) => {
          const option = options.find((candidate) => String(candidate.version) === value);

          if (option) {
            onSelect(option);
          }
          setIsOpen(false);
        }}
        toggle={toggle}
        shouldFocusToggleOnSelect
        isScrollable
      >
        <MenuSearch>
          <MenuSearchInput>
            <SearchInput
              ref={searchRef}
              onKeyDown={onSearchKeyDown}
              value={search}
              placeholder={words("resources.resourceActions.confirm.version.search")}
              aria-label={words("resources.resourceActions.confirm.version.search")}
              onChange={(_event, value) => onSearchChange(value)}
              onClear={() => onSearchChange("")}
            />
          </MenuSearchInput>
        </MenuSearch>
        <Divider />
        <SelectList
          ref={listRef}
          onScroll={onListScroll}
          aria-label={words("resources.resourceActions.confirm.version.title")}
        >
          {optionItems()}
          {listEnd()}
        </SelectList>
      </Select>
      {notice && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant={notice.variant}>{notice.text}</HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </>
  );
};
