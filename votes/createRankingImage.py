#Count execution time
from datetime import datetime
startTime = datetime.now()
#Imports
import urllib
import requests
import sys
import subprocess
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
#settings
pathToScript='/home/pi/qBot/votes/'
rankingfile = open(pathToScript+'ranking_sorted.csv','r')
rankingLineCount = sum(1 for line in open(pathToScript+'ranking_sorted.csv'))
print("LINES:"+str(rankingLineCount))
ranking = rankingfile.readlines()[1:25]
rankingfile.close()
rankingfile = open(pathToScript+'ranking_sorted.csv','r')
bottom = rankingfile.readlines()[-3:]
ranking += bottom
TINT_COLOR = (0,0,0)
firstRowStart = 20
rowHeight = 13
#font settings
smallfnt = ImageFont.truetype(pathToScript+'ShareTechMono-Regular.ttf',12)
firstfnt = ImageFont.truetype(pathToScript+'ShareTechMono-Regular.ttf',13)
scorefnt = ImageFont.truetype(pathToScript+'MiriamLibre-Bold.ttf',12)
black = (0,0,0)
firstColor = (13, 255, 0)
secondColor = (117, 242, 39)
thirdColor = (194, 242, 51)
restColor = (242, 242, 109)
shitColor = (161, 29, 29)
#open images
img = Image.open(pathToScript+'background_top.png')
img.convert("RGB")
star = Image.open(pathToScript+'1star.png')
star = star.convert("RGBA")
star = star.resize((14,14), Image.ANTIALIAS)
imgDraw = ImageDraw.Draw(img,"RGBA")
#Draw title
imgDraw.text((50,5), "The Slavest Games Ever", fill=(255,200,255))
lineIndex = 0
rank = 1
previousScore = -1
bottomMode = 0

for line in ranking:
    baseLocationX = 25
    baseLocationY = firstRowStart + rowHeight*lineIndex
    if line == ranking[-3]:
        print("XXXXXXXXXXXXXXXXXXXXXXXX")
        imgDraw.text((baseLocationX, baseLocationY), "BOTTOM THREE", font=smallfnt, fill=(0,255,255))
        lineIndex += 1
        rank = rankingLineCount - 3
        baseLocationY = firstRowStart + rowHeight*lineIndex
        bottomMode = 1
    gameName = line.split(";")[0].replace("\n","")
    score = line.split(";")[3].replace("\n","")
    print(gameName + " - " + score)
    if lineIndex % 2:
        overlay = Image.new('RGBA', img.size, TINT_COLOR+(0,))
        overlaydraw = ImageDraw.Draw(overlay)
        overlaydraw.rectangle([(0,(firstRowStart+rowHeight*lineIndex)+0),(530,firstRowStart+rowHeight*(lineIndex+1)+0)], fill=(255,255,255,27))
        img = Image.alpha_composite(img, overlay)
        #img.convert
    imgDraw = ImageDraw.Draw(img,"RGBA")
    #Draw rank
    if float(score) < float(previousScore):
        rank += 1
    imgDraw.text((baseLocationX-20, baseLocationY), str(rank), font=smallfnt, fill=(255,255,255))
    #Select font color according to rank
    if rank == 1:
        currentColor = firstColor
    elif rank == 2:
        currentColor = secondColor
    elif rank == 3:
        currentColor = thirdColor
    else:
        currentColor = restColor
    if bottomMode == 1:
        currentColor = shitColor

    #Draw text with game name
    imgDraw.text((baseLocationX+1, baseLocationY+1), gameName, font=smallfnt, fill=black)
    imgDraw.text((baseLocationX+2, baseLocationY+1), gameName, font=smallfnt, fill=black)
    imgDraw.text((baseLocationX, baseLocationY), gameName, font=smallfnt, fill=currentColor)
    #Draw score
    printableScore = str(score)[:4]
    if len(printableScore) < 4:
        for i in range(4 - len(str(score))):
            printableScore += "0"
        
    imgDraw.text((baseLocationX+300, baseLocationY), printableScore, font=scorefnt, fill=(255,255,255))
    fullStars = int(float(printableScore))
    fraction = float(printableScore) - int(float(printableScore))
    for i in range(fullStars):
        img.paste(star, (baseLocationX+350+15*i, baseLocationY), star) 
    if fraction > 0:
        starWidth, starHeight = star.size
        partialWidth = fraction*starWidth
        print("Part width: "+str(partialWidth))
        partialStar = star.crop((0,0,partialWidth,14))
        partialStar.convert("RGBA")
        print(str(starWidth)+" .... "+str(starHeight))
        img.paste(partialStar, (baseLocationX+350+15*(fullStars), baseLocationY), partialStar)

    previousScore = score
    lineIndex += 1



executionTime=str(round(datetime.now().timestamp() - startTime.timestamp(),2))
print("EX:"+executionTime+" NOW:"+str(datetime.now()))
imgDraw.text((0,390), "Generated in ~"+str(executionTime)+" seconds by qBot on "+str(datetime.now())[0:-7]+". Long live Slav Squat Squad!", font=smallfnt, fill=(120,120,120))
img.save(pathToScript+'ranking.png', quality=95)

#print('----------')
#for line in bottom:
#    print(line)
