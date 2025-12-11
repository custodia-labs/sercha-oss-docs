module.exports = {
  cliSidebar: [
    'overview',
    'quickstart',
    'supported-connectors',
    'basic-configuration',
    {
      type: 'category',
      label: 'Commands',
      link: { type: 'doc', id: 'commands/overview' },
      items: [
        'commands/search',
        'commands/source',
        'commands/document',
        'commands/sync',
        'commands/auth',
        'commands/settings',
        'commands/tui',
        'commands/mcp',
      ],
    },
    {
      type: 'category',
      label: 'Terminal UI',
      link: { type: 'doc', id: 'tui/overview' },
      items: [
        'tui/usage',
        'tui/architecture',
      ],
    },
    {
      type: 'category',
      label: 'AI Models',
      link: { type: 'doc', id: 'models/overview' },
      items: [
        {
          type: 'category',
          label: 'Embedding Models',
          link: { type: 'doc', id: 'models/embedding-models/overview' },
          items: [],
        },
        {
          type: 'category',
          label: 'Large Language Models',
          link: { type: 'doc', id: 'models/large-language-models/overview' },
          items: [],
        },
      ],
    },
    {
      type: 'category',
      label: 'Connectors',
      link: { type: 'doc', id: 'connectors/overview' },
      items: [
        'connectors/filesystem',
        'connectors/github',
        {
          type: 'category',
          label: 'Google',
          link: { type: 'doc', id: 'connectors/google/overview' },
          items: [
            'connectors/google/gmail',
            'connectors/google/drive',
            'connectors/google/calendar',
          ],
        },
      ],
    },
    'normalisers',
    {
      type: 'category',
      label: 'MCP',
      link: { type: 'doc', id: 'mcp/overview' },
      items: [],
    },
    {
      type: 'category',
      label: 'Architecture',
      link: { type: 'doc', id: 'architecture/overview' },
      items: [
        'architecture/layers',
        'architecture/data-flow',
        'architecture/storage-layer',
        'architecture/extensibility',
        'architecture/constraints',
      ],
    },
    {
      type: 'category',
      label: 'Advanced Configuration',
      link: { type: 'doc', id: 'advanced/overview' },
      items: [
        'advanced/storage',
        'advanced/scheduling',
        'advanced/pipeline',
      ],
    },
  ],
};
