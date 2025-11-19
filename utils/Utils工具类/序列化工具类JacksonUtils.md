#  序列化工具类JacksonUtils

```java
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.type.CollectionType;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class JsonUtils {

    private JsonUtils() {}

    private static final Logger LOG = LoggerFactory.getLogger(JsonUtils.class);

    private static final ObjectMapper MAPPER = new ObjectMapper();

    static {
        MAPPER.setTimeZone(TimeZone.getTimeZone("GMT+8"));
        MAPPER.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        MAPPER.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        MAPPER.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        MAPPER.configure(SerializationFeature.INDENT_OUTPUT, false);
        MAPPER.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
        MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        MAPPER.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
    }

    @FunctionalInterface
    private interface JsonAction<T> {
        T run() throws JsonProcessingException;
    }

    private static <T> T execute(JsonAction<T> action, String errorMsg) {
        try {
            return action.run();
        } catch (JsonProcessingException e) {
            LOG.error(errorMsg, e);
            throw new RuntimeException(errorMsg, e);
        }
    }

    /**
     * 将实体对象转换为json字符串
     *
     * @param entity 实体对象
     * @param <T>    泛型
     * @return json string
     */
    public static <T> String obj2json(T entity) {
        if (entity == null) {
            return null;
        }
        return execute(() -> MAPPER.writeValueAsString(entity), "序列化object to JSON失败. Object: " + entity);
    }

    /**
     * 将实体对象转换为json字符串
     *
     * @param entity 实体对象
     * @param pretty 是否转换为美观格式
     * @param <T>    泛型
     * @return json string
     */
    public static <T> String obj2json(T entity, boolean pretty) {
        if (entity == null) {
            return null;
        }
        if (!pretty) {
            return obj2json(entity);
        }
        return execute(
                () -> MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(entity),
                "美观序列化object to JSON失败. Object: " + entity);
    }

    /**
     * 将实体对象转换为字节数组
     *
     * @param entity 实体对象
     * @param <T>    泛型
     * @return json string
     */
    public static <T> byte[] obj2jsonBytes(T entity) {
        return execute(() -> MAPPER.writeValueAsBytes(entity), "将实体对象转换为字节数组失败, Object:" + entity);
    }

    /**
     * 将实体类转换为JsonNode对象
     *
     * @param entity 实体对象
     * @param <T>    泛型
     * @return JsonNode
     */
    public static <T> JsonNode obj2node(T entity) {
        return MAPPER.valueToTree(entity);
    }

    /**
     * 将实体对象写入文件
     *
     * @param filepath 文件绝对路径
     * @param entity   实体对象
     * @param <T>      泛型
     * @return 写入成功：true，否则：false
     */
    public static <T> boolean write2jsonFile(String filepath, T entity) {
        File file = new File(filepath);
        if (!file.exists()) {
            try {
                boolean success = file.createNewFile();
                if (!success) {
                    LOG.error("[write2jsonFile]-创建文件失败！路径：{}", filepath);
                    return false;
                }
            } catch (IOException e) {
                LOG.error("[write2jsonFile]-创建文件失败！路径：{}，失败原因：{}", filepath, e.getMessage());
                return false;
            }
        }
        return write2jsonFile(new File(filepath), entity);
    }

    /**
     * 将实体对象写入指定文件
     *
     * @param file   文件
     * @param entity 实体对象
     * @param <T>    泛型
     * @return 写入成功：true，否则：false
     */
    public static <T> boolean write2jsonFile(File file, T entity) {
        try {
            MAPPER.writeValue(file, entity);
            return true;
        } catch (IOException e) {
            LOG.error("[write2jsonFile]-写入文件失败！路径：{}，失败原因：{}", file.getAbsolutePath(), e.getMessage());
        }
        return false;
    }

    /**
     * 将json字符串转换为实体类对象
     *
     * @param json json字符串
     * @param type 实体对象类型
     * @param <T>  泛型
     * @return 转换成功后的对象
     */
    public static <T> T json2obj(String json, Class<T> type) {
        return execute(() -> MAPPER.readValue(json, type), "将json字符串转换为实体类对象失败,json: " + json);
    }

    /**
     * 将json字符串转换为map
     *
     * @param json json字符串
     * @return Map
     */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> json2map(String json) {
        return execute(() -> (Map<String, Object>) MAPPER.readValue(json, Map.class), "将json字符串转换为map失败，json：" + json);
    }

    /**
     * 将json字符串转换为map
     *
     * @param json json字符串
     * @return Map
     */
    public static <K, V> Map<K, V> json2map(String json, Class<K> keyType, Class<V> valueType) {
        JavaType mapLikeType = MAPPER.getTypeFactory().constructMapLikeType(Map.class, keyType, valueType);
        return execute(() -> MAPPER.readValue(json, mapLikeType), "将json字符串转换为map失败，json：" + json);
    }

    /**
     * 将 JSON 字符串转换为 Map<String, V>。
     * 这是最常用的 Map 转换形式，因为 JSON 对象的 key 总是字符串。
     *
     * @param json       JSON 字符串
     * @param valueClass Map 的 Value 的 Class 类型
     * @return 返回一个 Map<String, V>
     */
    public static <V> Map<String, V> jsonToMap(String json, Class<V> valueClass) {
        JavaType mapType = MAPPER.getTypeFactory().constructMapType(Map.class, String.class, valueClass);
        return execute(() -> MAPPER.readValue(json, mapType), "将json字符串转换为map失败，json：" + json);
    }

    /**
     * 泛化转换方式，此方式最为强大、灵活
     * <p>
     * example：
     * <p>
     *
     * @param json json字符串
     * @param type type
     * @param <T>  泛化
     * @return T
     */
    public static <T> T genericConvert(String json, TypeReference<T> type) {
        return execute(() -> MAPPER.readValue(json, type), "泛型转换失败，json：" + json);
    }

    /**
     * 将map转换为实体类对象
     *
     * @param map  map
     * @param type 实体对象类型
     * @param <T>  泛型
     * @return 实体对象
     */
    public static <T> T map2obj(Map<?, ?> map, Class<T> type) {
        return MAPPER.convertValue(map, type);
    }

    /**
     * 将文件内容转为实体类对象
     *
     * @param file 文件
     * @param type 实体类类型
     * @param <T>  泛型
     * @return 实体类对象
     * @throws IOException IOException
     */
    public static <T> T file2obj(File file, Class<T> type) throws IOException {
        return MAPPER.readValue(file, type);
    }

    /**
     * 将url指向的资源转换为实体类对象
     *
     * @param url  url
     * @param type 实体类对象类型
     * @param <T>  泛型
     * @return 实体类对象
     * @throws IOException IOException
     */
    public static <T> T urlResource2obj(URL url, Class<T> type) throws IOException {
        return MAPPER.readValue(url, type);
    }

    /**
     * 将json字符串转换为实体类List
     *
     * @param json json字符串
     * @param type 实体对象类型
     * @param <T>  泛型
     * @return list集合
     */
    public static <T> List<T> json2list(String json, Class<T> type) {
        CollectionType collectionType = MAPPER.getTypeFactory().constructCollectionType(List.class, type);
        return execute(() -> MAPPER.readValue(json, collectionType), "将json字符串转换为实体类List失败，json：" + json);
    }

    /**
     * 将json字符串转换为JsonNode对象
     *
     * @param json json字符串
     * @return JsonNode对象
     */
    public static JsonNode json2Node(String json) {
        return execute(() -> MAPPER.readTree(json), "将json字符串转换为JsonNode对象失败，json：" + json);
    }

    /**
     * 检查字符串是否是json格式
     *
     * @param str 待检查字符串
     * @return 是：true，否：false
     */
    public static boolean isJsonString(String str) {
        try {
            MAPPER.readTree(str);
            return true;
        } catch (Exception e) {
            if (LOG.isDebugEnabled()) {
                LOG.debug("[isJsonString]-检查字符串是否是json格式...{}", e.getMessage());
            }
            return false;
        }
    }

    /**
     * 打印json到控制台
     *
     * @param obj    需要打印的对象
     * @param pretty 是否打印美观格式
     * @param <T>    泛型
     */
    public static <T> void printJson(T obj, boolean pretty) {
        System.out.println(obj2json(obj, pretty));
    }
}
```
