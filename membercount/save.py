#Count execution time
from datetime import datetime, date, timedelta
startTime = datetime.now()

#Imports
import os
import sys
import mysql.connector

#Vars
pathToScript = "/home/pi/qBot/membercount"
today = (date.today()  - timedelta(1)).strftime("%Y%m%d")
#Arguments

#DB
mydb = mysql.connector.connect(
          host="localhost",
            user="loser",
              password="dupa",
                database="trackedtimes"
                )

#Args
memberCount = sys.argv[1]
withBots = sys.argv[2]

mycursor = mydb.cursor()
mycursor.execute("INSERT INTO `membercount` VALUES (NULL, '"+today+"', '"+memberCount+"', "+withBots+")")   
mycursor.execute("COMMIT;")
