# Spring Boot 自动配置原理

Spring Boot 自动配置的核心目标是：根据 classpath 中的依赖、配置文件和条件注解，自动创建一批默认 Bean，减少手动配置。

---

## 1. `@SpringBootApplication`

启动类常见注解：

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

`@SpringBootApplication` 是组合注解，主要包含：

```text
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan
```

---

## 2. 三个核心注解

### 2.1 `@SpringBootConfiguration`

本质上是 `@Configuration`，表示当前类是配置类。

### 2.2 `@ComponentScan`

扫描启动类所在包及其子包下的组件，例如：

*   `@Controller`
*   `@Service`
*   `@Repository`
*   `@Component`

### 2.3 `@EnableAutoConfiguration`

开启自动配置，是 Spring Boot 自动配置的关键。

---

## 3. 自动配置类从哪里来

Spring Boot 会从约定位置加载自动配置候选类。

Spring Boot 2.7+ 和 3.x 中，主要使用：

```text
META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

文件中每一行是一个自动配置类全限定名。

旧版本中常见的是：

```text
META-INF/spring.factories
```

理解版本差异时可以这样记：新版本更推荐 `AutoConfiguration.imports`，旧版本大量使用 `spring.factories`。

---

## 4. 自动配置的加载流程

简化流程：

```text
启动 Spring Boot 应用
  -> @SpringBootApplication
  -> @EnableAutoConfiguration
  -> 加载 AutoConfiguration.imports 中的自动配置类
  -> 根据条件注解决定是否生效
  -> 创建默认 Bean
  -> 用户自定义 Bean 优先覆盖默认配置
```

自动配置不是无脑全部生效，而是要经过条件判断。

---

## 5. 条件装配

常见条件注解：

| 注解 | 含义 |
| :--- | :--- |
| `@ConditionalOnClass` | classpath 中存在某个类时生效 |
| `@ConditionalOnMissingClass` | classpath 中不存在某个类时生效 |
| `@ConditionalOnBean` | 容器中存在某个 Bean 时生效 |
| `@ConditionalOnMissingBean` | 容器中不存在某个 Bean 时生效 |
| `@ConditionalOnProperty` | 配置项满足条件时生效 |
| `@ConditionalOnWebApplication` | Web 应用环境下生效 |

例如：

```java
@ConditionalOnClass(DataSource.class)
@ConditionalOnMissingBean(DataSource.class)
```

含义是：classpath 中有 `DataSource`，并且用户没有自定义 `DataSource` Bean 时，Spring Boot 才创建默认 Bean。

---

## 6. Starter 的作用

starter 本身通常不写业务代码，它主要做依赖聚合。

例如加入：

```xml
spring-boot-starter-web
```

会间接引入：

*   Spring MVC。
*   嵌入式 Web 容器。
*   JSON 序列化。
*   校验等相关依赖。

有了依赖后，自动配置类再根据 classpath 和配置项创建对应 Bean。

---

## 7. 用户配置如何覆盖默认配置

Spring Boot 的自动配置通常遵循：

```text
用户自定义优先
自动配置兜底
```

常见方式：

*   自己声明同类型 Bean。
*   在 `application.yml` 中配置属性。
*   排除某个自动配置类。

排除示例：

```java
@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)
```

---

## 8. 自动配置报告

排查自动配置是否生效，可以开启 debug：

```properties
debug=true
```

启动日志会输出条件匹配报告，能看到哪些自动配置生效、哪些没有生效。

---

## 9. 自定义 Starter 思路

一个简单 starter 通常包含：

```text
order-spring-boot-starter
order-spring-boot-autoconfigure
```

核心步骤：

1. 定义配置属性类，例如 `XxxProperties`。
2. 定义自动配置类，例如 `XxxAutoConfiguration`。
3. 使用条件注解控制是否生效。
4. 在 `AutoConfiguration.imports` 中声明自动配置类。
5. starter 模块聚合依赖。

---

## 10. 理解检查

**Spring Boot 为什么能做到开箱即用？**

因为 starter 负责依赖聚合，自动配置类负责根据条件创建默认 Bean，配置属性负责让默认 Bean 可调整。

**自动配置会不会覆盖用户自己的 Bean？**

通常不会。大量自动配置会使用 `@ConditionalOnMissingBean`，用户自定义 Bean 优先。

**`spring.factories` 和 `AutoConfiguration.imports` 的关系？**

`spring.factories` 是旧版本常见加载方式，Spring Boot 2.7+ 开始引入并推荐 `AutoConfiguration.imports` 作为自动配置候选类声明方式。

---

## 11. 总结

Spring Boot 自动配置可以概括为：starter 引入依赖，`@EnableAutoConfiguration` 加载自动配置候选类，条件注解决定是否创建 Bean，用户配置和自定义 Bean 覆盖默认行为。
