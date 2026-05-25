# 自定义 skill 整理

::: details Git 提交 skill

````md
---
name: "committing-code-changes"
description: "用于用户要求提交代码、生成提交信息、创建本地 commit、处理 revert commit，或需要按固定 Commit message 规范提交但默认不推送的场景。"
---

# 代码提交流程

## 目标

在用户要求提交代码时，创建范围清晰、信息规范、可追踪的本地 commit。默认只提交，不推送；除非用户明确要求 push，否则不要执行任何推送操作。

## 基本规则

- 提交前必须查看 `git status` 和相关 diff，确认只提交本次任务相关改动。
- 不要把用户已有的无关改动、运行态文件、临时文件或未确认文件带入 commit。
- 如果工作区包含无关改动，使用精确路径 staged，只提交本次范围。
- 如果没有可提交改动，不要创建空 commit，直接说明没有可提交内容。
- 除非用户明确说“推送”“push”“提交并推送”，否则只执行本地 commit，不执行 push。
- 如果提交前还没有完成必要收尾检查，先使用 `finishing-code-changes`。

## Commit message 格式

默认使用中文写 commit message。除 `type` 以及少量 Git/规范关键字
（例如 `BREAKING CHANGE:`、`Closes #123`、revert 固定句）外，`scope`、
`subject`、Body 和 Footer 的说明文字都必须使用中文。

每次提交信息包含三个部分：Header、Body 和 Footer。

```text
<type>(<中文 scope>): <中文 subject>

<中文 body>

<中文 footer>
```

- Header 必须存在。
- Body 和 Footer 可以省略。
- 任意一行不得超过 72 个字符；如果项目明确允许，可以放宽到 100 个字符。

## Header

Header 只有一行，包含 `type`、`scope` 和 `subject`。`type` 使用固定英文枚举；
`scope` 和 `subject` 使用中文。

```text
<type>(<中文 scope>): <中文 subject>
```

- `type` 必需。
- `scope` 可选，用于说明影响范围，例如数据层、控制层、视图层、支付、导出、后台等。
- 如果写 `scope`，优先使用中文名词或业务域名词，例如 `精修`、`后端`、`支付`、`素材`。
- `subject` 必需，不超过 50 个字符。

允许的 `type` 只有：

- `feat`：新功能。
- `fix`：修补 bug。
- `docs`：文档。
- `style`：格式调整，不影响代码运行。
- `refactor`：重构，不是新增功能，也不是修复 bug。
- `test`：增加或修改测试。
- `chore`：构建过程或辅助工具变动。

`subject` 规则：

- 使用中文动宾短语或简短中文句子，例如 `拆分工作台拖拽处理`。
- 避免英文描述，例如不要写 `split workspace drag handling`。
- 不要为了符合英文语法强行使用第一人称现在时。
- 结尾不加句号。
- 用简短语言说明本次提交目的。

## Body

Body 用于详细说明本次 commit，可以分多行。

- 使用中文说明。
- 说明代码变动的动机。
- 说明与以前行为的对比。
- 可以使用 bullet points。
- 每行控制在 72 个字符以内；项目允许时最多 100 个字符。

## Footer

Footer 只用于两类情况。

1. 破坏性更新。

如果当前代码与上一个版本不兼容，Footer 必须以 `BREAKING CHANGE:` 开头，说明变动内容、变动理由和迁移方法。

```text
BREAKING CHANGE: 调整导出项目 payload 结构。

迁移方式：使用新的 overlay 字段重新生成项目 payload。
旧 payload 缺少这些字段时将不再被接受。
```

2. 关闭 Issue。

如果当前 commit 针对某个 issue，可以在 Footer 中写：

```text
Closes #234
```

也可以一次关闭多个 issue：

```text
Closes #123, #245, #992
```

## Revert

如果当前 commit 用于撤销以前的 commit，Header 必须以 `revert:` 开头，后面跟被撤销 commit 的 Header。

```text
revert: feat(画笔): 增加石墨宽度选项

This reverts commit 667ecc1654a317a13331b17617d973392f415f02.
```

Body 格式固定为 Git revert 兼容句：

```text
This reverts commit <hash>.
```

其中 `<hash>` 是被撤销 commit 的 SHA。

## 提交流程

1. 检查工作区。
   - 运行 `git status --short`。
   - 查看本次相关文件 diff。
   - 识别无关改动，避免带入 commit。

