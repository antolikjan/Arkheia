"""
This tool adds simulation run to the mozaik repository, or a collection of mozaik simulation runs
that were a result of a parameter search.

usage:

if adding single run:

python add_mozaik_repository.py path_to_mozaik_simulation_run_output_directory

if adding parameter search:

python add_mozaik_repository.py path_to_mozaik_parameter_search_output_directory name_of_the_simulation
"""
import numpy

# from sphinx.util.docstrings import prepare_docstring
from pyNN.random import RandomDistribution
from mozaik.tools.distribution_parametrization import (
    MozaikExtendedParameterSet,
    load_parameters,
    PyNNDistribution,
)
from mozaik.storage.datastore import *
from parameters import ParameterSet
from mozaik.tools.mozaik_parametrized import MozaikParametrized
from mozaik.tools.misc import result_directory_name
import re
from sphinx.util import docstrings
import sys
import os.path
from parameters.random import ParameterDist
import datetime
import json
import pickle
import imageio
from operator import itemgetter
import mongodb_client

# import asyncio

# hack for fast addition of results for developmental purposes
FULL = False
WITH_STIMULI = False

sys.path.append("/home/antolikjan/projects/mozaik-contrib")

PARAMETERS_REGEX = re.compile(".*Parameters.*")


OTHER_PARAMETER_REGEX = re.compile(".*Other\ [pP]arameters\ *\n-{15}-+")

PARAMETER_REGEX = re.compile(
    "\s*(?P<name>[^:\s]+)\s*\:\s* (?P<tpe>[^\n]*)\n\s*(?P<doc>[^\n]*)"
)


def reindent(string):
    return "\n".join(l.strip() for l in string.strip().split("\n"))


def parse_docstring(docstring):
    """Parse the docstring into its components.
    :returns: a dictionary of form
              {
                  "short_description": ...,
                  "long_description": ...,
                  "params": [{"name": ..., "doc": ...}, ...],
                  "returns": ...
              }
    """

    short_description = long_description = returns = ""
    params = []

    if docstring:
        docstring = "\n".join(docstrings.prepare_docstring(docstring))

        lines = docstring.split("\n", 1)
        short_description = lines[0]

        if len(lines) > 1:
            reminder = lines[1].strip()
            # params_returns_desc = None
            match_parameters = PARAMETERS_REGEX.search(reminder)
            if match_parameters:
                long_desc_end = match_parameters.start()
                long_description = reminder[:long_desc_end].rstrip()
                reminder = reminder[long_desc_end:].strip()

            match = OTHER_PARAMETER_REGEX.search(reminder)

            if match:
                end = match.start()
                if not match_parameters:
                    long_description = reminder[:end].rstrip()
                reminder = reminder[end:].strip()

            if reminder:
                params = {}

                for name, tpe, doc in PARAMETER_REGEX.findall(reminder):
                    params[name] = (tpe, doc)

            if (not match_parameters) and (not match):
                long_description = reminder

    return {
        "short_description": short_description,
        "long_description": long_description,
        "params": params,
    }


def get_params_from_docstring(cls):
    params = {}
    for cls1 in cls.__mro__:
        params.update(parse_docstring(cls1.__doc__)["params"])
    return params


class ParametersEncoder(json.JSONEncoder):
    """
    For encoding parameters
    """

    def default(self, obj):
        if (
            isinstance(obj, ParameterDist)
            or isinstance(obj, PyNNDistribution)
            or isinstance(obj, RandomDistribution)
        ):

            return str(obj)

        return json.JSONEncoder.default(self, obj)


