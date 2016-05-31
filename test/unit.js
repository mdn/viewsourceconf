'use strict';

const assert = require('assert');
const fs = require('fs');

console.log('Running unit tests');

describe('The site source...', function() {
    it('should not have invalid JSON', function(done) {
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
});