2. 判断提交类型。
   - 新功能用 `feat`。
   - 修复 bug 用 `fix`。
   - 纯文档用 `docs`。
   - 纯格式用 `style`。
   - 重构用 `refactor`。
   - 测试用 `test`。
   - 构建、脚本、辅助工具用 `chore`。

3. 判断是否有破坏性更新。
   - 如果有，Footer 必须包含 `BREAKING CHANGE:`。
   - `BREAKING CHANGE:` 必须说明影响范围、理由、迁移方法。
   - 如果没有，Footer 不要写破坏性更新内容。

4. 精确 staged。
   - 只 stage 本次任务相关文件。
   - 不要使用会带入无关改动的粗暴命令。

5. 创建 commit。
   - 使用规范 commit message。
   - 如果需要多行 message，使用非交互方式传入 Header、Body 和 Footer。

6. 提交后确认。
   - 查看 `git status --short`，确认本次范围已提交。
   - 如果还有未提交改动，说明它们是否是无关改动或用户已有改动。
   - 不要 push，除非用户明确要求。

## 输出要求

最终说明必须包含：

- 提交哈希。
- Commit message。
- 已提交文件范围。
- 是否存在未提交改动。
- 是否推送；默认写“未推送，因为用户未明确要求推送”。
````

:::

::: details 大型开发流程 skill

````md
---
name: "structured-development-workflow"
description: "用于新需求、大改动、复杂业务实现或需要 AI 参与需求澄清、方案权衡、架构设计、执行文档拆分、分步骤编码和优化迭代的开发流程。"
---

# 结构化开发流程

## 目标

把模糊需求推进成可讨论、可执行、可测试、可追踪的开发计划。这个 skill 负责开发前和开发中的流程控制；代码完成后的最终门禁交给 `finishing-code-changes`。

## 适用场景

- 新功能、大改动、跨模块改造、复杂 bugfix。
- 需求仍有模糊点，需要 AI 反向提问补上下文。
- 需要比较多个方案，而不是直接接受第一个实现建议。
- 需要架构文档、执行文档、分步骤任务和硬验收标准。
- 需要 AI 分步骤写代码，并持续对照文档检查偏移。

## 不适用场景

- 简单文案、纯格式整理、无代码影响的轻量文档更新。
- 小范围 bugfix 或小改动，用户已经给出明确实现方式且不需要方案权衡。
- 只需要最终检查和交付说明的任务；这类任务直接使用 `finishing-code-changes`。

## 固定流程

1. 把第一版回答视为草稿。
   - 不要把第一个方案直接当最终答案。
   - 明确业务域、能力域、流程阶段、职责边界。
   - 记录可选方案、取舍理由、风险和不确定点。

2. 让 AI 反向提问。
   - 主动列出当前不知道的信息。
   - 要求用户补充业务上下文、边界条件、异常场景、数据来源、权限、性能、兼容性和交付约束。
   - 根据新增上下文修改需求 plan，不要让旧 plan 和新上下文并存冲突。

3. 发现并推荐可能适用的 skill。
   - 查看当前任务是否涉及已有专门 skill，例如前端、后端、数据库、测试、设计、支付、调试等。
   - 如果当前已安装 skill 不够覆盖反复出现的流程或领域知识，先检索或整理可推荐的 skill 候选，并说明每个候选能解决什么问题。
   - 不要自行安装、创建或启用新的 skill；必须把推荐列表和理由交给用户，由用户决定是否安装或启用。
   - 不要为了形式推荐无关 skill；推荐的 skill 必须能降低重复决策或提升执行稳定性。

4. 基于需求 plan 设计架构。
   - 明确模块边界、数据流、状态流转、外部依赖、失败路径、幂等性、事务边界和观测点。
   - 对多个架构方案做权衡，说明为什么选择当前方案。
   - 不要只写“采用最佳实践”；要写清楚它解决了什么具体问题。

5. 基于架构生成执行文档。
   - 把架构拆成可执行任务。
   - 每个任务必须说明目标、涉及文件、输入输出、依赖顺序、风险点和验收标准。
   - 标记哪些代码是手动生成、模板生成或非 AI 生成，例如 MyBatis / FreeMarker 生成的基础结构。
   - AI 不应随意重构模板生成或手动提交的基础代码；只在明确需要时调整集成点。

6. 拆分成可测试的小步骤。
   - 每一步都要足够小，能独立 review、验证和回滚。
   - 每一步都要有 checklist。
   - checklist 至少覆盖：必要测试、必要日志、相关 skill review、代码实现范围、文档同步要求。
   - 只有涉及代码、构建、依赖、运行配置等会影响运行或编译的步骤，才要求 JetBrains MCP；纯文档步骤不要求 JetBrains MCP。
   - 如果一步无法稳定测试，继续拆小或补充可观测性。

