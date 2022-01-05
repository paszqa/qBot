#Count execution time
from datetime import datetime
startTime = datetime.now()

#Imports
import os
import sys
import mysql.connector

#Vars
pathToScript = "/home/pi/qBot/votes"

#Arguments

#DB
mydb = mysql.connector.connect(
          host="localhost",
            user="loser",
              password="dupa",
                database="trackedtimes"
                )

mycursor = mydb.cursor()
#mycursor.execute("SELECT * FROM `votes` ORDER BY `totalTime` DESC LIMIT 25")

os.rename(pathToScript+"/temp.csv",pathToScript+"/processing.csv")
f = open(pathToScript+"/processing.csv","r")
content = f.readlines()
for line in content:
    reaction = line.split(";")[0]
    userId = line.split(";")[1]
    gameName = line.split(";")[2][:-1].replace("'","\\'")
    print("reaction: "+reaction)
    print("userId: "+userId)
    print("gameName: "+gameName)
    print("SELECT * FROM `votes` WHERE `game` = '"+gameName+"' AND `userID` = '"+userId+"'")
    mycursor.execute("SELECT * FROM `votes` WHERE `game` = '"+gameName+"' AND `userID` = '"+userId+"'")
    results = mycursor.fetchall()
    numberOfResults = len(results)
    if reaction == "R":#If reaction = R then delete any votes for this game of this user
        mycursor.execute("DELETE FROM `votes` WHERE `game` = '"+gameName+"' AND `userID` = '"+userId+"'")
    if numberOfResults == 0:#If no scores found, add new entry
        mycursor.execute("INSERT INTO `votes` VALUES (NULL, '"+gameName+"', '"+userId+"', "+reaction+")")
        #print("..........Added new entry")
    else:#If score found, update entry
        #mycursor.execute("SELECT `score` FROM `votes` WHERE `game` = '"+gameName+"' AND `userID` = '"+userId+"'")
        #oldScore = mycursor.fetchall()
        #print("Old score: "+str(oldScore[0][0]))
        #if int(oldScore[0][0]) < int(reaction):
        mycursor.execute("UPDATE `votes` SET `score` = '"+reaction+"' WHERE `game` = '"+gameName+"' AND `userID` = '"+userId+"'")
    
mycursor.execute("COMMIT;")
f.close()
