import React, { useState } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { AngleLeftIcon, AngleRightIcon } from "@patternfly/react-icons";
import { PageSize } from "@/Core/Domain";
import { PaginationPageSizes } from "@/Core/Domain/PageSize";
import { words } from "@/UI/words";

interface Props {
  pageSize: PageSize.Type;
  setPageSize: (size: PageSize.Type) => void;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  isDisabled?: boolean;
}

/**
 * Cursor-based pagination controls for the changelog page.
 *
 * The `get_resource_actions` API returns no total count, only next/previous
 * cursor links, so this component exposes a page-size selector and simple
 * previous/next navigation instead of numbered pages.
 *
 * @props {Props} props - The props of the component.
 * @returns {React.FC<Props>} The pagination component.
 */
export const CursorPagination: React.FC<Props> = ({
  pageSize,
  setPageSize,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  isDisabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Flex
      alignItems={{ default: "alignItemsCenter" }}
      spaceItems={{ default: "spaceItemsSm" }}
      aria-label="ResourceActions-Pagination"
    >
      <FlexItem>
        <Dropdown
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={() => setIsOpen(false)}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              aria-label="PageSizeToggle"
              onClick={() => setIsOpen(!isOpen)}
              isExpanded={isOpen}
              isDisabled={isDisabled}
              variant="plainText"
            >
              {words("resourceActions.pagination.perPage")(pageSize.value)}
            </MenuToggle>
          )}
        >
          <DropdownList>
            {PaginationPageSizes.map(({ title, value }) => (
              <DropdownItem
                key={value}
                onClick={() =>
                  setPageSize({
                    kind: "PageSize",
                    value: title as PageSize.PageSize["value"],
                  })
                }
              >
                {title}
              </DropdownItem>
            ))}
          </DropdownList>
        </Dropdown>
      </FlexItem>
      <FlexItem>
        <Button
          variant="plain"
          aria-label="PreviousPage"
          isDisabled={isDisabled || !hasPrev}
          onClick={onPrev}
          icon={<AngleLeftIcon />}
        />
      </FlexItem>
      <FlexItem>
        <Button
          variant="plain"
          aria-label="NextPage"
          isDisabled={isDisabled || !hasNext}
          onClick={onNext}
          icon={<AngleRightIcon />}
        />
      </FlexItem>
    </Flex>
  );
};
