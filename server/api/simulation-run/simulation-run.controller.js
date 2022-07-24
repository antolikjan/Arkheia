/**
 */
"use strict";
import { ParameterSearch, SimulationRun, Configuration } from "./simulation-run.model";
import mongoose from "mongoose";
const {spawn} = require('child_process');

var JSZip = require("jszip");
var Grid = require("gridfs-stream");
var gfs = Grid(mongoose.connection.db, mongoose.mongo);
var axios = require("axios");

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function packageDownload(res) {
  return function (entity) {
    var zip = new JSZip();
    zip.file("ArkheiaDocumentBody.json", String(entity));

    for (let r of entity.results) {
      zip.file(r.file_name, gfs.createReadStream({ _id: r.figure.id }));
    }

    res.attachment("ArkheiaDocument.zip");
    return zip.generateNodeStream({ type: "nodebuffer", streamFiles: true }).pipe(res);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of SimulationRuns
export function index(req, res) {
  var query = new Object();
  if ("query" in req.params) {
    var a = req.params.query.split("~")[0];
    var b = req.params.query.split("~")[1];
    query[a] = b;
  }
  return SimulationRun.find(query)
    .select("-results")
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single SimulationRun including with populated results from the DB
export function download(req, res) {
  return SimulationRun.findById(req.params.id)
    .exec()
    .then(packageDownload(res));
}

export function result(req, res) {
  return SimulationRun.findById(req.params.id)
    .populate("results.figure")
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getImage(req, res) {
  gfs.exist({ _id: req.params.id }, function (err, found) {
    if (err) return handleError(err);
    found ? gfs.createReadStream({ _id: req.params.id }).pipe(res) : console.log("File does not exist");
  });
}

// Gets the configuration
export function getConfiguration(req, res) {
  return Configuration.find().exec().then(respondWithResult(res)).catch(handleError(res));
}

// Gets a list of ParameterSearches
export function paramSearchList(req, res) {
  return ParameterSearch.find()
    .select("-simulation_runs.results")
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a full ParameterSearch
export function paramSearch(req, res) {
  return ParameterSearch.findById(req.params.id)
    .select("-simulation_runs.results.parameters")
    .populate("simulation_runs.results.figure")
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export async function deleteSimRun(req, res) {
  if (req.params.id.includes("$")) {
    var params = req.params.id.split("$");
    var id = params[0];
    var index = params[1];

    const paramSearch = await ParameterSearch.findById(id)
      .select("-simulation_runs.results.parameters")
      .populate("simulation_runs.results.figure")
      .exec();

    var newSimulationRuns = paramSearch.simulation_runs
    newSimulationRuns.splice(index, 1);

    // update ParameterSearch db document to remove desired simulation run
    await ParameterSearch.findOneAndUpdate(
      { _id: id },
      { "simulation_runs": newSimulationRuns }, // removes the run from simulation_runs array
      function (err, result) {
        if (err) {
          res.send(err);
        }
        else {
          res.send(result);
        }
      })
  }
  else {
    var query = new Object();
    const simRuns = await SimulationRun.find(query)
      .select("-results")
      .exec()

    await SimulationRun.deleteOne({ _id: simRuns[req.params.id]._id })
      .exec()
      .then(handleEntityNotFound(res))
      .then(respondWithResult(res))
      .catch(handleError(res));
  }
};


export async function deleteParamSearch(req, res) {
  await ParameterSearch.deleteOne({ _id: req.params.id })
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}


export async function insertSimrunsToDb(req, res) {

   
  if (!req.params["file_name"]) {
    res.send("No file name provided");
    return
  }

  if (!req.params["simrun_name"]) {
    res.send("No simulation run name provided");
    return
  }

  axios({
    method: 'post',
    url: "http://localhost:8080/insertRepository",
    data: {
      "file_name": req.params["file_name"],
      "simrun_name": req.params["simrun_name"]
    }
  })
  .then(function (response) {
    res.status(200).send(response.data);
  })
  .catch(function (error) {
    console.log(error);
    res.status(400).send(error);
  });
}


