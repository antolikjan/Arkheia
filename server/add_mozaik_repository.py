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
from pymongo import MongoClient
import gridfs
from sphinx.util.docstrings import prepare_docstring
from pyNN.random import RandomDistribution
from mozaik.tools.distribution_parametrization import MozaikExtendedParameterSet, load_parameters,PyNNDistribution
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

# hack for fast addition of results for developmental purposes
FULL=False
WITH_STIMULI=False

sys.path.append('/home/antolikjan/projects/mozaik-contrib')

PARAMETERS_REGEX = re.compile(".*Parameters.*")


OTHER_PARAMETER_REGEX = re.compile(".*Other\ [pP]arameters\ *\n-{15}-+")

PARAMETER_REGEX = re.compile("\s*(?P<name>[^:\s]+)\s*\:\s* (?P<tpe>[^\n]*)\n\s*(?P<doc>[^\n]*)")

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

            params_returns_desc = None
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
                    params[name] = (tpe,doc)

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
            if isinstance(obj, ParameterDist) or isinstance(obj, PyNNDistribution) or isinstance(obj, RandomDistribution):

                return str(obj)
            
            return json.JSONEncoder.default(self, obj)

def openMongoDB():
    #### MONGODB STUFF #######
    #client = MongoClient(host='165.22.80.43')   #DigitalOcean work Arkheia 
    #client = MongoClient(host='68.183.219.26') #Cortical Prosthesis
    client = MongoClient(host='localhost')
    db = client["arkheia-dev"]
    #db = client["arkheia"]
    gfs = gridfs.GridFS(db)
    return gfs,db


