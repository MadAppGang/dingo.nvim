# Changelog

All notable changes to the dingo.nvim plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Nothing yet

## [0.6.0] - 2026-01-07

### Added
- **Auto-install tree-sitter parser**: Parser is automatically copied to `~/.local/share/nvim/parser/` on plugin load
- **conform.nvim integration**: Automatically registers `dingo_fmt` formatter when conform.nvim is detected

### Changed
- **Standalone repository**: Plugin moved from `MadAppGang/dingo` (subdir) to `MadAppGang/dingo.nvim`
- Simplified installation: `{ "MadAppGang/dingo.nvim" }` (no more `subdir` option needed)
- Updated README with new installation instructions

### Fixed
- Tree-sitter syntax highlighting now works out of the box (no manual parser installation required)
- Format on save no longer falls back to gofumpt

## [0.5.1] - 2026-01-06

### Added
- Full LSP integration via `dingo-lsp` with gopls source map translation
- Tree-sitter grammar for Dingo-specific syntax highlighting
- Format on save with `dingo fmt`
- Lint integration with real-time diagnostics
- Build commands: `:DingoBuild`, `:DingoRun`, `:DingoTranspile`
- Health checks via `:checkhealth dingo`
- Mason support for automatic gopls installation
- Bundled lazy.nvim spec (`require("dingo.lazy")`)
- Comprehensive query files: highlights, folds, indents

### Tree-sitter Highlights
- Dingo keywords: `enum`, `match`, `let`
- Special operators: `?` (error propagation), `?.` (safe navigation), `??` (null coalesce)
- Lambda syntax: `|x| expr` and `(x) => expr`
- Enum variants and match patterns
- Full Go syntax support as base

## [0.1.0] - 2024-12-10

### Added
- Initial release
- Basic filetype detection for `.dingo` files
- Tree-sitter grammar foundation
- LSP client configuration
- Format and lint command structure

---

## Version Compatibility

| Plugin Version | Dingo CLI | dingo-lsp | Neovim |
|---------------|-----------|-----------|--------|
| 0.6.x         | 0.5.x     | 0.5.x     | 0.8+   |
| 0.5.x         | 0.5.x     | 0.5.x     | 0.8+   |
| 0.1.x         | 0.4.x     | 0.4.x     | 0.8+   |

[Unreleased]: https://github.com/MadAppGang/dingo.nvim/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/MadAppGang/dingo.nvim/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/MadAppGang/dingo.nvim/compare/v0.1.0...v0.5.1
[0.1.0]: https://github.com/MadAppGang/dingo.nvim/releases/tag/v0.1.0
