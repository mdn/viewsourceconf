'use strict';

const assert = require('assert');
const fs = require('fs');
const jsyaml = require('js-yaml');

console.log('Running unit tests');

describe('The site source...', function() {
    it.skip('should not have invalid JSON', function(done) {
        const filenames = fs.readdirSync('data');
        const errors = {};

        filenames.forEach(function(filename) {
            try {
                JSON.parse(fs.readFileSync(`data/${filename}`, 'utf8'));
            }
            catch (e) {
                errors[filename] = e.message;
            }
        });

        if (Object.keys(errors).length > 0) {
            const msg = `Source has invalid JSON: \n ${JSON.stringify(errors)}`;
            return done(new Error(msg));
        }
        return done();
    });
    it('should not have invalid YAML', function(done) {
        const filenames = fs.readdirSync('source/data');
        const errors = {};

        filenames.forEach(function(filename) {
            try {
                jsyaml.safeLoad(fs.readFileSync(`source/data/${filename}`, 'utf8'));
            }
            catch (e) {
                errors[filename] = e.message;
            }
        });

        if (Object.keys(errors).length > 0) {
            const msg = `Source has invalid YAML: \n ${JSON.stringify(errors)}`;
            return done(new Error(msg));
        }
        return done();
    });
});

describe('The YAML data files...', function() {
    it('should include speakers', function(done) {
        const filename = 'source/data/berlin_speakers.yaml';
        let doc = [];

        try {
            doc = jsyaml.safeLoad(fs.readFileSync(filename, 'utf8'));
        } catch (e) {
            return done(e.message);
        }

        return done(assert(doc.length > 0));
    });

    it('should include sessions', function(done) {
        const filename = 'source/data/berlin_sessions.yaml';
        let doc = [];

        try {
            doc = jsyaml.safeLoad(fs.readFileSync(filename, 'utf8'));
        } catch (e) {
            return done(e.message);
        }

        return done(assert(doc.length > 0));
    });

    it('should include a schedule', function(done) {
        const filename = 'source/data/berlin_schedule.yaml';
        let doc = [];

        try {
            doc = jsyaml.safeLoad(fs.readFileSync(filename, 'utf8'));
        } catch (e) {
            return done(e.message);
        }

        return done(assert(Object.keys(doc).length > 0));
    });
});