7. 设置硬验收标准。
   - 避免“系统应该很快”“体验要好”“逻辑要稳定”这类模糊标准。
   - 尽量改成可验证指标，例如 `P95 < 200ms`、核心接口错误率、覆盖率下限、必须通过的业务样例、必须保留的兼容行为。
   - 如果无法定义硬指标，要在文档中写明原因和剩余解释空间。

8. 分步骤实现代码。
   - 按执行步骤顺序实现，不要跳步。
   - 每完成一步，对照该步骤 checklist 检查。
   - 如果实现中发现文档不合理，先更新文档和计划，再继续编码。
   - 不要实现文档没有要求的额外能力，除非先说明原因并更新计划。

9. 对比代码和文档差异。
   - 检查代码是否偏离需求 plan、架构文档和执行步骤。
   - 检查是否存在逻辑错误、职责越界、多余实现、遗漏实现、文档过期。
   - 如果代码和文档不一致，明确判断是代码错、文档错，还是需求已经变化。

10. 初版后整理优化方案。
    - 提交或阶段性固定初版代码后，询问并整理优化方案。
    - 区分必须优化、可选优化和不采纳优化。
    - 记录不采纳原因，避免后续反复讨论同一问题。

11. 根据优化方案重构并重新验证。
    - 重构必须有目标：降低复杂度、修正边界、改善性能、减少重复、提升可测试性或消除风险。
    - 重构后重新跑相关测试和检查。
    - 确认重构没有引入文档漂移。

12. 进入最终收尾。
    - 代码完成后使用 `finishing-code-changes`。
    - 最终收尾必须检查测试、日志、注释、文档一致性、硬验收标准、遗留风险和删除清单。

## 交付物

执行过程中尽量产出或维护这些材料：

- 需求 plan。
- AI 反向问题和已补上下文。
- 方案权衡记录。
- 架构文档。
- 执行文档。
- 分步骤任务文档。
- 每步 checklist。
- 硬验收标准。
- 手动生成或模板生成代码边界说明。
- 优化方案和采纳记录。
- 遗留风险清单。

## 常见错误

- 把 AI 第一个答案当最终设计。
- 需求、架构、执行步骤同时混在一个文档里，导致职责不清。
- checklist 只有“完成实现”，没有测试、日志、skill review 和验收标准。
- 用模糊标准验收性能或稳定性。
- AI 在执行中偷偷新增文档没有要求的能力。
- 重构后没有重新对照文档和测试。
````

:::

::: details 收尾检查 skill

````md
---
name: "finishing-code-changes"
description: "用于代码修改完成后的最终收尾、交付、提交、创建 PR、合并前检查，尤其适用于需要确认 IDE 检查、测试、日志、注释、清理无用代码和明确说明删除内容的场景。"
---

# 代码修改收尾流程

## 目标

在代码改完后，把“已经改了代码”推进到“已经 review、检查、验证、补齐必要说明，并且清理过程透明可追踪”的状态。

这个 skill 只负责最终门禁，不重新做需求拆分、架构设计或执行计划。需求 plan、架构文档、执行步骤文档等属于“有则检查、适用才检查”的输入材料；普通小改动没有这些文档不算失败。

## 改动类型判定

先判断本次 touched files 属于哪类，再选择后续检查强度：

- 纯文档改动：只涉及 Markdown、README、说明文档、skill 文档等，不跑 JetBrains MCP；运行文档自身的轻量校验，例如 YAML 解析、Markdown/skill validator、打包校验或链接检查。
- 纯代码改动：涉及源码、测试代码、类型声明、构建脚本、依赖声明、运行时配置、数据库迁移等，必须执行相关 skill review、JetBrains MCP 检查和必要验证。
- 混合改动：代码部分按代码流程检查，文档部分按文档流程校验；最终说明要分别写清楚。

## 工程原则（KISS / YAGNI / DRY / SOLID）

- KISS：优先最小可行改动，避免不必要的复杂性。
- YAGNI：只实现用户当前明确需要的内容，拒绝过度设计。
- DRY：抽取重复逻辑，但不为“未来复用”而提前抽象。
- SOLID：保持职责单一、接口小而清晰、依赖抽象而非具体实现。

## 预设 subagent 联动

