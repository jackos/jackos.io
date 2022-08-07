const path = require('path');
const { googleAnalyticsPlugin } = require('@vuepress/plugin-google-analytics')
const { defaultTheme } = require('@vuepress/theme-default');
const { sitemapPlugin } = require('vuepress-plugin-sitemap2');

module.exports = {
  locales: {
    '/': {
      lang: 'English',
      title: 'JackOS',
      description: 'Programming and OS Tutorials',
    },
  },
  head: [
    ['meta', { name: 'theme-color', content: '#3264FF' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
    ],
    ['link', { rel: 'icon', href: '/images/logo_black.svg' }],
  ],
  markdown: {
    code: {
      lineNumbers: false,
    },
    importCode: {
      handleImportPath: (str) =>
        str.replace(/^@snippets/, path.resolve(__dirname, '../snippets')),
    },
  },
  theme: defaultTheme({
    logo: '/images/logo_black.svg',
    repo: 'jackos/jackos.github.io',
    repoLabel: 'GitHub',
    editLinks: true,
    docsRepo: 'jackos/jackos.github.io',
    docsBranch: 'main',
    lastUpdated: false,
    locales: {
      '/': {
        selectText: 'Languages',
        selectLanguageName: 'English',
        editLinkText: 'Edit this page on GitHub',
        navbar: [
          { text: 'Tutorials', link: '/rust-kernel/rust-for-linux.md' },
          { text: 'Rust Reference', link: '/rust-reference/error-result.md' },
        ],
        sidebar: [
          {
            text: "Tutorials",
            link: "/rust-kernel/rust-for-linux.md",
            children: [
              "/rust-kernel/rust-for-linux.md",
            ]
          },
          {
            text: "Reference",
            link: "/rust-reference/error-result.md",
            children: [
              "/rust-reference/error-result.md",
            ],
            collapsable: false,
          },

        ]
      },
    },
  }),
  plugins: [
    googleAnalyticsPlugin({
      id: 'G-THN55E7Q5Y',
    }),
    sitemapPlugin({
      hostname: 'https://www.jackos.io/',
    }),
  ],
  onPrepared: async (app) => {
    await app.writeTemp(
      'pages.js',
      `export default ${JSON.stringify(app.pages.map(({ data }) => data))}`
    );
  },
};
