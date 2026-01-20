
<details>

<summary>setting.json</summary>

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
      "mcp__javadc",
      "mcp__sequential-thinking__sequentialthinking",
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
</details>

<details>

<summary>setting.json (Linux)</summary>

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
      "mcp__javadc",
      "mcp__sequential-thinking__sequentialthinking",
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

</details>
