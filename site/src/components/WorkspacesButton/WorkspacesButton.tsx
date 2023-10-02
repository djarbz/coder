import { useState } from "react";
import { useOrganizationId, usePermissions } from "hooks";
import { useThrottledPreloadImages } from "./useImagePreloading";

import { useQuery } from "@tanstack/react-query";
import { type Template } from "api/typesGenerated";
import { templates } from "api/queries/templates";

import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/system/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/AddOutlined";
import Link from "@mui/material/Link";
import { Loader } from "components/Loader/Loader";
import { PopoverContainer } from "./PopoverContainer";
import { OverflowY } from "./OverflowY";
import { SearchBox } from "./SearchBox";

function sortTemplatesByUsersDesc(
  templates: readonly Template[],
  searchTerm: string,
) {
  const allWhitespace = /^\s+$/.test(searchTerm);
  if (allWhitespace) {
    return templates;
  }

  const termMatcher = new RegExp(searchTerm.replaceAll(/\s+/g, ".*?"), "i");
  return templates
    .filter((template) => termMatcher.test(template.display_name))
    .sort((t1, t2) => t1.active_user_count - t2.active_user_count);
}

/**
 * Trying to put together the component in the dumbest, most naive way possible
 * at first. Will break apart and figure out what abstraction make sense later.
 */
export function WorkspacesButton() {
  const organizationId = useOrganizationId();
  const permissions = usePermissions();
  const templatesQuery = useQuery(templates(organizationId));
  const preloadImages = useThrottledPreloadImages();

  // Dataset should always be small enough that client-side filtering should be
  // good enough. Can swap out down the line if it becomes an issue
  const [searchTerm, setSearchTerm] = useState("");
  const processed = sortTemplatesByUsersDesc(
    templatesQuery?.data ?? [],
    searchTerm,
  );

  return (
    <PopoverContainer
      anchorButton={
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onPointerEnter={() => {
            void preloadImages(templatesQuery.data?.map((t) => t.icon));
          }}
        >
          Create Workspace&hellip;
        </Button>
      }
    >
      <SearchBox
        value={searchTerm}
        onValueChange={(newValue) => setSearchTerm(newValue)}
        placeholder="Type/select a workspace template"
        label="Template select for workspace"
      />

      <OverflowY height={380}>
        {templatesQuery.isLoading ? (
          <Loader size={14} />
        ) : (
          processed.map((template) => (
            <Link
              key={template.id}
              component={RouterLink}
              // Sending user directly to workspace creation page for UX
              // reasons; avoids extra clicks on the user's part
              to={`/templates/${template.name}/workspace`}
            >
              <img
                src={template.icon}
                alt={template.display_name}
                style={{ width: "20px", height: "20px" }}
              />

              <p>{template.display_name}</p>

              <p>
                {template.active_user_count === 0
                  ? "No"
                  : template.active_user_count}{" "}
                developer
                {template.active_user_count === 1 ? "" : "s"}
              </p>
            </Link>
          ))
        )}
      </OverflowY>

      {permissions.createTemplates && (
        <Link component={RouterLink} to="/templates">
          <Box sx={{ paddingX: 2, paddingY: 1.5 }}>See all templates</Box>
        </Link>
      )}
    </PopoverContainer>
  );
}
