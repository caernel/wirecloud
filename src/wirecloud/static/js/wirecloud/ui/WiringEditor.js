/*
 *     (C) Copyright 2012 Universidad Politécnica de Madrid
 *
 *     This file is part of Wirecloud Platform.
 *
 *     Wirecloud Platform is free software: you can redistribute it and/or
 *     modify it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     Wirecloud is distributed in the hope that it will be useful, but WITHOUT
 *     ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 *     FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public
 *     License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with Wirecloud Platform.  If not, see
 *     <http://www.gnu.org/licenses/>.
 *
 */

/*global LayoutManagerFactory, OperatorMeta, opManager, StyledElements, Wirecloud, gettext, Draggable, BrowserUtilsFactory */
if (!Wirecloud.ui) {
    // TODO this line should live in another file
    Wirecloud.ui = {};
}

(function () {

    "use strict";

    /*************************************************************************
     * Constructor
     *************************************************************************/
    var WiringEditor = function WiringEditor(id, options) {
        var widgetIcon, operatorIcon;
        options['class'] = 'wiring_editor';
        StyledElements.Alternative.call(this, id, options);

        this.addEventListener('show', renewInterface.bind(this));
        this.addEventListener('hide', clearInterface.bind(this));

        this.layout = new StyledElements.BorderLayout();
        this.appendChild(this.layout);

        this.layout.getWestContainer().addClassName('menubar');
        this.accordion = new StyledElements.Accordion();
        this.mini_widget_section = this.accordion.createContainer({title: 'Widgets'});
        widgetIcon = document.createElement("span");
        widgetIcon.addClassName("widgetsIcon");
        this.mini_widget_section.titleContainer.wrapperElement.appendChild(widgetIcon);
        this.mini_operator_section = this.accordion.createContainer({title: 'Operators'});
        operatorIcon = document.createElement("span");
        operatorIcon.addClassName("operatorsIcon");
        this.mini_operator_section.titleContainer.wrapperElement.appendChild(operatorIcon);
        this.layout.getWestContainer().appendChild(this.accordion);
        this.layout.getCenterContainer().addClassName('grid');

        // general highlight button
        this.highlight_button = new StyledElements.StyledButton({
            'title': gettext("general highlight"),
            'class': 'generalHighlight_button',
            'plain': true
        });
        this.highlight_button.insertInto(this.layout.getCenterContainer());
        this.highlight_button.addClassName('activated');
        this.highlight_button.addEventListener('click', function () {
            if (this.generalHighlighted) {
                this.highlight_button.removeClassName('activated');
                this.generalUnhighlight();
                this.generalHighlighted = false;
            } else {
                this.generalHighlight();
                this.highlight_button.addClassName('activated');
                this.generalHighlighted = true;
            }
        }.bind(this), true);

        //canvas for arrows
        this.canvas = new Wirecloud.ui.WiringEditor.Canvas();
        this.canvasElement = this.canvas.getHTMLElement();
        this.layout.getCenterContainer().appendChild(this.canvasElement);
        this.canvas.addEventListener('arrowadded', function (canvas, arrow) {
            this.arrows.push(arrow);
        }.bind(this));
        this.canvas.addEventListener('arrowremoved', function (canvas, arrow) {
            var pos = this.arrows.indexOf(arrow);
            this.arrows.splice(pos, 1);
        }.bind(this));

        this.enableAnchors = this.enableAnchors.bind(this);
        this.disableAnchors = this.disableAnchors.bind(this);

        this.arrowCreator = new Wirecloud.ui.WiringEditor.ArrowCreator(this.canvas, this,
            function () {},
            function () {},
            this.enableAnchors,
            function () {}
        );
        this._startdrag_map_func = function (anchor) {
            anchor.addEventListener('startdrag', this.disableAnchors);
        }.bind(this);
    };
    WiringEditor.prototype = new StyledElements.Alternative();

    WiringEditor.prototype.view_name = 'wiring';

    /*************************************************************************
     * Private methods
     *************************************************************************/

    /**
     * @Private
     * finds anchors from the serialized string
     */
    var findAnchor = function findAnchor(desc) {
        switch (desc.type) {
        case 'iwidget':
            return this.igadgets[desc.id].getAnchor(desc.endpoint);
        case 'ioperator':
            return this.ioperators[desc.id].getAnchor(desc.endpoint);
        }
    };

    /**
     * @Private
     * repaint the wiringEditor interface
     */
    var renewInterface = function renewInterface() {
        var igadgets, igadget, key, i, gadget_interface, minigadget_interface, ioperators, operator,
            operator_interface, operator_instance, operatorKeys, connection, startAnchor, endAnchor,
            arrow, workspace, WiringStatus, isMenubarRef, minigadget_clon, pos;

        workspace = opManager.activeWorkSpace; // FIXME this is the current way to obtain the current workspace
        WiringStatus = workspace.wiring.status;

        if (WiringStatus == null) {
            WiringStatus = {
                views: [
                    {
                        label: 'default',
                        igadgets: {
                        },
                        operators: {
                        },
                        nextOperatorId: 1
                    }
                ],
                operators: {
                },
                connections: [
                ]
            };
        }

        this.nextOperatorId = WiringStatus.views[0].nextOperatorId;
        this.targetsOn = this.sourcesOn = true;
        this.targetAnchorList = [];
        this.sourceAnchorList = [];
        this.arrows = [];
        this.igadgets = {};
        this.mini_widgets = {};
        this.ioperators = {};
        this.selectedObjects = [];
        this.generalHighlighted = true;

        igadgets = workspace.getIGadgets();

        for (i = 0; i < igadgets.length; i++) {
            igadget = igadgets[i];
            // mini widgets
            isMenubarRef = true;
            minigadget_interface = new Wirecloud.ui.WiringEditor.GadgetInterface(this, igadget, this, isMenubarRef);
            this.mini_widgets[igadget.getId()] = minigadget_interface;
            this.mini_widget_section.appendChild(minigadget_interface);

            // widget
            if (igadget.getId() in WiringStatus.views[0].igadgets) {
                minigadget_interface.disable();
                gadget_interface = this.addIGadget(this, igadget);
                gadget_interface.setPosition(WiringStatus.views[0].igadgets[igadget.getId()]);
            }
        }

        // mini operators
        ioperators = Wirecloud.wiring.OperatorFactory.getAvailableOperators();
        for (key in ioperators) {
            isMenubarRef = true;
            operator = ioperators[key];
            operator_interface = new Wirecloud.ui.WiringEditor.OperatorInterface(this, operator, this, isMenubarRef);
            this.mini_operator_section.appendChild(operator_interface);
        }

        // operators
        ioperators = workspace.wiring.ioperators;
        for (key in ioperators) {
            operator_instance = ioperators[key];

            operator_interface = this.addIOperator(operator_instance);
            if (key in WiringStatus.views[0].operators) {
                operator_interface.setPosition(WiringStatus.views[0].operators[key]);
            }
        }

        // connenctions
        for (i = 0; i < WiringStatus.connections.length; i += 1) {
            connection = WiringStatus.connections[i];
            startAnchor = findAnchor.call(this, connection.source);
            endAnchor = findAnchor.call(this, connection.target);
            arrow = this.canvas.drawArrow(startAnchor.getCoordinates(this.layout.getCenterContainer().wrapperElement),
                 endAnchor.getCoordinates(this.layout.getCenterContainer().wrapperElement));
            arrow.startAnchor = startAnchor;
            startAnchor.addArrow(arrow);
            arrow.endAnchor = endAnchor;
            endAnchor.addArrow(arrow);
            arrow.addClassName('arrow');
            arrow.setPullerStart(connection.pullerStart);
            arrow.setPullerEnd(connection.pullerEnd);
        }
    };

    /**
     * @Private
     * clean the WiringEditor interface.
     */
    var clearInterface = function clearInterface() {
        var key, workspace;

        workspace = opManager.activeWorkSpace; // FIXME this is the current way to obtain the current workspace
        workspace.wiring.load(this.serialize());
        workspace.wiring.save();

        for (key in this.igadgets) {
            this.layout.getCenterContainer().removeChild(this.igadgets[key]);
            this.igadgets[key].destroy();
        }
        for (key in this.ioperators) {
            this.layout.getCenterContainer().removeChild(this.ioperators[key]);
            this.ioperators[key].destroy();
        }
        this.canvas.clear();

        this.mini_widget_section.clear();
        this.mini_operator_section.clear();
        this.arrows = [];
        this.mini_widgets = {};
        this.igadgets = {};
        this.ioperators = {};
    };

    /*************************************************************************
     * Public methods
     *************************************************************************/

    /**
     * start drag and drop for menubar gadgets
     */
    WiringEditor.prototype.starDrag = function starDrag(e) {
        var miniwidget_clon, pos_miniwidget;
        if (this.wrapperElement.hasClassName('disabled') || !BrowserUtilsFactory.getInstance().isLeftButton(e.button)) {
            return;
        }
        if (this instanceof Wirecloud.ui.WiringEditor.GadgetInterface) {
            miniwidget_clon = new Wirecloud.ui.WiringEditor.GadgetInterface(this.wiringEditor,
                                                    this.igadget, this.wiringEditor, true, true);
        } else {
            miniwidget_clon = new Wirecloud.ui.WiringEditor.OperatorInterface(this.wiringEditor,
                                                    this.ioperator, this.wiringEditor, true, true);
        }
        pos_miniwidget = this.getBoundingClientRect();
        miniwidget_clon.setBoundingClientRect(pos_miniwidget,
                     {top: -73, left: 0, width: -2, height: -10});

        miniwidget_clon.draggable = new Draggable(miniwidget_clon.wrapperElement,
            miniwidget_clon.wrapperElement, {initialPos: null, entity: miniwidget_clon},
            function onStart(draggable, data, event) {
                var mouseDesp;
                mouseDesp = data.entity.getPosition();
                mouseDesp.posX = event.clientX - mouseDesp.posX;
                mouseDesp.posY = event.clientY - 73 - mouseDesp.posY;
                data.initialPos = mouseDesp;
            },
            function (e, draggable, data, X, Y) {
                data.entity.repaint();
            },
            miniwidget_clon.onFinish.bind(this),
            function (draggable, data) {return data.entity.enabled; });
        this.wiringEditor.layout.wrapperElement.appendChild(miniwidget_clon.wrapperElement);

    };

    /**
     * Saves the wiring state.
     */
    WiringEditor.prototype.serialize = function serialize() {
        var pos, i, key, gadget, arrow, operator_interface, WiringStatus;

        // positions
        WiringStatus = {
            views: [
                {
                    label: 'default',
                    igadgets: {
                    },
                    operators: {
                    },
                    nextOperatorId: this.nextOperatorId
                }
            ],
            operators: {
            },
            connections: [
            ]
        };

        for (key in this.igadgets) {
            gadget = this.igadgets[key];
            pos = gadget.getStylePosition();
            WiringStatus.views[0].igadgets[key] = pos;
        }

        for (key in this.ioperators) {
            operator_interface = this.ioperators[key];
            pos = operator_interface.getStylePosition();
            WiringStatus.operators[key] = {"name" : operator_interface.getName(), 'id' : key};
            WiringStatus.views[0].operators[key] = pos;
        }

        for (i = 0; i < this.arrows.length; i++) {
            arrow = this.arrows[i];
            WiringStatus.connections.push({
                'source': arrow.startAnchor.serialize(),
                'target': arrow.endAnchor.serialize(),
                'pullerStart': arrow.getPullerStart(),
                'pullerEnd': arrow.getPullerEnd()
            });
        }

        return WiringStatus;
    };

    /**
     * general Highlight switch on.
     */
    WiringEditor.prototype.generalHighlight = function generalHighlight() {
        var i, key;

        this.selectedObjects = [];
        for (i in this.ioperators) {
            this.ioperators[i].highlight();
            this.selectedObjects.push(this.ioperators[i]);
        }

        for (key in this.igadgets) {
            this.igadgets[key].highlight();
            this.selectedObjects.push(this.igadgets[key]);
        }
    };

    /**
     * general Highlight switch off.
     */
    WiringEditor.prototype.generalUnhighlight = function generalUnhighlight() {
        var key;

        for (key in this.ioperators) {
            this.ioperators[key].unhighlight();
        }

        for (key in this.igadgets) {
            this.igadgets[key].unhighlight();
        }

        this.selectedObjects = [];
    };

    /**
     * Highlight object.
     */
    WiringEditor.prototype.highlightEntity = function highlightEntity(object) {
        this.selectedObjects.push(object);
    };

    /**
     * Unhighlight object.
     */
    WiringEditor.prototype.unhighlightEntity = function unhighlightEntity(object) {
        var pos = this.selectedObjects.indexOf(object);
        delete this.selectedObjects[pos];
    };

    /**
     * check if the position of the event occurred within the grid
     */
    WiringEditor.prototype.withinGrid = function withinGrid(event) {
        var box = this.layout.getCenterContainer().getBoundingClientRect();

        return (event.clientX > box.left) && (event.clientX < box.right) &&
               (event.clientY > box.top) && (event.clientY < box.bottom);
    };

    WiringEditor.prototype.addIGadget = function addIGadget(wiringEditor, igadget) {
        var gadget_interface = new Wirecloud.ui.WiringEditor.GadgetInterface(wiringEditor, igadget, this.arrowCreator);

        this.igadgets[igadget.getId()] = gadget_interface;
        this.layout.getCenterContainer().appendChild(gadget_interface);

        gadget_interface.sourceAnchors.map(this._startdrag_map_func);
        gadget_interface.targetAnchors.map(this._startdrag_map_func);

        this.targetAnchorList = this.targetAnchorList.concat(gadget_interface.targetAnchors);
        this.sourceAnchorList = this.sourceAnchorList.concat(gadget_interface.sourceAnchors);

        return gadget_interface;
    };

    WiringEditor.prototype.addIOperator = function addIOperator(ioperator) {
        var instanciated_operator, operator_interface;

        if (ioperator instanceof OperatorMeta) {
            instanciated_operator = ioperator.instanciate(this.nextOperatorId);
            this.nextOperatorId++;
        } else {
            instanciated_operator = ioperator;
        }

        operator_interface = new Wirecloud.ui.WiringEditor.OperatorInterface(this, instanciated_operator, this.arrowCreator);
        this.layout.getCenterContainer().appendChild(operator_interface);

        operator_interface.sourceAnchors.map(this._startdrag_map_func);
        operator_interface.targetAnchors.map(this._startdrag_map_func);

        this.targetAnchorList = this.targetAnchorList.concat(operator_interface.targetAnchors);
        this.sourceAnchorList = this.sourceAnchorList.concat(operator_interface.sourceAnchors);

        this.ioperators[operator_interface.getId()] = operator_interface;
        return operator_interface;
    };

    /**
     * Reenables all anchor disabled previously.
     */
    WiringEditor.prototype.enableAnchors = function enableAnchors() {
        var i;

        if (!this.sourcesOn) {
            for (i = 0; i < this.sourceAnchorList.length; i++) {
                this.sourceAnchorList[i].enable();
                this.sourcesOn = true;
            }
        } else if (!this.targetsOn) {
            for (i = 0; i < this.targetAnchorList.length; i++) {
                this.targetAnchorList[i].enable();
                this.targetsOn = true;
            }
        }
    };

    /**
     * Disables all anchor that cannot be connected to the given anchor.
     */
    WiringEditor.prototype.disableAnchors = function disableAnchors(anchor) {
        var i, anchorList = [];
        if (anchor instanceof Wirecloud.ui.WiringEditor.TargetAnchor) {
            anchorList = this.targetAnchorList;
            this.targetsOn = false;
        } else {
            anchorList = this.sourceAnchorList;
            this.sourcesOn = false;
        }
        for (i = 0; i < anchorList.length; i++) {
            anchorList[i].disable();
        }
    };

    WiringEditor.prototype.removeIGadget = function removeIGadget(gadget_interface) {
        delete this.igadgets[gadget_interface.getIGadget().getId()];
        this.layout.getCenterContainer().removeChild(gadget_interface);
        gadget_interface.destroy();

        this.mini_widgets[gadget_interface.getIGadget().getId()].enable();
    };

    WiringEditor.prototype.removeIOperator = function removeIOperator(operator_interface) {
        delete this.ioperators[operator_interface.getIOperator().id];
        this.layout.getCenterContainer().removeChild(operator_interface);
        operator_interface.destroy();
    };

    /**
     * getBreadcrum
     */
    WiringEditor.prototype.getBreadcrum = function getBreadcrum() {
        var workspace_breadcrum = LayoutManagerFactory.getInstance().viewsByName.workspace.getBreadcrum().slice();

        workspace_breadcrum.push({
            'label': 'wiring'
        });

        return workspace_breadcrum;
    };

    /*************************************************************************
     * Make WiringEditor public
     *************************************************************************/
    Wirecloud.ui.WiringEditor = WiringEditor;

})();
