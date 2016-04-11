# viewsourceconf

This is a repository for the viewsourceconf.org website source code.

## 2016

In 2016 we're using a static site generator, [metalsmith](http://metalsmith.io), to generate the site.

### Repository structure

`/source`: Most source code for the site lives here: HTML, Stylus, JavaScript. Subdirectories:
  * `/2015`: The prior year's website (which is mostly ignored by metalsmith using [metalsmith-branch](https://github.com/ericgj/metalsmith-branch)).
  * `/berlin-2016` or `/seattle-2016`: Any html or images specific to these events.
  * `/js` and `/stylesheets` (which are processed by [metalsmith-uglify](https://github.com/ksmithut/metalsmith-uglify) and [metalsmith-stylus](https://github.com/esundahl/metalsmith-stylus), respectively)
  * `/index.html`: the main landing page that'll live at http://viewsourceconf.org

`/layouts`: One or more layouts that page content can live in. For example we might have a berlin layout or a seattle layout, or a front and interior layout. These files are processed by [metalsmith-layouts](https://github.com/superwolff/metalsmith-layouts).

`/data`: json files containing structured data. For example, `berlin_speakers.json` or `seattle_sessions.json`. Data files are an appropriate place to put copy that might change independent of markup, such as venue information. Data files are processed by [metalsmith-models](https://github.com/jaichandra/metalsmith-models).

`/build`: The built site goes here. It looks a lot like the source directory, but files have been processed and composed. JS will be uglified; stylus files will be CSS-ified. This directory may or may not be checked into the repo.

`build.js`: This is the node script that does the site build -- the metalsmith controller, sort of.

### How to build the site

`node build` will build the site, start a web server at http://localhost:8080 (using [metalsmith-serve](https://github.com/mayo/metalsmith-serve)), and "watch" the source directory for changes (using [metalsmith-watch](https://github.com/FWeinb/metalsmith-watch)). The latter two operations can be commented out in build.js if they are in the way.

## 2015

The 2015 site was built in WordPress. That site no longer exists. But a static archival site exists, and should live at http://viewsourceconf.org/2015 for a while.
