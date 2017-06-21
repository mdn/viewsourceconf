/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

;(function() {
    'use strict';

    if(!window.vs.js) { return; }

    // !! this file assumes only one signup form per page !!

    var newsletterForm = document.getElementById('newsletter_form');
    // only do this if there's a form on the page
    if(!newsletterForm) { return; }
    var newsletterWrapper = window.vs.utils.parentByClass(newsletterForm, 'newsletter');

    // add listener if form is collapsed
    if(newsletterWrapper.classList.contains('js-collapse')) {
        // get email field
        var emailField = document.getElementById('email');
        // add listener for focus
        emailField.addEventListener('focus', newsletterExpand, false);
        // expand collapsed fields
        function newsletterExpand() {
            // remove .js-collapse class from form
            newsletterWrapper.classList.remove('js-collapse');
            // remove listener, we only expand once
            emailField.removeEventListener('focus', newsletterExpand, false);
        }
    }

    // handle errors
    var errorArray = [];
    var newsletterErrors = document.getElementById('newsletter_errors');
    function newsletterError(e) {
        var errorList = document.createElement('ul');

        if(errorArray.length) {
            for (var i = 0; i < errorArray.length; i++) {
                var item = document.createElement('li');
                item.appendChild(document.createTextNode(errorArray[i]));
                errorList.appendChild(item);
            }
        } else {
            // no error messages, forward to server for better troubleshooting
            newsletterForm.setAttribute('data-skip-xhr', true);
            newsletterForm.submit();
        }

        newsletterErrors.appendChild(errorList);
        newsletterErrors.style.display = 'block';
    }

    // show sucess message
    function newsletterThanks() {
        var thanks = document.getElementById('newsletter_thanks');

        // if this is an inline form
        if(newsletterWrapper.classList.contains('newsletter-inline')) {
            var sectionBody = window.vs.utils.parentByClass(newsletterForm, 'section_body');
            // move the thanks up to the section level
            sectionBody.insertBefore(thanks, sectionBody.firstChild);
            // hide the other stuff in the section
            var sectionChildren = sectionBody.children;
            for (var i = 0; i < sectionChildren.length; i++) {
                sectionChildren[i].style.display = 'none';
            }
        }

        // show thanks message
        thanks.style.display = 'block';
    }

    // XHR subscribe; handle errors; display thanks message on success.
    function newsletterSubscribe(evt) {
        console.log('submitted');
        var skipXHR = newsletterForm.getAttribute('data-skip-xhr');
        if (skipXHR) {
            return true;
        }
        evt.preventDefault();
        evt.stopPropagation();

        // new submission, clear old errors
        errorArray = [];
        newsletterErrors.style.display = 'none';
        while (newsletterErrors.firstChild) newsletterErrors.removeChild(newsletterErrors.firstChild);

        var fmt = document.getElementById('fmt').value;
        var email = document.getElementById('email').value;
        var newsletter = 'view-source-conference-global';
        var privacy = document.querySelector('input[name="privacy"]:checked') ? '&privacy=true' : '';
        var params = 'email=' + encodeURIComponent(email) +
                     '&newsletters=' + newsletter +
                     privacy +
                     '&fmt=' + fmt;

        var xhr = new XMLHttpRequest();

        xhr.onload = function(r) {
            if (r.target.status >= 200 && r.target.status < 300) {
                // response is null if handled by service worker
                if(response === null ) {
                    newsletterError(new Error());
                    return;
                }
                var response = r.target.response;
                if (response.success === true) {
                    newsletterForm.style.display = 'none';
                    newsletterThanks();
                    if(window.vs.analytics) {
                        window.vs.analytics.trackEvent({ category: 'signup', action: 'newsletter', label: String(newsletter) });
                    }
                }
                else {
                    if(response.errors) {
                        for (var i = 0; i < response.errors.length; i++) {
                            errorArray.push(response.errors[i]);
                        }
                    }
                    newsletterError(new Error());
                }
            }
            else {
                newsletterError(new Error());
            }
        };

        xhr.onerror = function(e) {
            newsletterError(e);
        };

        var url = newsletterForm.getAttribute('action');

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
        xhr.timeout = 5000;
        xhr.ontimeout = newsletterError;
        xhr.responseType = 'json';
        xhr.send(params);

        return false;
    }

    newsletterForm.addEventListener('submit', newsletterSubscribe, false);
})();
