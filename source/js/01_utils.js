(function() {
    'use strict';

    window.vs.utils = {
        closestByClass: function(parent, matchClass) {
            while (!parent.classList.contains(matchClass)) {
                // not on this parent, make the next loop check the next one
                parent = parent.parentNode;
                // make sure we're not out of parents
                if (!parent) { return null; }
            }
            // when the while loops stops, return the match
            return parent;
        }
    };
})();