def createSimulationRunDocumentAndUploadImages(path, from_parameter_search):
    print(path)
    # lets get parameters
    param = load_parameters(os.path.join(path, "parameters"), {})
    stim_docs = []
    experimental_protocols_docs = []

    if FULL:
        print("Loading...")
        data_store = PickledDataStore(
            load=True,
            parameters=ParameterSet({"root_directory": path, "store_stimuli": False}),
            replace=False,
        )
        print("Loaded")
        unique_stimuli = [
            (s, MozaikParametrized.idd(s)) for s in set(data_store.get_stimuli())
        ]
        if WITH_STIMULI:
            for s, sidd in unique_stimuli:
                raws = data_store.get_sensory_stimulus([s])
                if raws == []:
                    raws = numpy.array([[[0, 0], [0, 0.1]], [[0, 0], [0, 0]]])
                else:
                    raws = raws[0]
                if param["input_space"] != None:
                    imageio.mimwrite(
                        "movie.gif",
                        raws,
                        duration=param["input_space"]["update_interval"] / 1000.0,
                    )
                else:
                    imageio.mimwrite("movie.gif", raws, duration=0.1)
                params = sidd.get_param_values()

                params = {k: (v, sidd.params()[k].doc) for k, v in params}

                stim_docs.append(
                    {
                        "code": sidd.name,
                        "params": params,
                        "short_description": parse_docstring(
                            getattr(
                                __import__(
                                    sidd.module_path, globals(), locals(), sidd.name
                                ),
                                sidd.name,
                            ).__doc__
                        )["short_description"],
                        "long_description": parse_docstring(
                            getattr(
                                __import__(
                                    sidd.module_path, globals(), locals(), sidd.name
                                ),
                                sidd.name,
                            ).__doc__
                        )["long_description"],
                        "gif": mongodb_client.gfs.put(open("movie.gif", "r")),
                    }
                )

        #### EXPERIMENTAL PROTOCOLS ########
        print(data_store.get_experiment_parametrization_list())
        for ep in data_store.get_experiment_parametrization_list():
            name = ep[0][8:-2].split(".")[-1]
            module_path = ".".join(ep[0][8:-2].split(".")[:-1])
            doc_par = get_params_from_docstring(
                getattr(__import__(module_path, globals(), locals(), name), name)
            )
            params = eval(ep[1])

            p = {
                k: (params[k], doc_par[k][0], doc_par[k][1])
                if k in doc_par
                else params[k]
                for k in params.keys()
            }

            experimental_protocols_docs.append(
                {
                    "code": module_path + "." + name,
                    "params": p,
                    "short_description": parse_docstring(
                        getattr(
                            __import__(module_path, globals(), locals(), name), name
                        ).__doc__
                    )["short_description"],
                    "long_description": parse_docstring(
                        getattr(
                            __import__(module_path, globals(), locals(), name), name
                        ).__doc__
                    )["long_description"],
                }
            )

    ##### RECORDERS ###################
    recorders_docs = []
    for sh in param["sheets"].keys():
        for rec in param["sheets"][sh]["params"]["recorders"].keys():
            recorder = param["sheets"][sh]["params"]["recorders"][rec]
            name = recorder["component"].split(".")[-1]
            module_path = ".".join(recorder["component"].split(".")[:-1])
            doc_par = get_params_from_docstring(
                getattr(__import__(module_path, globals(), locals(), name), name)
            )
            p = {
                k: (recorder["params"][k], doc_par[k][0], doc_par[k][1])
                for k in recorder["params"].keys()
            }

            recorders_docs.append(
                {
                    "code": module_path + "." + name,
                    "source": sh,
                    "params": p,
                    "variables": recorder["variables"],
                    "short_description": parse_docstring(
                        getattr(
                            __import__(module_path, globals(), locals(), name), name
                        ).__doc__
                    )["short_description"],
                    "long_description": parse_docstring(
                        getattr(
                            __import__(module_path, globals(), locals(), name), name
                        ).__doc__
                    )["long_description"],
                }
            )

    # load basic info

    if os.path.exists(os.path.join(path, "info")):
        f = open(os.path.join(path, "info"), "r")
        info = eval(f.read())
    else:
        info = {}
        info["creation_data"] = "????"
        info["simulation_run_name"] = "???"
        info["model_name"] = "??"

    # let load up results
    results = []

    if os.path.exists(os.path.join(path, "results")):
        f = open(os.path.join(path, "results"), "r")
        lines = list(set([line for line in f]))
        lines = [eval(line) for line in lines]
    else:
        lines = []

    # Add all images not previously added (not in results file)
    for f in os.listdir(path):
        if os.path.splitext(f)[1].lower() == ".png" and f not in [
            l["file_name"] for l in lines
        ]:
            lines.append({"parameters": {}, "file_name": f, "class_name": ""})

    lines = sorted(lines, key=itemgetter("file_name"))

    for line in lines:
        r = line
        if "Movie" in r["file_name"]:
            continue
        if not re.match(".*\..*$", r["file_name"]):
            r["file_name"] += ".png"
        r["code"] = r["class_name"][8:-2]

        if True:
            if r["code"] != "":
                try:
                    name = r["code"].split(".")[-1]
                    module_path = ".".join(r["code"].split(".")[:-1])
                    doc_par = get_params_from_docstring(
                        getattr(
                            __import__(module_path, globals(), locals(), name), name
                        )
                    )
                    p = {
                        k: (r["parameters"][k], doc_par[k][0], doc_par[k][1])
                        if k in doc_par
                        else (r["parameters"][k], "", "")
                        for k in r["parameters"].keys()
                    }
                except ImportError:
                    p = []
            else:
                p = []
            r["parameters"] = p
        r["name"] = r["file_name"]
        r["figure"] = mongodb_client.gfs.put(
            open(os.path.join(path, r["file_name"]), "rb")
        )
        results.append(r)

    document = {
        "from_parameter_search": from_parameter_search,
        "submission_date": datetime.datetime.now().strftime("%d/%m/%Y-%H:%M:%S"),
        "run_date": info["creation_data"],
        "simulation_run_name": info["simulation_run_name"],
        "model_name": info["model_name"],
        "model_description": info["model_docstring"]
        if "model_docstring" in info
        else "",
        "results": results,
        "stimuli": stim_docs,
        "recorders": recorders_docs,
        "experimental_protocols": experimental_protocols_docs,
        "parameters": json.dumps(param, cls=ParametersEncoder),  #!!!!!!!!!!!!!!!!
    }
    return document