- 复杂任务、高风险任务、多步骤任务或用户明确要求独立复核时，可按 `subagent-orchestration` 显式使用 `final_delivery_reviewer` 做只读收尾审查。
- `final_delivery_reviewer` 只用于发现问题和证据缺口，不直接修改文件，也不能替代本 skill 的实际收尾、验证和最终交付说明；主 agent 必须处理其阻塞问题后再交付。
- 小改动、纯文档整理或已经足够清晰的低风险修改，不强制使用 `final_delivery_reviewer`。
- 如果最终复核发现删除清单缺失，必须补充 `Removed: ...` 或 `Removed: none`，不能隐藏删除内容。

## 固定流程

1. 确认适用的输入材料和本次真实改动范围。
   - 先判断本次是否走过结构化开发流程，或用户是否提供了需求 plan、架构文档、执行步骤文档、每步 checklist、硬验收标准、优化方案、遗留风险清单。
   - 默认从项目根目录的 `docs/` 查找总览文档，并从 `docs/plan/step/{任务概述名}/` 查找具体步骤文档；`{任务概述名}` 是占位符，不是真实固定目录名，要替换成当前任务的中文概述名。如果项目已有其他文档规范，优先遵守项目规范。
   - 如果存在 `docs/plan/step/{任务概述名}/`，优先检查其中的 `00-总览.md`，再检查后续步骤文档。
   - 结构化流程文档默认文件名和正文都是中文；如果发现关键文档用了无语义英文名或临时路径，要在最终风险里提示后续整理成本。
   - 如果这些材料存在，就必须对照检查。
   - 如果只是小改动、临时 bugfix、纯文档整理，且没有上述材料，不要把“缺少文档”视为失败；改为对照用户本轮请求、代码 diff 和本地上下文检查。
   - 如果改动复杂但缺少关键材料，才在最终说明里写明缺少什么，以及因此哪些检查只能部分完成。
   - 查看 `git diff --stat`、`git diff` 和已修改文件路径。
   - 区分本次任务产生的改动，以及用户已有或其他流程生成的无关改动。
   - 不要回滚、覆盖或删除无关改动。

2. 按适用输入检查实现一致性。
   - 如果存在需求 plan、架构文档、执行步骤或 checklist，检查代码是否与它们一致。
   - 如果没有独立文档，检查代码是否与用户本轮请求、已有代码约定和本次 diff 目标一致。
   - 在适用时检查业务域、能力域、流程阶段、职责边界是否被代码正确遵守。
   - 在适用时检查是否存在文档要求但代码漏做的能力，或代码实现了文档没有要求的额外能力。
   - 检查本次是否包含破坏性更新，例如接口不兼容、数据结构变化、迁移不可逆、删除旧能力、配置变更导致旧环境不可用、用户数据或运行态数据需要迁移。
   - 如果存在破坏性更新，最终说明必须单独写明影响范围、兼容策略、迁移步骤、回滚方案、验证方式和用户可见变化。
   - 检查是否存在逻辑错误、职责越界、状态流转错误、异常路径遗漏或文档漂移。
   - 如果代码和文档不一致，必须明确判断：代码错、文档过期，还是需求已经变化。

3. 使用相关 skill 和最佳实践 review 代码。
   - 根据改动内容加载对应 skill，例如前端、React、shadcn、Tailwind、Python 后端、API 设计、pytest、Vitest、数据库、调试、安全等。
   - 检查正确性、回归风险、边界条件、API 兼容性、可访问性、性能和可维护性。
   - 用 KISS / YAGNI / DRY / SOLID 复查实现：是否过度设计、是否提前抽象、是否职责混乱、是否接口过大或依赖具体实现过重。
   - 发现问题时，按照相关 skill 的最佳实践和当前代码库风格修复。
   - 不要为了完成流程而引入大范围重构；只修复与本次任务、touched files 或阻塞验证直接相关的问题。

