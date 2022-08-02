from klein import run, route
import json
from mongodb_client import openMongoDB, closeMongoDB
from add_mozaik_repository import insertMozaikRepository, mergeAndInsertMozaikRepositories


@route('/')
def home(request):
    return 'Hello, world!'

@route("/insertRepository",  methods=['POST'])
async def insertRepository(request):
    content = json.loads(request.content.read())
    
    file_name = content["file_name"]
    try:
        paramsearch_name = content["paramsearch_name"]
    except KeyError:
        paramsearch_name = None

    if paramsearch_name is None:
        res = await insertMozaikRepository(file_name)
    else:
        res = await insertMozaikRepository(file_name, paramsearch_name)

    return json.dumps(res)


@route("/mergeAndInsertRepository",  methods=['POST'])
async def mergeAndInsertRepository(request):
    content = json.loads(request.content.read())
    
    file_name1 = content["file_name1"]
    file_name2 = content["file_name2"]

    res = await mergeAndInsertMozaikRepositories(file_name1, file_name2)

    return json.dumps(res)

openMongoDB()
print("Opened MongoDB connection.")

run("localhost", 8080)

closeMongoDB()
print("Closed MongoDB connection.")
