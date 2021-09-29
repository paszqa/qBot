#!/bin/bash
####################################
# CONFIG & SETUP
####################################
input=$1
dbuser=$2
dbpass=$3

mode=$(echo "$1"|awk -F"," '{ print $2 }')
steamid=$(echo "$1"|awk -F"," '{ print $3 }')
####################################
# Get Steam ID in correct format
####################################
echo "Mode: $mode"
echo "Steam ID: $steamid"
if [ $mode == "id" ]; then
	echo "[Checking website] <https://www.steamidfinder.com/lookup/$steamid>"
	wget -q -O $steamid.tmp https://www.steamidfinder.com/lookup/$steamid
	websiteLine=$(cat $steamid.tmp|grep -i "steamID64 (Dec)")
	steamid64="${websiteLine/steamID64 (Dec)/}"   #REMOVE SOME TEXT WITH NUMBERS
	steamid64=$(echo $steamid64 | sed 's/[^0-9]*//g')    #REMOVE EVERYTHING EXCEPT NUMBERS
	echo "[Final SteamID] $steamid64"
	finalSteamID=$steamid64
elif [ $mode == "profiles" ]; then
	echo "[Final SteamID] $steamid"
	finalSteamID=$steamid
else
	echo "[ERROR] Incorrect Steam ID"
	exit 1
fi

###################################
# Add ID and Run Scanner
###################################
echo "[Scan 1/3] Adding new ID: $finalSteamID"
result=$(/home/pi/steamtracker/addnewid.sh $finalSteamID)
if [ $? -eq 0 ]; then
#	echo "[Scan 2/3] New user. Workflow starting."
	/home/pi/steamtracker/full-workflow.sh $dbuser $dbpass $finalSteamID
	echo "[Scan 2/3] New user. Workflow complete."
else
	echo "[Scan 2/3] User exists. Skipping workflow."
fi
echo "[Scan 2/3] Workflow complete"
# Search for line and add SteamID to profileList if not found
lineCount=$(cat /home/pi/steamsumup/profileList|grep -i $finalSteamID|wc -l)
if [ $lineCount -eq 0 ]; then
	echo $finalSteamID >> /home/pi/steamsumup/profileList
	echo "[Scan 3/3] Complete. Added new ID. It might take a few minutes before total times are updated."
	python3 /home/pi/steamsumup/sumUp.py
else
	echo "[Scan 3/3] Complete. ID already existed.."
fi
