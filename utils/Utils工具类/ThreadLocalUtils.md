# ThreadLocalUtils

```java
/**
 * 一个线程安全的 ThreadLocal 工具类。
 * 注意：在使用线程池的场景下（如Web服务器），
 * 必须在请求处理完成后调用 removeAll() 方法，以防内存泄漏。
 */
@SuppressWarnings("unchecked")
public abstract class ThreadLocalUtils {

    private ThreadLocalUtils() {
    }

    // 使用 <String, Object> 是一种更常见的实践，可以增加类型安全性和可读性
    private static final ThreadLocal<Map<String, Object>> THREAD_LOCAL = ThreadLocal.withInitial(HashMap::new);

    /**
     * 获取当前线程的 ThreadLocal Map。
     *
     * @return 当前线程的 Map 实例。
     */
    public static Map<String, Object> getThreadLocalMap() {
        return THREAD_LOCAL.get();
    }

    /**
     * 从当前线程的 Map 中获取一个值。
     *
     * @param key 键
     * @param <T> 值的类型
     * @return 键对应的值，如果不存在则返回 null
     */
    public static <T> T getValue(String key) {
        // 每次都从 ThreadLocal 获取当前线程的 Map
        return (T) THREAD_LOCAL.get().get(key);
    }

    /**
     * 从当前线程的 Map 中获取一个值，如果不存在则返回默认值。
     *
     * @param key 键
     * @param defaultValue 默认值
     * @param <T> 值的类型
     * @return 键对应的值，或默认值
     */
    public static <T> T getValueOrDefault(String key, T defaultValue) {
        Object value = getValue(key);
        return value == null ? defaultValue : (T) value;
    }

    /**
     * 向当前线程的 Map 中设置一个键值对。
     *
     * @param key 键
     * @param value 值
     */
    public static void setValue(String key, Object value) {
        THREAD_LOCAL.get().put(key, value);
    }

    /**
     * 将一个 Map 中的所有键值对设置到当前线程的 Map 中。
     *
     * @param sourceMap 源 Map
     */
    public static void setAll(Map<String, Object> sourceMap) {
        THREAD_LOCAL.get().putAll(sourceMap);
    }

    /**
     * 从当前线程的 Map 中移除一个键值对。
     *
     * @param key 要移除的键
     */
    public static void remove(String key) {
        THREAD_LOCAL.get().remove(key);
    }

    /** 清空当前线程 Map 中的所有键值对。 Map 对象本身依然存在，只是变为空了。 */
    public static void clear() {
        THREAD_LOCAL.get().clear();
    }

    /**
     * 移除当前线程的整个 Map 实例。 这是防止内存泄漏的最佳实践。调用后，当前线程的 ThreadLocal 就干净了。 下次再调用 get()
     * 会重新创建一个新的空 Map。
     */
    public static void removeAll() {
        THREAD_LOCAL.remove();
    }
}
```
