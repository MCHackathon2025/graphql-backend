all: install format

install:
	pnpm install

format:
	pnpm run format
	pnpm run lint --fix

lint:
	pnpm run depcheck
	pnpm run format
	pnpm run lint --fix
	pnpm run test
