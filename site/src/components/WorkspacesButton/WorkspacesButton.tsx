/**
 * Trying to put together the component in the dumbest, most naive way possible
 * at first. Will break apart and figure out what abstraction make sense later.
 */
import { useOrganizationId, usePermissions } from "hooks";

import { useThrottledPreloadImages } from "./useImagePreloading";
import { type Template } from "api/typesGenerated";
import { templates } from "api/queries/templates";
import { useQuery } from "@tanstack/react-query";

import { Link as RouterLink } from "react-router-dom";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/AddOutlined";
import Link from "@mui/material/Link";
import { SearchCombobox } from "./SearchCombobox";

export function WorkspacesButton() {
  const organizationId = useOrganizationId();
  const permissions = usePermissions();
  const templatesQuery = useQuery(templates(organizationId));
  const preloadImages = useThrottledPreloadImages();

  return (
    <SearchCombobox<Template>
      isLoading={templatesQuery.isLoading}
      data={templatesQuery.data}
      filterBy={["display_name"]}
      sort={(t1, t2) => t2.active_user_count - t1.active_user_count}
      placeholderText="Type/select a template for the workspace"
      accessibleLabel="Search templates"
      transform={(template) => (
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
      )}
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
      footer={
        permissions.createTemplates && (
          <Link component={RouterLink} to="/templates">
            See all templates
          </Link>
        )
      }
    />
  );
}