4. 仅在代码改动时通过 JetBrains MCP 跑 IDE 检查。
   - 使用 `jetbrains-mcp-tools` 选择合适的 JetBrains MCP 能力和检查范围。
   - 如果本次只整理文档、说明文件、README、skill 文档、Markdown 文档等，不需要跑 JetBrains MCP；改为运行对应文档自身的轻量校验，例如 YAML 解析、Markdown/skill validator、打包校验或链接检查。
   - 如果本次触碰了源码、测试代码、构建脚本、依赖声明、运行时配置、数据库迁移、类型声明等会影响运行或编译的文件，就必须跑 JetBrains MCP。
   - 优先使用当前可用的 JetBrains MCP，例如 PyCharm 或 IDEA。
   - 已知项目路径时必须传入项目路径。
   - 对本次触碰过的源码文件运行文件级检查，检查范围必须包含 warning，不要只看 error。
   - 可用时运行项目 build 或 compile 检查。
   - 本次新增 warning、本次改动直接相关 warning、阻塞构建或验证的 warning 都视为阻塞项，修复后重跑对应检查。
   - 如果 IDE 报出 touched scope 之外或本次改动前已存在的历史 warning，不要偷偷忽略；在最终说明中标明这是范围外既有问题，并给出足够信息让用户判断。
   - 范围外或历史问题默认只记录不修复；只有它阻塞本次验证或用户明确要求时，才扩大修复范围。

5. 验证适用的硬验收标准。
   - 如果用户、需求 plan 或执行文档给出了硬指标，例如 `P95 < 200ms`、覆盖率下限、错误率、核心业务样例、兼容行为，必须用测试、基准、日志、构建输出或手动验证证据支撑。
   - 如果任务明确涉及性能、稳定性、覆盖率、安全性等质量目标，但只有“系统应该很快”“体验要好”“逻辑要稳定”这类模糊标准，不要自行解释为通过；要说明本次采用了什么替代验证，以及剩余解释空间。
   - 如果是普通小改动且没有质量指标要求，不需要强行制造硬指标；写明不适用即可。
   - 如果已有硬指标但无法验证，不能声称该指标已通过。

6. 补充必要验证。
   - 行为变化、bugfix、共享逻辑、API 契约、状态流转、持久化、用户可见流程，都要优先补测试。
   - 使用当前仓库已有的测试框架和测试风格。
   - 不要为了满足 checklist 新增无意义测试；测试必须覆盖真实行为、风险分支或回归点。
   - 如果确实无法补测试，要说明原因，并运行最强可用的 build、类型检查、lint 或手动验证命令。
   - 如果存在需求 plan 或执行步骤，检查核心业务测试样例是否足够覆盖；不够时补充或说明缺口。

7. 检查日志链路和注释。
   - 外部调用、后台任务、支付流程、媒体处理、异步流程、失败分支等需要可追踪时，要补必要日志。
   - 日志不能包含敏感信息；可用时带上 `request_id`、`project_id`、`job_id`、`order_no`、`operation` 等关联字段。
   - 只给非显而易见的业务约束、脆弱集成点、特殊决策补注释；不要写“代码做了什么”的废话注释。
   - 不要为了满足 checklist 增加噪音日志或装饰性注释；没有排查价值或维护价值就不要加。

8. 检查手动或模板生成代码边界。
   - 如果本次涉及 MyBatis、FreeMarker 或其他手动/模板生成的基础代码，要记录它们的来源和边界。
   - 不要随意重构模板生成或用户手动提交的基础结构。
   - 只检查它们与本次业务代码的集成是否正确。
   - 如果发现模板代码本身有问题，要说明问题来源，不要混同为本次业务实现错误。

9. 检查优化迭代是否闭环。
   - 如果存在优化方案，说明哪些已采纳、哪些未采纳、为什么未采纳。
   - 如果做过重构，确认重构目标明确，并且重构后重新运行了相关验证。
   - 检查重构是否造成文档漂移、测试漂移或职责边界变化。

10. 透明清理无用代码。
   - 可以删除死代码、过期分支、未使用 import、未使用变量、重复 helper、临时 debug 代码、废弃文件、已经不需要的脚手架。
   - 不要删除无法确认的业务逻辑、用户已有改动、运行态生成数据或无关文件。
   - 删除文件、公共 API、数据库字段、配置项、迁移脚本、用户可见能力、运行态数据路径或模板生成代码时，即使看似无用，也必须先确认是否在本次范围内；不在范围内则只记录风险，不删除。
   - 如果存在相关文档、测试、接口说明或注释，删除前检查是否会造成漂移。
   - 删除后如果相关文档仍引用旧逻辑，要同步更新文档，或在最终风险中明确说明仍需调整。
   - 工作过程中维护删除清单，记录每个有意义的删除项：文件路径、删除内容、删除原因。
   - 最终回复必须包含以下二选一：
     - `Removed: ...`：列出实际删除的代码或文件，并说明原因。
     - `Removed: none`：本次没有删除代码或文件。

