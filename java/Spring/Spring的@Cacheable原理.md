# Spring @Cacheable 原理详解

## 一、核心原理概述

`@Cacheable` 是 Spring Cache 提供的声明式缓存注解，通过 **AOP 代理机制** 实现方法级别的缓存功能。

### 执行流程

```
用户调用方法
    ↓
代理对象拦截
    ↓
CacheInterceptor 拦截器
    ↓
检查缓存是否存在
    ↓
存在 → 直接返回缓存
    ↓
不存在 → 执行目标方法 → 将结果存入缓存 → 返回结果
```

---

## 二、核心组件架构

### 组件层次结构

```java
@EnableCaching
    ↓
CachingConfigurationSelector
    ↓
ProxyCachingConfiguration
    ↓
CacheInterceptor (拦截器)
    ↓
CacheAspectSupport (缓存切面支持)
    ↓
CacheManager (缓存管理器)
    ↓
Cache (具体缓存实现: Redis/Caffeine/EhCache)
```

### 核心类说明

| 类名 | 作用 |
|------|------|
| `@EnableCaching` | 启用缓存支持，导入配置类 |
| `CacheInterceptor` | 缓存拦截器，实现 AOP 拦截逻辑 |
| `CacheAspectSupport` | 缓存切面支持类，处理缓存操作 |
| `CacheOperationSource` | 解析缓存注解元数据 |
| `CacheManager` | 缓存管理器，管理多个 Cache |
| `Cache` | 缓存接口，具体实现如 RedisCache |

---

## 三、启用缓存配置

### 1. 开启缓存支持

```java
@Configuration
@EnableCaching  // 开启缓存支持
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        // 配置序列化方式
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))  // 设置过期时间
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair
                    .fromSerializer(new GenericJackson2JsonRedisSerializer())
            );

        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .build();
    }
}
```

**原理**：
- `@EnableCaching` 通过 `@Import` 导入 `CachingConfigurationSelector`
- `CachingConfigurationSelector` 根据 `mode` 选择配置类（默认 PROXY 模式）
- 注册 `ProxyCachingConfiguration`，创建 `CacheInterceptor` 和 `BeanFactoryCacheOperationSourceAdvisor`
- Spring AOP 为带有缓存注解的 Bean 创建代理对象

---

## 四、@Cacheable 注解详解

### 注解参数说明

```java
@Service
public class UserService {

    @Cacheable(
        cacheNames = "user",           // 缓存名称（必填）
        key = "#id",                   // 缓存 Key 的 SpEL 表达式
        condition = "#id > 0",         // 满足条件才缓存
        unless = "#result == null",    // 满足条件不缓存
        sync = false                   // 是否同步加载（防止缓存击穿）
    )
    public UserResp getUserById(Long id) {
        return userMapper.selectById(id);
    }
}
```

### 参数详解

| 参数 | 说明 | 示例 |
|------|------|------|
| `cacheNames` / `value` | 缓存名称，可以理解为缓存分组 | `"user"`, `"order"` |
| `key` | 缓存 Key 的 SpEL 表达式 | `"#id"`, `"#user.id"`, `"'user:' + #id"` |
| `condition` | 满足条件才执行缓存 | `"#id > 0"`, `"#user.age >= 18"` |
| `unless` | 满足条件不缓存结果 | `"#result == null"`, `"#result.size() == 0"` |
| `sync` | 是否同步加载（防止缓存击穿） | `true` / `false` |
| `cacheManager` | 指定缓存管理器 | `"redisCacheManager"` |

### SpEL 表达式支持

```java
// 1. 方法参数
@Cacheable(key = "#id")
public User getById(Long id) { }

// 2. 对象属性
@Cacheable(key = "#user.id")
public User save(User user) { }

// 3. 字符串拼接
@Cacheable(key = "'user:' + #id")
public User getById(Long id) { }

// 4. 方法名
@Cacheable(key = "#root.methodName + ':' + #id")
public User getById(Long id) { }

// 5. 目标类
@Cacheable(key = "#root.targetClass.simpleName + ':' + #id")
public User getById(Long id) { }

// 6. 条件判断
@Cacheable(key = "#id", condition = "#id > 0 && #id < 1000")
public User getById(Long id) { }
```

