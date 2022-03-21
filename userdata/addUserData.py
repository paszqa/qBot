#Count execution time
from datetime import datetime, timedelta
startTime = datetime.now()
from datetime import date

#Imports
import os
import sys, getopt
import mysql.connector
import configparser

#Read config
config = configparser.ConfigParser()
config.read("config.ini")
try:
    print("-----"+config["TEST SECTION"]["MAGIC"])
except:
    print("Config reading error")
    sys.exit(0)

#DATABASE connection
mydb = mysql.connector.connect(
          host=config["DATABASE"]["host"],
            user=config["DATABASE"]["username"],
              password=config["DATABASE"]["password"],
                database=config["DATABASE"]["database"]
                )
mycursor = mydb.cursor()

def set_attribute(discord_id, attribute_name, input_string):
    print(discord_id+": "+attribute_name+" = "+input_string)
    mycursor.execute("SELECT * FROM `userdata` WHERE `discord_user_id` = '"+discord_id+"'")
    print("---------")
    results = mycursor.fetchall()
    numberOfResults = len(results)
    if numberOfResults == 0:
        mycursor.execute("INSERT INTO `userdata` VALUES (NULL, '"+discord_user_id+"', NULL, NULL, NULL, NULL, NULL, NULL);")
    else:
        mycursor.execute("UPDATE `userdata` SET `"+attribute_name+"` = '"+input_string+"' WHERE `discord_user_id` = '"+discord_id+"'")



#Get arguments, main function
try:
    opts, args = getopt.getopt(sys.argv[1:], "d:u:i:s:t:n:")
except getopt.GetoptError:
    print('Wrong argument. Accepted arguments:\n-d discord_id -u discord_name -i steam_id -s steam_name -t twitch_id -n twitch_name')
    sys.exit(2)
for opt,arg in opts:
    if opt == '-d':
        discord_user_id = arg
        set_attribute(discord_user_id, "discord_user_id", arg)
    elif opt == '-u':
        set_attribute(discord_user_id, "discord_username", arg)
    elif opt == '-i':
        set_attribute(discord_user_id, "steam_user_id", arg)
    elif opt == '-s':
        set_attribute(discord_user_id, "steam_username", arg)
    elif opt == '-t':
        set_attribute(discord_user_id, "twitch_user_id", arg)
    elif opt == '-n':
        set_attribute(discord_user_id, "twitch_username", arg)


mycursor.execute("COMMIT;")
