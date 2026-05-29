# 自定义 skill 整理

::: details Workflow Router skill

````md
---
name: workflow-router
description: "用于代码项目或明确开发任务的统一入口路由：当用户请求开发、重构、调试、测试失败、代码审查、项目文档、收尾、提交、推送、PR，或显式使用 /dev、/feature、/refactor、/debug、/review、/docs、/finish、/address-comments、/optimize、/security 等入口时使用。普通问答、轻量文件整理和非代码任务不强制使用。"
---

# Workflow Router

## 目标

先判断开发任务应进入哪个工作流，再开始行动。这个 skill 只负责入口、模式和动作边界；具体执行交给目标 skill。

每次本 skill 生效时，必须先用一句中文宣布路由，包含入口、原因、动作边界。句式可以自然，但信息必须完整。

示例：

```text
我把这次任务路由到 `/debug`，因为这是测试失败；我会先复现和定位根因，不会先猜修。
```

## 触发范围

自动启用：

- 当前是代码项目，且用户请求开发、修复、重构、调试、测试、构建、lint、review、commit、push、PR、项目文档或收尾。
- 用户显式使用 `/dev`、`/feature`、`/refactor`、`/debug`、`/review`、`/docs`、`/finish`、`/address-comments`、`/optimize`、`/security`。

不强制启用：

- 普通问答。
- 轻量文件查找或整理。
- 简单系统命令。
- 非代码任务。
- 用户明确说只讨论且不需要进入开发流程。

## 路由表

| 入口 | 目标流程 | 默认改文件 | 默认提交 | 默认边界 |
| --- | --- | --- | --- | --- |
| `/dev`、`/feature`、`/refactor` | `structured-development-workflow` | 是，但先按风险过 Grill Gate / 文档 / 计划 | 结构化多步骤任务可每步提交 | 主开发、行为变化、重构、大改动 |
| `/debug` | `debug-workflow` | 可能，根因明确后 | 否 | 先失败证据和可验证假设，再最小修复 |
| `/review` | `review-workflow` | 否 | 否 | 只读本地代码审查，findings first |
| `/docs` | `docs-workflow` | 默认只改文档 | 否 | 文档、AGENTS.md、skill、计划、说明 |
| `/finish` | `finishing-code-changes` | 可以修收尾范围内问题 | 否 | 检查和收尾，不默认提交 |
| `/address-comments` | GitHub comments 或 receiving-code-review 风格 | 可能，先验证评论成立 | 否 | 处理外部 review feedback，不盲改 |
| `/optimize` | `structured-development-workflow` 的 optimize 模式 | 是 | 按主开发规则 | 先指标、基线、瓶颈，再优化和复测 |
| `/security` | 默认 `/review security`；修复为 `/dev security`；复现为 `/debug security` | 视入口而定 | 否 | 安全审查或修复，必须写范围和未覆盖范围 |

## 领域联动

路由先判断任务类型，再叠加领域 skill。领域 skill 不替代 `/dev`、`/debug`、`/review`、`/finish` 等入口。

前端结构：

- 任务涉及前端组件、页面、React、Next.js、Vue、Tailwind、shadcn、CSS Modules、普通 CSS、样式重构或 UI 代码审查时，必须同时使用 `frontend-structure-workflow`。
- React / Next.js 相关代码必须同时参考 `vercel-react-best-practices`。
- 如果任务涉及可复用组件 API、compound components、render props 或组件库设计，同时考虑 `vercel-composition-patterns`。
- 如果任务重点是视觉设计、页面美化或新界面创作，再叠加 `frontend-design` 或项目对应设计 skill。

## 不确定任务类型

如果任务类型不确定，最多执行 3 个只读侦察动作再宣布路由。

允许：

- `git status`、`git diff`、`git diff --stat`。
- `rg` 搜索。
- 读取相关文件、日志、文档。

禁止：

- 修改文件。
- 运行重型测试、构建或外部副作用命令。
- 提交、推送、开 PR。

3 个只读动作后仍不确定时，用 `grill-me` 风格问一个问题，并给推荐入口。

## Grill Gate

进入 `structured-development-workflow` 的头脑风暴或需求澄清阶段时，使用 Grill Gate：

- 一次只问一个问题。
- 每题给推荐答案。
- 问题必须具体、可回答、能推动决策。
- 默认连续最多 5 个问题。
- 5 个问题后仍不清楚时，总结已确认、未确认、阻塞点、推荐下一步，再让用户决定继续追问、降级执行或先写草案。

强制启用：

- 新任务、新阶段、新方向。
- 从讨论转入设计或计划。
- 从计划转入代码前仍有未确认事项。
- 范围扩大、方向变化、涉及破坏性更新。
- 文档、需求和代码现状冲突。

不强制启用：

- 用户明确说继续已确认计划的下一步。
- 已有步骤文档清楚。
- 本轮只是执行已确认计划中的小步骤。

发现不清楚、冲突或可能行为变化时，必须回到 Grill Gate。

## 硬规则优先级

用户可以降级流程重量，但不能绕过安全和真实性底线。

不可跳过：

- destructive command 确认。
- commit、push、PR 的明确授权。
- 完成前 fresh verification。
- bugfix 至少要有根因证据或最小复现/失败证据。
- review comments 必须先技术验证，不能盲改。
- 不回滚、覆盖、删除用户已有改动。
- 不泄露敏感信息。

可以被用户明确降级：

- 完整设计文档。
- 多轮 Grill Gate。
- subagent 使用。
- 每步提交。
- 完整方案权衡。
- 完整文档拆分。

## 模式

只讨论模式：

- 触发词：只讨论、先聊聊、只给方案、不要改代码、先别动文件。
- 不修改文件，不提交，不推送。
- 不运行命令，除非用户允许或只需极轻量只读上下文。
- 可以使用 Grill Gate、给方案、给权衡和推荐。
- 不写实施计划文件，不声称完成实现。

快速模式：

- 触发词：快速修一下、小改动、不用写文档、直接改这个点、简单处理、quick fix。
- 可以降级完整文档、多轮 Grill Gate、subagent、每步提交、完整方案权衡。
- 不能跳过明确边界、dirty worktree 保护、bugfix 证据、review comments 技术验证、修改后目标验证、commit/push/PR 授权、destructive 操作确认。
- 范围明确、低风险、验证方式明确时可直接做；需求含糊、高风险、可能改变行为或验证不明确时必须先问或只读侦察。

模式组合：

- 支持入口和修饰词组合，例如 `/refactor 快速模式`、`/debug 只讨论`、`/review 全面一点`、`/finish 并提交`。
- 合并解析后，在路由宣布中说明最终动作边界。

## 冲突和改判

只在冲突或改判时解释为什么没有使用用户字面入口。

必须说明的情况：

- 用户显式入口被改判。
- 用户要求跳过不可跳过的安全或验证底线。
- 任务风险高，需要升级流程。
- 用户要求快速模式，但任务不适合快速处理。
- 用户说 refactor，但实际会改变行为。
- 用户说 review，但实际要求修复，需要重新确认或分流。

## Dirty Worktree 保护

任何会改文件的入口都必须保护用户已有改动。

