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


        trackOutboundLinks: function() {
            document.body.addEventListener('click', 'a', function (event) {
                var $this = $(this);

                var host = this.hostname;
                if(host && host !== location.hostname) {
                    var newTab = (this.target === '_blank' || event.metaKey || event.ctrlKey);
                    var href = this.href;
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
            });
        },

        /*
            Track specific clientside errors created by our code
            this article was a lot of help: http://blog.gospodarets.com/track_javascript_angularjs_and_jquery_errors_with_google_analytics
        */
        trackClientErrors: function() {
            window.addEventListener('error', function (err) {
                var lineAndColumnInfo = err.colno ? ' line:' + err.lineno +', column:'+ err.colno : ' line:' + err.lineno;
                analytics.trackEvent('JavaScript Error', err.message , err.filename + ':' + lineAndColumnInfo);
            });
        },

    };
})();