async def insertMozaikRepository(file_path, simrun_name=None):
    # assert len(sys.argv)>1 , "Not enough arguments, missing mozaik repository directory. Usage:\npython add_mozaik_repository.py path_to_mozaik_simulation_run_output_directory\n\nor\n\npython add_mozaik_repository.py path_to_mozaik_parameter_search_output_directory name_of_the_simulation"

    if (
        os.path.exists(os.path.join(file_path, "parameter_combinations"))
        and simrun_name is not None
    ):  # file_path

        # assert len(sys.argv) > 2, """Missing simulation run argument. Usage: \n python add_mozaik_repository.py path_to_mozaik_parameter_search_output_directory name_of_the_simulation """

        simulation_name = simrun_name  # sys.argv[1]

        master_results_dir = file_path  # sys.argv[1]

        file = open(master_results_dir + "/parameter_combinations", "rb")
        combinations = pickle.load(file)
        file.close()

        # first check whether all parameter combinations contain the same parameter names
        assert (
            len(set([tuple(set(comb.keys())) for comb in combinations])) == 1
        ), "The parameter search didn't occur over a fixed set of parameters"

        simulation_runs = []
        working_combinations = []
        for _, combination in enumerate(combinations):
            combination = dict(
                [
                    (
                        x,
                        y.decode("string_escape")
                        .decode("string_escape")
                        .replace("'", "")
                        if type(y) == str
                        else y,
                    )
                    for x, y in combination.items()
                ]
            )

            rdn = result_directory_name("ParameterSearch", simulation_name, combination)
            print(rdn)
            try:
                simulation_runs.append(
                    createSimulationRunDocumentAndUploadImages(
                        os.path.join(master_results_dir, rdn),
                        from_parameter_search=False,
                    )
                )
                working_combinations.append(combination)
            except Exception as error:
                print("WARRNING, error in: >> " + rdn + ".\n Error:" + str(error))

        changing_params = set()
        for param_to_check in working_combinations[0].keys():
            for working_combination in working_combinations[0:]:
                for param in working_combination.keys():
                    if (
                        working_combination[param]
                        != working_combinations[0][param_to_check]
                    ):
                        changing_params.add(param_to_check.split(".")[-1])

        simulation_runs_relation = mongodb_client.mongo_client.submissions.insert_many(
            simulation_runs
        )
        document = {
            "submission_date": datetime.datetime.now().strftime("%d/%m/%Y-%H:%M:%S"),
            "changing_params": str(changing_params).replace(", ", '</br>').replace("{", '').replace("}", '').replace("'", ''),
            'name': simulation_name,
            "run_date": simulation_runs[0]["run_date"],
            "model_name": simulation_runs[0]["model_name"],
            "simulation_runs": simulation_runs_relation.inserted_ids,
            "parameter_combinations": json.dumps(working_combinations),
        }

        mongodb_client.mongo_client.parameterSearchRuns.insert_one(document)
        return "Successfully inserted {} into the parameter search runs db".format(
            simrun_name
        )

    else:
        mongodb_client.mongo_client.submissions.insert_one(
            createSimulationRunDocumentAndUploadImages(
                file_path, from_parameter_search=True
            )
        )
        return "Successfully inserted {} into the subbmisions db".format(simrun_name)


async def mergeAndInsertMozaikRepositories(file_path1, file_path2):
    d1 = createSimulationRunDocumentAndUploadImages(
        file_path1, from_parameter_search=True
    )
    d2 = createSimulationRunDocumentAndUploadImages(
        file_path2, from_parameter_search=True
    )

    assert d1["simulation_run_name"] == d2["simulation_run_name"]
    assert d1["model_name"] == d2["model_name"]

    d1["results"] = d1["results"] + d2["results"]
    d1["stimuli"] = d1["stimuli"] + d2["stimuli"]
    d1["recorders"] = d1["recorders"] + d2["recorders"]
    d1["experimental_protocols"] = (
        d1["experimental_protocols"] + d2["experimental_protocols"]
    )

    mongodb_client.mongo_client.submissions.insert_one(d1)

    return "Successfully inserted {} into the subbmisions db".format(
        d1["simulation_run_name"]
    )
