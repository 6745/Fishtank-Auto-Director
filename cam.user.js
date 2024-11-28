// ==UserScript==
// @name         Auto-Director
// @namespace    https://github.com/6745/Fishtank-Auto-Director
// @version      1.1
// @description  Automatically switches cam
// @author       6745
// @match        https://www.fishtank.live/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let autoClickEnabled = false; // hi
    let intervalID = null;


    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Start Director bot';
    toggleButton.style.position = 'fixed';
    toggleButton.style.top = '20px';
    toggleButton.style.right = '310px';
    toggleButton.style.zIndex = 1000;
    toggleButton.style.padding = '10px';

    document.body.appendChild(toggleButton);

    function clickButton() {
        const button = document.querySelector('.live-streams-monitoring-point_popular__x1FQU');
        if (button) {
            button.click();
            console.log('YIPEE', button);
        } else {
            console.log('MAKE A GIT PULL WITH WHATEVER ITS CHANGED TO NOW IF IT DOES CHANGE');
        }
    }


    toggleButton.addEventListener('click', () => {
        autoClickEnabled = !autoClickEnabled;
        toggleButton.textContent = autoClickEnabled ? 'Stop Auto' : 'Resume';
        toggleButton.style.backgroundColor = autoClickEnabled ? '#dc3545' : '#007bff';

        if (autoClickEnabled) {

            clickButton();
            intervalID = setInterval(clickButton, 30000);
        } else {
            clearInterval(intervalID);
        }
    });
})();
