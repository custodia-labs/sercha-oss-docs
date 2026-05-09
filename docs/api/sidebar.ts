import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "sercha-core-api",
    },
    {
      type: "category",
      label: "Admin",
      items: [
        {
          type: "doc",
          id: "list-job-history",
          label: "List job history",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-job-details",
          label: "Get job details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-job-statistics",
          label: "Get job statistics",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-upcoming-jobs",
          label: "Get upcoming jobs",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "trigger-reindex",
          label: "Trigger reindex",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "get-search-analytics",
          label: "Get search analytics",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-search-history",
          label: "Get search history",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-search-metrics",
          label: "Get search metrics",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-admin-statistics",
          label: "Get admin statistics",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Authentication",
      items: [
        {
          type: "doc",
          id: "user-login",
          label: "User login",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "logout-user",
          label: "Logout user",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "refresh-token",
          label: "Refresh token",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Capabilities",
      items: [
        {
          type: "doc",
          id: "get-capabilities",
          label: "Get capabilities",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-capability-preferences",
          label: "Get capability preferences",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-capability-preferences",
          label: "Update capability preferences",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "Connections",
      items: [
        {
          type: "doc",
          id: "list-connections",
          label: "List connections",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "create-connection",
          label: "Create connection",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "delete-connection",
          label: "Delete connection",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "get-connection",
          label: "Get connection",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "list-containers",
          label: "List containers",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-connection-sources",
          label: "Get connection sources",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "test-connection",
          label: "Test connection",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Documents",
      items: [
        {
          type: "doc",
          id: "get-document",
          label: "Get document",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "open-document",
          label: "Open document",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Health",
      items: [
        {
          type: "doc",
          id: "health-check",
          label: "Health check",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "readiness-check",
          label: "Readiness check",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-api-version",
          label: "Get API version",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Users",
      items: [
        {
          type: "doc",
          id: "get-current-user",
          label: "Get current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "list-all-users",
          label: "List all users",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "create-user",
          label: "Create user",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "delete-user",
          label: "Delete user",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "get-user",
          label: "Get user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-user",
          label: "Update user",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "reset-user-password",
          label: "Reset user password",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "OAuth",
      items: [
        {
          type: "doc",
          id: "start-o-auth-authorization",
          label: "Start OAuth authorization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "o-auth-callback",
          label: "OAuth callback",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Providers",
      items: [
        {
          type: "doc",
          id: "list-providers",
          label: "List providers",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Search",
      items: [
        {
          type: "doc",
          id: "search-documents",
          label: "Search documents",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Settings",
      items: [
        {
          type: "doc",
          id: "get-settings",
          label: "Get settings",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-settings",
          label: "Update settings",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "AI Settings",
      items: [
        {
          type: "doc",
          id: "get-ai-settings",
          label: "Get AI settings",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-ai-settings",
          label: "Update AI settings",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "get-ai-providers",
          label: "Get AI providers",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-ai-status",
          label: "Get AI status",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "test-ai-connection",
          label: "Test AI connection",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Setup",
      items: [
        {
          type: "doc",
          id: "initial-setup",
          label: "Initial setup",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "get-setup-status",
          label: "Get setup status",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Sources",
      items: [
        {
          type: "doc",
          id: "list-sources",
          label: "List sources",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "create-source",
          label: "Create source",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "delete-source",
          label: "Delete source",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "get-source",
          label: "Get source",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-source",
          label: "Update source",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "update-source-containers",
          label: "Update source containers",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "disable-source",
          label: "Disable source",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "list-source-documents",
          label: "List source documents",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "enable-source",
          label: "Enable source",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "list-failing-documents-for-a-source",
          label: "List failing documents for a source",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-sync-state-for-source",
          label: "Get sync state for source",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "trigger-sync",
          label: "Trigger sync",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "list-sync-states",
          label: "List sync states",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
