# viewsourceconf

This is a repository for the viewsourceconf.org website source code.

## 2016

In 2016 we're using a static site generator, [metalsmith](http://metalsmith.io), to generate the site.

### Repository structure

`/source`: Most source code for the site lives here: HTML, Stylus, JavaScript. Subdirectories:
  * `/2015`: The prior year's website (which is mostly ignored by metalsmith using [metalsmith-branch](https://github.com/ericgj/metalsmith-branch)).
  * `/berlin-2016`: Any source code specific to the event.
  * `/js` and `/stylesheets` (which are processed by [metalsmith-uglify](https://github.com/ksmithut/metalsmith-uglify) and [metalsmith-stylus](https://github.com/esundahl/metalsmith-stylus), respectively)
  * `/index.html`: the main landing page that'll live at http://viewsourceconf.org

`/layouts`: One or more layouts that page content can live in. For example we might have a berlin layout, a front layout, an interior layout. These files are processed by [metalsmith-layouts](https://github.com/superwolff/metalsmith-layouts).

`/data`: json files containing structured data. For example, `berlin_speakers.json`. Data files are an appropriate place to put content that we want to handle in a structured, templated way. Data files are processed by [metalsmith-models](https://github.com/jaichandra/metalsmith-models).

`/build`: The built site goes here. It looks a lot like the source directory, but files have been processed and composed. JS will be uglified; stylus files will be CSS-ified. This directory may or may not be checked into the repo.

`build.js`: This is the node script that does the site build -- the metalsmith controller, sort of.

`/test`: A growing body of tests we can run to help us be confident about changes.

### How to contribute

We welcome your help making this code better! Here's how to hack on it:

1. Fork & clone this repository
2. `cd viewsourceconf && npm install`
3. `node build dev`
4. Make a branch for your changes: `git branch my_changes`
5. Navigate to http://localhost:8080 to develop and test. Some kinds of changes may require forcing a build (ctrl+C + `node build dev` will do it, or `node build` in a separate terminal).
5. Commit and push your changes, then PR.

### How to build the site

* `node build` will build the site and then exit
* `node build dev` will
  * build the site
  * start a web server at http://localhost:8080 using [metalsmith-serve](https://github.com/mayo/metalsmith-serve)
  * watch the source directory for changes using [metalsmith-watch](https://github.com/FWeinb/metalsmith-watch)

### How to test the site

* `npm test` will run tests in /test/
* `npm run unit_test` will run tests resembling unit tests (e.g. JSON validator)
* `npm run integration_test` will run tests requiring a built site (and will try to use Selenium by way of Firefox for functional tests)
* adding `VS_TEST_URL=http://some.url.com` to the front of the command (as in `VS_TEST_URL=http://localhost:8080 npm test`) will point integration tests at a specific site. (By default they run against staging.)

### How to deploy the site

* [Build status is in Jenkins](https://ci.us-west.moz.works/view/viewsourceconf/)
* Code merged to [https://github.com/mdn/viewsourceconf/tree/master](https://github.com/mdn/viewsourceconf/tree/master) will land on [staging](viewsourceconf-stage.us-west.moz.works) automatically, unless it breaks the build.
* Don't do anything else until your code is merged to master and you have tested it in staging. Srsly.
* Tags pushed to Mozilla's remote master will trigger a production build. To tag...
  * (Have permissions to push code to the Mozilla remote master)
  * Check out the [Mozilla remote master](https://github.com/mdn/viewsourceconf/tree/master)
  * Set an environment variable containing the name of the remote master: `export MOZ_GIT_REMOTE=upstream` (where 'upstream' is the name of the remote master).
  * Run the tagging script conveniently located at the root of the repo. It is probably not set to be executable, so `. tag-release.sh --push`
  * Watch your build in Jenkins. Verify it in production.

### Docker

The site is deployed to staging and production using Docker and Deis, and you can also use Docker for local development without installing nodejs or npm dependencies. Most of the commands below will try to use an image based on the local git sha first and then fall back to the 'latest' image when appropriate, which allows you to build and test docker images with local commits when desired, or automatically use the images built by CI in the common case. All of the `make` commands make use of environment variables with defaults; see the Makefile for more details.

* `make build`: build the site by running `node build` in a Docker container
* `make dev`: run the `node build dev` command described above in a docker container
* `make build-build-image`: build the image used to build the site
  * run this if you add a new dependency to package.json or Dockerfile-build
* `make build-deploy-image`: package the built site into an nginx container for deployment
  * useful for testing nginx.conf changes
* `make serve`: run the nginx deployment image
  * listens on port 8000 by doefault, override with the SERVE_PORT environment variable
* `make curl`: run curl with the "X-Forwarded-Proto: https" header to bypass the http>https redirect
* `make sh`: run an interactive shell in a "build" container
  * useful for debugging new build dependencies

## LICENSE

This software is licensed under the MPL-2.0. For more information see `LICENSE`.

## 2015

The 2015 site was built in WordPress. That site no longer exists. But a static archival site exists, and should live at http://viewsourceconf.org/2015 for a while.
