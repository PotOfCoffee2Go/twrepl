/*

This script loads the tiddlywiki module for use by the node.js REPL
On windows may have to use '\' backslash in places - i've forgotten

Usage:
* From a command window make a new directory and
* install TddlyWiki

mkdir gofish && cd gofish
npm install tiddlywiki

* copy this script into an editor and
* save as twrepl.js in 'gofish' directory
+ have node run the script

node ./twrepl.js

*/
const fs = require('fs');

var runtime;
function tty(text) { runtime._ttyWrite(text); }

function motd() {
  process.stdout.write( [
    `TiddlyWiki REPL - Release: ${$tw.version}`,
    `TiddlyWiki code can be accessed via variable '$tw'`,
    '\n',
    `'cmdr.syncServer.listen()' starts the TiddlyWiki for this REPL`,
    `  so will do that for you automatically.`,
    `  Can go to 'http://localhost:8080' for further '$tw REPL' usage info`,
    ``,
    '\n',
    ].join('\n'));
}

function startup() {
  runtime = require('node:repl').start({
    prompt: '$tw repl> ', useColors: true,
    ignoreUndefined: true, /*completer: completer*/
  });
}

// Create twiki if not found
function checkname(name) {
  if (!twikis[name]) {
    twikis[name] = new $tw.Wiki;
    }
  return name;
}

// TiddlyWiki store helpers
const twikis = {};
const db = {
  doc: (name) => {
    twikis[checkname(name)] = new $tw.Wiki;
    return undefined;
    },
  wiki: (name) => twikis[checkname(name)],
  set: (name, tiddlersFields = []) => {
    tiddlersFields = !Array.isArray(tiddlersFields) ? [tiddlersFields] : tiddlersFields;
    twikis[checkname(name)].addTiddlers(tiddlersFields);
    return undefined;
  },
  get: (name, filter = '[all[]]') => JSON.parse(twikis[checkname(name)].getTiddlersAsJson(filter)),
  delete: (name, filter = '[all[]]') => {
      const tiddlers = twikis[checkname(name)].filterTiddlers(filter);
      $tw.utils.each(tiddlers,function(title) {
        twikis[checkname(name)].deleteTiddler(title);
      });
    return undefined;
  },
  import: (name, fname = '') => {
    fname = fname || `./${name}`;
    fname  = /\.json$/.test(fname) ? './db/' + fname : './db/' + fname + '.json';
    twikis[checkname(name)].addTiddlers(require(fname));
    return undefined;
  },
  export: (name, fname = '', filter = '[all[]]') => {
    fname = fname || `./${name}`;
    fname  = /\.json$/.test(fname) ? './db/' + fname : './db/' + fname + '.json';
    fs.writeFileSync(fname, twikis[checkname(name)].getTiddlersAsJson(filter));
    return undefined;
  },
  end: (name) => {
    delete twikis[checkname(name)];
    return null;
  },
  kit: () => Object.keys(twikis),
}


// Get TiddlyWiki, set output path, and boot it up
var $tw = require('./$tw/boot').get_$tw();
/*
var $tw = require('tiddlywiki').TiddlyWiki();
$tw.boot.argv = ['twout']; // TW output path
$tw.boot.boot(() => {});
*/

db.console = new $tw.utils.Logger("db",{ colour: "cyan", enable: true});

function resetContext() {
  runtime.context.$tw = $tw;
  runtime.context.db = db;
  runtime.context.cmdr = cmdr;
};

const cmdr = {
  app: new $tw.Commander(
    [],
    (err) => {
      if(err) {
        return $tw.utils.error("Error: " + err);
      }
      () => {}; // Callback does nuttin'
    },
    $tw.wiki,
    {output: process.stdout, error: process.stderr}
  ),

  // TiddlyWiki on node.js sync server
  syncServer: {
    listen: () => {
      new $tw.Commander(
        ['--listen'],
        (err) => {
          if(err) {
            return $tw.utils.error("Sync Server Error: " + err);
          }
          () => {}; // Callback
        },
        $tw.wiki,
        {output: () => {}, error: process.stderr}
      ).execute(); console.log('');
      setTimeout(() => tty('\n'), 500);
    }
  }
};


// Show Message of the day
motd(runtime);

// Startup REPL
//  $tw referncing tiddlywiki
//  db referncing helper functions
//  cmdr referencing the $tw.Commanders
startup();

runtime.on('reset', () => resetContext());
resetContext();

tty('cmdr.syncServer.listen()\n');