def createSimulationRunDocumentAndUploadImages(path,gfs):
    print(path)
    #lets get parameters
    param = load_parameters(os.path.join(path,'parameters'),{})
    stim_docs = []
    experimental_protocols_docs = []

    if FULL:
        print("Loading...")
        data_store = PickledDataStore(load=True,parameters=ParameterSet({'root_directory':path,'store_stimuli' : False}),replace=False)
        print("Loaded")
        unique_stimuli = [(s,MozaikParametrized.idd(s)) for s in set(data_store.get_stimuli())]
        if WITH_STIMULI:
            for s,sidd in unique_stimuli:
                raws = data_store.get_sensory_stimulus([s])
                if raws == []:
                    raws= numpy.array([[[0,0],[0,0.1]],[[0,0],[0,0]]])
                else:
                    raws = raws[0]
                if param['input_space'] != None:
                    imageio.mimwrite('movie.gif', raws,duration=param['input_space']['update_interval']/1000.0)
                else:
                    imageio.mimwrite('movie.gif', raws,duration=0.1)
                params = sidd.get_param_values()

                params = {k : (v,sidd.params()[k].doc) for k,v in params}

                stim_docs.append({
                    'code' : sidd.name,
                    'params' : params,
                    'short_description' : parse_docstring(getattr(__import__(sidd.module_path, globals(), locals(), sidd.name),sidd.name).__doc__)["short_description"],
                    'long_description' : parse_docstring(getattr(__import__(sidd.module_path, globals(), locals(), sidd.name),sidd.name).__doc__)["long_description"],
                    'gif'    : gfs.put(open('movie.gif','r')),
                    })

        #### EXPERIMENTAL PROTOCOLS ########
        print(data_store.get_experiment_parametrization_list())
        for ep in data_store.get_experiment_parametrization_list():
            name = ep[0][8:-2].split('.')[-1]
            module_path = '.'.join(ep[0][8:-2].split('.')[:-1])
            doc_par = get_params_from_docstring(getattr(__import__(module_path, globals(), locals(), name),name))
            params = eval(ep[1])

            p = {k:(params[k],doc_par[k][0],doc_par[k][1]) if k in doc_par else params[k] for k in params.keys()}

            experimental_protocols_docs.append({
                'code' : module_path + '.' + name,
                'params' : p,
                'short_description' : parse_docstring(getattr(__import__(module_path, globals(), locals(), name),name).__doc__)["short_description"],
                'long_description' : parse_docstring(getattr(__import__(module_path, globals(), locals(), name),name).__doc__)["long_description"],
                })
    
    ##### RECORDERS ###################
    recorders_docs = []
    for sh in param["sheets"].keys():
        for rec in param['sheets'][sh]["params"]["recorders"].keys():
            recorder = param['sheets'][sh]["params"]["recorders"][rec]
            name = recorder["component"].split('.')[-1]
            module_path = '.'.join(recorder["component"].split('.')[:-1])
            doc_par = get_params_from_docstring(getattr(__import__(module_path, globals(), locals(), name),name))
            p = {k:(recorder["params"][k],doc_par[k][0],doc_par[k][1]) for k in recorder["params"].keys()}
            
            recorders_docs.append({
             'code' : module_path + '.' + name,
             'source' : sh,
             'params' : p,
             'variables' : recorder["variables"],
             'short_description' : parse_docstring(getattr(__import__(module_path, globals(), locals(), name),name).__doc__)["short_description"],
             'long_description' : parse_docstring(getattr(__import__(module_path, globals(), locals(), name),name).__doc__)["long_description"],
            })
            

    # load basic info

    if os.path.exists(os.path.join(path,'info')):
        f = open(os.path.join(path,'info'),'r')
        info = eval(f.read())        
    else:
        info={}
        info["creation_data"] = "????"
        info["simulation_run_name"] = "???"
        info["model_name"] = "??"


    
    #let load up results
    results = []

    if os.path.exists(os.path.join(path,'results')):
        f = open(os.path.join(path,'results'),'r')
        lines = list(set([line for line in f]))
        lines = [eval(line) for line in lines]
    else:
        lines = []

    if os.path.exists(os.path.join(path,'TrialToTrialVariabilityComparison.png')):
         lines.append({'parameters' : {}, 'file_name' : 'TrialToTrialVariabilityComparison.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'TrialToTrialVariabilityComparisonNew.png')):
         lines.append({'parameters' : {}, 'file_name' : 'TrialToTrialVariabilityComparisonNew.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'SpontStatisticsOverview.png')):
         lines.append({'parameters' : {}, 'file_name' : 'SpontStatisticsOverview.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'Orientation_responseL23.png')):
         lines.append({'parameters' : {}, 'file_name' : 'Orientation_responseL23.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'Orientation_responseL4.png')):
         lines.append({'parameters' : {}, 'file_name' : 'Orientation_responseL4.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'Orientation_responseInhL23.png')):
         lines.append({'parameters' : {}, 'file_name' : 'Orientation_responseInhL23.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'Orientation_responseInh23.png')):
         lines.append({'parameters' : {}, 'file_name' : 'Orientation_responseInh23.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'MR.png')):
         lines.append({'parameters' : {}, 'file_name' : 'MR.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'MRReal.png')):
         lines.append({'parameters' : {}, 'file_name' : 'MRReal.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'aaa.png')):
         lines.append({'parameters' : {}, 'file_name' : 'aaa.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'bbb.png')):
         lines.append({'parameters' : {}, 'file_name' : 'bbb.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'Orientation_responsInheL4.png')):
         lines.append({'parameters' : {}, 'file_name' : 'Orientation_responsInheL4.png', 'class_name' : ''}) #!!!!!!!!!!!!!!!!!
    if os.path.exists(os.path.join(path,'GratingExcL23.png')):
       lines.append({'parameters' : {}, 'file_name' : 'GratingExcL23.png', 'class_name' : ''}) 
    if os.path.exists(os.path.join(path,'GratingInhL23.png')):
       lines.append({'parameters' : {}, 'file_name' : 'GratingInhL23.png', 'class_name' : ''}) 
    if os.path.exists(os.path.join(path,'GratingExcL4.png')):
       lines.append({'parameters' : {}, 'file_name' : 'GratingExcL4.png', 'class_name' : ''}) 
    if os.path.exists(os.path.join(path,'GratingInhL4.png')):
       lines.append({'parameters' : {}, 'file_name' : 'GratingInhL4.png', 'class_name' : ''}) 
    if os.path.exists(os.path.join(path,'SpontExcL23.png')):
       lines.append({'parameters' : {}, 'file_name' : 'SpontExcL23.png', 'class_name' : ''}) 
    if os.path.exists(os.path.join(path,'SpontInhL23.png')):
       lines.append({'parameters' : {}, 'file_name' : 'SpontInhL23.png', 'class_name' : ''}) 
    if os.path.exists(os.path.join(path,'SpontExcL4.png')):
       lines.append({'parameters' : {}, 'file_name' : 'SpontExcL4.png', 'class_name' : ''}) 
    if os.path.exists(os.path.join(path,'SpontInhL4.png')):
       lines.append({'parameters' : {}, 'file_name' : 'SpontInhL4.png', 'class_name' : ''}) 
    if os.path.exists(os.path.join(path,'NatExcL4.png')):
       lines.append({'parameters' : {}, 'file_name' : 'NatExcL4.png', 'class_name' : ''}) 

    for line in lines:
        r = line
        if not re.match('.*\..*$',  r['file_name']):
            r['file_name'] +='.png'
        r['code'] = r['class_name'][8:-2]

        if True:
            if r['code'] != '':
                name = r['code'].split('.')[-1]
                module_path = '.'.join(r['code'].split('.')[:-1])
                doc_par = get_params_from_docstring(getattr(__import__(module_path, globals(), locals(), name),name))
                p = {k:(r["parameters"][k],doc_par[k][0],doc_par[k][1]) if k in doc_par else (r["parameters"][k],"","") for k in r["parameters"].keys()}
            else:
                p=[]    
            r["parameters"] = p
        r["name"] = r['file_name']
        r["figure"] =   gfs.put(open(os.path.join(path,r['file_name']),'rb'))
        results.append(r)

    document = {
        'submission_date' :     datetime.datetime.now().strftime('%d/%m/%Y-%H:%M:%S'),
        'run_date'        :     info["creation_data"],
        'simulation_run_name' : info["simulation_run_name"],
        'model_name' : info["model_name"],
        'model_description' : info["model_docstring"] if 'model_docstring' in info else '',
        'results' : results,
        'stimuli' : stim_docs,
        'recorders' : recorders_docs,
        'experimental_protocols' : experimental_protocols_docs,
        'parameters' : json.dumps(param,cls=ParametersEncoder) #!!!!!!!!!!!!!!!!
    }
    return document

assert len(sys.argv)>1 , "Not enough arguments, missing mozaik repository directory. Usage:\npython add_mozaik_repository.py path_to_mozaik_simulation_run_output_directory\n\nor\n\npython add_mozaik_repository.py path_to_mozaik_parameter_search_output_directory name_of_the_simulation"

gfs,db = openMongoDB()

if len(sys.argv) == 5:
    d1 = createSimulationRunDocumentAndUploadImages(sys.argv[1],gfs)
    d2 = createSimulationRunDocumentAndUploadImages(sys.argv[2],gfs)

    assert d1['simulation_run_name'] == d2['simulation_run_name']
    assert d1['model_name'] == d2['model_name']

    d1['results'] = d1['results'] + d2['results']
    d1['stimuli'] = d1['stimuli'] + d2['stimuli']
    d1['recorders'] = d1['recorders'] + d2['recorders']
    d1['experimental_protocols'] = d1['experimental_protocols'] + d2['experimental_protocols']

    db.submissions.insert_one(d1)

elif os.path.exists(os.path.join(sys.argv[1],'parameter_combinations')):

    assert len(sys.argv)>2, """Missing simulation run argument. Usage: \n python add_mozaik_repository.py path_to_mozaik_parameter_search_output_directory name_of_the_simulation """

    if len(sys.argv) > 3:
        simulation_name = sys.argv[3]
    else:
        simulation_name = sys.argv[1]

    master_results_dir = sys.argv[1]

    f = open(master_results_dir+'/parameter_combinations','rb')
    combinations = pickle.load(f)
    f.close()
        
    # first check whether all parameter combinations contain the same parameter names
    assert len(set([tuple(set(comb.keys())) for comb in combinations])) == 1 , "The parameter search didn't occur over a fixed set of parameters"

    simulation_runs = []
    working_combinations = []
    for i,combination in enumerate(combinations):
        combination = dict([(x,y.decode('string_escape').decode('string_escape').replace("'", '') if type(y) == str else y) for x,y in combination.items()])

        rdn = result_directory_name('ParameterSearch',sys.argv[2],combination)
        print(rdn)
        try:
            simulation_runs.append(createSimulationRunDocumentAndUploadImages(os.path.join(master_results_dir,rdn),gfs))
            working_combinations.append(combination)        
        except Exception as e:
            print("WARRNING, error in: >> " + rdn + ".\n Error:" + str(e))


    document = {
            'submission_date' :     datetime.datetime.now().strftime('%d/%m/%Y-%H:%M:%S'),
            'name' : simulation_name,
            #'name' : master_results_dir,
            'simulation_runs' : simulation_runs,
            'parameter_combinations' : json.dumps(working_combinations)
    }

    db.parameterSearchRuns.insert_one(document)
else:
    db.submissions.insert_one(createSimulationRunDocumentAndUploadImages(sys.argv[1],gfs))
