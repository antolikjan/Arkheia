COURSES:=\
	NAIL062\
	NDBI025\
	NDMI002\
	NDMI011\
	NJAZ070\
	NJAZ072\
	NJAZ074\
	NJAZ090\
	NJAZ091\
	NMAI054\
	NMAI057\
	NMAI058\
	NMAI059\
	NMAI069\
	NPRG030\
	NPRG031\
	NPRG045\
	NPRG062\
	NSWI120\
	NSWI141\
	NSWI170\
	NSWI177\
	NTIN060\
	NTIN061\
	NTIN071\
	NTVY014\
	NTVY015\
	NTVY016\
	NTVY017

COURSES_META:=$(addsuffix .meta, $(addprefix src/, $(COURSES)))
COURSES_MD:=$(addsuffix .md, $(addprefix src/, $(COURSES)))
COURSES_PUBLIC_HTML:=$(addprefix public_html/, $(addsuffix .html, $(COURSES)))

all: _menu.md _menu.html src/index.md $(COURSES_PUBLIC_HTML) $(COURSES_META) $(COURSES_PUBLIC_HTML)

.PHONY: clean debug all

.FORCE:

index.html: src/index.md
	pandoc -o index.html index.md

_menu.md: $(COURSES_META)
	(echo '* [Homepage] (index.html)'
	./make_menu.sh $^
	) >$@

_menu.html: _menu.md
	pandoc -o $^ $@

public_html/%.html: src/%.md template.html _menu.html $(COURSES_META)
	pandoc --template template.html -B _menu.html --metadata-file src/$*.meta -o $@ $<

debug:
	@echo Rule -> $@
	@echo '          COURSES: $(COURSES)'
	@echo ' COURSES_PUBLIC_HTML: $(COURSES_PUBLIC_HTML)'

clean:
	rm -f _menu*
	rm -f public_html/*.html
