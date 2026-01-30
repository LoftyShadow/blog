::: details MCP整理

```json
{
  "mcpServers": {
    "memory": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ],
      "env": {}
    },
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@upstash/context7-mcp"
      ],
      "env": {}
    },
    "sequential-thinking": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ],
      "env": {}
    },
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem"
      ],
      "env": {}
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:123456@localhost:5432/test"
      ],
      "env": {}
    },
    "java-decompiler": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@idachev/mcp-javadc"
      ],
      "env": {}
    },
    "brave-search": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@brave/brave-search-mcp-server"
      ],
      "env": {
        "BRAVE_API_KEY": ""
      }
    }
  }
}
```

:::

::: details setting.json (Windows)

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "",
    "ANTHROPIC_BASE_URL": ""
  },
  "hooks": {
    "PermissionRequest": [
      {
        "hooks": [
          {
            "command": "powershell.exe -c \"[System.Media.SystemSounds]::Exclamation.Play()\"",
            "type": "command"
          }
        ],
        "matcher": "*"
      }
    ],
    "PreToolUse": [
      {
        "hooks": [
          {
            "command": "powershell.exe -c \"[System.Media.SystemSounds]::Question.Play()\"",
            "type": "command"
          }
        ],
        "matcher": "AskUserQuestion"
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "command": "powershell.exe -c \"[System.Media.SystemSounds]::Asterisk.Play()\"",
            "type": "command"
          }
        ]
      }
    ]
  },
  "includeCoAuthoredBy": false,
  "permissions": {
    "allow": [
      "mcp__context7",
      "mcp__java-decompiler",
      "mcp__sequential-thinking__sequentialthinking",
      "mcp__memory",
      "mcp__fetch",
      "mcp__ide__getDiagnostics",
      "Read",
      "WebSearch",
      "WebFetch",
      "Search",
      "Skill(my-skill)",
      "Bash(findstr:*)",
      "Bash(dir:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(find:*)",
      "Bash(mkdir:*)",
      "Bash(mvn:*)",
      "Bash(xargs:*)",
      "Bash(tree:*)"
    ]
  }
}
```

:::

::: details setting.json (Linux)

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "",
    "ANTHROPIC_BASE_URL": ""
  },
  "hooks": {
    "PermissionRequest": [
      {
        "hooks": [
          {
            "command": "paplay /usr/share/sounds/freedesktop/stereo/dialog-warning.oga",
            "type": "command"
          }
        ],
        "matcher": "*"
      }
    ],
    "PreToolUse": [
      {
        "hooks": [
          {
            "command": "paplay /usr/share/sounds/freedesktop/stereo/dialog-question.oga",
            "type": "command"
          }
        ],
        "matcher": "AskUserQuestion"
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "command": "paplay /usr/share/sounds/freedesktop/stereo/complete.oga",
            "type": "command"
          }
        ]
      }
    ]
  },
  "includeCoAuthoredBy": false,
  "permissions": {
    "allow": [
      "mcp__context7",
      "mcp__java-decompiler",
      "mcp__sequential-thinking__sequentialthinking",
      "mcp__memory",
      "mcp__fetch",
      "mcp__ide__getDiagnostics",
      "Read",
      "WebSearch",
      "WebFetch",
      "Search",
      "Skill(my-skill)",
      "Bash(findstr:*)",
      "Bash(dir:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(find:*)",
      "Bash(mkdir:*)",
      "Bash(mvn:*)",
      "Bash(xargs:*)",
      "Bash(tree:*)"
    ]
  }
}
```

:::
