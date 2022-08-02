import http.server
import socketserver
import simplejson
from mongodb_client import openMongoDB
from add_mozaik_repository import insertMozaikRepository, mergeAndInsertMozaikRepositories

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/insertRepository':
            try:
      
            
                self.data_string = self.rfile.read(int(self.headers['Content-Length']))


                data = simplejson.loads(self.data_string)
                msg = "test"

                file_name = data["file_name"]
                simrun_name = data["simrun_name"]

                self.protocol_version = 'HTTP/1.1'
                
                if file_name == None or simrun_name == None:
                    self.send_response(400)

                self.send_response(200)

                # self.send_header('Content-type','text/plain; charset=utf-8')
                # self.send_header('Content-length', str(len(msg)))

                
                self.wfile.write(bytes(msg, "utf-8"))
                self.end_headers()

            except Exception as e:
                self.send_error(400, "Bad Request: %s" % e)
                self.end_headers()

        return

# Create an object of the above class
handler_object = MyHttpRequestHandler

PORT = 9001
openMongoDB()
my_server = socketserver.TCPServer(("", PORT), handler_object)

print("Server is running at port:", PORT)
# Star the server
try:
    my_server.serve_forever()
except KeyboardInterrupt:
    my_server.shutdown()
    my_server.server_close()