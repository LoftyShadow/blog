# Logback 日志配置详解

## 概述

Logback 是 Spring Boot 默认的日志框架，通过 `logback-spring.xml` 配置文件可以实现灵活的日志管理。

## 基础配置结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 属性定义 -->
    <property name="LOG_PATH" value="logs"/>
    <property name="APP_NAME" value="myapp"/>

    <!-- Appender 定义 -->
    <!-- Logger 定义 -->
    <!-- Root Logger -->
</configuration>
```

## 完整配置示例

### 1. 基础配置（控制台 + 文件）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 日志存储路径 -->
    <property name="LOG_PATH" value="logs"/>
    <property name="APP_NAME" value="myapp"/>

    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 文件输出 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>

        <!-- 滚动策略 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${APP_NAME}-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>

    <!-- Root Logger -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

### 2. 分级日志配置（INFO/WARN/ERROR 分离）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_PATH" value="logs"/>
    <property name="APP_NAME" value="myapp"/>

    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- INFO 级别日志 -->
    <appender name="INFO_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}-info.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>

        <!-- 只记录 INFO 级别 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>INFO</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>

        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${APP_NAME}-info-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>

    <!-- WARN 级别日志 -->
    <appender name="WARN_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}-warn.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>

        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>WARN</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>

        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${APP_NAME}-warn-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>

    <!-- ERROR 级别日志 -->
    <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}-error.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>

        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>ERROR</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>

        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${APP_NAME}-error-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="INFO_FILE"/>
        <appender-ref ref="WARN_FILE"/>
        <appender-ref ref="ERROR_FILE"/>
    </root>
</configuration>
```

### 3. 多环境配置（开发/生产环境分离）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_PATH" value="logs"/>
    <property name="APP_NAME" value="myapp"/>

    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 文件输出 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${APP_NAME}-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>

    <!-- 开发环境配置 -->
    <springProfile name="dev">
        <root level="DEBUG">
            <appender-ref ref="CONSOLE"/>
        </root>
    </springProfile>

    <!-- 测试环境配置 -->
    <springProfile name="test">
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
            <appender-ref ref="FILE"/>
        </root>
    </springProfile>

    <!-- 生产环境配置 -->
    <springProfile name="prod">
        <root level="WARN">
            <appender-ref ref="FILE"/>
        </root>
    </springProfile>
</configuration>
```

## 配置项详解

### 1. Appender 类型

| Appender 类型 | 说明 | 使用场景 |
|--------------|------|---------|
| ConsoleAppender | 控制台输出 | 开发环境调试 |
| FileAppender | 文件输出（不滚动） | 简单日志记录 |
| RollingFileAppender | 滚动文件输出 | 生产环境（推荐） |

### 2. 日志级别

从低到高：`TRACE < DEBUG < INFO < WARN < ERROR`

- **TRACE**: 最详细的日志信息
- **DEBUG**: 调试信息
- **INFO**: 关键业务流程信息
- **WARN**: 警告信息
- **ERROR**: 错误信息

### 3. Pattern 格式说明

| 占位符 | 说明 | 示例 |
|-------|------|------|
| %d{pattern} | 日期时间 | %d{yyyy-MM-dd HH:mm:ss.SSS} |
| %thread | 线程名 | main |
| %level | 日志级别 | INFO |
| %-5level | 左对齐5字符日志级别 | INFO  |
| %logger{length} | Logger名称 | com.example.service |
| %msg | 日志消息 | 用户登录成功 |
| %n | 换行符 | \n |
| %class | 类名 | UserService |
| %method | 方法名 | login |
| %line | 行号 | 123 |

**常用 Pattern 示例:**

```xml
<!-- 简洁格式 -->
<pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>

<!-- 详细格式 -->
<pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} [%class:%line] - %msg%n</pattern>

<!-- 彩色输出（控制台） -->
<pattern>%d{HH:mm:ss.SSS} [%thread] %highlight(%-5level) %cyan(%logger{36}) - %msg%n</pattern>
```

### 4. 滚动策略配置

**按时间滚动:**

```xml
<rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
    <!-- 每天生成一个日志文件 -->
    <fileNamePattern>${LOG_PATH}/${APP_NAME}-%d{yyyy-MM-dd}.log</fileNamePattern>
    <!-- 保留30天 -->
    <maxHistory>30</maxHistory>
</rollingPolicy>
```

**按大小和时间滚动:**

```xml
<rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
    <fileNamePattern>${LOG_PATH}/${APP_NAME}-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
    <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
        <!-- 单个文件最大100MB -->
        <maxFileSize>100MB</maxFileSize>
    </timeBasedFileNamingAndTriggeringPolicy>
    <!-- 保留30天 -->
    <maxHistory>30</maxHistory>
    <!-- 总大小不超过10GB -->
    <totalSizeCap>10GB</totalSizeCap>
