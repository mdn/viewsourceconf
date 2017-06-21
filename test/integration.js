'use strict';

const assert = require('assert');
const blc = require('broken-link-checker');
const test = require('selenium-webdriver/testing');
const until = require('selenium-webdriver/lib/until');
const webdriver = require('selenium-webdriver');
const jsyaml = require('js-yaml');
const fs = require('fs');

const baseURL = process.env.VS_TEST_URL || 'https://viewsourceconf-stage.us-west.moz.works';
const browser = process.env.VS_TEST_BROWSER || 'safari';
console.log(`Running integration tests against ${baseURL} with ${browser}`);

describe('The site...', function() {
    this.timeout(65000);
    const url = baseURL;

    it('should not have any broken links', function(done) {
        const options = {
            // https://github.com/stevenvachon/broken-link-checker
            excludedKeywords: ['/2015', 'livereload'],
            filterLevel: '3',
            maxSocketsPerHost: '3',
        };

        const errors = {};

        const siteChecker = new blc.SiteChecker(options, {
            link(result) {
                if (result.broken) {
                    errors[result.base.resolved] = errors[result.base.resolved] || [];
                    errors[result.base.resolved].push(
                        `${result.url.resolved} (${blc[result.brokenReason]})`
                    );
                }
            },
            site() {
                if (Object.keys(errors).length > 0) {
                    const msg = `Site has broken links: \n ${JSON.stringify(errors)}`;
                    return done(new Error(msg));
                }
                return done();
            },
        });

        siteChecker.enqueue(url, url);
    });
});

test.describe('The landing page...', function() {
    this.timeout(10000);
    const url = baseURL;
    ['london-2017'].forEach(function(conference) {
        test.it.skip(`should have a visible link to the ${conference} page`, function(done) {
            const conferenceSelector = `a[href="/${conference}/"]`;
            const driver = new webdriver.Builder().forBrowser(browser).build();
            driver.get(url).then(function() {
                return driver.findElement(webdriver.By.css(conferenceSelector));
            }).then(function(link) {
                return link.isDisplayed();
            }).then(function(response) {
                driver.close().then(function() {
                    done(assert(response));
                });
            });
        });
    });
});

