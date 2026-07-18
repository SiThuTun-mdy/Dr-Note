/**
 * Escapes user-supplied search terms before interpolation into PostgREST
 * `.or()` / `.ilike()` filter strings.
 *
 * PostgREST treats `%`, `_`, and `\` as LIKE metacharacters inside `ilike`
 * values.  Commas, parentheses, and dots have structural meaning inside the
 * `.or()` filter syntax itself.  Leaving any of these unescaped lets user
 * input cross from DATA into the QUERY CHANNEL — the classic injection shape.
 *
 * @see https://postgrest.org/en/stable/references/api/tables_views_functions.html#full-text-search
 */
export function escapeSearchTerm(input: string): string {
  return input.replace(/[%_\\(),.]/g, "\\$&")
}
