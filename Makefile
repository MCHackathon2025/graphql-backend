SHELL:=/bin/bash

all:
	git config core.hooksPath .githooks
	for i in $$(ls -d [jt]s-*/); do pushd $$i; pnpm install --prod --no-optional && make; popd; done

lint:
	for i in $$(ls -d [jt]s-*/); do pushd $$i; make lint; popd; done
