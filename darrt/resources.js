/**
 * @namespace resources
 * @author Mike Amundsen (@mamund)
 * @created 2020-02-01
 * @description
 * darrt resources 
 */

/*******************************************
// initialization and setup for DARRT
********************************************/
var express, router, bodyParser, actions, representation, 
  transitions, utils, templates, forms, metadata;

init();

// shared metadata for this service
metadata = [
  {name: "title", value: "BigCo Activity Records" },
  {name: "author", value: "Mike Amundsen" },
  {name: "release", value: "1.0.0" },
  {name: "generated", value: "{date}" }, 
  {name: "url", value: "{fullhost}" }
];

router.use(timeLog);

/**
 * @memberof resources
 * @function timeLog
 * @param {object} req - Express Request object.
 * @param {object} res - Express Response object.
 * @param {function} next - Express pass-through callback.
 * @description
 * optional tracking middleware
 */
function timeLog (req, res, next) {
  console.log('Time: ', Date.now() + " : " + req.headers.host + req.url + " : " + req.method + " : " + JSON.stringify(req.body));
  next();
}

/************************************************************************/

// ***********************************************************
// public resources for the api service
// ***********************************************************
router.get('/', routerCallback(actions.home, 'home', 'home'));
router.post('/', routerCallback(actions.create, 'api', 'list'));
router.get('/list/', routerCallback(actions.list, 'api', 'list'));
router.get('/filter/', routerCallback(actions.filter, 'api', 'list'));
router.get('/:id', routerCallback(actions.read, 'api', 'item'));
router.put('/:id', routerCallback(actions.update, 'api', 'item'));
router.delete('/:id', routerCallback(actions.remove, 'api', 'list'));
router.patch('/status/:id', routerCallback(actions.status, 'api', 'item'));

/**
 * @function routerCallback
 * @memberof resources
 * @param {function} act - Action to perform.
 * @param {string} type - Request context.
 * @param {string} filter - Name of filter.
 */
function routerCallback (act, type, filter) {
	/**
	 * @param {object} req - Express Request object.
	 * @param {object} res - Express Response object.
	 */
	return function (req, res) {
		var args = {};
		args.request = req;
		args.response = res;
		args.action = act;
		args.type = type;
		args.config = {
			metadata: metadata,
			templates: templates,
			forms: forms,
			filter: filter
		};
		respond(args);
	};
}

/***********************************************************************/

/**
 * @function init
 * @memberof resources
 * @description
 * initialize module
 */
function init () {
  express = require('express');
  router = express.Router();
  bodyParser = require('body-parser');

  actions = require('./actions');
  representation = require('./representation');
  transitions = require('./transitions');
  utils = require('./lib/utils');

  // set up request body parsing & response templates
  router.use(bodyParser.json({ type: representation.getResponseTypes() }));
  router.use(bodyParser.urlencoded({ extended: representation.urlencoded }));

  // load response templates and input forms
  templates = representation.getTemplates();
  forms = transitions.forms;
}

/**
 * @function respond
 * @memberof resources
 * @param {object} args - Configuration object for response.
 * @description
 * local resour5ce handler function
 */
function respond (args) {
  var request = args.request || null;
  var response = args.response || null;
  var action = args.action || null;
  var object = args.type || "";
  var config = args.config || {};

  return utils.handler(request, response, action, object, config);	
}

// publish the capability routes
module.exports = router;

// EOF
