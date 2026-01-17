# FastAPI 快速入门

> 现代、快速（高性能）的 Python Web 框架

---

## 1. FastAPI 简介

### 1.1 什么是 FastAPI？

FastAPI 是一个用于构建 API 的现代、快速（高性能）的 Web 框架，基于 Python 3.7+ 的类型提示。

**核心特点**：
- ⚡ **高性能**：性能媲美 NodeJS 和 Go
- 🚀 **快速开发**：开发速度提升 200%-300%
- 🐛 **减少 Bug**：减少约 40% 的人为错误
- 💡 **智能提示**：完美的编辑器支持和自动补全
- 📝 **自动文档**：自动生成交互式 API 文档
- 🔒 **类型安全**：基于 Python 类型提示

### 1.2 为什么选择 FastAPI？

| 特性 | FastAPI | Flask | Django |
|------|---------|-------|--------|
| 性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 异步支持 | ✅ 原生支持 | ⚠️ 需要扩展 | ⚠️ 3.1+ 支持 |
| 自动文档 | ✅ 内置 | ❌ 需要扩展 | ❌ 需要扩展 |
| 数据验证 | ✅ Pydantic | ❌ 需要扩展 | ✅ Forms |
| 类型提示 | ✅ 完整支持 | ⚠️ 部分支持 | ⚠️ 部分支持 |
| 学习曲线 | 中等 | 简单 | 复杂 |

---

## 2. 安装与环境配置

### 2.1 安装 FastAPI

```bash
# 安装 FastAPI
pip install fastapi

# 安装 ASGI 服务器（用于运行应用）
pip install "uvicorn[standard]"

# 或者一次性安装所有依赖
pip install "fastapi[all]"
```

### 2.2 验证安装

```bash
# 查看版本
python -c "import fastapi; print(fastapi.__version__)"
```

---

## 3. 第一个 FastAPI 应用

### 3.1 Hello World

创建文件 `main.py`：

```python
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义路由
@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
```

### 3.2 运行应用

```bash
# 启动服务器
uvicorn main:app --reload

# 参数说明:
# main: 文件名 main.py
# app: FastAPI 实例名称
# --reload: 代码修改后自动重启（开发环境使用）
```

### 3.3 访问应用

启动后，访问以下地址：

- **应用地址**: http://127.0.0.1:8000
- **交互式文档 (Swagger UI)**: http://127.0.0.1:8000/docs
- **备用文档 (ReDoc)**: http://127.0.0.1:8000/redoc
- **OpenAPI Schema**: http://127.0.0.1:8000/openapi.json

---

## 4. 路径参数与查询参数

### 4.1 路径参数

```python
from fastapi import FastAPI

app = FastAPI()

# 路径参数
@app.get("/users/{user_id}")
def read_user(user_id: int):
    return {"user_id": user_id}

# 多个路径参数
@app.get("/users/{user_id}/items/{item_id}")
def read_user_item(user_id: int, item_id: str):
    return {"user_id": user_id, "item_id": item_id}

# 路径参数验证
from fastapi import Path

@app.get("/items/{item_id}")
def read_item(
    item_id: int = Path(..., title="商品ID", ge=1, le=1000)
):
    return {"item_id": item_id}
```

### 4.2 查询参数

```python
# 可选查询参数
@app.get("/items/")
def read_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

# 必需查询参数
@app.get("/items/{item_id}")
def read_item(item_id: str, q: str):
    return {"item_id": item_id, "q": q}

# 查询参数验证
from fastapi import Query

@app.get("/items/")
def read_items(
    q: str = Query(None, min_length=3, max_length=50, regex="^fixedquery$")
):
    return {"q": q}
```

---

## 5. 请求体与数据模型

### 5.1 使用 Pydantic 定义数据模型

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional

app = FastAPI()

# 定义数据模型
class Item(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: float = Field(..., gt=0)
    tax: Optional[float] = None

# POST 请求
@app.post("/items/")
def create_item(item: Item):
    return {"item": item, "total": item.price + (item.tax or 0)}
```

### 5.2 嵌套模型

```python
from typing import List

class Image(BaseModel):
    url: str
    name: str

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    images: List[Image] = []

@app.post("/items/")
def create_item(item: Item):
    return item
```

### 5.3 响应模型

```python
class UserIn(BaseModel):
    username: str
    password: str
    email: str

class UserOut(BaseModel):
    username: str
    email: str

@app.post("/users/", response_model=UserOut)
def create_user(user: UserIn):
    # 返回时自动过滤掉 password
    return user
```

---

## 6. HTTP 方法

### 6.1 常用 HTTP 方法

```python
from fastapi import FastAPI

app = FastAPI()

# GET - 查询
@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}

