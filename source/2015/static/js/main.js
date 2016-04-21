/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

;(function() {
    'use strict';

    // Add class to reflect javascript availability for CSS
    document.documentElement.className = document.documentElement.className.replace(/\bno-js\b/, 'js');

    // Show/hide speaker bios
    function bioToggle(event) {
        if (event.target.parentNode.classList.contains('open')) {
            event.target.parentNode.classList.remove('open');
        } else {
            event.target.parentNode.classList.add('open');
        }
    }

    var speakerBios = document.getElementsByClassName('bio-title');
    if (speakerBios) {
        for (var i = 0; i < speakerBios.length; i++) {
            speakerBios[i].addEventListener('click', bioToggle);
        }
    }

})();