默认会改文件前运行：

```bash
rtk git status --short --branch
```

可以跳过：

- 本轮刚运行过且状态未变。
- 用户刚提供可信状态。
- 当前目录不是 git repo。
- 只读 review。
- 只讨论模式。

必须：

- 区分用户已有改动和本次任务改动。
- 不回滚、覆盖、删除无关改动。
- 同文件已有改动时，先读现状再编辑。
- 最终说明中区分本次改动和已有未处理改动。

## Subagent

本 skill 不主动决定 subagent：

- 不直接派发 subagent。
- 不决定并发策略。
- 可以在路由说明中标记可能需要 subagent。
- 具体是否使用由目标 workflow skill 决定。
- 一旦使用 subagent、`/agent` 或多 agent 协作，必须遵守 `subagent-orchestration`。

````

:::

::: details 文档工作流 skill

````md
---
name: docs-workflow
description: "用于项目文档、README、AGENTS.md、Codex skills、设计文档、执行计划、变更说明和工作流文档的创建或修改。当用户显式使用 /docs，或请求更新文档/skill/AGENTS 时使用。默认只改文档、不提交，并做轻量验证。"
---

# Docs Workflow

## 目标

安全修改文档、AGENTS.md 和 skills。默认只改文档，不提交、不推送；如果文档任务变成代码改动，重新路由到 `/dev`、`/debug` 或 `/finish`。

## 修改前

修改 AGENTS.md 或 skill 前必须：

- 读取现有文件。
- 识别并保留用户已有硬规则。
- 列出保留、新增、替换/合并、删除清单。
- 未经明确要求，不删除已有规则。
- 如果要删除、覆盖、合并旧规则，先说明理由。

特别保留：

- 全局语言回复规则。
- RTK 命令规则。
- subagent 调度规则。
- 用户已有项目约束。

## 编辑原则

必须：

- 正文默认使用中文；代码标识符、命令、路径、错误信息、接口字段、指标名可保留英文。
- 修改 skill 时保留 YAML frontmatter。
- skill frontmatter 只包含 `name` 和 `description`。
- skill `name` 使用英文 slug。
- skill `description` 写清楚触发场景，不只写泛泛能力。
- 命令示例优先使用 RTK 形式。
- 不新增 README、安装指南、变更日志等无必要附属文件。

可以：

- 对普通 Markdown 做轻量结构整理。
- 对项目文档按既有目录规范调整。
- 小同步文档可以和代码提交合并，但 `/docs` 默认不提交。

禁止：

- 覆盖用户已有规则。
- 删除无法确认用途的约束。
- 在文档里写真实密钥、token、cookie、私钥、签名材料。
- 把英文待办或待定占位符留在最终文档中，除非用户明确要求保留。

## 验证

完成后必须做固定轻量验证：

- skill 文件：检查 YAML frontmatter、`name`、`description`、Markdown 基本结构。
- AGENTS.md：检查关键规则仍存在。
- 普通 Markdown：检查无英文待办、待定或明显占位符，必要时检查链接。
- 命令示例：检查是否优先使用 RTK。

默认不跑代码测试、构建或 JetBrains MCP。只有文档改动影响命令、配置、源码或运行行为时，才进入对应代码验证流程。

## 收尾

最终说明必须写清：

- 改了哪些文档。
- 保留了哪些关键规则。
- 新增/替换/删除了什么。
- 做了哪些轻量验证。
- 是否存在未验证或需要后续确认的范围。

默认不 commit。用户明确要求提交时，再联动 `committing-code-changes` 或当前仓库规则。

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

## 文档位置和命名

- 默认把需求 plan、方案权衡、架构设计、执行计划、验收标准、优化记录等总览文档写在项目根目录的 `docs/` 下。
- 默认把具体步骤文档写在 `docs/plan/step/{任务概述名}/` 下；`{任务概述名}` 是占位符，不是真实固定目录名，要替换成当前任务的中文概述名，例如 `docs/plan/step/订单支付重构/`。
- 每个 `docs/plan/step/{任务概述名}/` 目录下必须包含 `00-总览.md`，用于说明该任务的整体目标、步骤列表、执行顺序、依赖关系、统一验收标准和全局风险。
- 文档文件名必须使用中文，避免使用只有英文缩写或无语义编号的文件名。
- 文档正文必须使用中文；只有代码标识符、命令、路径、错误信息、接口字段、指标名等必须保留原文时才使用英文。
- 如果项目已有明确文档目录规范，优先遵守项目规范；没有项目规范时使用以上默认路径。

## 工程原则（KISS / YAGNI / DRY / SOLID）

- KISS：优先最小可行改动，避免不必要的复杂性。
- YAGNI：只实现用户当前明确需要的内容，拒绝过度设计。
- DRY：抽取重复逻辑，但不为“未来复用”而提前抽象。
- SOLID：保持职责单一、接口小而清晰、依赖抽象而非具体实现。

## 预设 subagent 使用策略

当前全局预设了 3 个 Codex 自定义 subagent，位于 `~/.codex/agents/`。派发、等待、复用、并行、整合和关闭策略交给 `subagent-orchestration`。

- `planning_reviewer`：用于复杂需求、方案权衡、架构边界和执行步骤文档的只读审查。
- `step_implementer`：用于边界明确的单个执行步骤实现或修复。
- `final_delivery_reviewer`：用于复杂任务最终交付前的只读收尾复核。

使用边界：

- 只有在任务复杂、风险较高、步骤可独立拆分，或用户明确要求多 agent 协作时，才显式使用这些 subagent；普通小改动不强制使用。
- 需求计划、方案权衡、架构设计或步骤拆分完成后，可让 `planning_reviewer` 做独立审查，再根据审查结果更新文档。
- 单个步骤有清晰任务文档、允许修改范围、验收标准和验证命令时，可交给 `step_implementer` 实现。
- 进入最终收尾时，按 `finishing-code-changes` 执行；复杂任务可先让 `final_delivery_reviewer` 做只读复核。
- 不要为了形式派发 subagent；如果主 agent 本地处理更直接，就直接处理。

## 固定流程

1. 把第一版回答视为草稿。
   - 不要把第一个方案直接当最终答案。
   - 明确业务域、能力域、流程阶段、职责边界。
   - 记录可选方案、取舍理由、风险和不确定点。
   - 用 KISS / YAGNI / DRY / SOLID 约束方案，不要把草稿扩展成过度设计。
   - 如果任一方案包含破坏性更新，必须明确标记并说明影响范围、迁移方式和回滚方案。
   - 对复杂需求，可在草稿成形后使用 `planning_reviewer` 做只读审查。

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
   - 明确是否存在破坏性更新，例如接口不兼容、数据结构变化、迁移不可逆、删除旧能力、配置变更导致旧环境不可用、用户数据或运行态数据需要迁移。
   - 架构设计必须符合 KISS / YAGNI / DRY / SOLID：优先简单直接，拒绝未被当前需求证明必要的抽象。
   - 不要只写“采用最佳实践”；要写清楚它解决了什么具体问题。

