// Tree-sitter grammar for Dingo language
// Minimal grammar focusing on Dingo-specific extensions to Go

module.exports = grammar({
  name: 'dingo',

  extras: $ => [/\s/, $.comment],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.const_spec],
    [$.var_spec],
    [$.param_decl],
    [$.function_declaration],
    [$.receiver],
    [$.field_decl],
    [$.method_spec],
    [$.type_param],
    [$.lambda_param, $.parenthesized_expr],
    // Type vs expression ambiguity (core Go ambiguity)
    [$._expr, $.qualified_type],
    [$._expr, $.generic_type],
    [$._expr, $.composite_literal],
    [$.identifier, $.qualified_type],
    [$.identifier, $.generic_type],
    // Pointer type in receiver
    [$.pointer_type, $.receiver],
    // Type param vs expression
    [$._expr, $.type_param],
    [$._expr, $.generic_type, $.type_param],
    [$.func_type],
    [$.lambda_param, $._expr],
    [$._expr, $._type_expr],
    [$.composite_literal, $.pointer_type],
    [$.func_literal, $.func_type],
    [$._type_expr, $.field_decl],
    [$._type_expr, $.generic_type, $.field_decl],
    [$._type_expr, $.generic_type],
    [$.chan_type],
    [$._expr, $.keyed_element],
    [$.lambda_expression, $._expr],
  ],

  rules: {
    source_file: $ => repeat($._item),

    _item: $ => choice(
      $.package_clause,
      $.import_declaration,
      $.function_declaration,
      $.type_declaration,
      $.const_declaration,
      $.var_declaration,
      $.let_declaration,        // Dingo
      $.enum_declaration,       // Dingo
    ),

    // =============================================
    // COMMENTS
    // =============================================
    comment: $ => choice(
      token(seq('//', /.*/)),
      token(seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')),
    ),

    // =============================================
    // BASIC DECLARATIONS
    // =============================================
    package_clause: $ => seq('package', $.identifier),

    import_declaration: $ => seq(
      'import',
      choice(
        $.import_spec,
        seq('(', repeat($.import_spec), ')'),
      ),
    ),

    import_spec: $ => seq(
      optional(choice($.identifier, '.')),
      $.string_literal,
    ),

    // =============================================
    // DINGO: LET BINDING
    // =============================================
    let_declaration: $ => seq(
      'let',
      $._pattern,
      optional(seq(':', $._type_expr)),
      '=',
      $._expr,
    ),

    _pattern: $ => choice(
      $.identifier,
      $.tuple_pattern,
    ),

    tuple_pattern: $ => seq('(', commaSep1($.identifier), ')'),

    // =============================================
    // DINGO: ENUM
    // =============================================
    enum_declaration: $ => seq(
      'enum',
      field('name', $.identifier),
      optional($.type_params),
      '{',
      repeat($.enum_variant),
      '}',
    ),

    enum_variant: $ => seq(
      field('name', $.identifier),
      optional(choice(
        seq('(', commaSep($._type_expr), ')'),          // Tuple variant
        seq('{', commaSep($.variant_field), '}'),       // Struct variant
      )),
    ),

    variant_field: $ => seq($.identifier, ':', $._type_expr),

    // =============================================
    // DINGO: MATCH EXPRESSION
    // =============================================
    match_expression: $ => seq(
      'match',
      $._expr,
      '{',
      repeat($.match_arm),
      '}',
    ),

    match_arm: $ => seq(
      $.match_pattern,
      optional(seq('if', $._expr)),
      '=>',
      choice($._expr, $.block),
      optional(','),
    ),

    match_pattern: $ => choice(
      '_',
      $._literal,
      $.variant_match,
    ),

    // variant_match handles both simple identifiers (bindings) and variant patterns with args
    variant_match: $ => seq($.identifier, optional(seq('(', commaSep($.match_pattern), ')'))),

    // =============================================
    // DINGO: LAMBDA
    // =============================================
    lambda_expression: $ => choice(
      // |x| expr
      seq('|', commaSep($.lambda_param), '|', choice($._expr, $.block)),
      // x => expr or (x) => expr
      seq(choice($.identifier, seq('(', commaSep($.lambda_param), ')')), '=>', choice($._expr, $.block)),
    ),

    lambda_param: $ => seq($.identifier, optional(seq(':', $._type_expr))),

    // =============================================
    // EXPRESSIONS
    // =============================================
    _expr: $ => choice(
      $.identifier,
      $._literal,
      $.parenthesized_expr,
      $.unary_expr,
      $.binary_expr,
      $.call_expr,
      $.selector_expr,
      $.index_expr,
      $.lambda_expression,
      $.match_expression,
      $.error_propagation,
      $.safe_navigation,
      $.composite_literal,
      $.func_literal,
    ),

    parenthesized_expr: $ => seq('(', $._expr, ')'),

    unary_expr: $ => prec.left(10, seq(choice('-', '!', '*', '&', '<-', '^'), $._expr)),

    binary_expr: $ => choice(
      prec.left(1, seq($._expr, '||', $._expr)),
      prec.left(2, seq($._expr, '&&', $._expr)),
      prec.left(3, seq($._expr, '??', $._expr)),    // Dingo: null coalesce
      prec.left(4, seq($._expr, choice('==', '!=', '<', '<=', '>', '>='), $._expr)),
      prec.left(5, seq($._expr, choice('+', '-', '|', '^'), $._expr)),
      prec.left(6, seq($._expr, choice('*', '/', '%', '&', '<<', '>>', '&^'), $._expr)),
    ),

    call_expr: $ => prec.left(11, seq($._expr, optional($.type_args), '(', commaSep($._expr), ')')),

    selector_expr: $ => prec.left(11, seq($._expr, '.', $.identifier)),

    index_expr: $ => prec.left(11, seq($._expr, '[', $._expr, ']')),

    // Dingo: error propagation expr?
    error_propagation: $ => prec.left(12, seq($._expr, '?')),

    // Dingo: safe navigation expr?.field
    safe_navigation: $ => prec.left(11, seq($._expr, '?.', $.identifier)),

    composite_literal: $ => seq($._type_expr, '{', commaSep($.keyed_element), '}'),

    keyed_element: $ => seq(optional(seq(choice($.identifier, $._expr), ':')), $._expr),

    func_literal: $ => seq('func', $.param_list, optional($._type_expr), $.block),

    // =============================================
    // TYPES (simplified)
    // =============================================
    _type_expr: $ => choice(
      $.identifier,
      $.qualified_type,
      $.pointer_type,
      $.slice_type,
      $.array_type,
      $.map_type,
      $.chan_type,
      $.func_type,
      $.generic_type,
      $.struct_type,
      $.interface_type,
    ),

    qualified_type: $ => seq($.identifier, '.', $.identifier),
    pointer_type: $ => seq('*', $._type_expr),
    slice_type: $ => seq('[', ']', $._type_expr),
    array_type: $ => seq('[', $._expr, ']', $._type_expr),
    map_type: $ => seq('map', '[', $._type_expr, ']', $._type_expr),
    chan_type: $ => seq(optional('<-'), 'chan', optional('<-'), $._type_expr),
    func_type: $ => seq('func', $.param_list, optional($._type_expr)),
    generic_type: $ => seq(choice($.identifier, $.qualified_type), $.type_args),
    struct_type: $ => seq('struct', '{', repeat($.field_decl), '}'),
    interface_type: $ => seq('interface', '{', repeat($.method_spec), '}'),

    type_args: $ => seq('[', commaSep1($._type_expr), ']'),
    type_params: $ => seq('[', commaSep1($.type_param), ']'),
    type_param: $ => seq($.identifier, optional($._type_expr)),

    // =============================================
    // DECLARATIONS
    // =============================================
    function_declaration: $ => seq(
      'func',
      optional($.receiver),
      field('name', $.identifier),
      optional($.type_params),
      $.param_list,
      optional($._type_expr),
      optional($.block),
    ),

    receiver: $ => seq('(', optional($.identifier), optional('*'), $._type_expr, ')'),

    param_list: $ => seq('(', commaSep($.param_decl), ')'),

    param_decl: $ => seq(
      optional($.identifier),
      optional('...'),
      $._type_expr,
    ),

    type_declaration: $ => seq('type', $.identifier, optional($.type_params), $._type_expr),

    const_declaration: $ => seq(
      'const',
      choice(
        $.const_spec,
        seq('(', repeat($.const_spec), ')'),
      ),
    ),

    const_spec: $ => seq($.identifier, optional($._type_expr), optional(seq('=', $._expr))),

    var_declaration: $ => seq(
      'var',
      choice(
        $.var_spec,
        seq('(', repeat($.var_spec), ')'),
      ),
    ),

    var_spec: $ => seq($.identifier, choice(
      seq($._type_expr, optional(seq('=', $._expr))),
      seq('=', $._expr),
    )),

    // =============================================
    // STATEMENTS
    // =============================================
    _stmt: $ => choice(
      $.expr_stmt,
      $.return_stmt,
      $.if_stmt,
      $.for_stmt,
      $.short_var_decl,
      $.assignment_stmt,
      $.block,
    ),

    block: $ => seq('{', repeat($._stmt), '}'),

    expr_stmt: $ => $._expr,

    return_stmt: $ => prec.right(seq('return', optional($.expr_list))),

    expr_list: $ => commaSep1($._expr),

    if_stmt: $ => seq(
      'if',
      optional(seq(choice($.short_var_decl, $.expr_stmt), ';')),
      $._expr,
      $.block,
      optional(seq('else', choice($.if_stmt, $.block))),
    ),

    short_var_decl: $ => seq($.expr_list, ':=', $.expr_list),

    assignment_stmt: $ => seq($.expr_list, choice('=', '+=', '-=', '*=', '/='), $.expr_list),

    for_stmt: $ => seq('for', optional($._expr), $.block),

    field_decl: $ => choice(
      seq($.identifier, $._type_expr, optional($.string_literal)),
      $._type_expr,
    ),

    method_spec: $ => choice(
      seq($.identifier, $.param_list, optional($._type_expr)),
      $._type_expr,
    ),

    // =============================================
    // LITERALS
    // =============================================
    _literal: $ => choice(
      $.int_literal,
      $.float_literal,
      $.string_literal,
      $.rune_literal,
      'true',
      'false',
      'nil',
    ),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    int_literal: $ => choice(
      /0[xX][0-9a-fA-F_]+/,
      /0[oO][0-7_]+/,
      /0[bB][01_]+/,
      /[0-9][0-9_]*/,
    ),

    float_literal: $ => /[0-9][0-9_]*\.[0-9_]*([eE][+-]?[0-9_]+)?/,

    string_literal: $ => choice(
      seq('"', repeat(choice(/[^"\\\n]+/, /\\./)), '"'),
      /`[^`]*`/,
    ),

    rune_literal: $ => seq("'", choice(/[^'\\]/, /\\./), "'"),
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
