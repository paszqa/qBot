#Count execution time
from datetime import datetime
from datetime import date
startTime = datetime.now()

#Imports
import os
import sys

#Vars
pathToScript = "/home/pi/qBot/activity"
today = date.today().strftime("%Y%m%d")

#Arguments
activityString = sys.argv[1]

f = open(pathToScript+"/temp"+today+".csv","a+")
f.write(activityString+"\n")
f.close()
