/*Requires from frontend.js*/
var moment      = require('moment'),
    rss         = require('../data/xml/rss'),
    _           = require('lodash'),
    Promise     = require('bluebird'),
    api         = require('../api'),
    config      = require('../config'),
    filters     = require('../filters'),
    template    = require('../helpers/template'),
    errors      = require('../errors'),
    routeMatch  = require('path-match')(),
    path        = require('path'),

    frontendControllers,
    staticPostPermalink;

// Cache static post permalink regex
staticPostPermalink = routeMatch('/:slug/:edit?');

function genericTemplate{

	results: function (req, res) {
        var defaultPage = path.resolve(config.paths.adminViews, 'results.hbs');
        return getActiveThemePaths().then(function (paths) {
            var data = res.datatemplate;
            /*Show an error page when res.error has been set with res.errorcode response*/
            if (res.error) {
                data.error = res.error;
				data.errorcode = res.errorcode;
				console.log(data.error);
				return errors.renderErrorPage(data.errorcode,data.error,req,res,null);
            }

            setResponseContext(req, res);
			
			if(res.renderpath){
				if (paths.hasOwnProperty(res.renderpath+'.hbs')) {
					return res.render(res.renderpath,data);
				}
			}
			
            if (paths.hasOwnProperty('results.hbs')) {
                return res.render('results', data);
            } else {
                return res.render(defaultPage, data);
            }
        });
    }
    
}

module.exports = genericTemplate;