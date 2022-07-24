from klein import run, route
import json
from mongodb_client import openMongoDB
from add_mozaik_repository import insertMozaikRepository, mergeAndInsertMozaikRepositories


@route('/')
def home(request):
    return 'Hello, world!'

@route("/insertRepository",  methods=['POST'])
async def insertRepository(request):
    content = json.loads(request.content.read())
    
    file_name = content["file_name"]
    try:
        simrun_name = content["simrun_name"]
    except KeyError:
        simrun_name = None

    if simrun_name is None:
        res = await insertMozaikRepository(file_name)
    else:
        res = await insertMozaikRepository(file_name, simrun_name)

    return json.dumps(res)

    # response = json.dumps(dict(the_data=content), indent=4)
    # return file_name

openMongoDB()
run("localhost", 8080)