# POST - 创建
@app.post("/items/")
def create_item(item: Item):
    return item

# PUT - 全量更新
@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {"item_id": item_id, "item": item}

# PATCH - 部分更新
@app.patch("/items/{item_id}")
def patch_item(item_id: int, item: dict):
    return {"item_id": item_id, "item": item}

# DELETE - 删除
@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    return {"message": "Item deleted"}
```

---

## 7. 异常处理

### 7.1 抛出 HTTP 异常

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

items = {"foo": "The Foo Wrestlers"}

@app.get("/items/{item_id}")
def read_item(item_id: str):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item": items[item_id]}
```

### 7.2 自定义异常处理器

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

class UnicornException(Exception):
    def __init__(self, name: str):
        self.name = name

app = FastAPI()

@app.exception_handler(UnicornException)
async def unicorn_exception_handler(request: Request, exc: UnicornException):
    return JSONResponse(
        status_code=418,
        content={"message": f"Oops! {exc.name} did something wrong."}
    )

@app.get("/unicorns/{name}")
async def read_unicorn(name: str):
    if name == "yolo":
        raise UnicornException(name=name)
    return {"unicorn_name": name}
```

---

## 8. 依赖注入

### 8.1 基础依赖

```python
from fastapi import Depends, FastAPI

app = FastAPI()

# 定义依赖函数
def common_parameters(q: str = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

# 使用依赖
@app.get("/items/")
def read_items(commons: dict = Depends(common_parameters)):
    return commons

@app.get("/users/")
def read_users(commons: dict = Depends(common_parameters)):
    return commons
```

### 8.2 类作为依赖

```python
class CommonQueryParams:
    def __init__(self, q: str = None, skip: int = 0, limit: int = 100):
        self.q = q
        self.skip = skip
        self.limit = limit

@app.get("/items/")
def read_items(commons: CommonQueryParams = Depends()):
    return commons
```

### 8.3 数据库会话依赖（示例）

```python
from typing import Generator

# 模拟数据库会话
def get_db() -> Generator:
    db = "database_session"
    try:
        yield db
    finally:
        # 关闭数据库连接
        pass

@app.get("/users/")
def read_users(db: str = Depends(get_db)):
    # 使用 db 进行数据库操作
    return {"db": db}
```

---

## 9. 中间件与 CORS

### 9.1 添加中间件

```python
import time
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

### 9.2 配置 CORS

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许的源，生产环境应指定具体域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许的 HTTP 方法
    allow_headers=["*"],  # 允许的 HTTP 头
)

@app.get("/")
def read_root():
    return {"message": "Hello World"}
```

---

## 10. 异步支持

### 10.1 异步路由

```python
from fastapi import FastAPI
import asyncio

app = FastAPI()

@app.get("/")
async def read_root():
    await asyncio.sleep(1)
    return {"message": "Hello World"}
```

### 10.2 异步数据库操作

```python
import httpx

@app.get("/external-api")
async def call_external_api():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
        return response.json()
```

---

## 11. 文件上传与下载

### 11.1 文件上传

```python
from fastapi import FastAPI, File, UploadFile
from typing import List

app = FastAPI()

# 单文件上传
@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents)
    }

# 多文件上传
@app.post("/uploadfiles/")
async def create_upload_files(files: List[UploadFile] = File(...)):
    return [{"filename": file.filename} for file in files]
```

### 11.2 文件下载

```python
from fastapi.responses import FileResponse

@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = f"./files/{filename}"
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream"
    )
```

---

## 12. 后台任务

```python
from fastapi import BackgroundTasks

def write_log(message: str):
    with open("log.txt", "a") as f:
        f.write(message + "\n")

