var frontend    = require('../controllers/frontend'),
    channels    = require('../controllers/frontend/channels'),
    config      = require('../config'),
    express     = require('express'),
    utils       = require('../utils'),

    frontendRoutes;

    
/*Hijacking config for our own purposes*/
var config2 = require('../../../config');
console.log(config2);
var Schema = require('schema-client');
/*Setup Schema Client*/
var schemaPrefix = config2.schema.slug || 'shop';
var schemaRoutes = config2.schema.routes || [
    'accounts',
    'blogs',
    'carts',
    'categories',
    'contacts',
    'coupons',
    'credits',
    'invoices',
    'notifications',
    'orders',
    'pages',
    'payments',
    'products',
    'settings',
    'shipments',
    'subscriptions',
    'webhooks'
];
var schemaRelateable = config2.schema.related || ['variants','stock','reviews','options'];
if(config2.schema.slug != '' && config2.schema.client_id != '' && config2.schema.client_key != '' && config2.schema.routes != ''){
    var client = new Schema.Client(config2.schema.client_id,config.schema.client_key);
}
var schemaUrls = '('+schemaRoutes.join('|')+')';/*JSON.stringify(schemaRoutes);*/

console.log("Schema Setup");
console.log(schemaPrefix);
console.log(schemaRoutes);
console.log(schemaUrls);

function schemaLogin(req,res,next){
    client.get('/accounts/:login', req.query, function(err, result) {
        if (result) {
            console.log(result.email); //success
            console.log(result.id);
            req.session.schemaUser = result.id;
        }  else {
            console.log(err);
        }
        return res.redirect('/');
    });
}

function schemaAccount(req,res,next){
    res.datatemplate[model] = data;
    res.renderpath = "results";
    return frontend.results(req,res);
}

function schemaHandler(err,data,res,req,target,model){
    if (err) {
        res.Rerror = req.method+":"+target+" failed";
        res.Rerrorcode = 602;
        /*Fail and spit out error page w/ error code and message Rerror*/
        return frontend.results(req,res);
    }
    /*Access our returned data from inside hbs template as "records"*/
    res.datatemplate = {
        /*records: data*/
    };
    /*or access the same data from the api path where the data was found*/
    /*Eg /products will set a products object*/
    res.datatemplate[model] = data;
    /*res.renderpath = model;*/
    res.renderpath = "results";
    /*Template the file <model>.hbs from the content folder with all the key value pairs from datatemplate*/
    return frontend.results(req,res);
}

