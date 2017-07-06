/**
 */

'use strict';
import { ParameterSearch, SimulationRun } from './simulation-run.model';
import mongoose from 'mongoose';

var Grid = require('gridfs-stream');
var gfs = Grid(mongoose.connection.db, mongoose.mongo);

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of SimulationRuns
export function index(req, res) {
  return SimulationRun.find().select('-results')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single SimulationRun including with populated results from the DB
export function result(req, res) {
  return SimulationRun.findById(req.params.id)
    .populate('results.figure')
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getImage(req, res) {
  gfs.exist({_id: req.params.id}, function(err, found) {
    if(err) return handleError(err);
    found ? gfs.createReadStream({_id: req.params.id}).pipe(res) : console.log('File does not exist');
  });
}

// Gets a list of ParameterSearches
export function paramSearchList(req, res) {
  return ParameterSearch.find().select('-simulation_runs')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a full ParameterSearch
export function paramSearch(req, res) {
  return ParameterSearch.findById(req.params.id).select('-simulation_runs.results.parameters')
    .populate('simulation_runs.results.figure')
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}
