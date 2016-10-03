(function() {
    'use strict';

    /*
        Basic expand/collapse utilities
    */

    var isHash = false;
    var targetId = null;
    if(window.location.hash) {
        isHash = true;
        targetId = window.location.hash;
        targetId = targetId.replace('#', '');
    }
    var targetElement = document.getElementById(targetId);

    // adds ARIA attributes to associate controller and expanded
    function expandInitController(controller, controlledId) {
        // add aria to controller
        controller.setAttribute('aria-controls', controlledId);
        controller.setAttribute('aria-expanded', 'false');
        return controller;
    }

    // given a controller and controlled, sets ARIA attributes to expanded
    function expandOpen(controller) {
        controller.setAttribute('aria-expanded', 'true');
        return controller;
    }

    // given a controller and controlled, sets ARIA attributes to collapsed
    function expandClose(controller) {
        // update expanded to show it's closed
        controller.setAttribute('aria-expanded', 'false');
        return controller;
    }

    function expandSimple(controller) {
        var controls = controller.getAttribute('aria-controls');
        var controlled = document.getElementById(controls);
        if (controller.getAttribute('aria-expanded') === 'true') {
            // toggle aria
            expandClose(controller);
            // toggle visibility
            controlled.classList.add('js-hidden');
            expandCleanURL();
        } else {
            //toggle aria
            expandOpen(controller);
            controlled.classList.remove('js-hidden');
            if(controlled.id) {
                location.href = '#' + controlled.id;
            }
        }
    }

    function expandCleanURL() {
        // remove #hash from location http://stackoverflow.com/questions/1397329/how-to-remove-the-hash-from-window-location-with-javascript-without-page-refresh/5298684#5298684
        if ("pushState" in history) {
            history.pushState('', document.title, location.pathname + location.search);
        }
    }

    /*
        session expand/collapse
    */

    var summaryDivs = document.querySelectorAll('.session_summary');

    if(summaryDivs) {
        var sessionTitleCTATextCollapsed = 'More…';
        var sessionTitleCTATextExpanded = 'Less';

        Array.prototype.forEach.call(summaryDivs, function(element, i) {
            var summary = element;
            // get parent div
            var sessionParent = window.vs.utils.parentByClass(summary, 'session_details');
            // get what we need to figure out session_title
            var sessionTitle = sessionParent.querySelector('.session_title');
            var sessionTitleText = sessionTitle.textContent + ' • ';
            var sessionTitleCTA = document.createElement('span');
            sessionTitleCTA.classList.add('session_cta');


            // create button to replace session_title
            var sessionButton = document.createElement('button');
            sessionButton.setAttribute('type', 'button');
            sessionButton.classList.add('session_title');

            // insert button
            sessionTitle.parentNode.insertBefore(sessionButton, sessionTitle);
            // add text to button (button needs to be in DOM before we append childen, thank you Chrome)
            sessionButton.appendChild(document.createTextNode(sessionTitleText));
            sessionButton.appendChild(sessionTitleCTA);
            sessionTitleCTA.appendChild(document.createTextNode(sessionTitleCTATextCollapsed));
            // remove old session_title
            sessionTitle.parentNode.removeChild(sessionTitle);

            // get session_summary ID
            var summaryId = summary.id;
            // init controller
            expandInitController(sessionButton, summaryId);
            // add listener
            sessionButton.addEventListener('click', function(event) {
                expandSimple(sessionButton);
                if (sessionButton.getAttribute('aria-expanded') === 'true') {
                    sessionTitleCTA.textContent = sessionTitleCTATextExpanded;
                } else {
                    sessionTitleCTA.textContent = sessionTitleCTATextCollapsed;
                }
            }, false);

            if(sessionParent.classList.contains('session_details-keynote')) {
                expandOpen(sessionButton);
                summary.classList.remove('js-hidden');
                sessionTitleCTA.textContent = sessionTitleCTATextExpanded;
            }
        });

        if(isHash) {
            var matchesSummary = document.querySelector('.session button[aria-controls="' + targetId + '"]');
            var matchesParent = document.querySelector('.session button[aria-controls="' + targetId + '_summary"]');
            if(matchesParent || matchesSummary) {
                var matchedController = matchesSummary ? matchesSummary : matchesParent;
                var matchedControlled = matchesSummary ? document.getElementById(targetId) : document.getElementById(targetId + '_summary');
                var cta = matchedController.querySelector('.session_cta');
                expandOpen(matchedController);
                matchedControlled.classList.remove('js-hidden');
                cta.textContent = sessionTitleCTATextExpanded;
                // scroll to it now that it is in view
                location.href = '#' + targetId;
            }
        }
    }

})();
