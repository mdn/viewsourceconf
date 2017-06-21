(function () {
    'use strict';

    if (!window.vs.js) { return; }

    var speakersList = document.getElementById('speakers_list');
    var speakers;
    if(speakersList !== null) {
        speakers = speakersList.querySelectorAll('.speaker');
    } else {
        return;
    }

    function speakerToggle(event, speakerId) {
        var speaker = document.getElementById(speakerId);
        var isActive = speaker.classList.contains('js-active');
        if (isActive) {
            // if open, close it
            speakerClose(speakerId);
        } else {
            // otherwise close all others
            var activeSpeakers = speakersList.querySelectorAll('.js-active');
            Array.prototype.forEach.call(activeSpeakers, function (element) {
                var elementId = element.id;
                speakerClose(elementId);
            });
            // open it
            speakerOpen(speakerId);
        }
    }

    function speakerOpen(speakerId) {
        // add active class to list
        speakersList.classList.add('js-active');
        var speaker = document.getElementById(speakerId);
        // get minHeight (.speaker_pic + .speaker_info)
        var pic = speaker.querySelectorAll('.speaker_pic');
        var picHeight = pic[0].offsetHeight;
        var info = speaker.querySelectorAll('.speaker_info');
        var infoHeight = info[0].offsetHeight;
        var speakerHeight = picHeight + infoHeight;
        // add class
        speaker.classList.add('js-active');
        // set minHeight
        speaker.style.minHeight = speakerHeight + 'px';
        info[0].style.minHeight = infoHeight + 'px';
        // set aria-expanded to true
        var controls = speaker.querySelectorAll('[aria-controls=' + speakerId + '_info]');
        Array.prototype.forEach.call(controls, function(element) {
            element.setAttribute('aria-expanded', 'true');
        });
    }

    function speakerClose(speakerId) {
        // remove active class from parent
        speakersList.classList.remove('js-active');
        // remove active class from speaker
        var speaker = document.getElementById(speakerId);
        speaker.classList.remove('js-active');
        speaker.style.minHeight = '0px';
        // set aria-expanded to false
        var controls = speaker.querySelectorAll('[aria-controls=' + speakerId + '_info]');
        Array.prototype.forEach.call(controls, function (element) {
            element.setAttribute('aria-expanded', 'false');
        });
    }

    Array.prototype.forEach.call(speakers, function (element) {
        var speakerId = element.id;
        // create button to close speaker_info
        var button = document.createElement('button');
        var buttonText = document.createElement('span');
        button.setAttribute('type', 'button');
        button.setAttribute('aria-controls', speakerId + '_info');
        button.setAttribute('aria-expanded', 'false');
        button.classList.add('speaker_close');
        buttonText.classList.add('invisible');
        buttonText.appendChild(document.createTextNode('Return to speaker list.'));
        button.appendChild(buttonText);
        // add listenter
        button.addEventListener('click', function () {
            speakerClose(speakerId);
        }, false);
        // append button to speaker_test
        var speakerText = element.querySelectorAll('.speaker_text');
        Array.prototype.forEach.call(speakerText, function (el) {
            el.appendChild(button);
        });

        // add listners & ARIA on speaker photos
        var speakerLinks = element.querySelectorAll('.speaker_pic a');
        Array.prototype.forEach.call(speakerLinks, function(el, i) {
            el.setAttribute('aria-controls', speakerId + '_info');
            el.setAttribute('href', '#' + speakerId);
            el.setAttribute('aria-expanded', 'false');
            el.addEventListener('click', function (event) {
                speakerToggle(event, speakerId);
            }, false);
        });
    });
})();
