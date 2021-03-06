# -*- coding: utf-8 -*-

# Copyright (c) 2012-2014 CoNWeT Lab., Universidad Politécnica de Madrid

# This file is part of Wirecloud.

# Wirecloud is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Wirecloud is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.

# You should have received a copy of the GNU Affero General Public License
# along with Wirecloud.  If not, see <http://www.gnu.org/licenses/>.

from hashlib import sha1
import json

from django.conf import settings
from django.utils.translation import get_language, ugettext_lazy as _

import wirecloud.platform
from wirecloud.platform.core.catalogue_manager import WirecloudCatalogueManager
from wirecloud.platform.plugins import build_url_template, get_active_features_info, WirecloudPlugin


WORKSPACE_CSS = (
    'css/workspace/iwidget.css',
    'css/workspace/empty_workspace_message.css',
)

CATALOGUE_CSS = (
    'css/catalogue/emptyCatalogueBox.css',
)

WIRING_EDITOR_FILES = (
    'js/wirecloud/ui/WiringEditor.js',
    'js/wirecloud/ui/WiringEditor/Anchor.js',
    'js/wirecloud/ui/WiringEditor/Arrow.js',
    'js/wirecloud/ui/WiringEditor/ArrowCreator.js',
    'js/wirecloud/ui/WiringEditor/Canvas.js',
    'js/wirecloud/ui/WiringEditor/GenericInterface.js',
    'js/wirecloud/ui/WiringEditor/WidgetInterface.js',
    'js/wirecloud/ui/WiringEditor/OperatorInterface.js',
    'js/wirecloud/ui/WiringEditor/SourceAnchor.js',
    'js/wirecloud/ui/WiringEditor/TargetAnchor.js',
    'js/wirecloud/ui/WiringEditor/Multiconnector.js',
    'js/wirecloud/ui/WiringEditor/GenericInterfaceSettingsMenuItems.js',
    'js/wirecloud/ui/WiringEditor/MiniInterfaceSettingsMenuItems.js',
    'js/wirecloud/ui/WiringPreview.js',
    'js/wirecloud/ui/ColorSmartBox.js',
    'js/wirecloud/ui/BasicRecommendations.js',
    'js/wirecloud/ui/RecommendationManager.js',
    'js/wirecloud/wiring/GhostEndpoint.js',
)

TUTORIAL_FILES = (
    'js/wirecloud/ui/Tutorial.js',
    'js/wirecloud/ui/TutorialCatalogue.js',
    'js/wirecloud/ui/TutorialSubMenu.js',
    'js/wirecloud/ui/Tutorial/PopUp.js',
    'js/wirecloud/ui/Tutorial/SimpleDescription.js',
    'js/wirecloud/ui/Tutorial/UserAction.js',
    'js/wirecloud/ui/Tutorial/FormAction.js',
    'js/wirecloud/ui/Tutorial/AutoAction.js',
    'js/wirecloud/Tutorials/BasicConcepts.js',
)

STYLED_ELEMENTS_FILES = (
    'js/StyledElements/Event.js',
    'js/StyledElements/ObjectWithEvents.js',
    'js/StyledElements/StyledElements.js',
    'js/StyledElements/Addon.js',
    'js/StyledElements/Accordion.js',
    'js/StyledElements/Expander.js',
    'js/StyledElements/Fragment.js',
    'js/StyledElements/PaginatedSource.js',
    'js/StyledElements/Button.js',
    'js/StyledElements/PopupMenuBase.js',
    'js/StyledElements/PopupMenu.js',
    'js/StyledElements/MenuItem.js',
    'js/StyledElements/SubMenuItem.js',
    'js/StyledElements/PopupButton.js',
    'js/StyledElements/StaticPaginatedSource.js',
    'js/StyledElements/FileField.js',
    'js/StyledElements/TextField.js',
    'js/StyledElements/TextArea.js',
    'js/StyledElements/StyledList.js',
    'js/StyledElements/PasswordField.js',
    'js/StyledElements/Select.js',
    'js/StyledElements/ToggleButton.js',
    'js/StyledElements/StyledNotebook.js',
    'js/StyledElements/Alternatives.js',
    'js/StyledElements/HorizontalLayout.js',
    'js/StyledElements/BorderLayout.js',
    'js/StyledElements/ModelTable.js',
    'js/StyledElements/EditableElement.js',
    'js/StyledElements/CheckBox.js',
    'js/StyledElements/InputInterface.js',
    'js/StyledElements/InputInterfaces.js',
    'js/wirecloud/ui/ParametrizableValueInputInterface.js',
    'js/StyledElements/VersionInputInterface.js',
    'js/StyledElements/InputInterfaceFactory.js',
    'js/StyledElements/DefaultInputInterfaceFactory.js',
    'js/StyledElements/Form.js',
    'js/StyledElements/GUIBuilder.js',
    'js/StyledElements/PaginationInterface.js',
)