11. 检查并整理遗留风险。
   - 主动检查是否还有未覆盖场景、性能风险、并发风险、数据一致性风险、权限风险、兼容风险、回滚风险或环境依赖风险。
   - 只有风险需要用户决策、需求补充或范围确认时，才停下来追问用户。
   - 能修复的风险在当前范围内修复；不能修复的风险写入最终说明。
   - 不要把“未验证”写成“无风险”。

12. 最终验证和交付说明。
   - 修复和清理后，重新运行最小但足够的验证命令。
   - 复杂任务如使用了 `final_delivery_reviewer`，必须处理其阻塞问题，并在最终说明中体现复核结论或剩余风险。
   - 没有验证输出支撑时，不要声称任务已完成或检查已通过。
   - 如果必要检查无法运行，要说明阻塞原因、缺失环境和剩余风险。

13. 如需提交代码，联动 `committing-code-changes`。
   - 只有用户明确要求提交时才创建 commit。
   - 提交前先完成本 skill 的收尾检查。
   - Commit message、破坏性更新 Footer、revert 格式和 issue 关闭语法都交给 `committing-code-changes` 处理。
   - 默认只 commit，不 push；除非用户明确要求推送，否则不要执行 push。

## 最终回复格式

最终交付时保持简洁，并使用这个结构：

```markdown
改动：
- ...

文档一致性：
- 有文档时写明对照结果；无独立文档时写明已对照用户请求和代码 diff；不适用时说明原因。

破坏性更新：
- 有则写明影响范围、兼容策略、迁移步骤、回滚方案、验证方式和用户可见变化；没有则写无。

验证：
- ...

硬验收标准：
- 有硬指标时写明验证证据；没有适用硬指标时写明不适用；存在模糊标准时写明替代验证和剩余解释空间。

JetBrains MCP：
- 代码改动：写明 inspection/build 结果，并说明 touched files 是否已经没有 warning 及以上问题。
- 文档整理：写明未运行 JetBrains MCP，因为本次未触碰会影响运行或编译的代码文件；列出已运行的文档校验。

优化闭环：
- 有优化方案或重构时写明采纳和验证结果；没有则写不适用。

工程原则：
- 写明是否存在明显违反 KISS / YAGNI / DRY / SOLID 的实现；没有则写无明显问题。

删除：
- Removed: ... / Removed: none

风险：
- ...

提交：
- 如果用户要求提交，写明已交给 `committing-code-changes` 处理或写明提交结果。
- 如果用户未要求提交，写明未提交。
```
````

:::

::: details JetBrains skill

````md
---
name: "jetbrains-mcp-tools"
description: "用于需要使用 PyCharm、IntelliJ IDEA、GoLand 等 JetBrains IDE MCP 做项目检查、文件问题分析、构建、运行配置、数据库查询、文件导航、重构或 IDE 终端操作的场景。"
---

# JetBrains MCP 快速调用

## 目标

快速选择 PyCharm、IntelliJ IDEA、GoLand 等 JetBrains IDE MCP 的合适能力。优先用于 IDE 级项目理解、文件问题检查、构建、运行配置、数据库对象查看、符号检索和安全的 IDE 辅助操作；普通终端命令默认直接用本地 shell/RTK。

## 适用场景

- 用户要求使用 PyCharm、IDEA、GoLand、JetBrains MCP 或 IDE 检查。
- 代码改动完成后，需要检查 touched files 是否有 warning 及以上问题。
- 需要 IDE 语义能力：符号查找、符号信息、重命名、文件问题、项目模块、运行配置。
- 需要查看 IDE 已配置数据库连接、schema、表结构或执行安全 SQL。
- 需要通过 IDE run configuration 运行测试、服务或脚本。

## 不适用场景

- 纯文档、README、Markdown、skill 文档整理：不要为了形式跑 JetBrains MCP，使用对应文档校验即可。
- 普通 shell 查询、测试、lint、build、git、rg、npm、pytest 等：默认直接使用本地 shell，并按项目要求优先通过 `rtk` 包装；不要为了形式改用 IDE terminal。
- 大段代码编辑：默认用 `apply_patch`；JetBrains MCP 主要做检查、语义查询、重命名、格式化和运行。

## 当前主要能力

### 项目和文件探索

- `get_project_modules`：查看项目模块。
- `get_project_dependencies`：查看项目依赖。
- `get_repositories`：查看 VCS roots。
- `list_directory_tree`：查看目录树，优先于 shell `ls/tree`。
- `find_files_by_name_keyword`、`find_files_by_glob`、`search_file`：找文件。
- `search_text`、`search_regex`、`search_in_files_by_text`、`search_in_files_by_regex`：搜文本或正则。
- `search_symbol`、`get_symbol_info`：查符号和符号说明。
- `read_file`、`get_file_text_by_path`：读取文件内容。
- `open_file_in_editor`：打开文件到 IDE。

