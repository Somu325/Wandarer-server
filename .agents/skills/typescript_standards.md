# Skill: TypeScript & Styling Standards

**Trigger**: Continuous standard for all files.

## TypeScript Constraints

1. **Strict Mode**: `strict: true` is enforced. Absolutely no implicit or explicit `any`. Use `unknown` and narrow it, or define a proper interface.
2. **Interfaces**: 
   - Prefix all interfaces with `I` (e.g., `IJob`, `IProfile`).
   - Use `interface` for object shapes, `type` for unions/aliases.
   - Define shared interfaces inside their respective model files. Do not create a separate `types/` folder.
3. **Documentation**: Every exported function must include a JSDoc comment with `@param` and `@returns`.
4. **Imports**: Use ESM (`import/export`). Do not use CommonJS `require()`.

## Formatting Constraints

1. Indentation: strictly 2 spaces.
2. Quotes: strictly single quotes `''` for strings.
3. Semicolons: NO semicolons at the ends of lines.
