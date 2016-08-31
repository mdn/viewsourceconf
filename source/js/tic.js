(function() {
    'use strict';
    var count = 0;
    var winner = false;

    var x = 'X';
    var o = 'O';

    var buttons = document.querySelectorAll('#tic button');

    if(buttons.length < 1) { return; }

    Array.prototype.forEach.call(buttons, function(button, i) {
        button.addEventListener('click', function() {
            play(button);
        }, false);
    });

    function turn(i) {
        return (i % 2) ? x : o;
    }

    function play(button) {
        // check count
        if(count > 8 || winner) { return; }

        // check button not in use
        if(button.hasChildNodes()) { return; }

        // play x or o based on odd or even
        button.appendChild(document.createTextNode(turn(count)));
        button.classList.add('tic_' + turn(count));

        count ++;

        // check for end of game
        check();
    }

    function check() {
        // check each victory condition
        var i;
        // check for matching in 3s
        for(i = 0; i < 9; i += 3) {
            matches(buttons.item(i), buttons.item(i+1), buttons.item(i+2));
        }
        // check for matching at % 3
        for(i = 0; i < 3; i += 1) {
            matches(buttons.item(i), buttons.item(i+3), buttons.item(i+6));
        }
        // check for matching at 1,5,9
        matches(buttons.item(0), buttons.item(4), buttons.item(8));
        // check for matching at 3,5,7
        matches(buttons.item(2), buttons.item(4), buttons.item(6));
        // might be end of game anyway.
        if(count == 9) {
            end();
            return;
        }
    }

    function matches(first, second, third) {
        if(first.textContent === '') {
            return false;
        } else if (first.textContent === second.textContent && second.textContent === third.textContent) {
        // end game
        end();
            // if we find a winner, add the winning classes
            first.classList.add('tic_winner');
            window.setTimeout(function(){second.classList.add('tic_winner');}, 50);
            window.setTimeout(function(){third.classList.add('tic_winner');}, 100);
            return true;
        } else {
            return false;
        }
    }

    function end() {
        winner = true;
        // disable buttons
        Array.prototype.forEach.call(buttons, function(button, i) {
            button.setAttribute('disabled', 'disabled');
        });
    }

    function restart() {
        // reset count and winner
        count = 0;
        winner = false;
        Array.prototype.forEach.call(buttons, function(button, i) {
            // remove all classes
            button.className = '';
            // remove all text
            while (button.firstChild) {
                button.removeChild(button.firstChild);
            }
            // enable buttons
            button.removeAttribute('disabled');
        });
    }

    var restart_button = document.getElementById('tic_restart');

    restart_button.addEventListener('click', function() {
        restart();
    }, false);

})();