BASE_CSS = (
    'css/base/fade.css',
    'css/windowmenues/logwindowmenu.css',
    'css/workspace/ioperator.css',
)

WIRING_EDITOR_CSS = (
    'css/wiring/editor.css',
    'css/wiring/anchor.css',
    'css/wiring/arrow.css',
    'css/wiring/entities.css',
    'css/wiring/multiconnector.css',
    'css/wiring/emptyWiringBox.css',
    'css/wiring/wiringPreview.css',
    'css/wiring/colorSmartBox.css',
)

TUTORIAL_CSS = (
    'css/tutorial.css',
)


STYLED_ELEMENTS_CSS = (
    'css/styled_elements_core.css',
    'css/styledelements/styled_addon.css',
    'css/styledelements/styled_button.css',
    'css/styledelements/styled_checkbox.css',
    'css/styledelements/styled_notebook.css',
    'css/styledelements/styled_form.css',
    'css/styledelements/styled_pagination.css',
    'css/styledelements/styled_file_field.css',
    'css/styledelements/styled_text_field.css',
    'css/styledelements/styled_text_area.css',
    'css/styledelements/styled_password_field.css',
    'css/styledelements/styled_select.css',
    'css/styledelements/styled_horizontal_layout.css',
    'css/styledelements/styled_table.css',
    'css/styledelements/styled_label_badge.css',
    'css/styledelements/styled_message.css',
    'css/styledelements/styled_rating.css',
    'css/styledelements/styled_popup_menu.css',
)