5. 基于架构生成执行文档。
   - 把架构拆成可执行任务。
   - 每个任务必须说明目标、涉及文件、输入输出、依赖顺序、风险点和验收标准。
   - 如果存在破坏性更新，执行文档必须单独列出“破坏性更新说明”，包含影响对象、兼容策略、迁移步骤、回滚方案、验证方式和用户可见变化。
   - 总览类执行文档写入 `docs/`，具体步骤文档写入 `docs/plan/step/{任务概述名}/`，其中 `{任务概述名}` 要替换成当前任务的中文概述名。
   - 每个具体任务步骤目录先写 `00-总览.md`，再写后续步骤文档。
   - 文档名和正文都使用中文，路径中的具体任务名也使用中文。
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
   - 实现时持续遵守 KISS / YAGNI / DRY / SOLID，尤其不要为了未来可能复用提前抽象。
   - 如果步骤边界清晰且可独立验证，可使用 `step_implementer` 执行该单步实现；否则由主 agent 本地完成。

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
    - 复杂任务、高风险任务或多步骤任务可先使用 `final_delivery_reviewer` 做只读复核，再处理其发现的问题。
    - 最终收尾必须检查测试、日志、注释、文档一致性、硬验收标准、遗留风险和删除清单。

## 交付物

执行过程中按风险裁剪产出或维护这些材料；最低要求是能支撑当前任务 review、实现、验证和回滚，不要求每次都产出完整文档套件：

- 需求 plan。
- AI 反向问题和已补上下文。
- 方案权衡记录。
- 架构文档。
- 执行文档。
- 分步骤任务文档。
- 每步 checklist。
- 硬验收标准。
- 手动生成或模板生成代码边界说明。
- 破坏性更新说明，如果适用。
- 优化方案和采纳记录。
- 遗留风险清单。

默认目录示例：

```text
docs/
  需求计划.md
  方案权衡.md
  架构设计.md
  执行计划.md
  验收标准.md
  优化记录.md
  plan/
    step/
      订单支付重构/
        00-总览.md
        步骤01-任务说明.md
        步骤02-任务说明.md
        检查清单.md
```

## 常见错误

- 把 AI 第一个答案当最终设计。
- 需求、架构、执行步骤同时混在一个文档里，导致职责不清。
- 文档散落在项目根目录、临时文件或英文无语义文件名里，后续收尾无法稳定对照。
- checklist 只有“完成实现”，没有测试、日志、skill review 和验收标准。
- 发生破坏性更新但没有提前标记影响范围、迁移方式和回滚方案。
- 用模糊标准验收性能或稳定性。
- AI 在执行中偷偷新增文档没有要求的能力。
- 为了“看起来架构更完整”引入当前需求不需要的抽象、扩展点或复杂层级。
- 重构后没有重新对照文档和测试。

````

:::

::: details 前端结构工作流 skill

````md
---
name: frontend-structure-workflow
description: "用于前端组件结构和样式边界控制：当用户写、改、审查或重构 React、Next.js、Vue、Tailwind、shadcn、CSS Modules、普通 CSS 等前端 UI 代码时使用。重点防止页面组件过大、不拆组件、状态/JSX/CSS 混在一起、全局样式堆业务样式。React/Next 相关代码必须同时参考 vercel-react-best-practices。"
---

# Frontend Structure Workflow

## 目标

约束前端代码的组件边界、状态边界和样式边界。这个 skill 不是视觉设计 skill；视觉和审美仍交给 `frontend-design` 或项目既有设计系统。

使用本 skill 时，仍按任务类型走原入口：

- 新功能、重构、行为变化 -> `structured-development-workflow`。
- bug 或异常行为 -> `debug-workflow`。
- 本地审查 -> `review-workflow`。
- 收尾 -> `finishing-code-changes`。

## React / Next 联动

写、审查或重构 React / Next.js 代码时，必须同时参考 `vercel-react-best-practices`。

重点检查：

- 不在组件内部定义子组件。
- 拆分独立依赖的 hooks。
- 派生状态优先 render 阶段计算，不用无意义 effect。
- callback、effect dependencies、memo 使用符合 React 性能规则。
- 避免因为组件拆分引入新的 re-render、bundle 或 data fetching 问题。

如果任务涉及可复用组件 API、compound components、render props 或组件库设计，同时考虑 `vercel-composition-patterns`。

## 写代码前先看结构

修改前必须先观察当前项目约定：

- 组件目录如何组织。
- 样式使用 Tailwind、CSS Modules、普通 CSS、styled-components、shadcn 还是其他体系。
- 是否已有 `components`、`features`、`hooks`、`utils`、`styles` 约定。
- 是否已有 `cn`、`cva`、variant helper、design tokens 或主题变量。

禁止在未确认项目样式体系前新建另一套样式组织方式。

## Component Map

中等以上前端任务必须先给 component map，哪怕很短：

```text
Page / Route：页面编排、数据入口、主要状态协调
Feature Component：一个业务区块
Leaf Component：复杂或重复 UI 单元
Hook：状态、事件、副作用、派生数据
Utils：纯数据转换
Style File：对应组件或 feature 的样式
```

小改动可以不写完整 component map，但仍要判断是否会让现有组件继续膨胀。

## 默认拆分触发条件

出现以下情况时，优先拆分组件、hook、utils 或样式文件：

- 单个组件超过约 250-300 行，且继续增长。
- 一个组件包含 3 个以上明显 UI 区块。
- 同时包含数据请求、状态副作用、大段 JSX、复杂样式。
- JSX 片段重复 2 次以上。
- className、variant 或 CSS selector 大量重复。
- CSS 文件同时服务多个无关组件。
- 全局 CSS 出现业务组件选择器。
- 一个文件里同时维护页面布局、弹窗、表单、列表项、状态机和 API 适配。

拆分后的文件必须有清晰职责；不要只为了变多而拆。

## 样式边界

全局样式只放：

- reset / normalize。
- 字体、基础排版。
- design tokens、CSS variables。
- app shell 级布局变量。
- 第三方库必要覆盖，且要有范围约束。

组件或 feature 样式应靠近对应组件：

- CSS Modules 项目：复杂组件优先使用同名 `.module.css`。
- Tailwind 项目：重复长 className 优先抽组件、variant helper 或项目已有 `cn` / `cva` 模式。
- shadcn 项目：优先沿用 shadcn 组件、variant 和项目已有 tokens。
- 普通 CSS 项目：按 feature 或组件命名，避免无范围全局 selector。

禁止：

- 把新业务组件样式继续堆进全局 CSS。
- 用一个巨大 CSS 文件承载多个无关页面。
- 为单个组件引入全新 styling framework。
- 用深层选择器硬覆盖本可通过 props、variant 或组件边界解决的问题。

## 状态和逻辑边界

优先拆出：

- 复杂派生数据 -> 局部变量、selector、pure helper。
- 多个事件处理器共享流程 -> hook 或 action builder。
- 副作用和订阅 -> 专门 hook。
- 纯格式化、排序、过滤 -> utils。

不要拆出：

- 只使用一次、很短、没有独立语义的 JSX。
- 为未来可能复用而提前抽象的组件。
- 只包一层 `div` 且没有语义的组件。

## Review 检查清单

审查前端改动时必须看：

