#Count execution time
from datetime import datetime, timedelta
startTime = datetime.now()
from datetime import date

#Imports
import os
import sys
import mysql.connector

#Vars
pathToScript = "/home/pi/qBot/activity"
yesterday = (date.today()  - timedelta(1)).strftime("%Y%m%d") 
yesterdaySql = (date.today() - timedelta(1)).strftime("%Y-%m-%d")
if sys.argv[1]:
    yesterdaySql = sys.argv[1]
    yesterday = sys.argv[1].replace("-","")
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

#os.rename(pathToScript+"/temp"+yesterday+".csv",pathToScript+"/proc"+yesterday+".csv")
f = open(pathToScript+"/temp"+yesterday+".csv","r")
content = f.readlines()
for line in content:
    username = line.split(";")[1]
    userId = line.split(";")[2]
    gameName = line.split(";")[-4]
    music = line.split(";")[-3]
    stream = line.split(";")[-2]
    print("username: "+username)
    print("userId: "+userId)
    if gameName != "NONE":
        print("gameName: "+gameName)
        mycursor.execute("SELECT `activityTime` FROM `activity` WHERE `activityName` = '"+gameName+"' AND `userId` = '"+userId+"' AND `date` = '"+yesterdaySql+"'");
        results = mycursor.fetchall()
        numberOfResults = len(results)
        print(gameName+" :::::: "+str(numberOfResults));
        if numberOfResults == 0:
            mycursor.execute("INSERT INTO `activity` VALUES (NULL, '"+userId+"', '"+username+"', '"+yesterdaySql+"', 'game', '"+gameName+"', 5)");
        else:
            mycursor.execute("UPDATE `activity` SET `activityTime` = activityTime + 5 WHERE `activityName` = '"+gameName+"' AND `userId` = '"+userId+"' AND `date` = '"+yesterdaySql+"'");
    if music != "NONE":
        print("music: "+music)
        mycursor.execute("SELECT `activityTime` FROM `activity` WHERE `type` = 'music' AND `userId` = '"+userId+"' AND `date` = '"+yesterdaySql+"'");
        results = mycursor.fetchall()
        numberOfResults = len(results)
        if numberOfResults == 0:
            mycursor.execute("INSERT INTO `activity` VALUES (NULL, '"+userId+"', '"+username+"', '"+yesterdaySql+"', 'music', NULL, 5)");
        else:
            mycursor.execute("UPDATE `activity` SET `activityTime` = activityTime + 5 WHERE `type` = 'music' AND `userId` = '"+userId+"' AND `date` = '"+yesterdaySql+"'");
    if stream != "NONE":
        print("stream: "+stream)
        mycursor.execute("SELECT `activityTime` FROM `activity` WHERE `type` = 'stream' AND `userId` = '"+userId+"' AND `date` = '"+yesterdaySql+"'");
        results = mycursor.fetchall()
        numberOfResults = len(results)
        if numberOfResults == 0:
            mycursor.execute("INSERT INTO `activity` VALUES (NULL, '"+userId+"', '"+username+"', '"+yesterdaySql+"', 'stream', NULL, 5)");
        else:
            mycursor.execute("UPDATE `activity` SET `activityTime` = activityTime + 5 WHERE `type` = 'stream' AND `userId` = '"+userId+"' AND `date` = '"+yesterdaySql+"'");




#    mycursor.execute("SELECT * FROM `votes` WHERE `game` = '"+gameName+"' AND `userID` = '"+userId+"'")
#    results = mycursor.fetchall()
#    numberOfResults = len(results)
#    if reaction == "R":#If reaction = R then delete any votes for this game of this user
#        mycursor.execute("DELETE FROM `votes` WHERE `game` = '"+gameName+"' AND `userID` = '"+userId+"'")
#    if numberOfResults == 0:#If no scores found, add new entry
#        mycursor.execute("INSERT INTO `votes` VALUES (NULL, '"+gameName+"', '"+userId+"', "+reaction+")")
#        #print("..........Added new entry")
#    else:#If score found, update entry
#        #mycursor.execute("SELECT `score` FROM `votes` WHERE `game` = '"+gameName+"' AND `userID` = '"+userId+"'")
#        #oldScore = mycursor.fetchall()
#        #print("Old score: "+str(oldScore[0][0]))
#        #if int(oldScore[0][0]) < int(reaction):
#        mycursor.execute("UPDATE `votes` SET `score` = '"+reaction+"' WHERE `game` = '"+gameName+"' AND `userID` = '"+userId+"'")
    
mycursor.execute("COMMIT;")
f.close()
