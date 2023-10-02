import { useState } from "react";
import { useOrganizationId, usePermissions } from "hooks";
import { useThrottledPreloadImages } from "./useImagePreloading";

import { useQuery } from "@tanstack/react-query";
import { type Template } from "api/typesGenerated";
import { templates } from "api/queries/templates";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/system/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import AddIcon from "@mui/icons-material/AddOutlined";
import OpenIcon from "@mui/icons-material/OpenInNewOutlined";
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
    .sort((t1, t2) => t1.active_user_count - t2.active_user_count)
    .slice(0, 10);
}

function WorkspaceResultsRow({ template }: { template: Template }) {
  return (
    <Link
      key={template.id}
      component={RouterLink}
      // Sending user directly to workspace creation page for UX
      // reasons; avoids extra clicks on the user's part
      to={`/templates/${template.name}/workspace`}
    >
      <Box
        sx={{
          display: "flex",
          columnGap: 2,
          alignItems: "center",
          paddingX: 2,
          marginBottom: 2,
          overflowY: "hidden",
          "&:first-child": {
            marginTop: 2,
          },
        }}
      >
        <Box
          component="img"
          src={template.icon}
          alt={template.display_name || "Coder template"}
          sx={{ width: "20px", height: "20px" }}
        />

        <Box
          sx={{
            lineHeight: 1,
            width: "100%",
            overflow: "hidden",
            color: "white",
          }}
        >
          <Box
            component="p"
            sx={{
              marginY: 0,
              paddingBottom: 0.5,
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {template.display_name || "[Unnamed]"}
          </Box>

          <Box
            component="p"
            sx={{
              marginY: 0,
              fontSize: 14,
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            {/*
             * There are some templates that have -1 as their count –
             * basically functioning like a null count in JS
             */}
            {template.active_user_count <= 0
              ? "No"
              : template.active_user_count}{" "}
            developer
            {template.active_user_count === 1 ? "" : "s"}
          </Box>
        </Box>
      </Box>
    </Link>
  );
}

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

      <Box>
        <OverflowY height={380}>
          {templatesQuery.isLoading ? (
            <Loader size={14} />
          ) : (
            processed.map((template) => (
              <WorkspaceResultsRow key={template.id} template={template} />
            ))
          )}
        </OverflowY>
      </Box>

      {permissions.createTemplates && (
        <Link component={RouterLink} to="/templates">
          <Box
            sx={{
              padding: 2,
              display: "flex",
              flexFlow: "row nowrap",
              alignItems: "center",
              columnGap: 1,
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <OpenIcon sx={{ fontSize: "14px" }} />
            <span>See all templates</span>
          </Box>
        </Link>
      )}
    </PopoverContainer>
  );
}
