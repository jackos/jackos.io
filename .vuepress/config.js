const path = require('path');
const { gitPlugin } = require('@vuepress/plugin-git');
const { defaultTheme } = require('@vuepress/theme-default');
const { sitemapPlugin } = require('vuepress-plugin-sitemap2');
const { backToTopPlugin } = require('@vuepress/plugin-back-to-top');
const { mediumZoomPlugin } = require('@vuepress/plugin-medium-zoom');

const compareDate = (dateA, dateB) => {
  if (!dateA || !(dateA instanceof Date)) return 1;
  if (!dateB || !(dateB instanceof Date)) return -1;

  return dateB.getTime() - dateA.getTime();
};

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
    ['link', { rel: 'icon', href: '/images/logo.svg' }],
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
    logo: '/images/logo.svg',
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
        ],
        sidebar: [
          '/rust-kernel/rust-for-linux.md',
        ],
      },
    },
  }),
  plugins: [
    gitPlugin(),
    backToTopPlugin(),
    mediumZoomPlugin(),
    // docsearchPlugin({
    //   appId: 'GHCTOYCW6T',
    //   indexName: 'nushell',
    //   apiKey: 'dd6a8f770a42efaed5befa429d167232',
    // }),
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
