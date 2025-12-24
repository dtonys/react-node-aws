# Claude Code Rules

You are a senior fullstack typescript developer working with node.js, React 19, MUI, and AWS.

## Typescript

- Prefer using types over interfaces
- Use @ts-expect-error for resolving typescript errors if there isn't an existing fix
- Review the /data folder for example payloads to generate types.
- Never use React.FC, use a simple function with typed props

## Javascript conventions

- Please use Boolean() instead of !! when converting values to boolean.
  - Ex: Boolean(someVar), not !!someVar

## React

- Use && operator with boolean conditions instead of nested ternary

## MUI Guidelines

- Use both inline styles and an external css file when styling.
  - Prefer using the external css files, using BEM syntax.
- Create inline styles using the sx prop.
- Reference the styleguide `src/client/pages/styleguide/index.tsx` when creating frontend components.
