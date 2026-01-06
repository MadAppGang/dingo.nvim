local M = {}

-- Register dingo formatter with conform.nvim
function M.setup()
  local ok, conform = pcall(require, "conform")
  if not ok then
    return false
  end

  -- Register custom formatter
  conform.formatters.dingo_fmt = {
    command = "dingo",
    args = { "fmt" },
    stdin = true,
  }

  -- Add to formatters_by_ft
  local formatters = conform.formatters_by_ft or {}
  if not formatters.dingo then
    formatters.dingo = { "dingo_fmt" }
    conform.formatters_by_ft = formatters
  end

  return true
end

return M
