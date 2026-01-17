// @ts-ignore
import { NavItem } from "vitepress/types/default-theme";

export const nav: NavItem[] = [
  {
    text: "主页",
    link: "/",
  },
  {
    text: "Python整理",
    activeMatch: "^/python/",
    link: "/python/FastAPI快速入门.md",
  },
  {
    text: "Java整理",
    activeMatch: "^/java/",
    link: "/java/java/常用的JVM参数和命令.md",
  },
  {
    text: "CI/CD",
    activeMatch: "^/cicd/",
    link: "/cicd/Jenkins部署项目.md",
  },
  {
    text: "算法整理",
    activeMatch: "^/leetcode/",
    link: "/leetcode/menu.md",
  },
  {
    text: "书籍整理",
    activeMatch: "^/books/",
    link: "/books/menu.md",
  },
  {
    text: "文章整理",
    activeMatch: "^/article/",
    link: "/article/jq常用命令.md",
  },
  {
    text: "常用配置工具类整理",
    activeMatch: "^/utils/",
    link: "/utils/Utils工具类/计算工具类ArithUtils.md",
  },
  {
    text: "杂项",
    activeMatch: "^/snippets/",
    items: [
      {
        text: "常用软件",
        link: "/snippets/常用软件.md",
      },
      {
        text: "Chrome浏览器设置",
        link: "/snippets/Chrome浏览器设置.md",
      },
      {
        text: "油猴插件",
        link: "/snippets/油猴脚本.md",
      },
      {
        text: "双拼输入法",
        link: "/snippets/设置双拼输入法.md",
      },
      {
        text: "Idea整理",
        activeMatch: "^/idea/",
        link: "/idea/Idea的liveTemplates整理.md",
      },
    ],
  },
];
