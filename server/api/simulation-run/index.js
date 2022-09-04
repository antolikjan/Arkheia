"use strict";

var express = require("express");
var controller = require("./simulation-run.controller");

var router = express.Router();

router.get("/", controller.index);
router.get("/result/:id", controller.result);
router.get("/download/:id", controller.download);
router.get("/images/:id", controller.getImage);

router.post("/simruns", controller.getSimRuns);
router.post("/simrunsres", controller.getSimRunsWithResults);

router.get("/configuration", controller.getConfiguration);

router.get("/param_search_list", controller.paramSearchList);
router.get("/param_search/:id", controller.paramSearch);

router.get("/delete_simrun/:id", controller.deleteSimRun);
router.get("/delete_parameter_search/:id", controller.deleteParamSearch);
router.get("/:query", controller.index);

router.post("/insert_repository", controller.insertSimrunsToDb);
// router.get('/insert_repository/:file_name/:simrun_name', controller.insertSimrunsToDb)
router.post("/merge_and_insert_repository", controller.mergeAndInsertSimrunsToDb);

module.exports = router;
