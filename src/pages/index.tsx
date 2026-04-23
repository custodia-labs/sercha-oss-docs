import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={styles.hero}>
      <div className="container">
        <img
          src="/img/sercha-logo.png"
          alt="Sercha"
          className={styles.heroLogo}
        />
        <Heading as="h1" className={styles.heroTitle}>
          Search everything your team uses.
        </Heading>
        <p className={styles.heroSubtitle}>
          Self-hosted unified search across GitHub, Google Drive, Notion, and more.
          Connect your data sources, index content, and search from one API.
        </p>
      </div>
    </header>
  );
}

type QuickLinkItem = {
  title: string;
  to: string;
  description: string;
  icon: string;
};

const quickLinks: QuickLinkItem[] = [
  {
    title: 'Quickstart',
    to: '/docs/quickstart',
    description: 'Get Sercha running locally with Docker Compose in a few minutes.',
    icon: '>>',
  },
  {
    title: 'API Reference',
    to: '/api/sercha-core-api',
    description: 'Full REST API documentation with interactive examples.',
    icon: '{}',
  },
  {
    title: 'Connectors',
    to: '/connectors',
    description: 'GitHub, local filesystem, and more. See all supported data sources.',
    icon: '<>',
  },
  {
    title: 'Configuration',
    to: '/docs/configuration',
    description: 'Environment variables, AI providers, and deployment options.',
    icon: '#_',
  },
];

function QuickLinks() {
  return (
    <section className={styles.quickLinks}>
      <div className="container">
        <div className={styles.quickLinksGrid}>
          {quickLinks.map((link) => (
            <Link key={link.title} to={link.to} className={styles.quickLinkCard}>
              <span className={styles.quickLinkIcon}>{link.icon}</span>
              <div>
                <Heading as="h3" className={styles.quickLinkTitle}>{link.title}</Heading>
                <p className={styles.quickLinkDesc}>{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

type ValuePropItem = {
  title: string;
  description: string;
};

const valueProps: ValuePropItem[] = [
  {
    title: 'Self-Hosted',
    description: 'Your data stays on your infrastructure. Deploy with Docker Compose and keep full control over your search index.',
  },
  {
    title: 'Unified Search',
    description: 'Connect GitHub, Google Drive, Notion, and more. Search across all your team\'s data sources from a single API.',
  },
  {
    title: 'Built for Developers',
    description: 'REST API with OpenAPI spec, OAuth2 connectors, and a plugin architecture for adding new data sources.',
  },
];

function ValueProps() {
  return (
    <section className={styles.valueProps}>
      <div className="container">
        <div className={styles.valuePropsGrid}>
          {valueProps.map((prop) => (
            <div key={prop.title} className={styles.valuePropCard}>
              <Heading as="h3" className={styles.valuePropTitle}>{prop.title}</Heading>
              <p className={styles.valuePropDesc}>{prop.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpenSource() {
  return (
    <section className={styles.openSource}>
      <div className="container">
        <Heading as="h2" className={styles.openSourceTitle}>Open Source</Heading>
        <p className={styles.openSourceDesc}>
          Sercha is licensed under Apache 2.0. Contributions, issues, and feedback are welcome.
        </p>
        <div className={styles.openSourceLinks}>
          <Link className={clsx('button button--primary', styles.heroBtn)} href="https://github.com/sercha-oss/sercha-core">
            GitHub
          </Link>
          <Link className={clsx('button button--secondary', styles.heroBtn)} href="https://discord.gg/Hpj7e6k6Et">
            Discord
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Sercha - Self-hosted unified search"
      description="Self-hosted search across all your team's tools. Connect GitHub, Google Drive, Notion, and more.">
      <HomepageHeader />
      <main>
        <QuickLinks />
        <ValueProps />
        <OpenSource />
      </main>
    </Layout>
  );
}
