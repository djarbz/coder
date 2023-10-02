import {
  type ForwardedRef,
  type KeyboardEvent,
  forwardRef,
  useId,
} from "react";

import Box from "@mui/system/Box";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import { visuallyHidden } from "@mui/utils";

type Props = {
  value: string;
  onValueChange: (newValue: string) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  placeholder?: string;
  label?: string;
};

export const SearchBox = forwardRef(function SearchBox(
  {
    value,
    onValueChange,
    onKeyDown,
    label = "Search",
    placeholder = "Search...",
  }: Props,
  ref?: ForwardedRef<HTMLInputElement>,
) {
  const hookId = useId();
  const inputId = `${hookId}-${SearchBox.name}`;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        paddingLeft: 2,
        paddingRight: 2,
        height: 40,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
      onKeyDown={onKeyDown}
    >
      <SearchIcon
        sx={{
          fontSize: 14,
          color: (theme) => theme.palette.text.secondary,
        }}
      />

      <Box component="label" sx={visuallyHidden} htmlFor={inputId}>
        {label}
      </Box>

      <Box
        id={hookId}
        tabIndex={0}
        component="input"
        type="text"
        placeholder={placeholder}
        autoFocus
        ref={ref}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        sx={{
          height: "100%",
          border: 0,
          background: "none",
          width: "100%",
          marginLeft: 2,
          outline: 0,
          "&::placeholder": {
            color: (theme) => theme.palette.text.secondary,
          },
        }}
      />
    </Box>
  );
});