- 页面组件是否继续膨胀。
- 新增 UI 是否有合理组件边界。
- CSS 是否放在正确作用域。
- 是否新增无关全局 selector。
- 重复 JSX / className 是否应抽出。
- React / Next 代码是否已参考 `vercel-react-best-practices`。
- 拆分是否真的降低复杂度，而不是制造目录噪音。

## 验证

按项目已有命令验证：

- 前端行为变化：目标测试或交互验证。
- TypeScript 项目：typecheck。
- 样式/组件改动：lint 或 build，必要时浏览器截图/视觉检查。
- 只做结构重构：至少跑目标测试、typecheck 或 build 中最能证明无行为漂移的一项。

不能验证时，必须说明原因和残余风险。

````

:::

::: details 调试工作流 skill

````md
---
name: debug-workflow
description: "用于 bug、测试失败、构建失败、异常行为、性能异常、集成问题或用户显式使用 /debug 的根因优先调试流程。要求先收集失败证据和可验证根因假设，再做最小修复；复杂修复升级到 structured-development-workflow。"
---

# Debug Workflow

## 目标

用证据驱动调试，避免猜修。先复现和定位根因，再做最小修复，最后用 fresh verification 证明结果。

默认不提交、不推送。只有用户明确要求提交、推送或 PR 时才进入对应动作。

## 基本流程

1. 收集失败证据。
   - 自动化测试失败。
   - 可复现命令失败。
   - 错误栈、日志、手动复现步骤。
   - 最近改动和症状之间的证据链。
2. 阅读错误信息和相关上下文。
   - 完整读错误、栈、行号、路径、错误码。
   - 检查最近改动、配置、依赖、环境差异。
3. 建立可验证根因假设。
   - 写清楚“我认为根因是 X，因为 Y 证据”。
   - 写清楚下一步如何验证或否定。
   - 一次只验证一个主要假设。
4. 优先写回归测试。
   - 能自动化复现时，先写失败测试，看它失败。
   - 再做最小修复，看测试通过。
5. 不能写自动化测试时，说明原因。
   - 用最强可用验证替代，例如目标命令、构建、lint、手动复现、日志检查、一次性脚本。
   - 在最终说明中记录测试缺口和残余风险。
6. 最小修复。
   - 只修根因，不做无关重构。
   - 不顺手扩大范围。
7. fresh verification。
   - 运行能证明修复的目标验证。
   - 没有验证证据，不得声称修复完成。

## 根因标准

调试中必须至少有可验证假设，不要求一开始完全证明代码级根因。

交付前：

- 如果已修复，说明最终根因。
- 如果只是缓解或绕过，说明未确认部分和残余风险。

示例：

```text
假设：失败来自缓存 key 没包含 userId。
证据：两个用户请求命中同一 cache entry，日志里 key 相同但 payload 不同。
验证：加一个失败测试复现跨用户污染。
```

## 停止试错

如果连续 3 个主要根因假设被否定，或连续 3 次修复未解决问题：

- 停止继续改代码。
- 总结已验证的事实。
- 总结已排除的假设。
- 重新追调用链、数据流或状态流。
- 判断是否是架构边界或需求理解问题。
- 必要时升级到 `structured-development-workflow`。
- 向用户说明阻塞点和推荐下一步。

## 升级条件

升级到 `structured-development-workflow`：

- 根因显示需要跨模块重构。
- 修复会改变用户可见行为。
- 涉及数据结构、权限、安全、支付、并发、迁移。
- 需要重新设计状态流、事务边界、缓存边界或模块职责。
- 连续 3 次主要假设失败。

## 允许和禁止

必须：

- 先有失败证据或复现证据。
- 先有可验证根因假设再修。
- 修改后运行目标验证，或说明无法验证的原因。
- 保护 dirty worktree，不回滚用户已有改动。

禁止：

- 没有证据就提出修复方案。
- 一次改多个无关点来“试试看”。
- 把测试通过写成“根因已确认”，除非证据链也成立。
- 没有 fresh verification 就声称修复完成。

## 收尾

修复后按任务风险决定是否进入 `finishing-code-changes`。

默认不 commit；如果用户明确要求提交，先完成必要验证，再联动 `committing-code-changes`。

````

:::

::: details 代码审查工作流 skill

````md
---
name: review-workflow
description: "用于本地代码改动的只读审查：当用户显式使用 /review，或请求检查本地 diff、审查 touched files、找 bug/回归风险/测试缺口/设计问题时使用。默认不修改文件、不提交；外部 PR review comments 不走本 skill。"
---

# Review Workflow

## 目标

像代码审查一样审查本地改动。默认只读，不修改文件、不提交、不推送。

优先发现 bug、回归风险、测试缺口、设计边界问题和可维护性风险。不要把审查写成泛泛总结。

## 默认范围

默认审查：

- `git status` / `git diff`。
- 本次 touched files。
- 变更附近上下文。
- 必要时追一层调用方、测试、类型定义。

默认不扩大到无关模块。用户明确说“全面审查这个模块”时，才扩大范围。

## 验证策略

按风险判断是否运行轻量只读验证：

- 目标测试。
- typecheck。
- lint。
- `git diff --check`。

触发条件：

- diff 涉及行为变化。
- 共享逻辑。
- 测试代码。
- 构建、类型、配置。
- review 结论依赖验证证据。

默认不运行：

- 全量测试。
- build。
- 需要外部服务或明显很慢的命令。

全量验证交给 `/finish`，或在用户明确要求“完整检查 / 跑全量 / 收尾”时执行。

## 输出格式

必须 findings first，按严重程度排序。每条包含具体文件/行号、问题、影响、建议。

格式：

```markdown
发现：
- Critical: [path:line] 问题。影响：...。建议：...
- Important: [path:line] 问题。影响：...。建议：...
- Minor: [path:line] 问题。影响：...。建议：...

残余风险：
- ...

总结：
- ...
```

没有发现阻塞问题时：

```markdown
发现：
- 未发现阻塞问题。

残余风险：
- ...

总结：
- ...
```

## 修复边界

即使发现 Critical，也不自动修。只报告并建议下一步入口。

用户明确说“修掉这些问题”后，重新路由：

- bug、回归、测试失败、异常行为 -> `/debug`。
- 结构、边界、重构、行为调整 -> `/dev` 或 `/refactor`。
- 文档、说明、skill、AGENTS -> `/docs`。
- 纯格式、lint、未使用 import 等小问题 -> `/dev` 快速模式。

## 外部 Review Comments

外部 PR review comments、CodeRabbit、同事反馈不走本 skill。

改用 `/address-comments`：

- GitHub PR comments 使用 `github:gh-address-comments`。
- 普通外部反馈按 receiving-code-review 风格处理。
- 先理解和验证评论是否成立，再决定是否修改。
- 不盲目迎合外部 reviewer。

## 禁止

- 不默认修改文件。
- 不默认提交或推送。
- 不用表扬、泛泛总结替代 findings。
- 不扩大到无关模块，除非用户要求。
- 不把未运行验证写成“无风险”。

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

## Build 默认策略

