from cStringIO import StringIO
import os.path

from django.db.models import Q

from wirecloud.catalogue import utils as catalogue
from wirecloud.catalogue.utils import add_widget_from_wgt, add_resource_from_template
from wirecloud.catalogue.models import CatalogueResource
from wirecloud.platform.markets.utils import get_market_managers
from wirecloud.platform.models import Widget
from wirecloud.platform.widget.utils import create_widget_from_template, create_widget_from_wgt
from wirecloud.commons.utils.template import TemplateParser
from wirecloud.commons.utils.wgt import WgtFile


def install_resource(downloaded_file, templateURL, user, packaged):

    if packaged:
        downloaded_file = StringIO(downloaded_file)
        wgt_file = WgtFile(downloaded_file)
        template_contents = wgt_file.get_template()
    else:
        template_contents = downloaded_file

    template = TemplateParser(template_contents)
    resources = CatalogueResource.objects.filter(vendor=template.get_resource_vendor(), short_name=template.get_resource_name(), version=template.get_resource_version())[:1]

    # Create/recover catalogue resource
    if len(resources) == 1:
        resource = resources[0]
    else:
        if packaged:
            resource = add_widget_from_wgt(downloaded_file, user, wgt_file=wgt_file)
        else:
            resource = add_resource_from_template(templateURL, template_contents, user)

    resource.users.add(user)

    if resource.resource_type() == 'widget':
        widget_vendor = template.get_resource_vendor()
        widget_name = template.get_resource_name()
        widget_version = template.get_resource_version()
        if Widget.objects.filter(vendor=widget_vendor, name=widget_name, version=widget_version).exists():
            local_resource = Widget.objects.get(vendor=widget_vendor, name=widget_name, version=widget_version)
        else:
            if resource.fromWGT:
                base_dir = catalogue.wgt_deployer.get_base_dir(resource.vendor, resource.name, resource.version)
                wgt_file = WgtFile(os.path.join(base_dir, resource.template_uri))
                local_resource = create_widget_from_wgt(wgt_file, user)
            else:
                local_resource = create_widget_from_template(resource.template_uri, user)

        local_resource.users.add(user)

    return resource


def install_resource_from_available_marketplaces(vendor, name, version, user):

    # Now search it on other marketplaces
    market_managers = get_market_managers(user)
    resource_info = None

    for manager in market_managers:

        try:
            resource_info = market_managers[manager].search_resource(vendor, name, version, user)
        except:
            pass

        if resource_info is not None:
            break

    if resource_info is not None:

        return install_resource(resource_info['downloaded_file'], resource_info['template_url'], user, resource_info['packaged'])
    else:
        raise Exception


def get_or_add_resource_from_available_marketplaces(vendor, name, version, user):

    if not CatalogueResource.objects.filter(vendor=vendor, short_name=name, version=version).filter(Q(public=True) | Q(users=user)).exists():
        return install_resource_from_available_marketplaces(vendor, name, version, user)
    else:
        return CatalogueResource.objects.get(vendor=vendor, short_name=name, version=version)