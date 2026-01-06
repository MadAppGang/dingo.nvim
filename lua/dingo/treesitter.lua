local M = {}

-- Get the plugin's root directory
local function get_plugin_root()
  local source = debug.getinfo(1, "S").source:sub(2)
  return vim.fn.fnamemodify(source, ":h:h:h")
end

-- Install the pre-compiled parser to Neovim's parser directory
local function install_parser()
  local plugin_root = get_plugin_root()
  local source = plugin_root .. "/tree-sitter-dingo/dingo.so"
  local target_dir = vim.fn.stdpath("data") .. "/parser"
  local target = target_dir .. "/dingo.so"

  -- Check if source exists
  if vim.fn.filereadable(source) == 0 then
    return false
  end

  -- Create target directory if needed
  vim.fn.mkdir(target_dir, "p")

  -- Copy if target doesn't exist or source is newer
  local source_time = vim.fn.getftime(source)
  local target_time = vim.fn.getftime(target)
  if target_time == -1 or source_time > target_time then
    vim.fn.system({ "cp", source, target })
  end

  return true
end

-- Register dingo parser with nvim-treesitter
function M.register()
  -- Install pre-compiled parser
  install_parser()

  -- Try new nvim-treesitter API first (main branch)
  local ok, parsers = pcall(require, "nvim-treesitter.parsers")
  if ok and parsers.dingo == nil then
    -- New API: directly assign to parsers table
    parsers.dingo = {
      install_info = {
        url = "https://github.com/MadAppGang/dingo.nvim",
        location = "tree-sitter-dingo",
        files = { "src/parser.c" },
        branch = "main",
        generate_requires_npm = true,
      },
      filetype = "dingo",
      maintainers = { "@MadAppGang" },
    }
  end

  -- Try legacy API (master branch)
  if ok and type(parsers.get_parser_configs) == "function" then
    local parser_config = parsers.get_parser_configs()
    if parser_config.dingo == nil then
      parser_config.dingo = {
        install_info = {
          url = "https://github.com/MadAppGang/dingo.nvim",
          location = "tree-sitter-dingo",
          files = { "src/parser.c" },
          branch = "main",
          generate_requires_npm = true,
        },
        filetype = "dingo",
        maintainers = { "@MadAppGang" },
      }
    end
  end

  -- Register language mapping (parser name -> filetype)
  pcall(vim.treesitter.language.register, "dingo", "dingo")

  return ok
end

return M