- 收尾默认不运行 `build` / `compile` / 项目级构建命令。
- 只有用户明确说“build”、“构建”、“编译”、“跑全量构建”、“完整 build 检查”等，才运行 build 或 compile。
- 如果项目文档、执行步骤或硬验收标准要求 build，但用户本轮没有明确授权，先说明该要求和验证缺口，不直接运行 build。
- 可优先使用更小验证：目标测试、typecheck、lint、`git diff --check`、IDE 文件级 inspection 或手动验证。
- 如果 JetBrains MCP 的 `build_project` 属于项目级构建，也按同一规则处理；文件级 inspection 可继续按需运行。

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
   - 如果确认是文档过期，且文档属于本次任务范围、验收依据或会误导后续开发/交付，必须同步更新文档；如果文档不在本次范围内或无法安全修改，最终说明必须列出具体文档路径、漂移内容和后续处理建议，不能只写“文档不一致”。

3. 使用相关 skill 和最佳实践 review 代码。
   - 根据改动内容加载对应 skill，例如前端、React、shadcn、Tailwind、Python 后端、API 设计、pytest、Vitest、数据库、调试、安全等。
   - 检查正确性、回归风险、边界条件、API 兼容性、可访问性、性能和可维护性。
   - 用 KISS / YAGNI / DRY / SOLID 复查实现：是否过度设计、是否提前抽象、是否职责混乱、是否接口过大或依赖具体实现过重。
   - 检查是否存在嵌套过多的三元表达式；如果可读性下降或分支含义不清，必须优化为更清晰的条件变量、函数、映射表或常规 `if/else`。
   - 发现问题时，按照相关 skill 的最佳实践和当前代码库风格修复。
   - 不要为了完成流程而引入大范围重构；只修复与本次任务、touched files 或阻塞验证直接相关的问题。

4. 仅在代码改动时通过 JetBrains MCP 跑 IDE 检查。
   - 使用 `jetbrains-mcp-tools` 选择合适的 JetBrains MCP 能力和检查范围。
   - 如果本次只整理文档、说明文件、README、skill 文档、Markdown 文档等，不需要跑 JetBrains MCP；改为运行对应文档自身的轻量校验，例如 YAML 解析、Markdown/skill validator、打包校验或链接检查。
   - 如果本次触碰了源码、测试代码、构建脚本、依赖声明、运行时配置、数据库迁移、类型声明等会影响运行或编译的文件，就必须跑 JetBrains MCP。
   - 优先使用当前可用的 JetBrains MCP，例如 PyCharm 或 IDEA。
   - 已知项目路径时必须传入项目路径。
   - 对本次触碰过的源码文件运行文件级检查，检查范围必须包含 warning，不要只看 error。
   - 默认不运行项目 build 或 compile；只有用户明确声明要 build、构建、编译或跑全量构建时才运行。
   - 本次新增 warning、本次改动直接相关 warning、阻塞构建或验证的 warning 都视为阻塞项，修复后重跑对应检查。
   - 如果 IDE 报出 touched scope 之外或本次改动前已存在的历史 warning，不要偷偷忽略；在最终说明中标明这是范围外既有问题，并给出足够信息让用户判断。
   - 范围外或历史问题默认只记录不修复；只有它阻塞本次验证或用户明确要求时，才扩大修复范围。

5. 验证适用的硬验收标准。
   - 如果用户、需求 plan 或执行文档给出了硬指标，例如 `P95 < 200ms`、覆盖率下限、错误率、核心业务样例、兼容行为，必须用测试、基准、日志、允许范围内的命令输出或手动验证证据支撑；需要 build 作为证据时仍必须先有用户明确授权。
   - 如果任务明确涉及性能、稳定性、覆盖率、安全性等质量目标，但只有“系统应该很快”“体验要好”“逻辑要稳定”这类模糊标准，不要自行解释为通过；要说明本次采用了什么替代验证，以及剩余解释空间。
   - 如果是普通小改动且没有质量指标要求，不需要强行制造硬指标；写明不适用即可。
   - 如果已有硬指标但无法验证，不能声称该指标已通过。

6. 补充必要验证。
   - 行为变化、bugfix、共享逻辑、API 契约、状态流转、持久化、用户可见流程，都要优先补测试。
   - 使用当前仓库已有的测试框架和测试风格。
   - 不要为了满足 checklist 新增无意义测试；测试必须覆盖真实行为、风险分支或回归点。
   - 如果确实无法补测试，要说明原因，并运行最强可用的非 build 验证，例如目标测试、类型检查、lint、一次性脚本或手动验证；除非用户明确声明，否则不使用 build 作为默认替代验证。
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
- 代码改动：写明 inspection 结果；只有用户明确声明运行 build/compile 时，才写 build 结果。说明 touched files 是否已经没有 warning 及以上问题。
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
- 用户明确要求提交时，如果暂存区已有文件，先把暂存区视为用户已选中的提交候选，必须查看 staged diff 后再决定提交粒度。
- 暂存区已有内容可以按逻辑拆成多次额外 commit，直到暂存区没有剩余文件；拆分时只移动 index 中的精确路径或 hunk，不改工作区内容，也不要把未确认的未暂存改动混入。
- 如果暂存区内容明显分属多个范围，优先拆成多个 commit；如果同一文件需要按 hunk 拆分但无法非交互安全处理，先说明限制并请求用户确认。
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
   - 运行 `rtk git status --short`。
   - 查看本次相关文件 diff。
   - 识别无关改动，避免带入 commit。

2. 处理已有暂存区。
   - 如果用户明确要求提交且暂存区已有文件，查看 `rtk git diff --cached --stat` 和必要的 `rtk git diff --cached`。
   - 如果暂存区范围单一，直接提交 staged 内容。
   - 如果暂存区包含多个独立范围，按逻辑拆成多次 commit；每完成一次都重新查看 `rtk git status --short`，继续处理剩余 staged 内容，直到暂存区为空。
   - 提交这些既有暂存内容后，最终说明中写清“已把原暂存区内容一起提交”，并逐个列出 commit。

3. 判断提交类型。
   - 新功能用 `feat`。
   - 修复 bug 用 `fix`。
   - 纯文档用 `docs`。
   - 纯格式用 `style`。
   - 重构用 `refactor`。
   - 测试用 `test`。
   - 构建、脚本、辅助工具用 `chore`。

4. 判断是否有破坏性更新。
   - 如果有，Footer 必须包含 `BREAKING CHANGE:`。
   - `BREAKING CHANGE:` 必须说明影响范围、理由、迁移方法。
   - 如果没有，Footer 不要写破坏性更新内容。

5. 精确 staged。
   - 只 stage 本次任务相关文件。
   - 不要使用会带入无关改动的粗暴命令。

6. 创建 commit。
   - 使用规范 commit message。
   - 如果需要多行 message，使用非交互方式传入 Header、Body 和 Footer。

7. 提交后确认。
   - 查看 `rtk git status --short`，确认本次范围已提交。
   - 如果还有未提交改动，说明它们是否是无关改动或用户已有改动。
   - 不要 push，除非用户明确要求。

## 输出要求

最终说明必须包含：

