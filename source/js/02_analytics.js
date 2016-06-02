(function() {
    'use strict';

    if(!window.vs.js){ return; }

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
                // TODO: callback with timeout
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
            // capture all click events
            document.addEventListener('click', function (event) {

                // utility functions
                function controlClasses(controls){
                    var controlClasses = controls.className;
                    // remove common utility class
                    controlClasses = controlClasses.replace('section','');
                    // make double spaces single
                    controlClasses = controlClasses.replace(/\s{2,}/,'');
                    // remove spaces at start and finish
                    controlClasses = controlClasses.trim();
                    return controlClasses;
                }


                // was it a link?
                event = event || window.event;
                var local = window.location.protocol + '//' + window.location.host;
                var trigger = event.target.tagName;
                var parent = event.target.parentNode.tagName;
                var category, action, label, data;
                if(trigger === 'A' || parent === 'A') {
                    var link = (trigger == 'A') ? event.target : event.target.parentNode;
                    var href;
                    // no really, was it a link?
                    if (link.href) {
                        href = link.href;
                    } else {
                        // no href, abort, abort
                        return;
                    }

                    // what's our label?
                    label = link.href.replace(local, '');

                    // track header/footer click
                    var headerNode = document.getElementById('header');
                    var footerNode = document.getElementById('footer');
                    // header/footer
                    var inHeader = false;
                    var inFooter = false;
                    if(headerNode) { inHeader = headerNode.contains(link); }
                    if(footerNode) { inFooter = footerNode.contains(link); }
                    if(inHeader || inFooter) {
                        var which = inHeader ? 'header' : 'footer';
                        analytics.trackEvent({
                            'category' :  'nav',
                            'action' : which,
                            'label' : label
                        });
                    }

                    // variables to populate as we check tracking posabilities
                    category = 'link';
                    action = '';
                    var needsCallback = false;

                    // link away from site
                    if(href.indexOf(local) == -1 && href.indexOf('http') === 0) {
                        action = 'external';
                        needsCallback = true;
                    }

                    // link goes to current site and has a '#' in it
                    var currentNoHash = window.location.href.split("#")[0];
                    var linkNoHash = link.href.split("#")[0];
                    if(currentNoHash == linkNoHash && link.href.indexOf('#')) {
                        action = 'anchor';
                    }

                    // aria-expanded on link - over rides anchor tracking
                    if(link.hasAttribute('aria-expanded') && link.hasAttribute('aria-controls')) {
                        // we only track openings, not closings
                        var linkExpanded = link.getAttribute('aria-expanded');
                        if(linkExpanded === 'false') {
                            return;
                        }
                        category = 'expand';
                        // get the classes off the object it controls
                        var linkControlFor = link.getAttribute('aria-controls');
                        var linkControls = document.getElementById(linkControlFor);
                        // set action
                        action = controlClasses(linkControls);
                    }

                    // file link
                    var extensions = /\.(zip|exe|dmg|pdf|doc.*|xls.*|ppt.*|mp3|txt|rar|wma|mov|avi|wmv|flv|wav)$/i;
                    if(href.indexOf(local) === 0 && href.match(extensions)) {
                        action = 'download';
                        needsCallback = true;
                    }

                    // email link
                    if(href.indexOf('mailto:') === 0) {
                        action = 'email';
                        needsCallback = false;
                    }

                    if(action === '') {
                        return; // nothing to track, abort, abort
                    }

                    // link is opening a new tab
                    var newTab = (link.getAttribute('target') === '_blank' || event.metaKey || event.ctrlKey);
                    if(newTab){
                        needsCallback = false;
                    }

                    var callback = function() {
                        window.location = href;
                    };

                    data = {
                        'category': category,
                        'action': action,
                        'label': label,
                    };

                    if(needsCallback) {
                        event.preventDefault();
                        data.hitCallback = callback;
                        analytics.trackEvent(data, callback);
                    } else {
                        analytics.trackEvent(data);
                    }
                } else if(trigger === 'BUTTON' || parent === 'BUTTON') {
                    var button = (trigger == 'BUTTON') ? event.target : event.target.parentNode;
                    if(button.hasAttribute('aria-expanded') && button.hasAttribute('aria-controls')) {
                        // we only track openings, not closings
                        var buttonExpanded = button.getAttribute('aria-expanded');
                        if(buttonExpanded === 'false') {
                            return;
                        }

                        category = 'expand';
                        // get the classes off the object it controls
                        var buttonControlFor = button.getAttribute('aria-controls');
                        var buttonControls = document.getElementById(buttonControlFor);
                        // set action
                        action = controlClasses(buttonControls);
                        // set label
                        label = buttonControlFor;
                    } else {
                        // we don't track other buttons yet
                        return;
                    }

                    data = {
                        'category': category,
                        'action': action,
                        'label': label,
                    };
                    analytics.trackEvent(data);
                }
            }, false);
        },

        /*
            Track specific clientside errors created by our code
            this article was a lot of help: http://blog.gospodarets.com/track_javascript_angularjs_and_jquery_errors_with_google_analytics
        */
        trackClientErrors: function() {
            window.addEventListener('error', function (err) {
                var lineAndColumnInfo = err.colno ? ' line:' + err.lineno +', column:'+ err.colno : ' line:' + err.lineno;
                window.vs.analytics.trackEvent({
                    category: 'error',
                    action:  err.message,
                    label: lineAndColumnInfo
                });
            });
        },

        trackLandingSplit: function() {
            // get links to conference landing pages from .split
            var splitLinks = document.querySelectorAll('.split a');
            // add listeners
            Array.prototype.forEach.call(splitLinks, function(element) {
                var link = element.getAttribute('href');
                element.addEventListener('click', function() {
                    window.vs.analytics.trackEvent({
                        category: 'nav',
                        action: 'split',
                        label: link
                    });
                });
            });
            // get links to conference landing pages from text
            var introLinks = document.querySelectorAll('#intro a');
            // add listeners
            Array.prototype.forEach.call(introLinks, function(element) {
                var link = element.getAttribute('href');
                element.addEventListener('click', function() {
                    window.vs.analytics.trackEvent({
                        category: 'nav',
                        action: 'intro',
                        label: link
                    });
                });
            });
        },

    };

    analytics.trackClicks();
    analytics.trackClientErrors();
    analytics.trackLandingSplit();
})();
