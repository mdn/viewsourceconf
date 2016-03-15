/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

;(function() {
    'use strict';

    // Use staging if not in prod
    var basketUrl = 'https://basket.allizom.org/news/subscribe/';
    if (window.location.hostname === 'viewsourceconf.org') {
        basketUrl = 'https://basket.mozilla.org/news/subscribe/';
    }

    // All errors should go here
    function err(e) {
        var msg = 'An unknown error occurred. Please try again later.';
        if (e.message !== '' && e.message !== undefined) {
            msg = e.message;
        }
        var error = document.querySelector('.subscribe-form .error');
        error.textContent = msg;
        error.style.display = 'block';

        if (msg === 'Invalid email address') {
            document.getElementById('newsletter-email').parentNode.parentNode.className += ' invalid';
        }
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
    function subscribe(evt) {
        evt.preventDefault();
        evt.stopPropagation();

        var form = document.getElementById('newsletter-signup');
        if (!validate(form)) {
            return false;
        }

        var email = document.getElementById('newsletter-email').value;
        var newsletter = document.querySelector('input[name="newsletters"]:checked').value;
        var thanks = document.getElementById('newsletter-thanks');
        var params = 'email=' + encodeURIComponent(email) +
                     '&newsletters=' + newsletter;

        var xhr = new XMLHttpRequest();

        xhr.onload = function(r) {
            if (r.target.status >= 200 && r.target.status < 300) {
                var response = r.target.response;
                if (response.status === 'ok') {
                    form.style.display = 'none';
                    thanks.style.display = 'block';
                }
                else {
                    err(new Error(response.desc));
                }
            }
            else if (r.target.status !== null) {
                err(new Error(r.target.response.desc));
            }
            else {
                err(new Error());
            }
        };

        xhr.onerror = function(e) {
            err(e);
        };

        xhr.open('POST', basketUrl, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('Connection', 'close');
        xhr.timeout = 5000;
        xhr.ontimeout = err;
        xhr.responseType = 'json';
        xhr.setRequestHeader('Content-length', params.length);
        xhr.send(params);

        return false;
    }

    var button = document.getElementById('newsletter-submit');
    button.addEventListener('click', subscribe, false);
})();