- 提交哈希；如果一次产生多个 commit，逐个列出。
- Commit message；如果一次产生多个 commit，逐个列出。
- 已提交文件范围；如果一次产生多个 commit，按 commit 归类。
- 如果提交前暂存区已有内容，说明是否已把原暂存区内容一起提交，以及暂存区是否已清空。
- 是否存在未提交改动。
- 是否推送；默认写“未推送，因为用户未明确要求推送”。

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

::: details Subagent 调度 skill

````md
---
name: "subagent-orchestration"
description: "用于 Codex 自定义 subagent 的调度、生命周期、并发数量、任务边界、阻塞等待、结果整合和关闭策略，适用于多 agent 协作、并行审查、步骤实现和最终复核。"
---

# Subagent 调度流程

## 目标

让 subagent 作为受控的协作手段，而不是默认执行方式。使用 subagent 前必须先判断任务是否独立、边界是否清楚、是否可验证、是否真的能降低主线复杂度。

## 适用场景

- 用户明确要求使用 subagent、`/agent` 或多 agent 协作。
- 需要使用预设 Codex 自定义 subagent：`planning_reviewer`、`step_implementer`、`final_delivery_reviewer`。
- 需要并行审查、独立探索、边界明确的步骤实现、测试排查或最终复核。
- 需要判断子 agent 是否阻塞主线、是否应该等待、是否应该复用已有线程、何时关闭线程。

## 不适用场景

- 普通小改动、单文件简单修改、纯说明性回答。
- 任务边界不清、验收标准不清、写入范围不清。
- 多个任务高度耦合，或多个 agent 需要同时修改同一批文件。
- 主 agent 本地处理更直接，派发 subagent 只会增加调度成本。

## 预设 subagent

当前全局预设 subagent 位于 `~/.codex/agents/`：

- `planning_reviewer`：复杂需求、方案权衡、架构边界和执行步骤文档的只读审查。
- `step_implementer`：边界明确的单个执行步骤实现或修复。
- `final_delivery_reviewer`：复杂任务最终交付前的只读收尾复核。

## 调度原则

- 派发前先判断 subagent 的结果是否阻塞主线下一步。
- 如果结果是下一步必要输入，明确告诉用户正在等待哪个 agent 的什么结果，然后等待。
- 如果只是旁路审查、独立探索、并行实现或最终复核，主 agent 不要原地等待，应继续推进不依赖该结果的主线工作。
- 不要重复执行已经交给 subagent 的同一任务；主 agent 应处理非重叠工作，并在 subagent 返回后整合结论。
- 不要为了形式派发 subagent；派发必须能降低风险、节省上下文、并行推进或提供独立复核。

## 生命周期和数量控制

- 同一时刻最多允许一个 `step_implementer` 写代码；只有明确证明写入范围不重叠时，才允许多个 `step_implementer` 并行。
- 同一复杂任务中，`planning_reviewer` 通常只在需求、架构或步骤文档成形后调用一次；需求或架构重大变化后才重新调用。
- `final_delivery_reviewer` 通常只在最终收尾前调用一次；修复阻塞问题后才允许二次复核。
- 同一步骤返工优先继续发送给原 agent，不新开 agent。
- 新的独立步骤可以新开 agent，但必须重新说明任务目标、上下文、写入范围、验收标准和验证命令。
- subagent 完成且结果已整合后，关闭不再需要的 agent 线程。

## 写入范围控制

- 派发写代码的 subagent 前，必须说明允许修改文件、禁止修改范围和预计验证命令。
- 并行写代码前，必须确认写入范围不重叠；无法确认时不要并行写。
- subagent 不得回滚、覆盖或删除用户已有改动、其他 agent 的改动或无关文件。
- 如果实现中发现未文档化的破坏性更新，必须停止并升级为阻塞问题，不得自行继续。

## 主 agent 职责

- 维护当前活跃 subagent 清单：agent 名称、任务、是否阻塞、写入范围、状态。
- 为 subagent 提供足够上下文，但不要把无关历史全部塞给它。
- 在 subagent 运行期间推进非重叠工作。
- subagent 返回后，主 agent 必须审阅、整合结论，并决定是否修复、追问用户或记录风险。
- 主 agent 仍对最终结果负责；subagent 的结论不能替代最终验证和交付说明。

## 输出透明度

派发 subagent 时，要求它的最终输出包含：

- 审查或执行范围。
- 读取或修改的文件。
- 对照的规则或验收标准。
- 运行的验证命令和结果；无法验证时说明原因。
- 删除内容，必须写 `Removed: ...` 或 `Removed: none`。
- 未验证内容和剩余风险。

## 常见错误

- 把 subagent 当成默认执行方式。
- 多个 `step_implementer` 同时修改同一个文件。
- 同一步骤返工时反复新开 agent，导致上下文丢失。
- 派出 subagent 后主 agent 原地等待旁路任务。
- subagent 返回后不整合结论，也不关闭线程。
- 把只读 reviewer 的结论当成完整验证或最终收尾。

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

::: details 迁移保障 skill

````md
---
name: migration-assurance
description: 当你要把一个现有系统迁移到另一种语言、框架、运行时或基础设施，并且需要一套可复用的方法来整理当前行为、区分一致性要求与增强项、基于可观测行为设计测试、拆分可验证迁移阶段、持续保持文档与源系统一致时，使用这个 skill。
---

# 通用迁移保障

## 概述

当你在做系统迁移，并且需要的是一套可重复执行的方法，而不是某一种技术栈的专用手册时，使用这个 skill。
它适合处理下面这类工作：
- 在重写之前先整理当前系统真实行为
- 把需求拆成行为一致项和迁移增强项
- 基于可观测行为设计测试，而不是基于想象中的架构
- 把迁移工作拆成带明确门槛的阶段
- 反复检查文档、代码、脚本、配置和环境说明是否仍然一致

这个 skill 故意保持技术栈无关。
无论目标是 Go、Java、Rust、Node.js，还是替换运行时、网关、存储、基础设施，都可以复用这套方法。

## 适用场景

当用户要做下面这些事时，使用这个 skill：
- 把一个代码库迁移到另一种语言或框架
- 重写某个服务，但要求外部行为保持兼容
- 替换基础设施、存储、缓存、队列、代理或网关层
- 产出与现有实现保持一致的迁移文档
- 设计能够证明迁移正确性的测试方案
- 把迁移工作拆成可审计、可测试的阶段
- 用尽量容易理解的方式解释运行和运维概念

如果只是普通功能开发，而不是迁移相关任务，不要使用这个 skill。

## 事实来源

始终把当前正在运行的系统、当前代码、脚本、配置和清单文件当作首要事实来源。
现有文档只能视为维护产物，不能默认当作权威事实。

按任务需要，读取最小必要范围的真实来源：
- 应用入口和路由定义
- 请求与响应模型
- 领域逻辑或服务逻辑
- 存储适配层和外部集成代码
- 基础设施清单和部署 overlay
- 本地环境搭建脚本
- 测试代码（如果存在且可信）
- 日志、指标、链路或其他运行证据（如果可用）

## 核心原则

### 1. 先写清楚当前系统做了什么

先记录当前系统实际上做了什么，再讨论目标系统应该做什么。
如果当前行为有歧义，要明确标记这个歧义，并写出后续如何验证。