</rollingPolicy>
```

### 5. 过滤器配置

**级别过滤器（LevelFilter）:**

```xml
<filter class="ch.qos.logback.classic.filter.LevelFilter">
    <level>INFO</level>
    <onMatch>ACCEPT</onMatch>
    <onMismatch>DENY</onMismatch>
</filter>
```

**阈值过滤器（ThresholdFilter）:**

```xml
<!-- 只记录 WARN 及以上级别 -->
<filter class="ch.qos.logback.classic.filter.ThresholdFilter">
    <level>WARN</level>
</filter>
```

## 高级配置

### 1. 异步日志配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_PATH" value="logs"/>
    <property name="APP_NAME" value="myapp"/>

    <!-- 文件输出 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${APP_NAME}-%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>

    <!-- 异步输出 -->
    <appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
        <!-- 队列大小 -->
        <queueSize>512</queueSize>
        <!-- 丢弃阈值（队列剩余容量小于此值时开始丢弃TRACE/DEBUG/INFO日志） -->
        <discardingThreshold>0</discardingThreshold>
        <!-- 是否阻塞 -->
        <neverBlock>false</neverBlock>
        <appender-ref ref="FILE"/>
    </appender>

    <root level="INFO">
        <appender-ref ref="ASYNC_FILE"/>
    </root>
</configuration>
```

### 2. 特定包日志级别配置

```xml
<configuration>
    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 设置特定包的日志级别 -->
    <logger name="com.example.service" level="DEBUG"/>
    <logger name="com.example.mapper" level="DEBUG"/>

    <!-- 关闭 Spring 框架的 DEBUG 日志 -->
    <logger name="org.springframework" level="INFO"/>

    <!-- 关闭 MyBatis SQL 日志 -->
    <logger name="com.baomidou.mybatisplus" level="WARN"/>

    <!-- 开启 SQL 日志（开发环境） -->
    <logger name="com.example.mapper" level="DEBUG" additivity="false">
        <appender-ref ref="CONSOLE"/>
    </logger>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>
```

### 3. JSON 格式日志输出

```xml
<configuration>
    <appender name="JSON_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/app-json.log</file>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <!-- 自定义字段 -->
            <customFields>{"app":"myapp","env":"prod"}</customFields>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/app-json-%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>

    <root level="INFO">
        <appender-ref ref="JSON_FILE"/>
    </root>
</configuration>
```

**依赖（pom.xml）:**

```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

## 实际应用场景

### 1. 开发环境配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_PATH" value="logs"/>

    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %highlight(%-5level) %cyan(%logger{36}) - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 开启 SQL 日志 -->
    <logger name="com.example.mapper" level="DEBUG"/>

    <root level="DEBUG">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>
```

### 2. 生产环境配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_PATH" value="/var/log/myapp"/>
    <property name="APP_NAME" value="myapp"/>

    <!-- ERROR 日志 -->
    <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}-error.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </encoder>
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>ERROR</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${APP_NAME}-error-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <maxHistory>90</maxHistory>
        </rollingPolicy>
    </appender>

    <!-- INFO 日志 -->
    <appender name="INFO_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}-info.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </encoder>
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>INFO</level>
        </filter>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${APP_NAME}-info-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>

    <root level="INFO">
        <appender-ref ref="INFO_FILE"/>
        <appender-ref ref="ERROR_FILE"/>
    </root>
</configuration>
```

## 常见问题

### 1. 日志文件位置

**配置文件位置:**
- `src/main/resources/logback-spring.xml`（推荐）
- `src/main/resources/logback.xml`

**日志输出位置:**
- 相对路径：`logs/app.log`（项目根目录下）
- 绝对路径：`/var/log/myapp/app.log`

### 2. application.yml 配置

```yaml
logging:
  level:
    root: INFO
    com.example.service: DEBUG
  file:
    name: logs/app.log
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

### 3. 性能优化建议

- 生产环境使用异步日志（AsyncAppender）
- 合理设置日志级别（生产环境 INFO 或 WARN）
- 配置日志滚动策略，避免单个文件过大
- 定期清理历史日志文件

### 4. 常见错误

**错误 1: 找不到配置文件**
```
Logback configuration error detected
```
解决：确保 `logback-spring.xml` 在 `src/main/resources` 目录下

**错误 2: 日志文件无法创建**
```
Failed to create parent directories for [/var/log/app.log]
```
解决：检查目录权限，或使用相对路径

## 参考资料

- [Logback 官方文档](https://logback.qos.ch/manual/index.html)
- [Spring Boot 日志配置](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.logging)
