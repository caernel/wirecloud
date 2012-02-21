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

/*jslint white: true, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
/*global alert, Constants, Element, document, gettext, interpolate, LayoutManagerFactory, Template */
"use strict";

var ResourceDetailsPainter = function (catalogue, details_structure_element) {
    var get_extra_data, get_all_versions_html;

    HTML_Painter.call(this);

    this.catalogue = catalogue;
    this.details_template_element = details_structure_element;
    this.details_template = new Template(this.details_template_element);

    get_extra_data = function (name, extra_data) {
        if (!extra_data) {
            return '';
        }

        if (extra_data[name]) {
            return extra_data[name];
        } else {
            return '';
        }
    };

    get_all_versions_html = function (versions) {
        var i, html = '';

        for (i = 0; i < versions.length; i += 1) {
            html += 'v' + versions[i].text + ' ';
        }

        return html;
    };

    this.create_simple_command = function (selector, command, _event, handler) {
        var elements = this.dom_element.getElementsBySelector(selector);

        if (!elements || elements.length !== 1) {
            alert('Problem rendering resource details (' + selector + ')!');
        }

        EzWebExt.addEventListener(elements[0], _event, handler);
    };

    this.paint = function (resource, user_command_manager) {
        var extra_data, ieCompatibleClass, type, button_text,
            resource_html, tag_links_list, tag_links, search_options, tags, j,
            tag, tag_element, mytags_area_list, my_tags_area;

        extra_data = resource.getExtraData();
        resource.setExtraData(null);

        this.dom_element.update('');

        if (resource.getIeCompatible()) {
            // Si es IE compatible ocultamos la advertencia
            ieCompatibleClass = 'hidden';
        }

        type = '';
        button_text = gettext('Add');

        resource_html = this.details_template.evaluate({
            'image_url': resource.getUriImage(),
            'name': resource.getName(),
            'description': resource.getDescription(),
            'type': type,
            'button_text': button_text,
            'vendor': resource.getVendor(),
            'version': resource.getVersion().text,
            'creator': resource.getCreator(),
            'versions': get_all_versions_html(resource.getAllVersions()),
            'wiki': resource.getUriWiki(),
            'template_url': resource.getUriTemplate(),
            'update_result': get_extra_data('update_result', extra_data),
            'voting_result': get_extra_data('voting_result', extra_data),
            'average_popularity': this.get_popularity_html(resource.getPopularity()),
            'ie_compatible_class': ieCompatibleClass
        });

        // Inserting resource html to the root_element
        this.dom_element.update(resource_html);

        ///////////////////////////////
        // Binding events to GUI
        ///////////////////////////////

        // Go back to list of resources
        this.create_simple_command('.back_to_resource_list', 'click', UserInterfaceHandler.goback.bind());

        // "Instantiate"
        this.create_simple_command('.left_column_resource button', 'click', UserInterfaceHandlers.instanciate(this.catalogue, resource));

        /*
        // Delete resource
        this.create_simple_command('.delete_resource', 'click', this.catalogue.deleteResource.bind(resource));

        // Update resource html
        this.create_simple_command('.update_resource', 'click', this.catalogue.updateResource.bind(resource));

        // Voting a resource
        this.create_simple_command('.voting_resource', 'click', this.catalogue.'VOTE_RESOURCE', resource, 'click', user_command_manager);

        // Changing version
        this.create_simple_command('.change_version_resource', 'CHANGE_RESOURCE_VERSION', resource, 'click', user_command_manager);

        // Tagging resource
        this.create_simple_command('.tagging_resource', 'TAG_RESOURCE', resource, 'click', user_command_manager);

        // ALL Tags
        tag_links_list = this.dom_element.getElementsBySelector('.right_column_resource .tags .tag_links');
        if (!tag_links_list || tag_links_list.length !== 1) {
            alert('Problem rendering resource details (tag_list)!');
        }

        tag_links = tag_links_list[0];

        search_options = {
            starting_page: 1,
            boolean_operator: 'AND',
            scope: ''
        };

        tags = resource.getTags();
        for (j = 0; j < tags.length; j += 1) {
            tag = tags[j];

            tag_element = document.createElement('a');

            Element.extend(tag_element);
            tag_element.update(tag.value);
            tag_element.addClassName('link');
            tag_links.appendChild(tag_element);

            search_options.criteria = tag.value;

            user_command_manager.create_command_from_data('SIMPLE_SEARCH', tag_element, search_options, 'click');
        }

        // MY Tags
        mytags_area_list = this.dom_element.getElementsBySelector('.right_column_resource .my_tags_area');
        if (!mytags_area_list || mytags_area_list.length !== 1) {
            alert('Problem rendering resource details (mytags)!');
        }

        my_tags_area = mytags_area_list[0];

        my_tags_area.update('');

        tags = resource.getTags();

        for (j = 0; j < tags.length; j += 1) {
            tag = tags[j];

            if (tag.added_by.toLowerCase() === 'no') {
                continue;
            }

            tag_element = document.createElement('a');

            Element.extend(tag_element);
            tag_element.update(tag.value);
            tag_element.addClassName('link');
            my_tags_area.appendChild(tag_element);

            tag_element.tag_id = tag.id;

            user_command_manager.create_command_from_data('DELETE_TAG', tag_element, resource, 'click');
        }*/
    };
};
ResourceDetailsPainter.prototype = new HTML_Painter();
