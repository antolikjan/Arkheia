'use strict';

var express = require('express');
var controller = require('./simulation-run.controller');

var router = express.Router();



router.get('/', controller.index);
router.get('/result/:id', controller.result);
router.get('/download/:id', controller.download);
router.get('/images/:id', controller.getImage);

router.get('/configuration', controller.getConfiguration);


router.get('/param_search_list', controller.paramSearchList);
router.get('/param_search/:id', controller.paramSearch);

router.get('/delete_run/:id', controller.deleteRun);

router.get('/:query', controller.index);


module.exports = router;
