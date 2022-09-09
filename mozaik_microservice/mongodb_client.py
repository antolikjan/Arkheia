from pymongo import MongoClient
import gridfs

gfs, mongo_client, client = None, None, None

def openMongoDB():
    global gfs
    global mongo_client
    #### MONGODB STUFF ####
    #client = MongoClient(host='165.22.80.43')   #DigitalOcean work Arkheia
    #client = MongoClient(host='68.183.219.26') #Cortical Prosthesis
    client = MongoClient(host='localhost')
    mongo_client = client["arkheia-new"]
    #db = client["arkheia"]
    gfs = gridfs.GridFS(mongo_client)


def closeMongoDB():
    global client
    if client:
        global gfs
        global mongo_client
        client.close()
        gfs, mongo_client, client = None, None, None
