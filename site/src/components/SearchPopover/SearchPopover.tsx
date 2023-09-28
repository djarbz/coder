/**
 * Trying to put together the component in the dumbest, most naive way possible
 * at first. Will break apart and figure out what abstraction make sense later.
 */
import React, { useState } from "react";
import { useOrganizationId } from "hooks";
import { preloadImages } from "./useImagePreloading";

import { type Template } from "api/typesGenerated";
import { templates } from "api/queries/templates";
import { useQuery } from "@tanstack/react-query";

import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/AddOutlined";
import { Stack } from "@mui/system";

function filterAndSortDesc<T extends Template>(
  templates: readonly T[],
  searchTerm: string,
): readonly T[] {
  const searchTermMatcher = new RegExp(searchTerm, "i");

  return templates
    .filter((t) => searchTermMatcher.test(t.display_name))
    .sort((t1, t2) => t2.active_user_count - t1.active_user_count);
}

export function SearchPopover() {
  const organizationId = useOrganizationId();
  const templatesQuery = useQuery(templates(organizationId));

  const [searchTerm, setSearchTerm] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(
    null,
  );

  const onPopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElement(event.currentTarget);
    setIsPopoverOpen(true);
  };

  const onPopoverClose = () => {
    setIsPopoverOpen(false);
    setAnchorElement(null);
  };

  const templatesToShow = filterAndSortDesc(
    templatesQuery.data ?? [],
    searchTerm,
  );

  return (
    <>
      <Button
        startIcon={<AddIcon />}
        variant="contained"
        onClick={onPopoverOpen}
        onPointerEnter={() => {
          preloadImages(templatesQuery.data?.map((t) => t.icon));
        }}
      >
        Create Workspace&hellip;
      </Button>

      <Popover
        open={isPopoverOpen}
        anchorEl={anchorElement}
        onClose={onPopoverClose}
      >
        <label>
          Put some text here
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
        <Stack>
          {templatesToShow.map((template) => (
            <div key={template.id}>
              <p>{template.display_name}</p>
            </div>
          ))}
        </Stack>
      </Popover>
    </>
  );
}