class WirecloudCorePlugin(WirecloudPlugin):

    features = {
        'Wirecloud': wirecloud.platform.__version__,
        'ApplicationMashup': '1.0',
        'StyledElements': '0.5',
    }

    def get_platform_context_definitions(self):
        return {
            'language': {
                'label': _('Language'),
                'description': _('Current language used in the platform'),
            },
            'username': {
                'label': _('Username'),
                'description': _('User name of the current logged user'),
            },
            'fullname': {
                'label': _('Full name'),
                'description': _('Full name of the logged user'),
            },
            'isstaff': {
                'label': _('Is Staff'),
                'description': _('Boolean. Designates whether current user can access the admin site.'),
            },
            'issuperuser': {
                'label': _('Is Superuser'),
                'description': _('Boolean. Designates whether current user is a super user.'),
            },
            'mode': {
                'label': _('Mode'),
                'description': _('Rendering mode used by the platform (available modes: classic, smartphone and embedded)'),
            },
            'orientation': {
                'label': _('Orientation'),
                'description': _('Current screen orientation'),
            },
            'theme': {
                'label': _('Theme'),
                'description': _('Name of the theme used by the platform'),
            },
            'version': {
                'label': _('Version'),
                'description': _('Version of the platform'),
            },
            'version': {
                'label': _('Version'),
                'description': _('Version of the platform'),
            },
            'version_hash': {
                'label': _('Version Hash'),
                'description': _('Hash for the current version of the platform. This hash changes when the platform is updated or when an addon is added or removed'),
            },
        }

    def get_platform_context_current_values(self, user):
        from django.conf import settings

        if user.is_authenticated():
            username = user.username
            fullname = user.get_full_name()
        else:
            username = 'anonymous'
            fullname = _('Anonymous')

        return {
            'language': get_language(),
            'orientation': 'landscape',
            'username': username,
            'fullname': fullname,
            'isstaff': user.is_staff,
            'issuperuser': user.is_superuser,
            'mode': 'unknown',
            'theme': settings.THEME_ACTIVE,
            'version': wirecloud.platform.__version__,
            'version_hash': sha1(json.dumps(get_active_features_info(), sort_keys=True)).hexdigest(),
        }

    def get_workspace_context_definitions(self):
        return {
            'name': {
                'label': _('Name'),
                'description': _('Current name of the workspace'),
            },
            'owner': {
                'label': _('Owner'),
                'description': _("Workspace's owner username"),
            }
        }

    def get_workspace_context_current_values(self, workspace, user):
        return {
            'name': workspace.name,
            'owner': workspace.creator.username,
        }

    def get_scripts(self, view):
        common = (
            'js/wirecloud/shims/classList.js',
            'js/wirecloud/BaseRequirements.js',
            'js/common/ComputedStyle.js',
            'js/wirecloud/constants.js',
            'js/wirecloud/core.js',
            'js/wirecloud/io.js',
            'js/wirecloud/ContextManager.js',
            'js/wirecloud/PreferenceError.js',
            'js/wirecloud/UserPrefDef.js',
            'js/wirecloud/UserPref.js',
            'js/wirecloud/PersistentVariable.js',
            'js/wirecloud/PersistentVariableDef.js',
            'js/wirecloud/PolicyManager.js',
            'js/wirecloud/HistoryManager.js',
            'js/wirecloud/Version.js',
            'js/wirecloud/Widget.js',
            'js/wirecloud/PreferenceDef.js',
            'js/wirecloud/PlatformPref.js',
            'js/wirecloud/PreferencesDef.js',
            'js/wirecloud/PlatformPreferencesDef.js',
            'js/wirecloud/WorkspacePreferencesDef.js',
            'js/wirecloud/TabPreferencesDef.js',
        ) + STYLED_ELEMENTS_FILES + (
            'js/wirecloud/Preferences.js',
            'js/wirecloud/PlatformPreferences.js',
            'js/wirecloud/PreferenceManager.js',
            'js/wirecloud/WorkspacePreferences.js',
            'js/wirecloud/TabPreferences.js',
            'js/wirecloud/TaskMonitorModel.js',
            'js/wirecloud/IWidget.js',
            'js/wirecloud/Wiring.js',
            'js/wirecloud/LogManager.js',
            'js/wirecloud/Widget/LogManager.js',
            'js/wirecloud/ui/InputInterfaceFactory.js',
            'js/wirecloud/ui/IWidgetMenuItems.js',
            'js/wirecloud/ui/ResizeHandle.js',
            'js/wirecloud/ui/IWidgetResizeHandle.js',
            'js/wirecloud/ui/IWidgetView.js',
            'js/wirecloud/ui/Draggable.js',
            'js/wirecloud/ui/Theme.js',
            'js/wirecloud/WirecloudCatalogue.js',
            'js/wirecloud/LocalCatalogue.js',
            'js/wirecloud/WorkspaceCatalogue.js',
            'js/wirecloud/wiring/Endpoint.js',
            'js/wirecloud/wiring/EndpointError.js',
            'js/wirecloud/wiring/SourceEndpoint.js',
            'js/wirecloud/wiring/TargetEndpoint.js',
            'js/wirecloud/wiring/OperatorFactory.js',
            'js/wirecloud/wiring/OperatorLogManager.js',
            'js/wirecloud/wiring/Operator.js',
            'js/wirecloud/wiring/OperatorMeta.js',
            'js/wirecloud/wiring/OperatorSourceEndpoint.js',
            'js/wirecloud/wiring/OperatorTargetEndpoint.js',
            'js/wirecloud/wiring/WidgetSourceEndpoint.js',
            'js/wirecloud/wiring/WidgetTargetEndpoint.js',
        )

        if view in ('classic', 'embedded'):
            scripts = common + (
                'js/opManager/Workspace.js',
                'js/wirecloud/ui/WorkspaceListItems.js',
                'js/opManager/WorkspaceItems.js',
                'js/opManager/WorkspaceView.js',
                'js/opManager/TabMenuItems.js',
                'js/opManager/Tab.js',
                'js/catalogue/MarketplaceView.js',
                'js/catalogue/CatalogueSearchView.js',
                'js/catalogue/CatalogueView.js',
                'js/dragboard/dragboard.js',
                'js/wirecloud/ui/IWidgetDraggable.js',
                'js/wirecloud/DragboardPosition.js',
                'js/wirecloud/ui/DragboardCursor.js',
                'js/wirecloud/ui/MultiValuedSize.js',
                'js/wirecloud/ui/DragboardLayout.js',
                'js/dragboard/FreeLayout.js',
                'js/dragboard/FullDragboardLayout.js',
                'js/wirecloud/ui/ColumnLayout.js',
                'js/wirecloud/ui/SmartColumnLayout.js',
                'js/wirecloud/MarketManager.js',
                'js/wirecloud/ui/MarketplaceViewMenuItems.js',
                'js/catalogue/ResourceDetailsView.js',
                'js/wirecloud/ui/ResourcePainter.js',
                'js/wirecloud/ui/WirecloudCatalogue/PublishView.js',
                'js/wirecloud/ui/WindowMenu.js',
                'js/wirecloud/ui/AlertWindowMenu.js',
                'js/wirecloud/ui/ExternalProcessWindowMenu.js',
                'js/wirecloud/Widget/PreferencesWindowMenu.js',
                'js/wirecloud/ui/MissingDependenciesWindowMenu.js',
                'js/wirecloud/ui/InstantiateMashupWindowMenu.js',
                'js/wirecloud/ui/FormWindowMenu.js',
                'js/wirecloud/ui/LogWindowMenu.js',
                'js/wirecloud/ui/EmbedCodeWindowMenu.js',
                'js/wirecloud/ui/MessageWindowMenu.js',
                'js/wirecloud/ui/NewWorkspaceWindowMenu.js',
                'js/wirecloud/ui/ParametrizeWindowMenu.js',
                'js/wirecloud/ui/PreferencesWindowMenu.js',
                'js/wirecloud/ui/OperatorPreferencesWindowMenu.js',
                'js/wirecloud/ui/PublishWorkspaceWindowMenu.js',
                'js/wirecloud/ui/PublishResourceWindowMenu.js',
                'js/wirecloud/ui/RenameWindowMenu.js',
            ) + WIRING_EDITOR_FILES + TUTORIAL_FILES

            if view == 'embedded':
                scripts += ('js/wirecloud/ui/EmbeddedWirecloudHeader.js',)
            else:
                scripts += ('js/wirecloud/ui/WirecloudHeader.js',)

            return scripts

        elif view == 'smartphone':
            return common + (
                'iphone/interface/NavigationHeader.js',
                'iphone/interface/MobileDragboard.js',
                'iphone/opManager/Workspace.js',
                'iphone/opManager/Tab.js',
            )
        else:
            return common

    def get_market_classes(self):
        return {
            'wirecloud': WirecloudCatalogueManager,
        }

    def get_constants(self):
        languages = [{'value': lang[0], 'label': _(lang[1])} for lang in settings.LANGUAGES]
        return {
            'AVAILABLE_LANGUAGES': languages,
        }

    def get_templates(self, view):
        if view == 'classic':
            return {
                "iwidget": "wirecloud/ui/iwidget.html",
                "iwidget_smartphone": "wirecloud/ui/iwidget_smartphone.html",
                "window_menu": "wirecloud/ui/window_menu.html",
                "wirecloud_catalogue_search_interface": "wirecloud/catalogue/search_interface.html",
                "catalogue_resource_template": "wirecloud/catalogue/resource.html",
                "catalogue_main_resource_details_template": "wirecloud/catalogue/main_resource_details.html",
                "catalogue_resource_details_template": "wirecloud/catalogue/resource_details.html",
                "wirecloud_catalogue_publish_interface": "wirecloud/catalogue/developers.html",
            }
        else:
            return {}

    def get_ajax_endpoints(self, view):
        endpoints = (
            {'id': 'LOGIN_VIEW', 'url': build_url_template('login')},
            {'id': 'LOGOUT_VIEW', 'url': build_url_template('logout')},
            {'id': 'LOCAL_REPOSITORY', 'url': build_url_template('wirecloud.root')},
            {'id': 'LOCAL_RESOURCE_COLLECTION', 'url': build_url_template('wirecloud.resource_collection')},
            {'id': 'LOCAL_RESOURCE_ENTRY', 'url': build_url_template('wirecloud.resource_entry', ['vendor', 'name', 'version'])},
            {'id': 'IWIDGET_COLLECTION', 'url': build_url_template('wirecloud.iwidget_collection', ['workspace_id', 'tab_id'])},
            {'id': 'IWIDGET_ENTRY', 'url': build_url_template('wirecloud.iwidget_entry', ['workspace_id', 'tab_id', 'iwidget_id'])},
            {'id': 'IWIDGET_PREFERENCES', 'url': build_url_template('wirecloud.iwidget_preferences', ['workspace_id', 'tab_id', 'iwidget_id'])},
            {'id': 'IWIDGET_VERSION_ENTRY', 'url': build_url_template('wirecloud.iwidget_version_entry', ['workspace_id', 'tab_id', 'iwidget_id'])},
            {'id': 'PLATFORM_CONTEXT_COLLECTION', 'url': build_url_template('wirecloud.platform_context_collection')},
            {'id': 'PLATFORM_PREFERENCES', 'url': build_url_template('wirecloud.platform_preferences')},
            {'id': 'PROXY', 'url': build_url_template('wirecloud|proxy', ['protocol', 'domain', 'path'])},
            {'id': 'WORKSPACE_PREFERENCES', 'url': build_url_template('wirecloud.workspace_preferences', ['workspace_id'])},
            {'id': 'TAB_COLLECTION', 'url': build_url_template('wirecloud.tab_collection', ['workspace_id'])},
            {'id': 'TAB_ENTRY', 'url': build_url_template('wirecloud.tab_entry', ['workspace_id', 'tab_id'])},
            {'id': 'TAB_PREFERENCES', 'url': build_url_template('wirecloud.tab_preferences', ['workspace_id', 'tab_id'])},
            {'id': 'THEME_ENTRY', 'url': build_url_template('wirecloud.theme_entry', ['name'])},
            {'id': 'MARKET_COLLECTION', 'url': build_url_template('wirecloud.market_collection')},
            {'id': 'GLOBAL_MARKET_ENTRY', 'url': build_url_template('wirecloud.market_entry', ['market'])},
            {'id': 'MARKET_ENTRY', 'url': build_url_template('wirecloud.market_entry', ['user', 'market'])},
            {'id': 'WIRING_ENTRY', 'url': build_url_template('wirecloud.workspace_wiring', ['workspace_id'])},
            {'id': 'OPERATOR_ENTRY', 'url': build_url_template('wirecloud.operator_code_entry', ['vendor', 'name', 'version'])},
            {'id': 'VARIABLE_COLLECTION', 'url': build_url_template('wirecloud.variable_collection', ['workspace_id'])},
            {'id': 'WIDGET_CODE_ENTRY', 'url': build_url_template('wirecloud.widget_code_entry', ['vendor', 'name', 'version'])},
            {'id': 'WORKSPACE_COLLECTION', 'url': build_url_template('wirecloud.workspace_collection')},
            {'id': 'WORKSPACE_ENTRY', 'url': build_url_template('wirecloud.workspace_entry', ['workspace_id'])},
            {'id': 'WORKSPACE_PUBLISH', 'url': build_url_template('wirecloud.workspace_publish', ['workspace_id'])},
            {'id': 'WORKSPACE_RESOURCE_COLLECTION', 'url': build_url_template('wirecloud.workspace_resource_collection', ['workspace_id'])},
            {'id': 'WORKSPACE_VIEW', 'url': build_url_template('wirecloud.workspace_view', ['owner', 'name'])},
            {'id': 'PUBLISH_ON_OTHER_MARKETPLACE', 'url': build_url_template('wirecloud.publish_on_other_marketplace')},
            {'id': 'WORKSPACE_MERGE', 'url': build_url_template('wirecloud.workspace_merge', ['to_ws_id'])},
        )

        from django.conf import settings
        if 'django.contrib.admin' in settings.INSTALLED_APPS:
            endpoints += ({'id': 'DJANGO_ADMIN', 'url': build_url_template('admin:index')},)

        return endpoints

    def get_platform_css(self, view):
        common = BASE_CSS + STYLED_ELEMENTS_CSS

        if view == 'classic':
            return common + WORKSPACE_CSS + WIRING_EDITOR_CSS + CATALOGUE_CSS + TUTORIAL_CSS
        elif view == 'embedded':
            return common + WORKSPACE_CSS
        elif view == 'smartphone':
            return common + ('css/iphone.css',)
        else:
            return common

    def get_widget_api_extensions(self, view, features):
        return (
            'js/WirecloudAPI/StyledElements.js',
        )

    def get_proxy_processors(self):
        return ('wirecloud.proxy.processors.SecureDataProcessor',)
