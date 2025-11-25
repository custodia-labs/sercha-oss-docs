import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Sercha Documentation',
  tagline: 'Privacy-focused local search for your data',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.sercha.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  organizationName: 'custodia-labs',
  projectName: 'sercha-oss-docs',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    // CLI docs (versioned)
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'cli',
        path: 'docs/cli',
        routeBasePath: 'cli',
        sidebarPath: require.resolve('./sidebars-cli.js'),
        includeCurrentVersion: true,
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      },
    ],
    // Core docs (not versioned)
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'core',
        path: 'docs/core',
        routeBasePath: 'core',
        sidebarPath: require.resolve('./sidebars-core.js'),
        includeCurrentVersion: true,
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
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
            'https://github.com/custodia-labs/sercha-oss-docs/tree/main/',
          // Useful options to enforce blogging best practices
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
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Sercha',
      logo: {
        alt: 'Sercha Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'cliSidebar',
          docsPluginId: 'cli',
          position: 'left',
          label: 'CLI',
        },
        {
          type: 'docSidebar',
          sidebarId: 'coreSidebar',
          docsPluginId: 'core',
          position: 'left',
          label: 'Core',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/custodia-labs/sercha-cli',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'CLI',
              to: '/cli/intro',
            },
            {
              label: 'Core',
              to: '/core/intro',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'GitHub - CLI',
              href: 'https://github.com/custodia-labs/sercha-cli',
            },
            {
              label: 'GitHub - Core',
              href: 'https://github.com/custodia-labs/sercha-core',
            },
            {
              label: 'Report Issues',
              href: 'https://github.com/custodia-labs/sercha-cli/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Custodia Labs',
              href: 'https://custodialabs.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Custodia Labs. Licensed under Apache 2.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
