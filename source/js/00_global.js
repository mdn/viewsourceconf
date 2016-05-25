(function() {
    'use strict';
    var html = document.documentElement;
    // remove js-no if its still there
    html.classList.remove('js-no');
    // signal site js loaded
    html.classList.add('js-site');

})();
