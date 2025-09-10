all: install format

install:
	pnpm install

format:
	pnpm run format
	pnpm run lint

lint:
	pnpm run depcheck
	pnpm run format
	pnpm run lint
	pnpm run test