### 检查、构建和格式化

- `get_file_problems`：对单个文件跑 IDE inspections，可包含 warning。
- `build_project`：构建项目或重建指定文件。
- `reformat_file`：按 IDE 格式化文件。

代码收尾时的最低 IDE 检查：

1. 只对代码、测试、构建脚本、依赖、运行配置、数据库迁移、类型声明等会影响运行或编译的文件运行。
2. 对本次 touched source files 跑 `get_file_problems(errorsOnly=false)`。
3. 对可构建项目跑 `build_project`；能指定 touched files 时优先缩小范围。
4. 本次新增 warning、本次改动直接相关 warning、阻塞构建或验证的 warning 视为阻塞；历史 warning 记录为范围外风险，默认不扩大修。

### 运行配置

- `get_run_configurations`：列出项目 run configurations，或查询某文件里的可运行入口。
- `execute_run_configuration`：执行已有配置或指定文件行号的临时运行配置。

使用规则：

- 运行已有配置前先用 `get_run_configurations` 确认名称和 `supportsDynamicLaunchOverrides`。
- 只有配置支持动态覆盖时，才传 `programArguments`、`workingDirectory` 或 `envs`。
- `waitForExit=true` 适合测试、lint、一次性脚本；服务类长进程用 `waitForExit=false`。

### IDE 集成终端例外

- `execute_terminal_command`：在 IDE 集成终端执行命令。

默认不要用它跑普通命令。只有这些情况才考虑 IDE terminal：

- 用户明确要求“在 PyCharm/IDEA/Goland 终端里跑”。
- 需要复用 IDE 终端窗口、IDE 注入的环境或当前 IDE terminal 上下文。
- 本地 shell/RTK 无法复现，而 IDE run/terminal 能复现的问题。

即使使用 IDE terminal，也要说明为什么不用普通 shell/RTK。

### 安全编辑和重构

- `rename_refactoring`：程序符号重命名，优先于手写搜索替换。
- `replace_text_in_file`：精确文本替换；只在替换范围非常明确时使用。
- `create_new_file`：在项目内创建文件。
- `reformat_file`：格式化文件。

编辑规则：

- 普通代码编辑默认用 `apply_patch`。
- 符号级重命名优先用 `rename_refactoring`。
- 不要用文本替换做语义重命名。
- 不要重写、回滚或删除用户已有改动。

### 数据库能力

- `list_database_connections`：列出 IDE 数据库连接。
- `test_database_connection`：测试连接。
- `list_database_schemas`：列出 schemas。
- `list_schema_object_kinds`：列出对象类型。
- `list_schema_objects`：列出 schema objects。
- `get_database_object_description`：查看表、视图、routine 等结构。
- `preview_table_data`：预览表数据。
- `execute_sql_query`：执行 SQL。
- `list_recent_sql_queries`：查看最近查询。
- `cancel_sql_query`：取消查询。

数据库规则：

- 先看连接、schema、对象结构，再执行 SQL。
- 默认只做只读查询和预览。
- DDL、DML、迁移、删除、更新数据必须有用户明确授权，并说明影响范围和回滚方式。
- 不要把密钥、完整敏感请求、用户 cookie 或隐私数据写入日志和回复。

### Notebook

- `runNotebookCell`：执行 Jupyter notebook 单个 cell 或全量 notebook。

## 常用流程

### 代码改动后检查

1. 判断是否触碰代码类文件；纯文档不跑 JetBrains MCP。
2. 用搜索或 git diff 确认 touched files。
3. 对 touched source files 运行 `get_file_problems(errorsOnly=false)`。
4. 能构建时运行 `build_project`。
5. 如有 run configuration，按需执行测试或服务配置。
6. 修复本次新增或相关 warning/error 后重跑。
7. 最终说明列出检查范围、结果、历史问题和未验证风险。

### 找代码和理解符号

1. 先用 `search_file`、`find_files_by_name_keyword` 或 `search_symbol` 定位。
2. 用 `read_file` 或 `get_file_text_by_path` 读必要片段。
3. 对关键引用用 `get_symbol_info` 确认类型、签名和来源。
4. 不确定调用链时再用文本或正则搜索扩大范围。

### 运行项目配置

