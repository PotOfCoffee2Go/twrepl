// Tiddlers to be loaded into embedded TiddlyWiki
const twTiddlers = require('./tiddlers.json');
const twMacros = require('./macros.json');
const twModules = require('./modules.json');
const twPlugins = require('./plugins.json');

const twPreloadTiddlers = twTiddlers.concat(twMacros, twModules, twPlugins);

// TiddlyWiki wikis created/used by Node-Red
var $tw = undefined;
var twikis = undefined; // General purpose collection of TW5 Wikis

// Boot TiddlyWiki module
const bootTiddlyWiki = () => {
	$tw = require('tiddlywiki').TiddlyWiki();
	$tw.preloadTiddlers = twPreloadTiddlers;
	$tw.boot.argv = ['browser']; // TW output path
	$tw.boot.boot(() => {});

	// Reference $tw main wiki
	twikis = { '$tw.wiki': $tw.wiki };

	return $tw;
}

exports.get_$tw = () => $tw ? $tw : bootTiddlyWiki();

exports.get_twikis = () => $tw ? twikis : bootTiddlyWiki(), twikis;
