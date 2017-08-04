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
import pypandoc
from pymongo import MongoClient
import gridfs
from sphinx.util.docstrings import prepare_docstring
from mozaik.tools.distribution_parametrization import MozaikExtendedParameterSet, load_parameters,PyNNDistribution
from mozaik.storage.datastore import *
from parameters import ParameterSet
from mozaik.tools.mozaik_parametrized import MozaikParametrized
from mozaik.tools.misc import result_directory_name
from pyNN.random import RandomDistribution
import re
from sphinx.util import docstrings
import sys
import os.path
from parameters.random import ParameterDist
import datetime
import json
import pickle
import imageio

PARAMETERS_REGEX = re.compile(".*Parameters\s*\n-{9}-*")

OTHER_PARAMETER_REGEX = re.compile(".*Other\ *[pP]arameters\ *\n-{16}-*")

PARAMETER_REGEX = re.compile("\s*(?P<name>[^:\s]+)\s*\:\s* (?P<tpe>[^\n]*)\n\s*(?P<doc>[^\n]*)")



def remove_identation(string):
    # remove top most indentation from the string
    tab = re.compile("(^\s*).*").search(string.split('\n')[1]).group(1)
    s = ""
    for ss in string.split('\n')[1:]:
        s = s + ss[len(tab):] + '\n'
    return s

def parse_docstring(docstring,flag=False):
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

            params_returns_desc = None

            match_parameters = PARAMETERS_REGEX.search(reminder)
            if match_parameters:
                long_desc_end = match_parameters.start()
                long_description = pypandoc.convert_text(reminder[:long_desc_end].rstrip(), 'md', format='rst')
                reminder = reminder[long_desc_end:].strip()
            else:
                long_description = pypandoc.convert_text(reminder.rstrip(), 'md', format='rst') 
            match = OTHER_PARAMETER_REGEX.search(reminder)

            if match:
               end = match.start()
               if not match_parameters:
                  long_description = pypandoc.convert_text(reminder[:end].rstrip(), 'md', format='rst') 
         
               reminder = reminder[end:].strip()               

            if reminder:
                params = {}
                    
                for name, tpe, doc in PARAMETER_REGEX.findall(reminder):
                    params[name] = (tpe,doc)
                
                
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
            if isinstance(obj, ParameterDist) or isinstance(obj, PyNNDistribution) or isinstance(obj, RandomDistribution):

                return str(obj)
            
            return json.JSONEncoder.default(self, obj)

def openMongoDB():
    #### MONGODB STUFF #######
    #client = MongoClient(host='178.62.7.131')
    client = MongoClient()
    db = client["arkheia-dev"]
    gfs = gridfs.GridFS(db)
    return gfs,db


