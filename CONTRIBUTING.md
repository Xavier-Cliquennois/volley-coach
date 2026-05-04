# Contributing

Thanks for your interest in improving Volley Coach.

## Ground rules

- Be respectful, on-topic, and constructive.
- Open an issue **before** working on a non-trivial change, so we can align on scope.
- Keep PRs small and focused. One concern per PR.

## Development workflow

1. Fork and clone the repo.
2. `npm install`
3. `npx expo prebuild` (first time only).
4. `npm run android` or `npm run ios`.
5. Make your changes.
6. `npm run typecheck` must pass.
7. Open a PR with a clear description of *what* and *why*.

## Code style

- TypeScript strict mode.
- No commented-out code.
- No comments that simply restate what the code does — only comments that explain a non-obvious *why*.
- Match existing patterns in the file you're editing.
- Conventional Commits format for commit messages: `feat(scope): ...`, `fix(scope): ...`, `docs: ...`, etc.

## Reporting bugs

Open an issue with:

- Steps to reproduce
- Expected vs actual behavior
- Device + OS version
- Screenshots if visual

## Suggesting features

Open an issue tagged `enhancement` describing:

- The use case
- Why it matters
- Rough idea of the UX

## Scope

The app is intentionally minimal. Features that add server dependencies, accounts, analytics, or external SDKs are unlikely to be accepted — local-first is a core value.
