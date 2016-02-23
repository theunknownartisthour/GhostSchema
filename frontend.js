var frontend    = require('../controllers/frontend'),
    channels    = require('../controllers/frontend/channels'),
    config      = require('../config'),
    express     = require('express'),
    utils       = require('../utils'),

    frontendRoutes;

var Schema = require('schema-client');    
var client = new Schema.Client('client_id', 'client_key');
var schemaRoutes = ['s_accounts','s_blogs','s_carts','s_categories','s_contacts','s_coupons','s_credits','s_invoices','s_notifications','s_orders','s_pages','s_payments','s_products','s_settings','s_shipments','s_subscriptions','s_webhooks'];
var schemaUrls = JSON.stringify(schemaRoutes);
console.log(schemaUrls);
function schemaIT(req,res,next){
	var urls = schemaRoutes;
    console.log('Urls: '+urls);
    console.log('Path: '+req.path);
	for(var i = 0; i < schemaRoutes.length; i++){
		/*remove prefix*/
		var model = schemaRoutes[i].replace("s_","");
        console.log("Model: "+model);
		if(req.path.indexOf(model)>=0){
			var target = '/'+model+'/'+req.params.id+'/';
			if(req.params.field){
				target += req.params.field;
			} else if (req.params.collection){
				target += req.params.collection;
			} else if (req.params.arrayfield){
				target += req.params.arrayfield;
			}
			var query = req.query || {};
			console.log("Query: "+query);
            console.log("Method: "+req.method);
			if(req.method == 'GET'){
				if(req.params.id){
                    var record = null;
					var clientcall = client.get(target, query, function(records){
                        if (result.errors) {
                            res.Rerror = req.method+":"+target+" failed";
                            res.Rerrorcode = 602;
                            /*
                            frontend.results(req,res);
                            */
                            next();
                        }
						record = records;
					});
                    clientcall.on('error',function(error){
                        res.Rerror = req.method+":"+target+" failed";
                        res.Rerrorcode = 602;
                    });
                    clientcall.on('error.server',function(error){
                        res.Rerror = req.method+":"+target+" failed";
                        res.Rerrorcode = 602;
                    });
                    res.renderpath = model;
                    res.records = record;
                    console.log('Res.Records: '+res.records);
                    console.log('RenderPath: '+res.renderpath);
                    return frontend.results(req,res);
				} else {
                    var record = null;
					client.get('/'+model, query, function(records){
                        if (result.errors) {
                            res.Rerror = req.method+":"+target+" failed";
                            res.Rerrorcode = 602;
                            /*
                            frontend.results(req,res);
                            */
                            next();
                        }
						record = records;
					});
                    res.renderpath = model;
                    res.records = record;
                    console.log('Res.Records: '+res.records);
                    console.log('RenderPath: '+res.renderpath);
                    console.log('RenderPath: '+res.renderpath);
                    return frontend.results(req,res);
				}
			}
			else if(req.method == 'PUT'){
				if(req.params.id){
					client.put(target, query, function(records){
                        if (result.errors) {
                            res.Rerror = req.method+":"+target+" failed";
                            res.Rerrorcode = 602;
                            /*
                            frontend.results(req,res);
                            */
                            next();
                        }
						res.records = records;
						res.renderpath = model;
						return frontend.results(req,res);
					});
				} else {
					client.put('/'+model, query, function(records){
                        if (result.errors) {
                            res.Rerror = req.method+":"+target+" failed";
                            res.Rerrorcode = 602;
                            /*
                            frontend.results(req,res);
                            */
                            next();
                        }
						res.records = records;
						res.renderpath = model;
						return frontend.results(req,res);
					});
				}
			}
			else if(req.method == 'POST'){
				if(req.params.id){
					client.post(target, query, function(records){
                        if (result.errors) {
                            res.Rerror = req.method+":"+target+" failed";
                            res.Rerrorcode = 602;
                            frontend.results(req,res);
                        }
						res.records = records;
						res.renderpath = model;
						return frontend.results(req,res);
					});
				} else {
					client.post('/'+model, query, function(records){
                        if (result.errors) {
                            res.Rerror = req.method+":"+target+" failed";
                            res.Rerrorcode = 602;
                            /*
                            frontend.results(req,res);
                            */
                            next();
                        }
						res.records = records;
						res.renderpath = model;
						return frontend.results(req,res);
					});
				}
			}
			else if(req.method == 'DELETE'){
				if(req.params.id){
					client.delete(target, query, function(records){
						res.records = records;
						res.renderpath = model;
						return frontend.results(req,res);
					});
				} else {
					client.delete('/'+model, query, function(records){

						res.records = records;
						res.renderpath = model;
						return frontend.results(req,res);
					});
				}
			} else {
                
                res.Rerror = "No method picked";
                res.Rerrorcode = 601;
                return frontend.results(req,res);
                
                //next();
            }
		}
	}
    next();
}
    
frontendRoutes = function frontendRoutes(middleware) {
    var router = express.Router(),
        subdir = config.paths.subdir,
        routeKeywords = config.routeKeywords,
        privateRouter = express.Router();

    // ### Admin routes
    router.get(/^\/(logout|signout)\/$/, function redirectToSignout(req, res) {
        utils.redirect301(res, subdir + '/ghost/signout/');
    });
    router.get(/^\/signup\/$/, function redirectToSignup(req, res) {
        utils.redirect301(res, subdir + '/ghost/signup/');
    });

    // redirect to /ghost and let that do the authentication to prevent redirects to /ghost//admin etc.
    router.get(/^\/((ghost-admin|admin|wp-admin|dashboard|signin|login)\/?)$/, function redirectToAdmin(req, res) {
        utils.redirect301(res, subdir + '/ghost/');
    });
    
    router.all('/hello',function(req,res,next){
        res.send("Domo");
    });
    
    router.all('/products',schemaIT);
    
    router.all('/'+schemaRoutes+'/:id/:arrayfield',schemaIT);
    
    router.all('/'+schemaRoutes+'/:id/:collection',schemaIT);
    
    router.all('/'+schemaRoutes+'/:id/:field',schemaIT);
    
    router.all('/'+schemaRoutes+'/:id',schemaIT);
    
    router.all(schemaRoutes,schemaIT);
	
    // password-protected frontend route
    privateRouter.route('/')
        .get(
            middleware.privateBlogging.isPrivateSessionAuth,
            frontend.private
        )
        .post(
            middleware.privateBlogging.isPrivateSessionAuth,
            middleware.spamPrevention.protected,
            middleware.privateBlogging.authenticateProtection,
            frontend.private
        );

    // Post Live Preview
    router.get('/' + routeKeywords.preview + '/:uuid', frontend.preview);

    // Private
    router.use('/' + routeKeywords.private + '/', privateRouter);

    // Channels
    router.use(channels.router());

    // Default
    router.get('*', frontend.single);

    return router;
};

module.exports = frontendRoutes;