test.describe('The conference pages...', function() {
    this.timeout(10000);

    ['london-2017'].forEach(function(conference) {
        const url = `${baseURL}/${conference}`;

        test.it.skip(`should have all the session videos on it`, function(done) {
            const filename = 'source/data/london_sessions.yaml';
            const videoSelector = '.session_summary iframe';

            let doc;
            let count = 0;

            // Get the sessions yaml
            try {
                doc = jsyaml.safeLoad(fs.readFileSync(filename, 'utf8'));
            } catch (e) {
                return done(e.message);
            }

            doc.forEach((session) => {
                if (session.video) {
                    count += 1;
                }
            });

            const driver = new webdriver.Builder().forBrowser(browser).build();
            driver.get(url).then(function(){
                // find all the sessions on the page
                return driver.findElements(webdriver.By.css(videoSelector));
            }).then((items) => {
                // same number on page as in yaml?
                console.log(items.length + ' videos on page; ' + count + ' videos in yaml.');
                done(assert(items.length === count));
            });
        });

        test.it(`should have a visible ${conference} register link`, function(done) {
            const registerSelector = '.hero a[href*="ti.to"]';
            const driver = new webdriver.Builder().forBrowser(browser).build();
            driver.get(url).then(function() {
                return driver.findElement(webdriver.By.css(registerSelector));
            }).then(function(link) {
                return link.isDisplayed();
            }).then(function(response) {
                driver.close().then(function() {
                    done(assert(response));
                });
            });
        });

        test.it.skip(`should have a visible ${conference} cfp link`, function(done) {
            const registerSelector = 'a[href="cfp"].button';
            const driver = new webdriver.Builder().forBrowser(browser).build();
            driver.get(url).then(function() {
                return driver.findElement(webdriver.By.css(registerSelector));
            }).then(function(link) {
                return link.isDisplayed()
            }).then(function(response) {
                driver.close().then(function() {
                    done(assert(response));
                });
            });
        });

        test.it.skip(`should have a visible ${conference} sponsor prospectus link`, function(done) {
            const prospectusSelector = 'a[href$="sponsorship.pdf"]';
            const driver = new webdriver.Builder().forBrowser(browser).build();
            driver.get(url).then(function() {
                return driver.findElement(webdriver.By.css(prospectusSelector));
            }).then(function(link) {
                return link.isDisplayed()
            }).then(function(response) {
                driver.close().then(function() {
                    done(assert(response));
                });
            });
        });

        describe(`${conference} newsletter signup form...`, function() {
            const newsletterSubmitId = 'newsletter_submit';
            const policyCheckboxId = 'privacy';
            const emailInputId = 'email';
            const thanksId = 'newsletter_thanks';
            const url = `${baseURL}/${conference}/#newsletter`;

            test.it('should fail if email missing', function(done) {
                const driver = new webdriver.Builder().forBrowser(browser).build();
                driver.get(url).then(function() {
                    return driver.findElement(webdriver.By.id(newsletterSubmitId));
                }).then(function(button) {
                    return button.submit();
                }).then(function() {
                    return driver.findElement(webdriver.By.css(`#${emailInputId}:invalid`));
                }).then(function(invalid) {
                    driver.close().then(function() {
                        done();
                    });
                }, function(valid) {
                    driver.close().then(function() {
                        done(new Error('Form not marked as invalid with missing email'));
                    });
                });
            });

            test.it('should fail if policy checkbox isn\'t checked', function(done) {
                const driver = new webdriver.Builder().forBrowser(browser).build();
                driver.get(url).then(function() {
                    return driver.findElement(webdriver.By.id(newsletterSubmitId));
                }).then(function(button) {
                    return button.submit()
                }).then(function() {
                    driver.findElement(webdriver.By.css(`#${policyCheckboxId}:invalid`));
                }).then(function(invalid) {
                    driver.close().then(function() {
                        done();
                    });
                }, function(valid) {
                    driver.close().then(function() {
                        done(new Error('Form not marked as invalid with missing policy checkbox'));
                    });
                });
            });

            test.it('should display a "Thanks" message on successful submission', function(done) {
                const driver = new webdriver.Builder().forBrowser(browser).build();

                driver.get(url).then(function() {
                    return driver.findElement(webdriver.By.id(emailInputId));
                }).then(function(email) {
                    return email.sendKeys('vs_integration_tester@mailinator.com');
                }).then(function() {
                    return driver.findElement(webdriver.By.id(policyCheckboxId));
                }).then(function(policy) {
                    return policy.click();
                }).then(function() {
                    return driver.findElement(webdriver.By.id(newsletterSubmitId));
                }).then(function(button) {
                    return button.submit();
                }).then(function() {
                    const thanks = driver.findElement(webdriver.By.id(thanksId));
                    // wait up to 5 secs for thanks message; otherwise fail.
                    return driver.wait(
                        until.elementIsVisible(thanks), 5000
                    ).then(function(resolved) {
                        driver.close().then(function() {
                            done();
                        });
                    }, function(rejected) {
                        driver.close().then(function() {
                            done(rejected);
                        });
                    });
                });
            });
        });
    });


    test.describe('The schedule page...', function() {
        this.timeout(10000);

        ['london-2017'].forEach(function(conference) {
            const url = `${baseURL}/${conference}/schedule`;

            test.it.skip(`should have all the sessions on it`, function(done) {
                const filename = 'source/data/london_schedule.yaml';
                const sessionSelector = '.session_details';

                let doc;
                let count = 0;

                // Get the schedule yaml
                try {
                    doc = jsyaml.safeLoad(fs.readFileSync(filename, 'utf8'));
                } catch (e) {
                    return done(e.message);
                }

                // find all the slugs in the yaml
                for (let day in doc) {
                    let times = doc[day];
                    for (let time in times) {
                        let event = times[time];
                        if (event.slug) {
                            count += 1;
                        } else if (event.sessions) {
                            for (let s in event.sessions) {
                                let session = event.sessions[s];
                                if (session.slug) {
                                    count += 1;
                                }
                            }
                        }
                    }
                }

                const driver = new webdriver.Builder().forBrowser(browser).build();
                driver.get(url).then(function(){
                    // find all the sessions on the page
                    return driver.findElements(webdriver.By.css(sessionSelector));
                }).then((items) => {
                    // same number of slugs & sessions?
                    done(assert(items.length === count));
                });
            });

        });
    });
});
