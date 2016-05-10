(function() {
    'use strict';

    // Adding to globally available vs object
    var analytics = window.vs.analytics = {
        /*
            Tracks generic events passed to the method
        */
        trackEvent: function(eventObject, callback) {
            // Submit eventArray to GA and call callback only after tracking has
            // been sent, or if sending fails.
            //
            // callback is optional.

            /*
                Format:

                    ga('send', {
                        'eventCategory' : 'Star Trek',
                        'eventAction'   : 'Fire',
                        'eventLabel'    : 'Phasers',
                        'eventValue'    : 100,
                        'hitCallback'   : function () {
                            document.location = href;
                        },
                        'hitType': 'event'
                    });
            */

            var ga = window.ga;
            var data = {
                hitType: 'event',
                eventCategory: eventObject.category || '',    // Required.
                eventAction: eventObject.action || '',             // Required.
                eventLabel: eventObject.label || '',
                eventValue: eventObject.value || 0,
                hitCallback: callback || null
            };

            // If Analytics has loaded, go ahead with tracking
            // Checking for ".create" due to Ghostery mocking of ga
            if(ga && ga.create) {
                // Send event to GA
                ga('send', data);
            }
            else if(ga && !ga.create) {
                // GA blocked or not yet initialized
                // strip callback from data
                data.hitCallback = null;
                // add to queue without callback
                ga('send', data);
                // execute callback now
                if(callback) {
                    callback();
                }
            }
            else if(callback) {
                // GA disabled or blocked or something, make sure we still
                // call the caller's callback:
                callback();
            }
        },


        trackClicks: function() {
            console.log('trackLinks executed');
            // capture all click events
            document.addEventListener('click', function (event) {
            console.log('click detected');
// TODO: don't do anything if default was prevented, hijax will handle that

                // was it a link?
                event = event || window.event;
                var local = window.location.protocol + '//' + window.location.host;
                var trigger = event.target.tagName;
                var parent = event.target.parentNode.tagName;
                console.log('event', event);
                if(trigger == 'A' || parent == 'A') {
                    var link = (trigger == 'A') ? event.target : event.target.parentNode;
                    var href;
                    if (link.href) {
                        href = link.href;
                    } else {
                        // no href, abort, abort
                        return;
                    }
                    console.log('link detected', link);
                    console.log('link href', link.href);
                    console.log('link href attr', link.getAttribute('href'));
                    console.log('local', local);
                    var category = 'link';
                    var action;
                    var label;
                    var callback;

                    // TODO: callback with timeout if leaving page

                    // link away from site
                    if(href.indexOf(local) == -1) {
                        console.log('link away from site');
                    }

                    // email link
                    if(href.indexOf('mailto:') == -1) {
                        console.log('email link');
                    }

                    // link stays on current page
                    if(path == path) {
                        console.log('link leads to current page');
                    }

                    // check if in header or footer
                    var headerNode = document.getElementById('header');
                    var footerNode = document.getElementById('footer');
                    // header/footer
                    var inHeader = false;
                    var inFooter = false;
                    if(headerNode) {
                        inHeader = headerNode.contains(link);
                    }
                    if(footerNode) {
                        inFooter = footerNode.contains(link);
                    }

                    if(inHeader || inFooter) {
                        var which = inHeader ? 'header' : 'footer';
                        //trackEvent('nav', which, label);
                        console.log('trackEvent','nav', which, link.href);
                    }


                    var filetypes = /\.(zip|exe|dmg|pdf|doc.*|xls.*|ppt.*|mp3|txt|rar|wma|mov|avi|wmv|flv|wav)$/i;
                    var baseHref = '';

                    var track = true;
                    var isThisDomain = href.indexOf(local);
                    if (!href.match(/^javascript:/i)) {
                        var elEv = []; elEv.value=0, elEv.non_i=false;
                        if (href.match(/^mailto\:/i)) {
                            elEv.category = "email";
                            elEv.action = "click";
                            elEv.label = href.replace(/^mailto\:/i, '');
                            elEv.loc = href;
                        }
                        else if (href.match(filetypes)) {
                        var extension = (/[.]/.exec(href)) ? /[^.]+$/.exec(href) : undefined;
                            elEv.category = "download";
                            elEv.action = "click-" + extension[0];
                            elEv.label = href.replace(/ /g,"-");
                            elEv.loc = baseHref + href;
                        }
                        else if (href.match(/^https?\:/i) && !isThisDomain) {
                            elEv.category = "external";
                            elEv.action = "click";
                            elEv.label = href.replace(/^https?\:\/\//i, '');
                            elEv.non_i = true;
                            elEv.loc = href;
                        }
                        else if (href.match(/^tel\:/i)) {
                            elEv.category = "telephone";
                            elEv.action = "click";
                            elEv.label = href.replace(/^tel\:/i, '');
                            elEv.loc = href;
                        }
                        else {
                            track = false;
                        }

                        //track
                    }
                    // what kind of link?

                        // anchor
                            // anchor
                            // path + #hash
                        // file
                            // file
                            // href
                        // email
                            // email
                            // email address
                        // external
                            // external
                            // full URL
                        // else regular page nav?

                    //trackEvent(category, action, label);
                    console.log('trackEvent', category, action, label);
                }



                // anchor
                // file
                // email
                // header or footer nav
/*

                var host = this.hostname;
                if(host && host !== location.hostname) {
                    var newTab = (trigger.target === '_blank' || event.metaKey || event.ctrlKey);
                    var href = trigger.href;
                    var callback = function() {
                        window.location = href;
                    };
                    var data = {
                        category: 'Outbound Links',
                        action: href
                    };

                    if(newTab) {
                        analytics.trackEvent(data);
                    } else {
                        event.preventDefault();
                        data.hitCallback = callback;
                        analytics.trackEvent(data, callback);
                    }
                }
                            */
            }, false);
        },

        /*
            Track specific clientside errors created by our code
            this article was a lot of help: http://blog.gospodarets.com/track_javascript_angularjs_and_jquery_errors_with_google_analytics
        */
        trackClientErrors: function() {
            window.addEventListener('error', function (err) {
                var lineAndColumnInfo = err.colno ? ' line:' + err.lineno +', column:'+ err.colno : ' line:' + err.lineno;
                analytics.trackEvent('Error', err.message , err.filename + ':' + lineAndColumnInfo);
            });
        },

    };

    window.vs.analytics.trackClicks();
})();