### 2. 明确区分一致性要求与增强项

在写文档或改文档之前，先把每个重要要求归类：
- `Behavior parity`
  - 迁移后必须与当前系统保持等价
  - 例如：接口契约、校验规则、状态码、响应头、重试行为、状态流转
- `Migration enhancement`
  - 迁移过程中新增的工程改进
  - 例如：更好的日志、类型更严格、仓储抽象、结构化错误、可观测性增强
- `Known debt`
  - 出于兼容性或阶段性原因，暂时保留或延期处理的问题

不要把迁移增强项写成当前系统已经具备的能力。

### 3. 每个重要结论都必须可观测

迁移文档里的每个重要说法，都应该能通过下面至少一种方式确认：
- 单元测试或服务测试
- 契约测试或 API 测试
- 集成测试或端到端测试
- 手工接口调用或命令行验证
- 清单、配置或脚本检查
- 日志、指标、链路或产物文件

如果一个说法无法被观察和确认，就把它改写成可观察的说法。

### 4. 迁移阶段必须有进入和退出门槛

迁移工作要拆成范围足够小的阶段。
每个阶段都应该定义：
- 范围
- 产出
- 测试
- 手工确认方法
- 已知风险
- 退出门槛

“代码写完了”不等于阶段完成。
只有当产出和行为都能被验证时，阶段才算完成。

### 5. 持续复核，防止文档漂移

迁移文档很容易和实现脱节。
只要下面这些东西有变动，就应该重新做一致性复核：
- 源代码
- 迁移文档
- 脚本或清单
- API 行为
- 目标设计决策

## 标准产出物

按任务需要选择合适的输出。
常见迁移产出包括：
- 当前 API 暴露面文档
- 当前实现逻辑文档
- 面向非专家的运行或基础设施说明
- 本地测试环境参考文档
- 迁移测试规格说明
- 迁移阶段与门槛文档
- 可观测性或日志规范
- 存储与状态职责映射文档
- 记录不一致点和未决问题的复核笔记

决定要维护哪些产出物时，参考 `references/output-map.md`。

## 工作流程

### 1. 先划清边界

先定义清楚：
- 本次到底在迁移什么
- 哪些内容暂时不迁
- 哪些行为必须保持兼容
- 哪些内容允许作为增强项调整
- 哪些运行环境需要被覆盖
- 什么证据可以被视为“迁移正确”的证明

### 2. 先建立当前系统的基线模型

把当前系统用“可观测”的方式整理出来：
- 对外接口
- 请求校验规则
- 响应结构和状态码
- 错误映射
- 异步或后台行为
- 状态流转
- 持久化与缓存职责
- 副作用及其顺序保证
- 运行依赖
- 本地开发和测试假设

### 3. 给每条要求归类

对每一条重要要求，都明确它属于：
- `Behavior parity`
- `Migration enhancement`
- `Known debt`

如果一条要求无法归类，通常说明它还不够清晰。

### 4. 保守地更新文档

改迁移文档时要遵守：
- 先保证当前事实准确
- 避免写推测性结论
- 明确标出只属于目标系统的设计决定
- 优先使用简短、可验证的事实描述
- 如果读者需要，初学者说明和深度实现说明要分开写

### 5. 设计验证矩阵

把每个重要行为映射到一种或多种验证方式：
- 单元测试或服务测试
- API 或契约测试
- 集成测试
- 端到端测试
- 手工确认
- 基础设施检查
- 日志、报告或其他证据产物

优先覆盖对外可见行为。
然后再覆盖状态、副作用、失败处理和运维安全性。

### 6. 拆成迁移阶段

对每个阶段，至少定义：
- 目标
- 输入
- 变更组件
- 预期产出
- 必需测试
- 手工检查方法
- 回滚或隔离思路
- 退出门槛

阶段要小到足以让评审者清楚判断“这一阶段是否通过”。

### 7. 让文档再次和现实对齐

每次重要改动后都要重新对齐：
- 再次比较文档与代码、脚本、清单是否一致
- 立刻修正文档中的不一致项
- 明确列出仍然存在的不确定点
- 记录哪些内容仍然需要实际运行才能最终证明正确

## 常见任务模式

### 文档与代码一致性复核

当你在复核迁移文档和实现是否一致时：
- 先找不一致点
- 给出能证明不一致的源码位置或运行证据
- 只有确认实现路径后再改文档
- 改完后再读一遍相关段落，避免引入新的歧义

### 基于现状设计迁移测试

当你需要从源系统推导测试时：
- 基于真实行为设计测试，而不是基于理想架构图
- 覆盖成功路径、失败路径、边界情况和状态流转
- 需要时覆盖幂等性、重试、后台流程和失败恢复
- 优先验证对外可见契约，而不是内部实现细节

### 解释基础设施或 K8s 概念

当迁移涉及运行和运维概念时：
- 先解释它在当前系统里是干什么的
- 先用简单、具体的话，再讲平台抽象概念
- 每个概念都尽量绑定到具体文件、清单或运行行为
- 如果读者基础薄弱，就单独维护一份入门版说明

### 日志、存储与运维规范整理

当任务涉及日志、数据库、缓存、队列或链路时：
- 先确认当前系统实际上具备什么
- 再定义目标系统希望达到什么标准
- 把“当前状态”和“目标规范”明确分开
- 指定敏感信息边界，以及必须留下哪些证据输出

### 增加目标技术栈专用说明

如果后续迁移确定了具体目标栈：
- 把这个 skill 当作通用方法层
- 另写目标栈专用文档或附录
- 不要让目标技术偏好覆盖掉当前系统事实

## 完成标准

一次迁移规划或迁移复核，至少要达到下面这些标准：
- 重要结论都能追溯到源码、清单、脚本或运行证据
- 一致性要求和增强项已经明确分离
- 每个迁移阶段都有真实的验证路径
- 未解决风险和未知点被明确列出
- 其他工程师接手时，不需要重新摸索同一批事实

## 参考文件

按需读取：
- `references/output-map.md`
  - 用来决定迁移中应该维护哪些产出物
- `references/review-checklist.md`
  - 用来重复执行一致性、可测试性和阶段门槛复核

````

:::

::: details 迁移实现 skill

````md
---
name: migration-implementation
description: 当你已经有一套迁移文档，并且要根据这些文档真正完成代码迁移、补齐测试、落地脚本与配置、按阶段验收迁移结果时，使用这个 skill。它与 migration-assurance 配套，前者负责整理和复核迁移事实，这个 skill 负责基于这些事实把迁移代码做出来。
---

# 通用迁移实现

## 概述

当迁移相关文档已经整理到足够可执行的程度，需要开始真正写迁移代码、补测试、补脚本、做阶段验收时，使用这个 skill。

这个 skill 是 `migration-assurance` 的反向配套版本：
- `migration-assurance` 负责先把当前系统行为、迁移边界、测试要求和阶段门槛整理清楚
- `migration-implementation` 负责把这些文档转化为真实可运行的迁移实现

它是通用方法，不依赖某一种语言、框架或基础设施。

## 适用场景

