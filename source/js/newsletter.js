/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

;(function() {
    'use strict';

    // handle errors
    var errorArray = [];
    var newsletterErrors = document.getElementById('newsletter-errors');
    function err(e) {
        var errorList = document.createElement('ul');

        if(errorArray.length) {
            for (var i = 0; i < errorArray.length; i++) {
                var item = document.createElement('li');
                item.appendChild(document.createTextNode(errorArray[i]));
                errorList.appendChild(item);
            }
        } else {
            subscribe(false, true);
        }

        newsletterErrors.appendChild(errorList);
        newsletterErrors.style.display = 'block';
    }

    /* HTML5 "required" validation feedback is not cross-browser compatible
     * so we have to roll our own.
     * Add .invalid class to :invalid elements; remove on submit.
     */
    function validate(form) {

        var already_invalid = form.querySelectorAll('.invalid');
        for (var i = 0; i < already_invalid.length; ++i) {
            var element = already_invalid[i];
            element.className = element.className.replace(/ *invalid/g, '');
        }
        var invalid = form.querySelectorAll('input:invalid');
        for (i = 0; i < invalid.length; ++i) {
            invalid[i].parentNode.parentNode.className += ' invalid';
        }
        if (invalid.length > 0) {
            err(new Error('Please complete the form below.'));
            return false;
        }
        return true;
    }

    // XHR subscribe; handle errors; display thanks message on success.
    function subscribe(evt, skipXHR) {
        if(skipXHR) {
            return true;
        }
        evt.preventDefault();
        evt.stopPropagation();

        // new submission, clear old errors
        errorArray = [];
        newsletterErrors.style.display = 'none';
        while (newsletterErrors.firstChild) newsletterErrors.removeChild(newsletterErrors.firstChild);

        var form = document.getElementById('newsletter-signup');
        if (!validate(form)) {
            return false;
        }

        var fmt = document.getElementById('fmt').value;
        var email = document.getElementById('newsletter-email').value;
        var newsletter = document.querySelector('input[name="newsletters"]:checked') ? document.querySelector('input[name="newsletters"]:checked').value : '';
        var privacy = document.querySelector('input[name="privacy"]:checked') ? '&privacy=true' : '';
        var thanks = document.getElementById('newsletter-thanks');
        var params = 'email=' + encodeURIComponent(email) +
                     '&newsletters=' + newsletter +
                     privacy +
                     '&fmt=' + fmt;

        var xhr = new XMLHttpRequest();

        xhr.onload = function(r) {
            if (r.target.status >= 200 && r.target.status < 300) {
                var response = r.target.response;
                if (response.success === true) {
                    form.style.display = 'none';
                    thanks.style.display = 'block';
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
                    err(new Error());
                }
            }
            else {
                err(new Error());
                if(window.vs.analytics) {
                    window.vs.analytics.trackEvent({ category: 'Error', action: 'XMLHttpRequest', label: String(r.target.status) });
                }
            }
        };

        xhr.onerror = function(e) {
            err(e);
        };

        var url = form.getAttribute('action');

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
        xhr.timeout = 5000;
        xhr.ontimeout = err;
        xhr.responseType = 'json';
        xhr.send(params);

        return false;
    }

    var newsletterForm = document.getElementById('newsletter-signup');
    if(newsletterForm){
        newsletterForm.addEventListener('submit', subscribe, false);
    }
})();
