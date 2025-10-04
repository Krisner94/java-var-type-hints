# Java Var Type Hints

![Version](https://img.shields.io/badge/version-0.0.1-blue)
![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.98.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Author:** Rhama Krisner  
**Category:** Programming Languages  

---

## Description

**Java Var Type Hints** helps you read Java code that uses `var` by showing the **actual type inferred by the compiler** directly in the editor.

Perfect for:  
- Developers reviewing “lazy” code that relies heavily on `var`.  
- Teams that want clarity in complex Java projects.  
- Learning variable types in Java, especially with generics.

> ⚡ Key feature: the plugin **does not modify your source code** while displaying types.

---

## Features

- Displays **inferred types for `var`** inline or via hover.  
- Supports **basic types**, **arrays**, **custom classes**, and **simple generics** (`List<String>`, `Map<K,V>`).  
- Automatically updates when the document changes or plugin settings are modified.  
- Command to **replace `var` with the inferred type** manually (`Ctrl+Shift+P → Java Var Type Hints: Replace Var With Type`).  
- Fully configurable:
  - Hint color  
  - Prefix (`:`, `->`, `::`)  
  - Font size  
  - Hover information  

---

## Commands

| Command | Description |
|---------|-------------|
| `Java Var Type Hints: Reload Hints` | Refreshes all type hints in the active editor. |
| `Java Var Type Hints: Replace Var With Type` | Manually replaces the `var` keyword with the inferred type from hover. |

---

## Settings

All settings can be accessed under `Settings → Extensions → Java Var Type Hints`:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `javaVarTypeHints.enabled` | boolean | true | Enable or disable type hints for `var` variables. |
| `javaVarTypeHints.color` | string | `#888888` | Color of the type hint (hex, rgb, etc.). |
| `javaVarTypeHints.style` | string (`inline`/`end-of-line`) | `inline` | Position of the hint: after the variable name or at the end of the line. |
| `javaVarTypeHints.prefix` | string | `: ` | Prefix displayed before the inferred type. |
| `javaVarTypeHints.showOnHover` | boolean | true | Show detailed type info on hover. |
| `javaVarTypeHints.fontSize` | string | `inherit` | Font size of the hint text. |

---

## Visual Example

### Original Code
```java
var person = new Person();
var ages = List.of(10, 20, 30);
```

### Visual representation in editor
```java
Person person = new Person();
var ages: List<Integer>  = List.of(10, 20, 30);
```


The actual file still uses var; the plugin only visually replaces it in the editor.

---

## Release Notes
<i>v0.0.1</i>

* Initial release:

    - Basic and simple generic type support.

    - Inline decoration with inferred type.

    - Manual var replacement command.

    - Configurable color, prefix, style, and hover settings.

<br>
    
---
  ## Privacy / Data Policy

Java Var Type Hints does **not** collect, store, or transmit any data from its users.  
This plugin:

- Does **not** track your usage or send telemetry.
- Does **not** collect or distribute any personal or project data.
- Operates entirely locally within VS Code.

You can use this plugin with confidence that your data remains private and fully under your control.
