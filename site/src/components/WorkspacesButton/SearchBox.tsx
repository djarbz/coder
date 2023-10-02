import {
  type ForwardedRef,
  type KeyboardEvent,
  forwardRef,
  useId,
} from "react";

import Box from "@mui/system/Box";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import { visuallyHidden } from "@mui/utils";
import { type SystemStyleObject } from "@mui/system";

type Props = {
  value: string;
  onValueChange: (newValue: string) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  placeholder?: string;
  label?: string;
  sx?: SystemStyleObject;
};

export const SearchBox = forwardRef(function SearchBox(
  {
    value,
    onValueChange,
    onKeyDown,
    label = "Search",
    placeholder = "Search...",
    sx = {},
  }: Props,
  ref?: ForwardedRef<HTMLInputElement>,
) {
  const hookId = useId();
  const inputId = `${hookId}-${SearchBox.name}-input`;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        paddingLeft: 2,
        paddingRight: 2,
        height: 40,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        ...sx,
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
        id={inputId}
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
          paddingLeft: 2,
          outline: 0,
          "&::placeholder": {
            color: (theme) => theme.palette.text.secondary,
          },
        }}
      />
    </Box>
  );
});
