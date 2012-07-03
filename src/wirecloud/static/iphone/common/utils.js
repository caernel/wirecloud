/*jslint white: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
/*global setTimeout, window, document, OpManagerFactory, clearInterval, updateInterval, Wirecloud */
"use strict";

/*
*     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
*     S.A.Unipersonal (Telefonica I+D)
*
*     This file is part of Morfeo EzWeb Platform.
*
*     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
*     it under the terms of the GNU Affero General Public License as published by
*     the Free Software Foundation, either version 3 of the License, or
*     (at your option) any later version.
*
*     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
*     but WITHOUT ANY WARRANTY; without even the implied warranty of
*     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*     GNU Affero General Public License for more details.
*
*     You should have received a copy of the GNU Affero General Public License
*     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
*
*     Info about members and contributors of the MORFEO project
*     is available at
*
*     http://morfeo-project.org
 */

/******GENERAL UTILS **********/

/* Slide utility function */
var percent = 100;
var slideSpeed = 20;
var timer;
var percent;

function slide(backwards, element) {
    percent -= slideSpeed;
    if (percent <= 0) {
        percent = 0;
    }
    element.style.left = (backwards ? -percent : percent) + "%";
    if (percent !== 0) {
        setTimeout(function () {
            slide(backwards, element);
        }, 0);
    } else {
        percent = 100;
    }
}

/* language selection */
function setLanguage(language) {
    var onSuccess, onError, params;

    onSuccess = function () {
        window.location.reload();
    };
    onError = function () {};

    params = {
        language: language
    };
    Wirecloud.io.makeRequest("/i18n/setlang/", {
        method: 'POST',
        parameters: params,
        onSuccess: onSuccess,
        onFailure: onError
    });
    return false;
}

/* layout change function (landscape or portrait) */
function updateLayout () {
    var orient = (window.orientation === 0 || window.orientation === 180) ? "portrait" : "landscape";
    document.body.className = orient;
    document.body.style.height = window.innerHeight + 'px';
    document.body.style.width = window.innerWidth + 'px';

    OpManagerFactory.getInstance().alternatives.repaint();

    if (OpManagerFactory.getInstance().loadCompleted) {
        OpManagerFactory.getInstance().activeWorkSpace.updateLayout(orient);
    }
}

/* tab change function */
function checkTab () {
    var opManager, xoffset, tabWidth, halfTabWidth, scroll, STEP_H, steps,
        step, i, tabContainer, xoffset, tabWidth, newTabIndex;

    opManager = OpManagerFactory.getInstance();
    if (opManager.visibleLayer === "tabs_container") {

        tabContainer = opManager.activeWorkSpace.layout.getCenterContainer().wrapperElement;
        xoffset = tabContainer.scrollLeft;
        tabWidth = window.innerWidth;
        newTabIndex = Math.round(xoffset / tabWidth);

        //update the visible Tab
        opManager.activeWorkSpace.updateVisibleTab(newTabIndex);
    }
}