import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  image: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Local First',
    image: require('@site/static/img/icon-purple.png').default,
    description: (
      <>
        Sercha runs entirely on your machine. Your data stays local, fully under
        your control, with no external dependencies or cloud services required.
      </>
    ),
  },
  {
    title: 'Flexible Architecture',
    image: require('@site/static/img/icon-black.png').default,
    description: (
      <>
        Whether you're using Sercha via the CLI, integrating the Core engine into
        your own applications, or extending it with connectors, the system is
        designed to remain modular, composable, and easy to reason about.
      </>
    ),
  },
  {
    title: 'Built for Developers',
    image: require('@site/static/img/icon-grey.png').default,
    description: (
      <>
        Open source to the core. Sercha is built by developers, for developers,
        with a focus on extensibility and transparency.
      </>
    ),
  },
];

function Feature({title, image, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={image} className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