当用户要做下面这些事时，使用这个 skill：
- 按已有迁移文档开始落地目标代码
- 根据迁移测试规格补测试代码
- 按迁移阶段逐步完成服务、模块、脚本或基础设施替换
- 在迁移过程中保持行为一致项不被破坏
- 在完成行为一致后，再逐步落地增强项
- 为迁移结果补齐日志、配置、脚本、健康检查或验收命令

如果迁移文档还很混乱、事实还没整理清楚，先不要直接使用这个 skill，应该先回到 `migration-assurance` 做基线整理。

## 输入前提

开始实现前，尽量具备下面这些输入中的大部分：
- 当前 API 暴露面文档
- 当前实现逻辑文档
- 本地测试环境参考
- 迁移测试规格
- 迁移阶段与门槛文档
- 可观测性 / 日志规范
- 存储与状态职责映射
- 记录已知漂移和未决问题的复核笔记
- 目标技术栈约束或目标目录结构说明

如果输入不全，也可以开始，但要先补出最小可执行输入。
输入缺口请参考 `references/input-docs-map.md`。

## 核心原则

### 1. 文档是迁移输入，不是自由发挥的灵感来源

实现时要尽量忠实执行迁移文档中已经确认的内容。
如果文档写明了行为一致项，就不能擅自改成你认为更好的行为。
如果想做增强，必须明确它属于 `Migration enhancement`，并且不能破坏行为一致项。

### 2. 优先实现行为一致项，再实现增强项

迁移过程中，优先顺序通常应当是：
- 先恢复当前系统的外部行为
- 再恢复内部状态与副作用语义
- 再补齐运维与可观测能力
- 最后再落地增强项

不要在基本行为还没对齐时，先花大量时间做增强设计。

### 3. 每一步实现都必须有验证路径

每一块迁移代码落地时，都要明确它通过什么验证：
- 单元测试
- 服务测试
- 契约 / API 测试
- 集成测试
- 端到端测试
- 手工命令或请求
- 日志、报告、构建产物或运行证据

没有验证路径的实现，不算完成。

### 4. 文档和代码一旦冲突，要回退到事实核对

如果迁移文档、当前源码、已有测试、运行行为之间出现冲突：
- 不要默默猜测
- 不要直接按个人偏好拍板
- 先记录冲突点
- 必要时回到 `migration-assurance` 重新做事实复核

### 5. 阶段交付必须可验收

每个阶段都应该能清楚回答：
- 这阶段改了什么
- 哪些行为已经对齐
- 哪些增强项已经落地
- 跑了哪些测试
- 如何手工确认
- 还剩什么风险

## 工作流程

### 1. 先检查输入是否足够执行

先确认当前是否已经有足够输入来开始实现：
- 行为一致项是否已经写清楚
- 增强项是否已经单独标记
- 测试要求是否足够明确
- 阶段边界是否清楚
- 本地或 CI 验证路径是否已知

如果还不够，就先补最小输入，而不是直接开写。

### 2. 先锁定当前阶段目标

一次只做一个可验收阶段。
先明确：
- 当前阶段目标是什么
- 当前阶段不做什么
- 通过标准是什么
- 失败时如何判断问题范围

避免把多个阶段混在一次实现里，导致无法判断哪里出了问题。

### 3. 把文档翻译成可执行任务

把迁移文档中的内容拆成工程任务，例如：
- 新建目标项目结构
- 实现路由 / Handler / Controller
- 实现服务层 / 领域层 / 适配层
- 接入数据库、缓存、队列、网关或 K8s
- 实现错误映射、超时、重试、幂等处理
- 实现日志、指标、链路或审计输出
- 补充单元测试、契约测试、集成测试、E2E 测试
- 补充本地运行脚本、部署脚本和验证命令

任务必须足够小，能和阶段门槛绑定起来。

### 4. 先写验证，再写实现，或至少同步补齐验证

如果文档已经清楚到足以写测试：
- 优先先写测试或先写验证脚本
- 再写最小实现让验证通过

如果当前阶段暂时不适合完全测试先行，也至少要保证实现和验证同步推进，不能把“以后再补测试”当作默认做法。

### 5. 按分层逐步落地

迁移实现时通常按下面顺序最稳妥：
- 对外接口层
- 请求 / 响应模型与校验
- 领域逻辑或服务逻辑
- 状态与副作用处理
- 存储、缓存、队列或外部依赖适配
- 可观测性、日志和运维脚本
- 集成与回归验证

具体顺序可以按项目调整，但必须保持可验证性。

### 6. 发现漂移时立刻回写

在实现过程中，如果发现：
- 文档和当前代码不一致
- 文档没有写清楚某个关键分支
- 目标设计和阶段门槛不匹配
- 某个增强项实际上影响了行为一致项

就要立即回写说明或补复核记录，避免后续继续带着错误前提开发。

### 7. 用阶段门槛收尾

每个阶段结束时，至少要输出：
- 已完成代码
- 对应测试
- 验证结果
- 手工确认方法
- 剩余风险与未完成项
- 是否满足进入下一阶段的条件

## 常见任务模式

### 根据 API 与行为文档迁移服务

当你要重写一个对外服务时：
- 先按 API 暴露面文档恢复接口契约
- 再按实现逻辑文档恢复核心行为
- 再按测试规格补上关键用例
- 最后按日志和运维规范补齐可观测性与脚本

### 根据阶段文档逐步迁移

当迁移已经拆成多个阶段时：
- 每次只选一个阶段实施
- 不跨阶段偷跑增强项
- 阶段内先满足退出门槛，再推进下一阶段

### 根据测试规格反推实现

当测试规格已经很完整时：
- 把测试规格转换成真实测试代码或验证脚本
- 用这些测试驱动最小实现
- 对失败分支、边界分支和状态流转保持同等重视

### 存储或基础设施迁移

当迁移涉及数据库、缓存、队列、代理、网关或 K8s 时：
- 先对齐职责边界
- 再实现适配层和配置
- 再补环境脚本和部署验证
- 最后做故障路径和回退验证

### 落地增强项

当行为一致项已经稳定后，增强项可以逐步落地。
此时要遵守：
- 增强项必须可单独验证
- 增强项不能破坏已通过的一致性测试
- 增强项最好有开关、阶段边界或独立验收标准

## 输出期望

这个 skill 的理想输出通常包括：
- 已落地的迁移代码
- 对应测试代码或验证脚本
- 必要的配置、脚本、清单或环境调整
- 与迁移阶段对应的验收记录
- 对发现的文档漂移或未决问题的回写
- 对当前完成度、风险和下一阶段建议的简短说明

## 完成标准

一次迁移实现工作至少应达到下面这些标准：
- 当前阶段目标已经真正落地到代码
- 行为一致项已通过对应验证
- 增强项与一致性要求没有混淆
- 关键路径有测试或手工验证证据
- 发现的文档问题已经回写，不留隐性偏差
- 其他工程师接手时，可以直接继续下一阶段，而不是重新猜测上下文

## 参考文件

按需读取：
- `references/input-docs-map.md`
  - 用来判断实现前需要哪些迁移输入文档，以及缺失时怎么补最小输入
- `references/delivery-checklist.md`
  - 用来执行阶段实现、自测、回写和交付前检查

````

:::
