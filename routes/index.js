var express = require('express');
var router = express.Router();

var path = require('path')
  , folio = require('folio')
  , jade = require('jade');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Done.', layout: false });
});


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
        jade.compileClient(source, {
          client: true,
          compileDebug: false
        }) + ';';
    }
  }
});

router.get('/templates.js', folio.serve(templateJs))

module.exports = router;