1. 用 `get_run_configurations` 列出配置。
2. 选择最小相关配置，不随意运行长服务。
3. 如果需要覆盖参数，先确认 `supportsDynamicLaunchOverrides=true`。
4. 执行后记录 exit code、关键输出和完整输出路径。

### 查数据库结构

1. `list_database_connections`。
2. `test_database_connection`。
3. `list_database_schemas(selectedOnly=true)`。
4. `list_schema_objects` 和 `get_database_object_description`。
5. 只读查询或 preview；写操作必须先得到明确授权。

## 最终说明要求

使用 JetBrains MCP 后，最终回复写清：

- 使用的是哪个 IDE MCP，例如 PyCharm、IDEA 或 GoLand。
- 检查了哪些文件、模块、运行配置或数据库对象。
- 是否发现 warning/error，哪些是本次相关，哪些是历史或范围外问题。
- 运行了哪些 build、run configuration、SQL 或 notebook。
- 哪些检查未运行，以及原因。
- 如果本次是纯文档整理，明确说明未运行 JetBrains MCP 的原因。
````

:::

::: details Todo skill

````md
---
name: "superproductivity-local"
description: "用于处理 Super Productivity 桌面端、本地 REST API、127.0.0.1:3876 接口、Flatpak/RPM 桌面入口、任务检查或本地数据目录的场景。"
---

# Super Productivity 本地使用

## 概览

当桌面端开启本地 REST API 时，用它读取或控制任务。遇到数据目录、启动入口、重复图标或安装来源问题时，先区分 Flatpak 与 RPM 两种安装形态。

## 安装形态

- Flatpak 应用 ID：`com.super_productivity.SuperProductivity`
- Flatpak 数据目录：`~/.var/app/com.super_productivity.SuperProductivity/config/superProductivity`
- Flatpak desktop 文件：`~/.local/share/flatpak/exports/share/applications/com.super_productivity.SuperProductivity.desktop`
- 已观察到的 RPM 包名：`superProductivity`
- RPM 数据目录：`~/.config/superProductivity`
- RPM desktop 文件：`/usr/share/applications/superproductivity.desktop`
- RPM 执行入口：`/opt/Super Productivity/superproductivity`

如果只想隐藏原生 RPM 启动器而不卸载包，可创建 `~/.local/share/applications/superproductivity.desktop`：

```ini
[Desktop Entry]
Type=Application
Name=Super Productivity
Hidden=true
```

然后刷新 desktop 数据库：

```bash
update-desktop-database ~/.local/share/applications
```

## 本地 REST API

应用内开关名称类似 “Enable local REST API (desktop only)”。服务监听 `http://127.0.0.1:3876`，路径没有 `/api` 前缀。

使用 CLI 或脚本发请求，不要带浏览器 `Origin` header。带 Web Origin 的请求会被设计性拒绝。

常用只读请求：

```bash
curl -sS http://127.0.0.1:3876/health | jq
curl -sS http://127.0.0.1:3876/status | jq
curl -sS 'http://127.0.0.1:3876/tasks' | jq
curl -sS 'http://127.0.0.1:3876/tasks?includeDone=true&source=all' | jq
curl -sS 'http://127.0.0.1:3876/projects' | jq
curl -sS 'http://127.0.0.1:3876/tags' | jq
```

任务摘要：

```bash
curl -sS 'http://127.0.0.1:3876/tasks' \
  | jq '{ok, count: (.data | length), sample: (.data[:5] | map({id, title, isDone, projectId, tagIds, dueDay, dueWithTime, timeEstimate, timeSpent}))}'
```

已确认路由：

- `GET /health`
- `GET /status`
- `GET /task-control/current`
- `POST /task-control/current`，body 为 `{ "taskId": "..." }` 或 `{ "taskId": null }`
- `POST /task-control/stop`
- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `POST /tasks/:id/start`
- `POST /tasks/:id/archive`
- `POST /tasks/:id/restore`
- `GET /projects`
- `GET /tags`

`GET /tasks` 支持的 query 参数：

- `query=<text>`
- `projectId=<id>`
- `tagId=<id>`
- `includeDone=true|false`
- `source=active|archived|all`

响应结构为 `{ "ok": true, "data": ... }` 或 `{ "ok": false, "error": { "code": "...", "message": "..." } }`。

## 本地命令注意

在 `ip-avatar-mvp` 工作区内运行 shell 命令时，优先使用用户的 `rtk` 包装器，例如 `rtk proxy curl ...`、`rtk flatpak info ...`、`rtk rg ...`、`rtk run -c '...'`。
````

:::
