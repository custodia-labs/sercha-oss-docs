---
id: overview
sidebar_position: 1
title: Connectors
slug: /
---

# Connectors

Connectors integrate external data sources with Sercha. Each connector handles authentication, fetching content, and detecting changes for incremental sync.

## Available

<div className="feature-grid">
  <div className="connector-card">
    <img src="/assets/logos/github/github_icon.png" alt="GitHub" />
    <div className="connector-card-body">
      <strong><a href="/connectors/github">GitHub</a></strong>
      <span>Repositories, code, markdown, issues, and pull requests. Authenticates via OAuth.</span>
    </div>
  </div>
  <div className="connector-card">
    <div className="connector-card-body">
      <strong><a href="/connectors/localfs">Local Filesystem</a></strong>
      <span>Files from a server-side directory. Useful for development and testing.</span>
    </div>
  </div>
  <div className="connector-card">
    <img src="/assets/logos/notion/notion_icon.png" alt="Notion" />
    <div className="connector-card-body">
      <strong><a href="/connectors/notion">Notion</a></strong>
      <span>Pages, databases, and nested content. Authenticates via OAuth.</span>
    </div>
  </div>
  <div className="connector-card">
    <img src="/assets/logos/microsoft/microsoft_onedrive_icon.png" alt="OneDrive" />
    <div className="connector-card-body">
      <strong><a href="/connectors/onedrive">OneDrive</a></strong>
      <span>Files and folders from personal OneDrive. Incremental sync via Microsoft Graph delta queries. Authenticates via OAuth.</span>
    </div>
  </div>
</div>

## Planned

These connectors are tracked as GitHub issues. Contributions welcome.

| Connector | Issue | Auth |
|-----------|-------|------|
| <img className="connector-logo" src="/assets/logos/gitlab/gitlab_log.png" alt="GitLab" /> GitLab | [#36](https://github.com/sercha-oss/sercha-core/issues/36) | OAuth |
| <img className="connector-logo" src="/assets/logos/dropbox/dropbox_icon.png" alt="Dropbox" /> Dropbox | [#37](https://github.com/sercha-oss/sercha-core/issues/37) | OAuth |
| <img className="connector-logo" src="/assets/logos/linear/linear_icon.svg" alt="Linear" /> Linear | [#38](https://github.com/sercha-oss/sercha-core/issues/38) | OAuth |
| <img className="connector-logo" src="/assets/logos/figma/figma_icon.svg" alt="Figma" /> Figma | [#39](https://github.com/sercha-oss/sercha-core/issues/39) | OAuth |
| <img className="connector-logo" src="/assets/logos/asana/asana-icon.svg" alt="Asana" /> Asana | [#40](https://github.com/sercha-oss/sercha-core/issues/40) | OAuth |
| <img className="connector-logo" src="/assets/logos/miro/miro-icon.svg" alt="Miro" /> Miro | [#41](https://github.com/sercha-oss/sercha-core/issues/41) | OAuth |
| <img className="connector-logo" src="/assets/logos/google/google_drive_icon.png" alt="Google Drive" /> Google Drive | [#43](https://github.com/sercha-oss/sercha-core/issues/43) | OAuth (Google) |
| <img className="connector-logo" src="/assets/logos/google/google_drive_icon.png" alt="Google Docs" /> Google Docs | [#43](https://github.com/sercha-oss/sercha-core/issues/43) | OAuth (Google) |
| <img className="connector-logo" src="/assets/logos/atlassian/confluence.svg" alt="Confluence" /> Confluence | [#45](https://github.com/sercha-oss/sercha-core/issues/45) | OAuth (Atlassian) |
| <img className="connector-logo" src="/assets/logos/atlassian/jira.svg" alt="Jira" /> Jira | [#45](https://github.com/sercha-oss/sercha-core/issues/45) | OAuth (Atlassian) |