def createSimulationRunDocumentAndUploadImages(path,gfs):

    data_store = PickledDataStore(load=True,parameters=ParameterSet({'root_directory':path,'store_stimuli' : False}),replace=False)
    
    #lets get parameters
    param = load_parameters(os.path.join(path,'parameters'),{})


    ##### STIMULI ###########
    stimuli = [MozaikParametrized.idd(s) for s in data_store.get_stimuli()]
    unique_stimuli = [MozaikParametrized.idd(s) for s in set(data_store.get_stimuli())]
    stimuli_types = {}
    for s in stimuli: stimuli_types[s.name]=True

    stim_docs = []
    for s in unique_stimuli:

        print data_store.sensory_stimulus.keys()
        raws = data_store.get_sensory_stimulus([str(s)])[0]
        if raws == None:
            raws= numpy.array([[[0,0],[0,0.1]],[[0,0],[0,0]]])
        if param['input_space'] != None:
            imageio.mimwrite('movie.gif', raws,duration=param['input_space']['update_interval']/1000.0)
        else:
            imageio.mimwrite('movie.gif', raws,duration=0.1)
        params = s.get_param_values()

        params = [(k,v,s.params()[k].doc) for k,v in params]

        stim_docs.append({
         'class' : s.name,
         'params' : params,
         'short_description' : parse_docstring(getattr(__import__(s.module_path, globals(), locals(), s.name),s.name).__doc__)["short_description"],
         'long_description' : parse_docstring(getattr(__import__(s.module_path, globals(), locals(), s.name),s.name).__doc__)["long_description"],
         'gif'    : gfs.put(open('movie.gif','r')),
        })
    
    ##### RECORDERS ###################
    recorders_docs = []
    for sh in param["sheets"].keys():
        for rec in param['sheets'][sh]["params"]["recorders"].keys():
            recorder = param['sheets'][sh]["params"]["recorders"][rec]
            name = recorder["component"].split('.')[-1]
            module_path = '.'.join(recorder["component"].split('.')[:-1])
            doc_par = get_params_from_docstring(getattr(__import__(module_path, globals(), locals(), name),name))
            p = [(k,recorder["params"][k],doc_par[k][0],doc_par[k][1]) for k in recorder["params"].keys()]
            
            recorders_docs.append({
             'class' : name,
             'source' : sh,
             'params' : p,
             'variables' : recorder["variables"],
             'short_description' : parse_docstring(getattr(__import__(module_path, globals(), locals(), name),name).__doc__)["short_description"],
             'long_description' : parse_docstring(getattr(__import__(module_path, globals(), locals(), name),name).__doc__)["long_description"],
            })
            
    #### EXPERIMENTAL PROTOCOLS ########
    experimental_protocols_docs = []
    for ep in data_store.get_experiment_parametrization_list():
        name = ep[0][8:-2].split('.')[-1]
        module_path = '.'.join(ep[0][8:-2].split('.')[:-1])
        doc_par = get_params_from_docstring(getattr(__import__(module_path, globals(), locals(), name),name))
        params = eval(ep[1])

        p = [(k,params[k],doc_par[k][0],doc_par[k][1]) for k in params.keys()]

        experimental_protocols_docs.append({
             'class' : name,
             'params' : p,
             'short_description' : parse_docstring(getattr(__import__(module_path, globals(), locals(), name),name).__doc__)["short_description"],
             'long_description' : parse_docstring(getattr(__import__(module_path, globals(), locals(), name),name).__doc__,True)["long_description"],
            })

    # load basic info
    f = open(os.path.join(path,'info'),'r')
    info = eval(f.read())  
    
    info["model_docstring"] = remove_identation(info["model_docstring"])

    #let load up results
    results = []
    f = open(os.path.join(path,'results'),'r')

    lines = [eval(line) for line in f]

    if os.path.exists(os.path.join(path,'Orientation_responseL23.png')):
        lines.append({'parameters' : {}, 'file_name' : 'Orientation_responseL23.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'Orientation_responseL4.png')):
        lines.append({'parameters' : {}, 'file_name' : 'Orientation_responseL4.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'MR.png')):
        lines.append({'parameters' : {}, 'file_name' : 'MR.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'MRReal.png')):
        lines.append({'parameters' : {}, 'file_name' : 'MRReal.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    
    for line in lines:
        r = line
	if not re.match('.*\..*$',  r['file_name']):
	    r['file_name'] +='.png'
        r['class_name'] = r['class_name'][8:-2]

        name = r['class_name'].split('.')[-1]
        module_path = '.'.join(r['class_name'].split('.')[:-1])
        doc_par = get_params_from_docstring(getattr(__import__(module_path, globals(), locals(), name),name))
        p = [(k,r["parameters"][k],doc_par[k][0],doc_par[k][1]) for k in r["parameters"].keys()]    
        r["parameters"] = p
        r["name"] = r['file_name']
        r["figure"] =   gfs.put(open(os.path.join(path,r['file_name']),'r'))
        results.append(r)
    
    


    document = {
        'submission_date' :     datetime.datetime.now().strftime('%d/%m/%Y-%H:%M:%S'),
        'run_date'        :     info["creation_data"],
        'simulation_run_name' : info["simulation_run_name"],
        'model_name' : info["model_name"],
        'model_info' : info["model_docstring"],
        'results' : results,
        'stimuli' : stim_docs,
        'recorders' : recorders_docs,
        'experimental_protocols' : experimental_protocols_docs,
        'parameters' : json.dumps(param,cls=ParametersEncoder) 
    }
    return document

assert len(sys.argv)>1 , "Not enough arguments, missing mozaik repository directory. Usage:\npython add_mozaik_repository.py path_to_mozaik_simulation_run_output_directory\n\nor\n\npython add_mozaik_repository.py path_to_mozaik_parameter_search_output_directory name_of_the_simulation"

gfs,db = openMongoDB()

if os.path.exists(os.path.join(sys.argv[1],'parameter_combinations')):

    assert len(sys.argv)>2, """Missing simulation run argument. Usage: \n python add_mozaik_repository.py path_to_mozaik_parameter_search_output_directory name_of_the_simulation """

    master_results_dir = sys.argv[1]

    f = open(master_results_dir+'/parameter_combinations','rb')
    combinations = pickle.load(f)
    f.close()
        
    # first check whether all parameter combinations contain the same parameter names
    assert len(set([tuple(set(comb.keys())) for comb in combinations])) == 1 , "The parameter search didn't occur over a fixed set of parameters"

    simulation_runs = []
    working_combinations = []
    for i,combination in enumerate(combinations):
        rdn = result_directory_name('ParameterSearch',sys.argv[2],combination)
        print rdn
        try:
            simulation_runs.append(createSimulationRunDocumentAndUploadImages(os.path.join(master_results_dir,rdn),gfs))
            working_combinations.append(combination)        
        except Exception as e:
            print("WARRNING, error in: >> " + rdn + ".\n Error:" + str(e))


    document = {
            'submission_date' :     datetime.datetime.now().strftime('%d/%m/%Y-%H:%M:%S'),
            'name' : master_results_dir,
            'simulation_runs' : simulation_runs,
            'parameter_combinations' : json.dumps(working_combinations)
    }

    db.parameterSearchRuns.insert_one(document)
else:
    db.submissions.insert_one(createSimulationRunDocumentAndUploadImages(sys.argv[1],gfs))

