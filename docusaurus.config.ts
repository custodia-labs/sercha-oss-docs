import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Sercha Documentation',
  tagline: 'Query your documents like a database',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://docs.sercha.dev',
  baseUrl: '/',
  trailingSlash: false,

  organizationName: 'sercha-oss',
  projectName: 'sercha-oss-docs',

  // 'throw' (the Docusaurus default) so a broken link fails the build rather
  // than shipping. The /blog link 404'd on all 74 pages under 'warn'.
  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid', 'docusaurus-theme-openapi-docs'],

  plugins: [
    // Documentation (guides, quickstart, config) - DISABLED.
    // These describe the retired sercha-core OSS search product: the framing is
    // wrong for the platform and parts reference internal detail. The markdown
    // stays in docs/guides/ for reference; re-enable this block once rewritten.
    // [
    //   '@docusaurus/plugin-content-docs',
    //   {
    //     id: 'guides',
    //     path: 'docs/guides',
    //     routeBasePath: 'docs',
    //     sidebarPath: require.resolve('./sidebars-guides.js'),
    //     showLastUpdateAuthor: true,
    //     showLastUpdateTime: true,
    //   },
    // ],
    // API Reference (auto-generated from OpenAPI spec)
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'api',
        path: 'docs/api',
        routeBasePath: 'api',
        sidebarPath: require.resolve('./sidebars-api.js'),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        docItemComponent: '@theme/ApiItem',
      },
    ],
    // Connectors (per-source setup guides) - DISABLED alongside the guides.
    // The OAuth walkthroughs are still broadly accurate but they frame Sercha
    // as a search product and advertise connectors that are not shipped.
    // [
    //   '@docusaurus/plugin-content-docs',
    //   {
    //     id: 'connectors',
    //     path: 'docs/connectors',
    //     routeBasePath: 'connectors',
    //     sidebarPath: require.resolve('./sidebars-connectors.js'),
    //     showLastUpdateAuthor: true,
    //     showLastUpdateTime: true,
    //   },
    // ],
    // SerchaQL - the query language reference and playground
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'serchaql',
        path: 'docs/serchaql',
        routeBasePath: 'serchaql',
        sidebarPath: require.resolve('./sidebars-serchaql.js'),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      },
    ],
    // OpenAPI docs generator.
    // Regenerate the source spec from sercha-enterprise with:
    //   swag init -g cmd/sercha-enterprise/main.go -o docs --parseDependency --parseInternal
    //   cp docs/swagger.yaml ../sercha-oss-docs/openapi/enterprise.yaml
    // then `npx docusaurus gen-api-docs all` here.
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'api-docs',
        docsPluginId: 'api',
        config: {
          sercha: {
            specPath: './openapi/enterprise.yaml',
            outputDir: 'docs/api',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          },
        },
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: false,
        // Blog is off until there are posts to publish. With it enabled but
        // empty, Docusaurus never generates /blog, so the navbar and footer
        // links to it 404'd on every page.
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/sercha-logo.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      logo: {
        alt: 'Sercha',
        src: 'img/sercha-logo.png',
      },
      items: [
        {
          to: '/serchaql/intro',
          label: 'SerchaQL',
          position: 'left',
        },
        {
          to: '/library',
          label: 'Library',
          position: 'left',
        },
        {
          to: '/api/sercha-enterprise-api',
          label: 'API Reference',
          position: 'left',
        },
        {
          href: 'https://discord.gg/Hpj7e6k6Et',
          position: 'right',
          className: 'header-discord-link',
          'aria-label': 'Discord community',
        },
        {
          href: 'https://sercha.dev',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'SerchaQL', to: '/serchaql/intro'},
            {label: 'Library', to: '/library'},
            {label: 'API Reference', to: '/api/sercha-enterprise-api'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Discord', href: 'https://discord.gg/Hpj7e6k6Et'},
            {label: 'Sercha', href: 'https://sercha.dev'},
          ],
        },
      ],
      copyright: `Copyright \u00A9 ${new Date().getFullYear()} Sercha.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['go', 'bash', 'json', 'yaml'],
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
