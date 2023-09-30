import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useState,
} from "react";

import Popover from "@mui/material/Popover";
import Box from "@mui/system/Box";

type Defined = NonNullable<unknown>;

type SearchComboboxProps<TData extends Defined = Defined> = {
  data: readonly TData[] | undefined;
  isLoading: boolean;
  anchorButton: ReactNode;
  filterBy: readonly [keyof TData, ...(keyof TData)[]];
  transform: (dataItem: TData) => ReactElement;

  sort?: (item1: TData, item2: TData) => number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  accessibleLabel?: string;
  initialSearchTerm?: string;
  placeholderText?: string;
  footer?: ReactElement | false | undefined | null;
};

export function SearchCombobox<T extends Defined = Defined>({
  data,
  isLoading,
  anchorButton,
  transform,
  filterBy,

  sort,
  onChange,
  footer,
  accessibleLabel = "Search and filter data",
  initialSearchTerm = "",
  placeholderText = "Search...",
}: SearchComboboxProps<T>) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [activeAnchor, setActiveAnchor] = useState<HTMLButtonElement>();

  // Not using useClickable because the element used with this callback isn't
  // supposed to have any semantic/a11y meaning by itself
  const onButtonEventBubble = (
    event: MouseEvent | KeyboardEvent<HTMLElement>,
  ) => {
    if (event.target instanceof HTMLButtonElement) {
      event.stopPropagation();
      setActiveAnchor(event.target);
    }
  };

  const matcher = new RegExp(searchTerm, "i");
  const processedData = data?.filter((item) => {
    return filterBy.some((fieldKey) => {
      const indexed = item[fieldKey];
      return typeof indexed === "string" && matcher.test(indexed);
    });
  });

  if (sort !== undefined && processedData !== undefined) {
    processedData.sort(sort);
  }

  return (
    <>
      {/*
       * It is possible to take the anchorButton and clone/hack it to have extra
       * onClick functionality, but it's not type-safe. Better just to wrap the
       * button in a container that catches events through bubbling.
       */}
      <div
        role="none"
        onClick={onButtonEventBubble}
        onKeyDown={onButtonEventBubble}
      >
        {anchorButton}
      </div>

      <Popover
        open={activeAnchor !== undefined}
        anchorEl={activeAnchor}
        transformOrigin={{ horizontal: "center", vertical: "bottom" }}
        onClose={() => setActiveAnchor(undefined)}
        sx={{
          maxHeight: "420px",
        }}
      >
        <label>
          <Box>{accessibleLabel}</Box>

          <input
            type="text"
            value={searchTerm}
            placeholder={placeholderText}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              onChange?.(event);
            }}
          />
        </label>

        {isLoading ? <p>Loading...</p> : processedData?.map(transform)}
        {footer}
      </Popover>
    </>
  );
}
