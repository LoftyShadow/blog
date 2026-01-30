spring data jpa 的标准主键生成策略主要有四种，分别是：  
```java
public enum GenerationType {
    TABLE, //使用一个额外的数据库表来保存主键
    SEQUENCE,//使用序列的方式，且其底层数据库要支持序列，一般有postgres、Oracle等
    IDENTITY,//主键由数据库生成，一般为自增型主键，支持的有MySql和Sql Server
    AUTO//由程序来决定主键规则
}
```

# 公用属性

`@MappedSuperclass` 是 Java Persistence API (JPA) 中的一个注解，用于指示某个类是一个映射的超类（Mapped Superclass）。映射的超类类似于普通的 Java 类，但它不会被映射到数据库表，而是作为其他实体类的基类，用于共享字段和方法。  
总之，`@MappedSuperclass` 注解允许你在 JPA 中创建一个共享属性和方法的基类，而不需要将这些属性和方法映射到数据库表中。
::: details 实体类

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public class BaseEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(description = "创建人")
    @Column(name = "create_user")
    @CreatedBy
    private String createUser;

    @Schema(description = "更新人")
    @Column(name = "update_user")
    @LastModifiedBy
    private String updateUser;

    @Schema(description = "创建时间")
    @Temporal(TemporalType.DATE)
    @Column(name = "creat_time")
    @CreatedDate
    private Date creatTime;

    @Schema(description = "更新时间")
    @Temporal(TemporalType.DATE)
    @Column(name = "update_time")
    @LastModifiedDate
    private Date updateTime;

    @Schema(description = "删除状态")
    @Enumerated
    @Column(name = "delete_status")
    private DeleteStatusEnum deleteStatus;

    public DeleteStatusEnum getDeleteStatus() {
        return deleteStatus;
    }

    public void setDeleteStatus(DeleteStatusEnum deleteStatus) {
        this.deleteStatus = deleteStatus;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
    }

    public Date getCreatTime() {
        return creatTime;
    }

    public void setCreatTime(Date creatTime) {
        this.creatTime = creatTime;
    }

    public String getUpdateUser() {
        return updateUser;
    }

    public void setUpdateUser(String updateUser) {
        this.updateUser = updateUser;
    }

    public String getCreateUser() {
        return createUser;
    }

    public void setCreateUser(String createUser) {
        this.createUser = createUser;
    }
}
```
:::
