import traice
import random
import time

client = traice.TraiceClient('http://127.0.0.1:3000')
client.start()

for epoch in range(10):
    client.update(epoch, random.random(), random.random())
    time.sleep(3)

client.stop()