---

## 五、AOP 拦截执行流程

### 1. CacheInterceptor 拦截

```java
public class CacheInterceptor extends CacheAspectSupport
    implements MethodInterceptor, Serializable {

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        Method method = invocation.getMethod();

        // 创建缓存操作调用器
        CacheOperationInvoker aopAllianceInvoker = () -> {
            try {
                return invocation.proceed();  // 执行目标方法
            } catch (Throwable ex) {
                throw new ThrowableWrapper(ex);
            }
        };

        // 执行缓存逻辑
        return execute(aopAllianceInvoker, invocation.getThis(),
                      method, invocation.getArguments());
    }
}
```

### 2. CacheAspectSupport 核心逻辑

```java
protected Object execute(CacheOperationInvoker invoker, Object target,
                        Method method, Object[] args) {

    // 1. 获取缓存操作上下文
    CacheOperationContexts contexts =
        getCacheOperationContexts(method, args, target);

    // 2. 处理 @CacheEvict (beforeInvocation = true)
    processCacheEvicts(contexts.get(CacheEvictOperation.class), true, null);

    // 3. 查找缓存
    Cache.ValueWrapper cacheHit = findCachedItem(contexts.get(CacheableOperation.class));

    // 4. 如果缓存命中，直接返回
    if (cacheHit != null && !hasCachePut(contexts)) {
        return cacheHit.get();
    }

    // 5. 缓存未命中，执行目标方法
    Object result = invoker.invoke();

    // 6. 将结果存入缓存
    if (result != null) {
        cachePutIfNecessary(contexts, result);
    }

    // 7. 处理 @CacheEvict (beforeInvocation = false)
    processCacheEvicts(contexts.get(CacheEvictOperation.class), false, result);

    return result;
}
```

### 3. 缓存查找逻辑

```java
private Cache.ValueWrapper findCachedItem(Collection<CacheOperationContext> contexts) {
    for (CacheOperationContext context : contexts) {
        // 生成缓存 Key
        Object key = generateKey(context, NO_RESULT);

        // 从 Cache 中获取
        Cache cache = context.getCache();
        Cache.ValueWrapper result = cache.get(key);

        if (result != null) {
            return result;
        }
    }
    return null;
}
```

### 4. 缓存存储逻辑

```java
private void cachePutIfNecessary(CacheOperationContexts contexts, Object result) {
    for (CacheOperationContext context : contexts.get(CacheableOperation.class)) {
        // 检查 unless 条件
        if (context.canPutToCache(result)) {
            // 生成缓存 Key
            Object key = generateKey(context, result);

            // 存入缓存
            Cache cache = context.getCache();
            cache.put(key, result);
        }
    }
}
```

---

## 六、缓存 Key 生成策略

### 1. 默认 Key 生成器

```java
public class SimpleKeyGenerator implements KeyGenerator {

    @Override
    public Object generate(Object target, Method method, Object... params) {
        // 无参数
        if (params.length == 0) {
            return SimpleKey.EMPTY;
        }

        // 单参数
        if (params.length == 1) {
            Object param = params[0];
            if (param != null && !param.getClass().isArray()) {
                return param;
            }
        }

        // 多参数：组合成 SimpleKey
        return new SimpleKey(params);
    }
}
```

### 2. 自定义 Key 生成器

```java
@Component
public class CustomKeyGenerator implements KeyGenerator {

    @Override
    public Object generate(Object target, Method method, Object... params) {
        // 自定义 Key 生成逻辑
        return target.getClass().getSimpleName() + "_"
             + method.getName() + "_"
             + StringUtils.arrayToDelimitedString(params, "_");
    }
}

// 使用自定义生成器
@Cacheable(cacheNames = "user", keyGenerator = "customKeyGenerator")
public User getById(Long id) { }
```

---

## 七、缓存同步机制（sync = true）

### 防止缓存击穿

