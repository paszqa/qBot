#Count execution time
from datetime import datetime
startTime = datetime.now()

#Imports
import os
import sys
from PIL import Image, ImageDraw, ImageFont

#Choose size and color
#img = Image.new('RGB', (550, 400), color = (73, 109, 137))
img = Image.open('/home/pi/newreleases/background.png')
img = img.convert("RGB")
#Choose fonts
pathToScript='/home/pi/newreleases/'
largefnt = ImageFont.truetype(pathToScript+'ShareTechMono-Regular.ttf', 18)
smallfnt = ImageFont.truetype(pathToScript+'ShareTechMono-Regular.ttf', 13)
superfnt = ImageFont.truetype(pathToScript+'ShareTechMono-Regular.ttf',23)
minifnt = ImageFont.truetype(pathToScript+'ShareTechMono-Regular.ttf', 11)
#Settings
rowHeight=14
firstRowStart=18

#Draw background
d = ImageDraw.Draw(img,'RGBA')

#Get text from file


filename = "hello.png"
f = open('/home/pi/qBot/helloText.txt','r')


#Analyze each line from the file
rowNumber = 0
for row in f:
    print("RowNumber:"+str(rowNumber)+" Row: "+str(row))
    if rowNumber > 25:
        break;
    defaultColor = (199, 140, 38) #orange
    nameColor = (72, 94, 212) #blue
    black = (0,0,0) 
    defX = 10
    defY = firstRowStart+rowHeight*rowNumber
    defaultLocation = (defX,defY)
    if rowNumber == 0:
        currentColor = defaultColor
        fnt=smallfnt
        defX=220
    elif rowNumber == 2:
        currentColor = nameColor
        fnt=superfnt
        defX=235
    elif rowNumber == 5:
        currentColor = defaultColor
        fnt=smallfnt
        defX=45
    elif rowNumber == 7:
        currentColor = defaultColor
        fnt=largefnt
        defX=170
    elif rowNumber == 9:
        currentColor = nameColor
        fnt=superfnt
        defX=235
    elif rowNumber == 12:
        currentColor = defaultColor
        fnt=smallfnt
        defX=200
    elif rowNumber == 14:
        currentColor = nameColor
        fnt=largefnt
        defX=180
    else:
        currentColor = defaultColor
        fnt=smallfnt
        defX=10
    d.text((defX,defY), row, font=fnt, fill=currentColor)
#    if rowNumber % 2:
#        d.rectangle([(0,(firstRowStart+rowHeight*rowNumber)+2),(530,firstRowStart+rowHeight*(rowNumber+1)+1)], fill=(0,0,0,57))
#    d.text((100,firstRowStart+rowHeight*rowNumber), rowSplit[1][0:45], font=fnt, fill=currentColor)
#    d.text((450,firstRowStart+rowHeight*rowNumber), rowSplit[2], font=fnt, fill=currentColor)
#    d.text((470+min(1,rowNumber)*15,firstRowStart+rowHeight*rowNumber), rowSplit[3], font=fnt, fill=currentColor)
    rowNumber += 1

#Add title
#d.text((indent,3), titletext, font=largefnt, fill=(255,255,255))

#Add execution time info
executionTime=str(round(datetime.now().timestamp() - startTime.timestamp(),2))
print("EX:"+executionTime+" NOW:"+str(datetime.now()))
d.text((0,390), "Generated in ~"+str(executionTime)+" seconds by qBot on "+str(datetime.now())[0:-7]+". Long live Slav Squat Squad!", font=minifnt, fill=(20,20,20))
#Save for the glory of Slav Squat Squad
img.save('/home/pi/qBot/'+filename)
