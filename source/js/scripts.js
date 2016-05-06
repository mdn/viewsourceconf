(function() {
    'use strict';
    var html = document.documentElement;
    // remove js-no if its still there
    html.classList.remove('js-no');
    // signal site js loaded
    html.classList.add('js-site');
})();

(function(win, doc) {
    'use strict';
    var speaker_list = doc.getElementById('speaker_list');
    var speakers = speaker_list.querySelectorAll('.speaker');

    Array.prototype.forEach.call(speakers, function(element, i){
        var speaker_id = element.id;
        // create button to close speaker_info
        var button = doc.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('aria-controls', speaker_id + '_info');
        button.setAttribute('aria-expanded', 'false');
        button.classList.add('speaker_close');
        button.appendChild(doc.createTextNode('Close.'));
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
        var speaker = doc.getElementById(speaker_id);
        var is_active = speaker.classList.contains('js-active');
        if(is_active) {
            // if open, close it
            speaker_close(speaker_id);
        } else {
            // otherwise close all others
            var active_speakers = speaker_list.querySelectorAll('.js-active');
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
        speaker_list.classList.add('js-active');
        var speaker = doc.getElementById(speaker_id);
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
    }

    function speaker_close(speaker_id) {
        // remove active class from parent
        speaker_list.classList.remove('js-active');
        // remove active class from speaker
        var speaker = doc.getElementById(speaker_id);
        speaker.classList.remove('js-active');
        speaker.style.minHeight = '0px';
        // set aria-expanded to false
        var controls = speaker.querySelectorAll('[aria-controls='+ speaker_id +'_info]');
        Array.prototype.forEach.call(controls, function(element, i) {
            element.setAttribute('aria-expanded', 'false');
        });
    }

})(window, document);
