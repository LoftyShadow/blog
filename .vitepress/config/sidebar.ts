// @ts-ignore
import {Sidebar} from "vitepress/types/default-theme";

export const sidebar: Sidebar = {
    "/mysql/": [
        {
            text: "MySQL的MVCC",
            link: "/mysql/MySQL的MVCC.md",
        },
        {
            text: "MySQL的Explain执行计划",
            link: "/mysql/MySQL的Explain执行计划.md",
        },
        {
            text: "MySQL索引失效",
            link: "/mysql/MySQL索引失效.md",
        },
        {
            text: "MySQL查询优化",
            link: "/mysql/MySQL查询优化.md",
        },
        {
            text: "MySQL日志整理",
            link: "/mysql/MySQL日志整理.md",
        },
        {
            text: "Mysql常用函数整理",
            link: "/mysql/MySQL常用函数整理.md",
        },
        {
            text: "MySQL测试大量数据的COUNT",
            link: "/mysql/MySQL测试大量数据的COUNT.md",
        },
        {
            text: "MySQL的索引相关概念",
            link: "/mysql/MySQL的索引相关概念.md",
        },
        {
            text: "MySQL为什么使用B+树做索引",
            link: "/mysql/MySQL为什么使用B+树做索引.md",
        },
        {
            text: "MySQL的页分裂",
            link: "/mysql/MySQL的页分裂.md",
        },
        {
            text: "MySQL锁处理",
            link: "/mysql/MySQL锁处理.md",
        },
        {
            text: "MySQL可重复读隔离级别下如何解决幻读",
            link: "/mysql/MySQL可重复读隔离级别下如何解决幻读.md",
        },
        {
            text: "MySQL的mysqldump整理",
            link: "/mysql/MySQL的mysqldump整理.md",
        },
    ],
    "/docker/": [
        {
            text: "安装Docker",
            link: "/docker/安装Docker.md",
        },
        {
            text: "安装docker-compose",
            link: "/docker/安装Docker-compose.md",
        },
        {
            text: "Docker安装Mysql.md",
            link: "/docker/Docker安装Mysql.md",
        },
        {
            text: "Docker安装filebeat.md",
            link: "/docker/Docker安装filebeat.md",
        },
        {
            text: "Docker安装Redis.md",
            link: "/docker/Docker安装Redis.md",
        },
        {
            text: "Docker安装mongodb.md",
            link: "/docker/Docker安装mongodb.md",
        },
        {
            text: "Docker安装Nacos",
            link: "/docker/Docker安装Nacos.md",
        },
        {
            text: "Docker安装PostgreSQL",
            link: "/docker/Docker安装PostgreSQL.md",
        },
        {
            text: "Docker安装RabbitMQ",
            link: "/docker/Docker安装RabbitMQ.md",
        },
        {
            text: "Docker安装ElasticSearch",
            link: "/docker/Docker安装ElasticSearch.md",
        },
        {
            text: "Docker安装Kibana",
            link: "/docker/Docker安装Kibana.md",
        },
        {
            text: "Docker安装Canal",
            link: "/docker/Docker安装Canal.md",
        },
        {
            text: "Docker安装ExcaliDraw",
            link: "/docker/Docker安装ExcaliDraw.md",
        },
        {
            text: "Docker制作镜像Dockerfile编写",
            link: "/docker/Docker制作镜像Dockerfile编写.md",
        },
        {
            text: "Docker日志查看技巧",
            link: "/docker/Docker日志查看技巧.md",
        },
    ],
    "/idea/": [
        {
            text: "模板Live Templates",
            link: "/idea/Idea的liveTemplates整理.md",
        },
        {
            text: "后缀补全Postfix Completion",
            link: "/idea/Idea后缀补全Postfix Completion整理.md",
        },
        {
            text: "注册表Registry配置",
            link: "/idea/Idea注册表配置整理.md",
        },
        {
            text: "Idea插件整理",
            link: "/idea/Idea插件整理.md",
        },
        {
            text: "IdeaVim配置",
            link: "/idea/IdeaVim配置.md",
        },
    ],
    "/wsl/": [
        {
            text: "WSL安装整理",
            link: "/wsl/WSL安装整理.md",
        },
        {
            text: "WSL支持systemctl命令",
            link: "/wsl/WSL支持systemctl命令.md",
        },
        {
            text: "WSL实现桥接网络并固定IP地址",
            link: "/wsl/WSL实现桥接网络并固定IP地址.md",
        },
        {
            text: "WSL已知错误整理",
            link: "/wsl/已知错误整理.md",
        },
    ],
    "/article/": [
        {
            text: "jq常用命令",
            link: "/article/jq常用命令.md",
        },
        {
            text: "Rclone使用指南",
            link: "/article/Rclone使用指南.md",
        },
        {
            text: "Zsh安装",
            link: "/article/Zsh安装.md",
        },
        {
            text: "Nushell安装",
            link: "/article/Nushell安装",
        },
        {
            text: "MSYS2安装gcc、gmake",
            link: "/article/MSYS2安装gcc、gmake.md",
        },
        {
            text: "Apifox自动更新请求token",
            link: "/article/Apifox自动更新请求token.md",
        },
        {
            text: "Github使用ssh连接",
            link: "/article/Github使用ssh连接.md",
        },
        {
            text: "Git Worktree使用指南",
            link: "/article/Git Worktree使用指南.md",
        },
        {
            text: "xxl-job整理",
            link: "/article/xxl-job整理.md",
        },
        {
            text: "termux整理",
            link: "/article/termux整理.md",
        },
        {
            text: "Rust环境安装",
            link: "/article/Rust环境安装.md",
        },
        {
            text: "Windows耳机插孔选择错误更改",
            link: "/article/Windows耳机插孔选择错误更改.md",
        },
        {
            text: "解决windows自动安装英语(英文)输入法",
            link: "/article/解决windows自动安装英语(英文)输入法.md",
        },
        {
            text: "Window设置应用开机自启",
            link: "/article/Window设置应用开机自启.md",
        },
        {
            text: "Winodws添加neovide到右键",
            link: "/article/Winodws添加neovide到右键.md",
        },
        {
            text: "Win11关闭WindowsDefender实时保护",
            link: "/article/Win11关闭WindowsDefender实时保护.md",
        }
    ],
    "/java/": [
        {
            text: "Java",
            collapsed: false,
            items: [
                {
                    text: "常用的JVM参数和命令",
                    link: "/java/java/常用的JVM参数和命令.md",
                },
                {
                    text: "Java阻塞队列整理",
                    link: "/java/java/Java阻塞队列整理.md",
                },
                {
                    text: "ConcurrentHashMap设计",
                    link: "/java/java/ConcurrentHashMap设计.md",
                },
                {
                    text: "垃圾回收算法整理",
                    link: "/java/java/垃圾回收算法整理.md",
                },
                {
                    text: "经典垃圾收集器",
                    link: "/java/java/经典垃圾收集器.md",
                },
                {
                    text: "OSI七层协议",
                    link: "/java/java/OSI七层协议.md",
                },
                {
                    text: "三次握手和四次挥手",
                    link: "/java/java/三次握手和四次挥手.md",
                },
                {
                    text: "JVM类加载器和类加载过程",
                    link: "/java/java/JVM类加载器和类加载过程.md",
                },
                {
                    text: "订单超时自动取消方案",
                    link: "/java/java/订单超时自动取消方案.md",
                },
                {
                    text: "AQS整理",
                    link: "/java/java/AQS整理.md",
                },
            ],
        },
        {
            text: "多线程相关",
            collapsed: false,
            items: [
                {
                    text: "线程池相关",
                    link: "/java/多线程相关/线程池相关.md",
                },
                {
                    text: "线程的五种状态",
                    link: "/java/多线程相关/线程的五种状态.md",
                },
                {
                    text: "Synchronized和lock区别",
                    link: "/java/多线程相关/Synchronized和lock区别.md",
                },
                {
                    text: "线程间通信方式",
                    link: "/java/多线程相关/线程间通信方式.md",
                },
                {
                    text: "ThreadLocal整理",
                    link: "/java/多线程相关/ThreadLocal整理.md",
                },
            ],
        },
        {
            text: "Redis",
            collapsed: false,
            items: [
                {
                    text: "Redis过期删除策略与内存淘汰策略",
                    link: "/java/Redis/Redis过期删除策略与内存淘汰策略.md",
                },
                {
                    text: "Redis常见缓存问题",
                    link: "/java/Redis/Redis常见缓存问题.md",
                },
                {
                    text: "Redis的ZSET设计",
                    link: "/java/Redis/Redis的ZSET设计.md",
                },
                {
                    text: "Redis过期命令执行流程",
                    link: "/java/Redis/Redis的不同数据类型及使用场景.md",
                },
                {
                    text: "Redis的不同数据类型及使用场景",
                    link: "/java/Redis/Redis的不同数据类型及使用场景.md",
                },
            ],
        },
        {
            text: "ElasticSearch",
            collapsed: false,
            items: [
                {
                    text: "ES自定义ik分词配置",
                    link: "/java/ElasticSearch/ES自定义ik分词配置.md",
                },
            ],
        },
        {
            text: "ORM",
            collapsed: false,
            items: [
                {
                    text: "JPA使用整合",
                    link: "/java/ORM/JPA使用整合.md",
                },
            ],
        },
        {
            text: "微服务",
            collapsed: false,
            items: [
                {
                    text: "Nacos做配置中心",
                    link: "/java/微服务/Nacos做配置中心.md",
                },
                {
                    text: "微服务拆分整理",
                    link: "/java/微服务/微服务拆分整理.md",
                },
            ],
        },
        {
            text: "Spring",
            collapsed: false,
            items: [
                {
                    text: "Sping解决循环依赖",
                    link: "/java/Spring/Sping解决循环依赖.md",
                },
                {
                    text: "Spring的IOC和Bean的生命周期",
                    link: "/java/Spring/Spring的IOC和Bean的生命周期.md",
                },
                {
                    text: "Spring的事务及传播机制",
                    link: "/java/Spring/Spring的事务及传播机制.md",
                },
                {
                    text: "Spring常用注解",
                    link: "/java/Spring/Spring常用注解.md",
                },
                {
                    text: "Spring的拦截器和Servlet的过滤器适合场景",
                    link: "/java/Spring/Spring的拦截器和Servlet的过滤器适合场景.md",
                },
                {
                    text: "Spring的@Cacheable原理",
                    link: "/java/Spring/Spring的@Cacheable原理.md",
                },
            ],
        },
        // {
        //     text: 'RabbitMQ',
        //     items: [
        //
        //         {
        //             text: 'RabbitMQ防止消息丢失',
        //             link: '/java/RabbitMQ防止消息丢失.md',
        //         },
        //     ]
        // }
    ],
    "/cicd/": [
        {
            text: "Jenkins部署项目",
            link: "/cicd/Jenkins部署项目.md",
        },
    ],
    "/utils/": [
        {
            text: "Utils工具类",
            collapsed: false,
            items: [
                {
                    text: "计算工具类ArithUtils",
                    link: "/utils/Utils工具类/计算工具类ArithUtils.md",
                },
                {
                    text: "日期工具类DateUtils",
                    link: "/utils/Utils工具类/日期工具类DateUtils.md",
                },
                {
                    text: "序列化工具类JacksonUtils",
                    link: "/utils/Utils工具类/序列化工具类JacksonUtils.md",
                },
                {
                    text: "SpringContextUtils",
                    link: "/utils/Utils工具类/SpringContextUtils.md",
                },
                {
                    text: "ThreadLocalUtils",
                    link: "/utils/Utils工具类/ThreadLocalUtils.md",
                },
            ]
        },
        {
            text: "Config配置类",
            collapsed: false,
            items: [
                {
                    text: "RedisConfig配置",
                    link: "/utils/Config配置类/RedisConfig.md",
                },
                {
                    text: "SpringCorsConfig配置",
                    link: "/utils/Config配置类/SpringCorsConfig配置.md",
                },
            ]
        }],
    "/leetcode/": [
        {
            text: "一维动态规划",
            collapsed: false,
            activeMatch: "/leetcode/one-dimensionalDynamicProgramming/",
            items: [
                {
                    text: "爬楼梯",
                    link: "/leetcode/one-dimensionalDynamicProgramming/爬楼梯climbStairs.md",
                },
                {
                    text: "打家劫舍",
                    link: "/leetcode/one-dimensionalDynamicProgramming/打家劫舍rob.md",
                },
            ],
        },
        {
            text: "二分查找",
            collapsed: false,
            activeMatch: "/leetcode/binarySearch/",
            items: [
                {
                    text: "搜索插入位置",
                    link: "/leetcode/binarySearch/搜索插入位置searchInsert.md",
                },
                {
                    text: "寻找峰值",
                    link: "/leetcode/binarySearch/寻找峰值findPeakElement.md",
                },
            ],
        },
        {
            text: "双指针",
            collapsed: false,
            activeMatch: "/leetcode/dualPointers/",
            items: [
                {
                    text: "验证回文串",
                    link: "/leetcode/dualPointers/验证回文串isPalindrome.md",
                },
                {
                    text: "是否子序列",
                    link: "/leetcode/dualPointers/isSubsequence.md",
                },
            ],
        },
    ],
};
