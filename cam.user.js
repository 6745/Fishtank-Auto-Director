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
    toggleButton.textContent = 'off';
    toggleButton.className = 'bg-gradient-to-r from-dark-400/75 to-dark-500/75 p-0.5 inline-flex items-center justify-center cursor-pointer rounded-md hover:brightness-105 focus-visible:outline-1 focus-visible:outline-tertiary';
    toggleButton.style.padding = '6px 10px';
    toggleButton.style.fontSize = '13px';
    toggleButton.style.maxWidth = '110px';
    toggleButton.style.whiteSpace = 'normal';
    toggleButton.style.wordBreak = 'break-word';
    toggleButton.style.lineHeight = '1';

 
    let _attached = false;
    const panel = document.createElement('div');
   
    panel.className = 'rounded-lg shadow-panel p-0 border-t-2 border-b-3 border-l-2 border-r-2 text-dark-text bg-light border-b-light-700/50 border-l-light-300/75 border-r-light-700/75 [background-image:var(--texture-panel)] relative hidden lg:flex rounded-t-none border-t-none';
    panel.innerHTML = `
        <div class="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg [background-image:var(--texture-panel)] opacity-50 z-[-1]"></div>
        <div style="display:flex;align-items:center;justify-content:center;max-width:160px;">
            <div style="width:100%;opacity:1;transform:none;">
                <div style="display:flex;align-items:center;width:100%;transform:translateY(2px);">
                    <div class="m-2 bg-dark-700/30 border-2 border-dark-300/50 rounded-lg p-2 text-light-text text-shadow-lg shadow-panel-soft" style="display:flex;align-items:center;gap:8px;width:100%;flex-wrap:wrap;">
                        <div style="font-weight:700;min-width:0;">Auto:</div>
                        <div id="__auto_director_btn_wrap" style="margin-left:auto;min-width:0;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    function findDayContainer() {
        
        const els = Array.from(document.querySelectorAll('div'));
        for (const el of els) {
            try {
                const t = (el.innerText || el.textContent || '').trim();
                if (!t) continue;
                
                if (/\bDay\b\s*\d*/i.test(t) && el.classList && el.className.includes('rounded-lg')) {
                    return el;
                }
            } catch (e) {}
        }
        
        return document.querySelector('.relative.rounded-lg.shadow-panel');
    }

    function tryAttach() {
        const dayEl = findDayContainer();
        if (dayEl && dayEl.parentElement) {
            
            if (!dayEl.parentElement.contains(panel)) dayEl.parentElement.insertBefore(panel, dayEl.nextSibling);
            const wrap = panel.querySelector('#__auto_director_btn_wrap');
            if (wrap && !wrap.contains(toggleButton)) wrap.appendChild(toggleButton);
            _attached = true;
            return true;
        }
        
        if (document.body && !document.body.contains(panel)) {
            document.body.appendChild(panel);
            const wrap = panel.querySelector('#__auto_director_btn_wrap');
            if (wrap && !wrap.contains(toggleButton)) wrap.appendChild(toggleButton);
            _attached = true;
            return true;
        }
        return false;
    }

    function ensureAttachedAndObserve() {
        tryAttach();
        const root = document.documentElement || document;
        const mo = new MutationObserver(() => {
            if (!_attached || !document.body.contains(panel) || !panel.contains(toggleButton)) {
                tryAttach();
            }
        });
        mo.observe(root, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureAttachedAndObserve);
    } else {
        ensureAttachedAndObserve();
    }

    function clickButton() {
        
        function parseNumber(s) {
            if (!s) return null;
            const m = s.replace(/[,\s]+/g, ' ').match(/(\d{1,3}(?:,\d{3})*|\d+)/);
            if (!m) return null;
            return parseInt(m[0].replace(/,/g, ''), 10);
        }

        function getViewerCount(el) {
            if (!el) return null;
            
            const text = (el.innerText || el.textContent || '').replace(/\n/g, ' ');
            let rx = new RegExp("(\\d{1,3}(?:,\\d{3})*|\\d+)\\s*(?:Viewers|viewers|Views|views)", 'i');
            let m = text.match(rx);
            if (m) return parseInt(m[1].replace(/,/g, ''), 10);
            
            const alt = text.match(/(\d{2,}|\d{1,3}(?:,\d{3})*)/);
            if (alt) return parseInt(alt[0].replace(/,/g, ''), 10);
            return null;
        }

       
        const imgs = Array.from(document.querySelectorAll('img'));
        const candidates = new Map();
        for (const img of imgs) {
            const src = img.src || img.getAttribute('src') || '';
            
            if (!/live|streams-|live%2B/.test(src)) continue;
            
            const wrapper = img.closest('button, a, [role="button"], .group, .relative') || img.parentElement;
            if (!wrapper) continue;
            const key = wrapper;
            if (!candidates.has(key)) candidates.set(key, getViewerCount(wrapper));
        }

        
        const cardButtons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        for (const b of cardButtons) {
            // avoid adding UI controls like our toggle
            if (b === toggleButton) continue;
            // if element contains an image or the word "Viewers", consider it
            if (b.querySelector('img') || /Viewers|viewers|views/i.test(b.innerText || '')) {
                if (!candidates.has(b)) candidates.set(b, getViewerCount(b));
            }
        }

      
        let best = null;
        let bestCount = -1;
        for (const [el, count] of candidates.entries()) {
            const c = count == null ? -1 : count;
            if (c > bestCount) {
                best = el;
                bestCount = c;
            }
        }

       
        if (!best) {
        
            function findByText(regex) {
                const nodes = document.querySelectorAll('button, a');
                for (const n of nodes) {
                    try {
                        const t = (n.innerText || n.textContent || '').trim();
                        if (t && regex.test(t)) return n;
                    } catch (e) {}
                }
                return null;
            }
            best = findByText(/director\s*mode|director/i) || findByText(/watch|viewers|view/i) || document.querySelector('button.group.relative.cursor-pointer');
        }

        if (best) {
            try {
            
                if (!(best instanceof HTMLButtonElement) && best.querySelector) {
                    const innerBtn = best.querySelector('button, a, [role="button"]');
                    if (innerBtn) {
                        innerBtn.click();
                        console.log('Auto-Director clicked inner:', innerBtn, 'count=', bestCount);
                        return;
                    }
                }
                best.click();
                console.log('Auto-Director clicked best:', best, 'count=', bestCount);
            } catch (e) {
                console.log('Auto-Director: click failed', e, best);
            }
        } else {
            console.log('Auto-Director: no candidate found to click');
        }
    }


    toggleButton.addEventListener('click', () => {
        autoClickEnabled = !autoClickEnabled;
        toggleButton.textContent = autoClickEnabled ? 'on' : 'off';
        toggleButton.style.backgroundColor = autoClickEnabled ? '#007bff' : '#dc3545';

        if (autoClickEnabled) {

            clickButton();
            intervalID = setInterval(clickButton, 30000);
        } else {
            clearInterval(intervalID);
        }
    });
})();
