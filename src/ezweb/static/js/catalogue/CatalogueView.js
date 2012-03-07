var CatalogueView = function(id, options) {
    options.id = 'catalogue';
    StyledElements.Alternative.call(this, id, options);

    this.alternatives = new StyledElements.StyledAlternatives();
    this.appendChild(this.alternatives);

    this.viewsByName = {
        'search': this.alternatives.createAlternative({alternative_constructor: CatalogueSearchView, containerOptions: {catalogue: this}}),
        'developer': this.alternatives.createAlternative(),
        'details': this.alternatives.createAlternative({alternative_constructor: ResourceDetailsView, containerOptions: {catalogue: this}})
    };

    this.view_all_template = new Template(URIs.GET_POST_RESOURCES + '/#{starting_page}/#{resources_per_page}');
    this.simple_search_template = new Template(URIs.GET_RESOURCES_SIMPLE_SEARCH + '/simple_or/#{starting_page}/#{resources_per_page}');

    this.resource_painter = new ResourcePainter(this, $('catalogue_resource_template').getTextContent(), this.wrapperElement.getElementsByClassName('resource_list')[0]);
};
CatalogueView.prototype = new StyledElements.Alternative();

CatalogueView.prototype.view_name = 'catalogue';

CatalogueView.prototype._onShow = function() {
};

CatalogueView.prototype._onSearchSuccess = function(transport) {
    var preferred_versions, data, key, raw_data, resources, resource;

    raw_data = JSON.parse(transport.responseText);

    if (raw_data.resources) {
        preferred_versions = CookieManager.readCookie('preferred_versions', true);
        if (preferred_versions === null) {
            preferred_versions = {};
        }

        resources = [];

        for (i = 0; i < raw_data.resources.length; i += 1) {
            resource = new CatalogueResource(raw_data.resources[i]);
            resources.push(resource);
            key = resource.getVendor() + '/' + resource.getName();
            if (key in preferred_versions) {
                resource.changeVersion(preferred_versions[key]);
            }
        }

        data = {
            'resources': resources,
            'preferred_versions': preferred_versions,
            'query_results_number': resources.length,
            'resources_per_page': 10,
            'current_page': 1
        };

        this.resource_painter.paint(data);
    }
};

CatalogueView.prototype.search = function(options) {
    var params, url, context;

    params = {
        'orderby': options.order_by,
        'search_criteria': options.search_criteria,
        'search_boolean': options.search_boolean,
        'scope': options.scope
    };

    context = {
        'resource_painter': this.resource_painter,
        'user_command_manager': this.user_command_manager
    };

    if (options.search_criteria.strip() === '') {
        url = this.view_all_template.evaluate({'starting_page': options.starting_page, 'resources_per_page': options.resources_per_page});
    } else {
        url = this.simple_search_template.evaluate({'starting_page': options.starting_page, 'resources_per_page': options.resources_per_page});
    }
    PersistenceEngineFactory.getInstance().send(url, {
        method: 'GET',
        parameters: params,
        onSuccess: this._onSearchSuccess.bind(context),
    });
};

CatalogueView.prototype.instanciate = function(resource) {
    //is mashup?
    if (resource.isMashup()) {
        LayoutManagerFactory.getInstance().showWindowMenu(
            "addMashup",
            function () {
                OpManagerFactory.getInstance().addMashupResource(this);
            }.bind(resource),
            function () {
                OpManagerFactory.getInstance().mergeMashupResource(this);
            }.bind(resource));

        return;
    }

    // Normal instantiation!
    ShowcaseFactory.getInstance().addGadget(resource.getVendor(), resource.getName(),
        resource.getVersion().text, resource.getUriTemplate());
};

CatalogueView.prototype.showDetails = function(resource) {
    this.viewsByName['details'].paint(resource);
    this.alternatives.showAlternative(this.viewsByName['details']);
};

CatalogueView.prototype.getBreadcrum = function() {
    return [
        {
            'label': 'marketplace'
        }
    ];
};

CatalogueView.prototype.getSubMenuItems = function() {
    return [
        {
        'label': gettext('publish'),
        'callback': alert.bind(null, 'hola')
        }
    ];
};