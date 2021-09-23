var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json'); 
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true,
   intents: []
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
var fs = require('fs');












function pasteDivider(length){
	divider = "";
	for(var i = -1; i < length; i++){
		divider += "█";//String.fromCharCode(219)
	}
	return divider+"\n";
}

function buildTable(inputArray, maxWidth){
	finalString = "```\n";
	if(inputArray.length < 2){
		return 0;
	}
	//Check maximum line length
//	maxLength = 0;
//	for(var x = 0; x < inputArray.length; x++){
//		if(inputArray[x].length > maxLength){
//			maxLength = inputArray[x].length;
//		}
//	}
//	logger.info("Max length: "+maxLength);
	//Save each column length
	var maxLength = 0;
	var colLength = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	for(var y = 0; y < Math.min(maxWidth, inputArray.length); y++){
		columnSplit = inputArray[y].split(";");
		for(var z = 0; z < columnSplit.length; z++){
			if(columnSplit[z].length > colLength[z]){
				colLength[z] = columnSplit[z].length;
			}
		}
	}
	//Get Max line length by summing MAX columns
	for(var x = 0; x < colLength.length; x++){
		maxLength += colLength[x];
		if(colLength[x] > 0) maxLength += 1;
	}
	logger.info("Max col length: "+colLength);
	//Print it
	for(var i = 0; i < Math.min(20, inputArray.length); i++){
			if(i == 1){
				finalString += pasteDivider(maxLength);
			}
			splitLine = inputArray[i].split(";");
			finalString += "█";
			for(var j = 0; j < Math.min(maxWidth, splitLine.length); j++){
				logger.info(splitLine[j]+"===="+splitLine[j].length);	
				finalString += splitLine[j];
				if(splitLine[j].length < colLength[j]){
					for(var k = splitLine[j].length; k < colLength[j]; k++){
						finalString += " ";
					}
				}
//				finalString += "/"+splitLine[j].length+"/"+colLength[j]+"#";
				finalString += "█";
			}
			finalString += "\n";
			//splitLine.length
	}
//	for(var i=800;i<1500;++i) finalString += String.fromCharCode(i);
	finalString += "\n```"
	return finalString;
}

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
        switch(cmd) {
            // !ping
		case 'ping':
                	bot.sendMessage({
			to: channelID,
			message: 'Pong!'
		});
		break;
		case 'time':
			var currentTime = new Date();
			bot.sendMessage({
			to: channelID,
			message: currentTime.toLocaleString()
		});
		break;
		case 'releases':
		        var text = fs.readFileSync('/home/pi/newreleases/month-eng.csv', 'utf-8').toString('utf-8');
		        var textByLine = text.split("\n")
			var releaseText = ""
			for(var i = 0; i < textByLine.length; i++){
				if(i > 15){ break;}
				releaseText += textByLine[i];
				releaseText += "\n";
			}
			logger.info("1:"+textByLine[1]);
			logger.info("2:"+releaseText);
			logger.info("3:"+buildTable(textByLine,3));
			bot.sendMessage({
			to: channelID,
			message: buildTable(textByLine,3)//releaseText
		})
		break;
		case 'users':
			bot.sendMessage({
				to: channelID,
				message: user.name
			})
            // Just add any case commands if you want to..
         }
     }
});
