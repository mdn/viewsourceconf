(function() {
    'use strict';

    if(!window.vs.js){ return; }

    // heavily inspired by https://css-tricks.com/the-blur-up-technique-for-loading-background-images/
    // hero image on page?
    var hero = document.getElementsByClassName('hero')[0];
    if (hero) {
        // get the background-image src
        var bgSrc = (window.getComputedStyle(hero, '::before').getPropertyValue("background-image"));
        if (bgSrc) {
            // remove the stuff from the src we don't need
            // remove opening url(
            bgSrc = bgSrc.replace(/^url\(/, '');
            // remove opening " or ' if there is one
            bgSrc = bgSrc.replace(/^\"|^\'/, '');
            // remove closing )
            bgSrc = bgSrc.replace(/\)$/, '');
            // remove closing " or ' if there is one
            bgSrc = bgSrc.replace(/\"$|\'$/,'');

            // set up loader
            var img = new Image();
            img.onload = function() {
                hero.className += ' ' + 'hero-loaded';
            };
            // attach src to trigger load
            img.src = bgSrc;
        }
    }
})();
