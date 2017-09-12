all: .prettiered docs dist/p2pweb.min.js

docs: docs/notes.pdf docs/index.html docs/jsdoc/index.html

dist/p2pweb.min.js: dist/p2pweb.js
	./node_modules/.bin/uglifyjs dist/p2pweb.js > dist/p2pweb.min.js

dist/p2pweb.js: src/*
	./node_modules/.bin/webpack

clean:
	rm -rf docs/*.pdf docs/index.html docs/jsdoc

.prettiered: src/p2pweb.js
	./node_modules/.bin/prettier --write src/p2pweb.js --print-width 72 && git add src/p2pweb.js \
		&& date > .prettiered

live-server:
	kill `cat .pid-liveserver`; sleep 0.1
	./node_modules/.bin/live-server docs --no-browser \
		& echo $$! > .pid-liveserver

watch-docs:
	make live-server
	while inotifywait -e modify,close_write,move_self -q *.md pandoc/*; \
		do make docs; done

docs/jsdoc/index.html: src/p2pweb.js
	./node_modules/.bin/documentation build src/p2pweb.js -f html -o docs/jsdoc; git add docs/jsdoc

docs/notes.pdf: notes.md pandoc/*.html pandoc/*.yml pandoc/*.bib
	pandoc --toc pandoc/notes.yml pandoc/template.yml --bibliography=pandoc/bibliography.bib notes.md --template=pandoc/template.html -s -o docs/notes.html
	pandoc --toc pandoc/notes.yml pandoc/template.yml --bibliography=pandoc/bibliography.bib notes.md --latex-engine=xelatex -o docs/notes.pdf

docs/index.html: README.md pandoc/*.html pandoc/*.yml
	pandoc pandoc/README.yml pandoc/template.yml README.md --template=pandoc/template.html -s -o docs/index.html

coverage/lcov.info: src/p2pweb.js
	P2PWEB_URL=ws://localhost:3535 RUN_TESTS=true ./node_modules/.bin/istanbul cover src/p2pweb.js