```java
@Cacheable(cacheNames = "user", key = "#id", sync = true)
public UserResp getUserById(Long id) {
    return userMapper.selectById(id);
}
```

**原理**：
- 当 `sync = true` 时，Spring 会使用 `synchronized` 或 `Lock` 保证同一时刻只有一个线程执行目标方法
- 其他线程等待第一个线程执行完成并缓存结果后，直接从缓存获取

### 源码实现

```java
// AbstractCacheInvoker
protected Object execute(CacheOperationInvoker invoker, Supplier<Cache> cache,
                        CacheOperationContext context) {
    if (context.isSynchronized()) {
        // 同步模式
        return cache.get().get(key, () -> {
            return invoker.invoke();  // 只有一个线程执行
        });
    } else {
        // 非同步模式
        ValueWrapper result = cache.get().get(key);
        if (result != null) {
            return result.get();
        }
        Object value = invoker.invoke();
        cache.get().put(key, value);
        return value;
    }
}
```

---

## 八、其他缓存注解

### 1. @CachePut - 更新缓存

```java
@CachePut(cacheNames = "user", key = "#user.id")
public User updateUser(User user) {
    userMapper.updateById(user);
    return user;
}
```

**特点**：
- 总是执行方法
- 将返回值更新到缓存

### 2. @CacheEvict - 清除缓存

```java
// 删除单个缓存
@CacheEvict(cacheNames = "user", key = "#id")
public void deleteUser(Long id) {
    userMapper.deleteById(id);
}

// 清空所有缓存
@CacheEvict(cacheNames = "user", allEntries = true)
public void deleteAllUsers() {
    userMapper.delete(null);
}

// 方法执行前清除
@CacheEvict(cacheNames = "user", key = "#id", beforeInvocation = true)
public void deleteUser(Long id) {
    userMapper.deleteById(id);
}
```

### 3. @Caching - 组合注解

```java
@Caching(
    cacheable = {
        @Cacheable(cacheNames = "user", key = "#id")
    },
    put = {
        @CachePut(cacheNames = "userList", key = "'all'")
    },
    evict = {
        @CacheEvict(cacheNames = "userCache", allEntries = true)
    }
)
public User complexOperation(Long id) {
    // 复杂操作
}
```

---

## 九、缓存管理器实现

### 1. Redis 缓存管理器

```java
@Configuration
public class RedisCacheConfig {

    @Bean
    public CacheManager redisCacheManager(RedisConnectionFactory factory) {
        // 默认配置
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration
            .defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair
                    .fromSerializer(new StringRedisSerializer())
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair
                    .fromSerializer(new GenericJackson2JsonRedisSerializer())
            );

        // 针对不同缓存名称的个性化配置
        Map<String, RedisCacheConfiguration> configMap = new HashMap<>();
        configMap.put("user", defaultConfig.entryTtl(Duration.ofHours(1)));
        configMap.put("order", defaultConfig.entryTtl(Duration.ofMinutes(10)));

        return RedisCacheManager.builder(factory)
            .cacheDefaults(defaultConfig)
            .withInitialCacheConfigurations(configMap)
            .build();
    }
}
```

### 2. Caffeine 本地缓存

```java
@Bean
public CacheManager caffeineCacheManager() {
    CaffeineCacheManager cacheManager = new CaffeineCacheManager();
    cacheManager.setCaffeine(Caffeine.newBuilder()
        .maximumSize(1000)
        .expireAfterWrite(30, TimeUnit.MINUTES)
        .recordStats());
    return cacheManager;
}
```

### 3. 多级缓存（Caffeine + Redis）

```java
@Bean
public CacheManager compositeCacheManager(
        CacheManager caffeineCacheManager,
        CacheManager redisCacheManager) {

    CompositeCacheManager cacheManager = new CompositeCacheManager();
    cacheManager.setCacheManagers(Arrays.asList(
        caffeineCacheManager,  // 一级缓存
        redisCacheManager      // 二级缓存
    ));
    return cacheManager;
}
```

---

## 十、注意事项与最佳实践

### 1. 内部方法调用失效

