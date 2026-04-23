import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Sercha Documentation',
  tagline: 'Self-hosted search across all your team\'s tools',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://docs.sercha.dev',
  baseUrl: '/',
  trailingSlash: false,

  organizationName: 'sercha-oss',
  projectName: 'sercha-oss-docs',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid', 'docusaurus-theme-openapi-docs'],

  plugins: [
    // Documentation (guides, quickstart, config)
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'guides',
        path: 'docs/guides',
        routeBasePath: 'docs',
        sidebarPath: require.resolve('./sidebars-guides.js'),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      },
    ],
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
    // Connectors (per-source setup guides)
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'connectors',
        path: 'docs/connectors',
        routeBasePath: 'connectors',
        sidebarPath: require.resolve('./sidebars-connectors.js'),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      },
    ],
    // OpenAPI docs generator
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'api-docs',
        docsPluginId: 'api',
        config: {
          sercha: {
            specPath: './openapi/swagger.yaml',
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
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/sercha-oss/sercha-oss-docs/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
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
          to: '/docs',
          label: 'Documentation',
          position: 'left',
        },
        {
          to: '/api/sercha-core-api',
          label: 'API Reference',
          position: 'left',
        },
        {
          to: '/connectors',
          label: 'Connectors',
          position: 'left',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://discord.gg/Hpj7e6k6Et',
          position: 'right',
          className: 'header-discord-link',
          'aria-label': 'Discord community',
        },
        {
          href: 'https://github.com/sercha-oss/sercha-core',
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
            {label: 'Quickstart', to: '/docs/quickstart'},
            {label: 'Configuration', to: '/docs/configuration'},
            {label: 'API Reference', to: '/api/sercha-core-api'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Discord', href: 'https://discord.gg/Hpj7e6k6Et'},
            {label: 'GitHub', href: 'https://github.com/sercha-oss/sercha-core'},
            {label: 'Issues', href: 'https://github.com/sercha-oss/sercha-core/issues'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'Blog', to: '/blog'},
          ],
        },
      ],
      copyright: `Copyright \u00A9 ${new Date().getFullYear()} Sercha. Licensed under Apache 2.0.`,
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
