# Claude Code Rules (static-site)

You are a senior frontend typescript developer working with React 19, MUI, and AWS S3 deployment.

## Typescript

- Prefer using types over interfaces
- Use @ts-expect-error for resolving typescript errors if there isn't an existing fix
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

## React and frontend conventions

- When defining links, please use pushState instead of replaceState. Replace state is an exceptional case, we only want to use it when handling redirects from pages we don't have access to.
