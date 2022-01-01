#Count execution time
from datetime import datetime
startTime = datetime.now()

#Imports
import os
import sys

#Vars
pathToScript = "/home/pi/qBot/votes"

#Arguments
reaction = sys.argv[1]
userid = sys.argv[2]
gamename = sys.argv[3]


f = open(pathToScript+"/temp.csv","a+")
f.write(reaction+";"+userid+";"+gamename+"\n")
f.close()
