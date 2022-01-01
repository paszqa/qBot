#Count execution time
from datetime import datetime
startTime = datetime.now()

#Imports
import os
import sys

#Vars
pathToScript = "/home/pi/qBot/votes"

#Arguments
postId = sys.argv[1]


f = open(pathToScript+"/voteposts.csv","a+")
f.write(postId+"\n")
f.close()