from flask import Flask
from flask_socketio import SocketIO, disconnect

EVENT_WORKER_START   = 'worker:start'
EVENT_WORKER_UPDATE  = 'worker:update'
EVENT_WORKER_STOP    = 'worker:stop'
EVENT_WORKER_REFUSED = 'worker:refused'


app = Flask(__name__)
socketio = SocketIO(app)

@socketio.on(EVENT_WORKER_START)
def on_start(data):
    print(f"[{data['workerId']}] Started tracking")

@socketio.on(EVENT_WORKER_UPDATE)
def on_update(data):
    print(f"[{data['workerId']}] Finished epoch {data['epoch']}")

@socketio.on(EVENT_WORKER_STOP)
def on_stop(data):
    print(f"[{data['workerId']}] Stopped tracking")
    disconnect()

@socketio.on(EVENT_WORKER_REFUSED)
def on_refused(_):
    print(f"Worker refused (training already in progress)")
    disconnect()
    
if __name__ == '__main__':
    socketio.run(app)