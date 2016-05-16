'use strict';

const webdriver = require('selenium-webdriver');
const assert = require('assert');
const test = require('selenium-webdriver/testing');

const timeOut = 15000;
let url = 'http://localhost:8080';

test.describe('landing page', function() {
    this.timeout(timeOut);

    const expectedTitle = 'View Source Conference 2016';

    test.it('should be called "'+expectedTitle+'"', function(done) {
        let driver = new webdriver.Builder()
            .forBrowser('firefox')
            .build();

        driver.get(url).then(function() {
            driver.getTitle().then(function(title) {
                assert.equal(title, expectedTitle)
            });
            done();
        });
    });

    test.it('should have a footer & footer should have a link', function(done) {
        const selector = 'footer ul .footer_social_twitter a';
        const expectedText = '@ViewSourceConf';

        let driver = new webdriver.Builder()
            .forBrowser('firefox')
            .build();

        driver.get(url).then(function() {
            driver.findElement(webdriver.By.css(selector)).then(function(link) {
                link.getText().then(function(text) {
                    assert.equal(text.toLowerCase(), expectedText.toLowerCase());
                });
            });
            done();
        });
    });
});
