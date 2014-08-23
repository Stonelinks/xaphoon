
var path = require('path')
  , folio = require('folio')
  , jade = require('jade');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Done.', layout: false });
};


/**
 * Template Javascript Package
 *
 * We are going to use pre-compiled
 * jade on the client-side.
 */

var templateJs = new folio.Glossary([
  require.resolve('jade/runtime.js'),
  path.join(__dirname, '..', 'views/templates/js/header.js'),
  path.join(__dirname, '..', 'views/templates/form.jade'),
  path.join(__dirname, '..', 'views/templates/item.jade')
], {
  compilers: {
    jade: function (name, source) {
      return 'template[\'' + name + '\'] = ' +
        jade.compile(source, {
          client: true,
          compileDebug: false
        }) + ';';
    }
  }
});

// serve using express
exports.templatejs = folio.serve(templateJs);

