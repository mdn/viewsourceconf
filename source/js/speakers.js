(function() {
    'use strict';
    var speakers_list = document.getElementById('speakers_list');
    var speakers;
    if(speakers_list !== null) {
        speakers = speakers_list.querySelectorAll('.speaker');
    } else {
        return;
    }

    Array.prototype.forEach.call(speakers, function(element, i) {
        var speaker_id = element.id;
        // create button to close speaker_info
        var button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('aria-controls', speaker_id + '_info');
        button.setAttribute('aria-expanded', 'false');
        button.classList.add('speaker_close');
        button.appendChild(document.createTextNode('Return to speaker list.'));
        //add listenter
        button.addEventListener('click', function() {
            speaker_close(speaker_id);
        });
        // append button to speaker_test
        var speaker_text = element.querySelectorAll('.speaker_text');
        Array.prototype.forEach.call(speaker_text, function(element, i){
            element.appendChild(button);
        });

        // add listners & ARIA on speaker photos
        var speaker_links = element.querySelectorAll('.speaker_pic a');
        Array.prototype.forEach.call(speaker_links, function(element, i) {
            element.setAttribute('aria-controls', speaker_id + '_info');
            element.setAttribute('href', '#' + speaker_id);
            element.setAttribute('aria-expanded', 'false');
            element.addEventListener('click', function(event) {
                speaker_toggle(event, speaker_id);
            });
        });
    });

    function speaker_toggle(event, speaker_id) {
        var speaker = document.getElementById(speaker_id);
        var is_active = speaker.classList.contains('js-active');
        if(is_active) {
            // if open, close it
            speaker_close(speaker_id);
        } else {
            // otherwise close all others
            var active_speakers = speakers_list.querySelectorAll('.js-active');
            Array.prototype.forEach.call(active_speakers, function(element, i) {
                var element_id = element.id;
                speaker_close(element_id);
            });
            // open it
            speaker_open(speaker_id);
        }
    }

    function speaker_open(speaker_id) {
        // add active class to list
        speakers_list.classList.add('js-active');
        var speaker = document.getElementById(speaker_id);
        // get minHeight (.speaker_pic + .speaker_info)
        var pic = speaker.querySelectorAll('.speaker_pic');
        var pic_height = pic[0].offsetHeight;
        var info = speaker.querySelectorAll('.speaker_info');
        var info_height = info[0].offsetHeight;
        var speaker_height = pic_height + info_height;
        // add class
        speaker.classList.add('js-active');
        // set minHeight
        speaker.style.minHeight = speaker_height + 'px';
        info[0].style.minHeight = info_height + 'px';
        // set aria-expanded to true
        var controls = speaker.querySelectorAll('[aria-controls='+ speaker_id +'_info]');
        Array.prototype.forEach.call(controls, function(element, i) {
            element.setAttribute('aria-expanded', 'true');
        });

        if(window.vs.analytics) {
            window.vs.analytics.trackEvent({
                category: 'speaker-open',
                action: speaker_id
            });
        }
    }

    function speaker_close(speaker_id) {
        // remove active class from parent
        speakers_list.classList.remove('js-active');
        // remove active class from speaker
        var speaker = document.getElementById(speaker_id);
        speaker.classList.remove('js-active');
        speaker.style.minHeight = '0px';
        // set aria-expanded to false
        var controls = speaker.querySelectorAll('[aria-controls='+ speaker_id +'_info]');
        Array.prototype.forEach.call(controls, function(element, i) {
            element.setAttribute('aria-expanded', 'false');
        });
    }

})();
