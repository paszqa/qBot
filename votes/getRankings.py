#Count execution time
from datetime import datetime
startTime = datetime.now()

#Imports
import os
import sys
import mysql.connector
import pandas as pd

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

#Set file
f = open(pathToScript+"/ranking.csv","w+")
f.write("game;score;entries;correctScore\n")

#Save data from DB to CSV
mycursor.execute("SELECT game, AVG(score) AS score_avg, COUNT(game) AS entries FROM votes GROUP BY game ORDER BY score_avg DESC, entries DESC")
results = mycursor.fetchall()
for entry in results:
    correctedScore = entry[1]
    if entry[2] < 5:
        missingEntries = 5 - entry[2]
        correctedScore = (entry[1] * entry[2] + missingEntries * 3) / 5
    f.write(entry[0]+";"+str(entry[1])+";"+str(entry[2])+";"+str(correctedScore)+"\n")
f.close()

#
df = pd.read_csv(pathToScript+"/ranking.csv", delimiter=';')
#print(df)
sorted_df = df.sort_values(by=["correctScore"], ascending=False)
print(sorted_df)
sorted_df.to_csv(pathToScript+'/ranking_sorted.csv', sep=";", index=False)
