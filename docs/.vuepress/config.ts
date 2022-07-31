import { defaultTheme } from '@vuepress/theme-default';
module.exports = {
  lang: 'en-US',
  title: 'JackOS',
  description: 'Programming tutorials',
  theme: defaultTheme({
    logo: '/images/logo.svg',
    logoDark: '/images/logo.svg',
    sidebar:
      [
        '/rust-kernel/rust-for-linux/',
      ]
  })
}
