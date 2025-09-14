SHELL:=/bin/bash

all: install format	lint

install:
	git config core.hooksPath .githooks
	for i in $$(ls -d [jt]s-*/); do pushd $$i; pnpm install --prod --no-optional && make; popd; done


lint:
	for i in $$(ls -d [jt]s-*/); do pushd $$i; make lint; popd; done

format:
	for i in $$(ls -d [jt]s-*/); do pushd $$i; make format; popd; done
	git ls-files '*.yml' '*.yaml' | xargs -t -I {} yq -i -S -Y . {}