```java
@Service
public class UserService {

    // ❌ 错误：内部调用不会触发缓存
    public User getUser(Long id) {
        return getUserById(id);  // 直接调用，不走代理
    }

    @Cacheable(cacheNames = "user", key = "#id")
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }
}
```

**解决方案**：
```java
// ✅ 方案1：注入自己
@Service
public class UserService {
    @Autowired
    private UserService self;

    public User getUser(Long id) {
        return self.getUserById(id);  // 通过代理调用
    }
}

// ✅ 方案2：使用 AopContext
@EnableAspectJAutoProxy(exposeProxy = true)
public class UserService {
    public User getUser(Long id) {
        UserService proxy = (UserService) AopContext.currentProxy();
        return proxy.getUserById(id);
    }
}
```

### 2. 缓存穿透问题

```java
// ❌ 问题：查询不存在的数据，每次都打到数据库
@Cacheable(cacheNames = "user", key = "#id")
public User getUserById(Long id) {
    return userMapper.selectById(id);  // 返回 null
}

// ✅ 解决：缓存空值
@Cacheable(cacheNames = "user", key = "#id", unless = "false")
public User getUserById(Long id) {
    User user = userMapper.selectById(id);
    return user != null ? user : new User();  // 返回空对象
}
```

### 3. 缓存雪崩问题

```java
// ✅ 设置随机过期时间
@Bean
public CacheManager cacheManager(RedisConnectionFactory factory) {
    RedisCacheConfiguration config = RedisCacheConfiguration
        .defaultCacheConfig()
        .entryTtl(Duration.ofMinutes(30 + new Random().nextInt(10)));  // 30-40分钟

    return RedisCacheManager.builder(factory)
        .cacheDefaults(config)
        .build();
}
```

### 4. 大对象缓存

```java
// ❌ 避免缓存大对象
@Cacheable(cacheNames = "user", key = "#id")
public User getUserWithAllData(Long id) {
    User user = userMapper.selectById(id);
    user.setOrders(orderMapper.selectByUserId(id));  // 大量数据
    return user;
}

// ✅ 只缓存必要数据
@Cacheable(cacheNames = "user", key = "#id")
public UserDTO getUserBasicInfo(Long id) {
    User user = userMapper.selectById(id);
    return UserDTO.from(user);  // 只返回基础信息
}
```

### 5. 缓存一致性

```java
@Service
public class UserService {

    @Cacheable(cacheNames = "user", key = "#id")
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }

    // 更新时清除缓存
    @CacheEvict(cacheNames = "user", key = "#user.id")
    public void updateUser(User user) {
        userMapper.updateById(user);
    }

    // 或者更新缓存
    @CachePut(cacheNames = "user", key = "#user.id")
    public User updateUserAndCache(User user) {
        userMapper.updateById(user);
        return user;
    }
}
```

---

## 十一、总结

### 核心要点

1. **AOP 代理机制**：`@Cacheable` 基于 Spring AOP 实现，通过代理对象拦截方法调用
2. **缓存拦截器**：`CacheInterceptor` 负责拦截并处理缓存逻辑
3. **缓存管理器**：`CacheManager` 管理多个 `Cache` 实例，支持 Redis、Caffeine 等
4. **Key 生成策略**：支持 SpEL 表达式和自定义 KeyGenerator
5. **同步机制**：`sync = true` 可防止缓存击穿

### 执行流程总结

```
1. @EnableCaching 启用缓存支持
2. Spring 为带有缓存注解的 Bean 创建代理对象
3. 方法调用时，CacheInterceptor 拦截
4. 解析缓存注解元数据（cacheNames、key、condition 等）
5. 生成缓存 Key
6. 从 Cache 中查找缓存
7. 缓存命中 → 直接返回
8. 缓存未命中 → 执行目标方法 → 存入缓存 → 返回结果
```

### 适用场景

- ✅ 查询频繁、变化不频繁的数据
- ✅ 计算复杂、耗时的操作结果
- ✅ 第三方接口调用结果
- ❌ 实时性要求高的数据
- ❌ 频繁变化的数据
- ❌ 大对象数据