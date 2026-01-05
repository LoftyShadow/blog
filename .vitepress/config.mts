import { defineConfig } from 'vitepress'
import {nav} from "./config/navbar";
import {sidebar} from "./config/sidebar";
import taskList from 'markdown-it-task-lists'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/blog/',
  lang: 'zh-CN',
  title: 'Blog',
  description: '基于VitePress个人博客整理站点',
  head: [['link', {rel: 'icon', href: '/blog/icons/favicon.ico'}]],
  ignoreDeadLinks: true,
  themeConfig: {
    logo: '/icons/favicon.ico',
    //默认主题所有配置请写在这里！！！
    nav,
    sidebar,
    socialLinks: [{ icon: 'github', link: 'https://github.com/loftyshadow/blog' }],
    // 设置搜索框的样式
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "无法找到相关结果",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
            },
          },
        },
      },
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present LoftyShadow'
    },
    outline: {
      level: [1, 5], // 设置目录层级
      label: '页面导航', // 自定义标题
    }
  },
  markdown: {
    math: true,
    lineNumbers: true, // 显示代码行数
    config: (md) => {
      md.use(taskList)
    }
  },
})