@app.post("/send-notification/{email}")
async def send_notification(
    email: str,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(write_log, f"Notification sent to {email}")
    return {"message": "Notification sent in the background"}
```

---

## 13. 项目结构最佳实践

```
my_fastapi_project/
├── app/
│   ├── __init__.py
│   ├── main.py           # 应用入口
│   ├── models.py         # Pydantic 模型
│   ├── schemas.py        # 数据库模型
│   ├── crud.py           # 数据库操作
│   ├── database.py       # 数据库连接
│   └── routers/          # 路由模块
│       ├── __init__.py
│       ├── users.py
│       └── items.py
├── tests/
│   └── test_main.py
├── requirements.txt
└── .env
```

### 13.1 使用路由模块

**app/routers/users.py**:
```python
from fastapi import APIRouter

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/")
def read_users():
    return [{"username": "user1"}, {"username": "user2"}]

@router.get("/{user_id}")
def read_user(user_id: int):
    return {"user_id": user_id}
```

**app/main.py**:
```python
from fastapi import FastAPI
from app.routers import users, items

app = FastAPI()

# 注册路由
app.include_router(users.router)
app.include_router(items.router)

@app.get("/")
def read_root():
    return {"message": "Hello World"}
```

---

## 14. 数据库集成（SQLAlchemy）

### 14.1 安装依赖

```bash
pip install sqlalchemy databases
```

### 14.2 数据库配置

**app/database.py**:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 依赖函数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 14.3 定义模型

**app/models.py**:
```python
from sqlalchemy import Column, Integer, String
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
```

### 14.4 使用数据库

**app/main.py**:
```python
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app import models
from app.database import engine, get_db

# 创建数据库表
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.post("/users/")
def create_user(username: str, email: str, db: Session = Depends(get_db)):
    db_user = models.User(username=username, email=email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/")
def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users
```

---

## 15. 测试

### 15.1 安装测试依赖

```bash
pip install pytest httpx
```

### 15.2 编写测试

**tests/test_main.py**:
```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_create_item():
    response = client.post(
        "/items/",
        json={"name": "Test Item", "price": 10.5}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Item"
```

### 15.3 运行测试

```bash
pytest
```

---

## 16. 部署

### 16.1 使用 Uvicorn 部署

```bash
# 生产环境运行
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 使用多个 worker
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 16.2 使用 Docker 部署

**Dockerfile**:
```dockerfile
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**构建和运行**:
```bash
# 构建镜像
docker build -t my-fastapi-app .

# 运行容器
docker run -d -p 8000:8000 my-fastapi-app
```

---

## 17. 常见问题

### Q1: async def 和 def 有什么区别？

**A**:
- `async def`: 异步函数，适用于 I/O 密集型操作（数据库查询、HTTP 请求）
- `def`: 同步函数，适用于 CPU 密集型操作

```python
# 异步函数（推荐用于 I/O 操作）
@app.get("/async")
async def async_endpoint():
    await some_async_operation()
    return {"message": "async"}

# 同步函数（用于 CPU 密集型操作）
@app.get("/sync")
def sync_endpoint():
    result = heavy_computation()
    return {"result": result}
```

### Q2: 如何处理跨域问题？

**A**: 使用 CORS 中间件（参见第 9.2 节）。

### Q3: 如何设置请求超时？

**A**:
```python
import httpx

@app.get("/external")
async def call_external():
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get("https://api.example.com")
        return response.json()
```

---

## 18. 学习资源

### 官方资源
- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [FastAPI GitHub](https://github.com/tiangolo/fastapi)
- [Pydantic 文档](https://docs.pydantic.dev/)

### 推荐教程
- [FastAPI 官方教程](https://fastapi.tiangolo.com/tutorial/)
- [Real Python - FastAPI](https://realpython.com/fastapi-python-web-apis/)

---

## 19. 快速参考

### 19.1 常用装饰器

```python
@app.get("/path")           # GET 请求
@app.post("/path")          # POST 请求
@app.put("/path")           # PUT 请求
@app.delete("/path")        # DELETE 请求
@app.patch("/path")         # PATCH 请求
```

### 19.2 参数类型

```python
from fastapi import Path, Query, Body, Header, Cookie

# 路径参数
item_id: int = Path(...)

# 查询参数
q: str = Query(None, min_length=3)

# 请求体
item: Item = Body(...)

# 请求头
user_agent: str = Header(None)

# Cookie
session_id: str = Cookie(None)
```

### 19.3 响应状态码

```python
from fastapi import status

@app.post("/items/", status_code=status.HTTP_201_CREATED)
def create_item(item: Item):
    return item

@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    return None
```

### 19.4 Pydantic 验证器

```python
from pydantic import BaseModel, validator, Field

class Item(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0)

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('名称不能为空')
        return v
```

---

## 20. 总结

### 核心优势

1. **高性能** - 基于 Starlette 和 Pydantic，性能接近 NodeJS 和 Go
2. **快速开发** - 自动数据验证、序列化和文档生成
3. **类型安全** - 基于 Python 类型提示，IDE 支持完善
4. **易于学习** - 简洁的 API 设计，文档详尽

### 适用场景

- ✅ RESTful API 开发
- ✅ 微服务架构
- ✅ 数据验证密集型应用
- ✅ 需要自动文档的项目
- ✅ 异步 I/O 密集型应用

### 学习路径

1. **入门** - 掌握基本路由、参数和请求体
2. **进阶** - 学习依赖注入、中间件和异常处理
3. **实战** - 集成数据库、编写测试、部署应用

---

**文档版本**: v1.0
**最后更新**: 2026-01-16
**作者**: Claude Code
