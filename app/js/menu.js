'use strict';

/**
 * Created by ALI on 6/28/2017.
 */

var btn = document.querySelector('.header__menu-toogle');
var menu_bars = document.querySelector('.header__menu-bars');
var menu_sidebar = document.querySelector('.section-main-menu');
var body = document.querySelector('body');
menu_sidebar.addEventListener("transitionend", show);
btn.addEventListener('click', show);
function show() {
    if (event.type == 'transitionend' && !body.classList.contains("section-main-menu_open")) {
        setTimeout(function () {

            body.classList.remove('section-main-menu_scroll');
        }, 250);
    }
    if (event.type == "click") {
        event.preventDefault();
        menu_bars.classList.toggle('header__menu-bars_open');
        body.classList.toggle('section-main-menu_open');
        body.classList.add('section-main-menu_scroll');
    }
}