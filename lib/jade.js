/*
 * This file is part of the conga-jade module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// built-in modules
var fs = require('fs');
var path = require('path');

var Jade = function(){};

/**
 * Configure jade and register it within express
 * 
 * @param {Container} container
 * @param {Application} app
 * @param {Function} next
 * @returns {void}
 */
Jade.prototype.onConfigureViewEngine = function(container, app, next){

	var config = container.get('config').get('jade');

	// get jade!!!
	var jade = require('jade');

	// override jade's Parser.resolvePath to deal with namespaced template names
	// for 'extends' and 'include'
	// hopefully this never breaks in future versions!!!
	jade.Parser.prototype.resolvePath = function (templatePath, purpose) {

		// append the extention to the namespace path
		templatePath += '.jade';
		return container.get('namespace.resolver').resolveWithSubpath(templatePath, 'lib/resources/views');
	};
	
	// manually set jade's renderFile method in express's configuration
	app.engine('jade', jade.renderFile);
	
	// copy over jade options
	for (var i in config.options){
		app.locals[i] = config.options[i];
	}

	// set jade on the container so that other bundles can access it if they want
	container.set('jade', jade);

	// setting this here for now
	container.setParameter('app.view.engine', 'jade');

	// add error templates
	container.getParameter('conga.templates')['exception'] = {
		'error404': { namespace : 'conga-jade:exception/error404' },
		'error500': { namespace : 'conga-jade:exception/error500' }
	};

	next();
};

module.exports = Jade;