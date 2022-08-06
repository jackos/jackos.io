const path = require('path');
// const { gitPlugin } = require('@vuepress/plugin-git');
const { defaultTheme } = require('@vuepress/theme-default');
const { sitemapPlugin } = require('vuepress-plugin-sitemap2');
// const { backToTopPlugin } = require('@vuepress/plugin-back-to-top');
// const { mediumZoomPlugin } = require('@vuepress/plugin-medium-zoom');

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
          { text: 'Tutorials', link: '/tutorials/' },
          { text: 'Rust Reference', link: '/rust-reference/' },
          // { text: 'Blog', link: '/blog/' },
        ],
        sidebar: {
          '/rust-reference/': [
            {
              text: "Contents",
              link: "/rust-reference/README.md",
              collapsable: false,
            },
            {
              text: "Error",
              link: "/rust-reference/error.md",
              collapsable: false,
              children: [
                "/rust-reference/error-result.md"
              ]
            }
          ],
          '/tutorials/': [
            {
              text: "Contents",
              link: "/tutorials/README.md",
              collapsable: false,
            },
            {
              text: "Rust Linux Kernel Dev",
              link: "/tutorials/rust-linux-kernel.md",
              collapsable: false,
            }
          ]
        },
      },
    },
  }),
  plugins: [
    // gitPlugin(),
    // backToTopPlugin(),
    // mediumZoomPlugin(),
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