function schemaIT(req,res,next){
	var urls = schemaRoutes;
    /*console.log('Urls: '+urls);*/
    console.log('Path: '+req.path);
    console.log('Modeled: '+req.params.model);
    var testmodel = req.model;
	for(var i = 0; i < schemaRoutes.length; i++){
		/*remove prefix*/
		var model = req.params.model;/*schemaRoutes[i].replace(schemaPrefix,"");*/
        /*console.log("Model: "+model);*/
        /*req.path.indexOf(model)>=0*/
		if(req.path.indexOf(model)>=0){
            /*
			var target = '/'+model+'/'
            */
            /*Avoid stripping important parts of the base path like :variants*/
            /*TODO make sure additional parts of the path like :variants are pattern matched
            and assigned as a param...so we can safely reconstruct the url later*/
            var target = '/'+req.params.model.replace(schemaPrefix,"");
            if(req.params.model2){
                target += ':'+req.params.model2;
            }
            target += '/';
            if(req.params.id){
                target += req.params.id + '/';
            }
			if(req.params.field){
				target += req.params.field + '/';
			} else if (req.params.collection){
				target += req.params.collection + '/';
			} else if (req.params.arrayfield){
				target += req.params.arrayfield + '/';
			}
			var query = req.query || {};
            /*Grab details from session to limit results*/
            if(req.session){
                if(req.session.schemaUser){
                    console.log("Account: "+req.session.schemaUser);
                }
            }
			console.log("Query: "+JSON.stringify(query));
            console.log("Method: "+req.method);
            console.log("Target: "+target);
			if(req.method == 'GET'){
                if(req.params.method){
                    /*Allow /get/ /post/ /put/ /delete/ before a get query changes the method...testing only*/
                    if(req.params.method == 'get'){
                        return client.get(target, query, function(err,records){
                            console.log("Records: "+records);
                            schemaHandler(err,records,res,req,target,model);
                        });
                    } else if(req.params.method == 'post') {
                        return client.post(target, query, function(err,records){
                            console.log("Records: "+records);
                            res.redirect('/'+req.params.model+'/');
                        });
                    } else if(req.params.method == 'put') {
                        return client.put(target, query, function(err,records){
                            console.log("Records: "+records);
                            res.redirect('/'+req.params.model+'/');
                        });
                    } else if(req.params.method == 'delete') {
                        return client.delete(target, query, function(err,records){
                            console.log("Records: "+records);
                            res.redirect('/'+req.params.model+'/');
                        });
                    } else {
                        return client.get(target, query, function(err,records){
                            console.log("Records: "+records);
                            schemaHandler(err,records,res,req,target,model);
                        });
                    }
                } else {
                    /*No test method? Fall-back to default get request*/
                    return client.get(target, query, function(err,records){
                        console.log("Records: "+records);
                        schemaHandler(err,records,res,req,target,model);
                    });
                }
			}
            /*Mirror the same method type into schema's api*/
			else if(req.method == 'PUT'){
                return client.put(target, query, function(err,records){
                    console.log("Records: "+records);
                    res.redirect('/'+req.params.model+'/');
                });
			}
			else if(req.method == 'POST'){
                return client.post(target, query, function(err,records){
                    console.log("Records: "+records);
                    res.redirect('/'+req.params.model+'/');
                });
			}
			else if(req.method == 'DELETE'){
                return client.delete(target, query, function(err,records){
                    console.log("Records: "+records);
                    res.redirect('/'+req.params.model+'/');
                });
			} else {
                
                res.Rerror = "No method picked";
                res.Rerrorcode = 601;
                return frontend.results(req,res);
                
                //next();
            }
            break;
		}
	}
    next();
}

/*
process.on('uncaughtException', function (err) {
    console.log('UNCAUGHT EXCEPTION - keeping process alive:', err.message); // err.message is "foobar"
    console.log(err);
});
*/
    
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
    
    /*router.all('/products',schemaIT);*/
    router.all('/*',function(res,req,next){
        if(req.session){
            console.log("User: "+req.session.schemaUser);
        } else {
            console.log("No Sessions");
        }
        next();
    });
    
    router.all('/schema/login/',schemaLogin);
    
    router.all('/'+schemaPrefix+'/:model'+schemaUrls+'/related/:model2/:id/:arrayfield',schemaIT);
    
    router.all('/'+schemaPrefix+'/:model'+schemaUrls+'/related/:model2/:id/:collection',schemaIT);
    
    router.all('/'+schemaPrefix+'/:model'+schemaUrls+'/related/:model2/:id/:field',schemaIT);
    
    router.all('/'+schemaPrefix+'/:model'+schemaUrls+'/related/:model2/:id',schemaIT);
    
    router.all('/'+schemaPrefix+'/:model'+schemaUrls+'/related/:model2',schemaIT);
    
    /*That about covers it*/
    
    router.all('/'+schemaPrefix+'/:model'+schemaUrls+'/:id/:arrayfield',schemaIT);
    
    router.all('/'+schemaPrefix+'/:model'+schemaUrls+'/:id/:collection',schemaIT);
    
    router.all('/'+schemaPrefix+'/:model'+schemaUrls+'/:id/:field',schemaIT);
    
    router.all('/'+schemaPrefix+'/:model'+schemaUrls+'/:id',schemaIT);
    
    router.all('/'+schemaPrefix+'/:model'+schemaUrls,schemaIT);
    
    router.all('/'+schemaPrefix+'/:method/:model'+schemaUrls+'/:id/:arrayfield',schemaIT);
    
    router.all('/'+schemaPrefix+'/:method/:model'+schemaUrls+'/:id/:collection',schemaIT);
    
    router.all('/'+schemaPrefix+'/:method/:model'+schemaUrls+'/:id/:field',schemaIT);
    
    router.all('/'+schemaPrefix+'/:method/:model'+schemaUrls+'/:id',schemaIT);
    
    router.all('/'+schemaPrefix+'/:method/:model'+schemaUrls,schemaIT);
	
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
