const Discord = require("discord.js");
var logger = require('winston');
const client = new Discord.Client();
var auth = require('./auth.json');

client.on("ready", () => {
  console.log("I am ready!");
  console.log(client.user.tag+' ///// '+client.user.id);//client.username + ' - (' + client.id + ')');
});

client.on("message", (message) => {
  if (message.content.startsWith("!ping")) {
	message.channel.send("pong!");
  }
  if (message.content.startsWith("!soon")) {
	console.log(getReleases("month"));
	message.channel.send(getReleases("month"));
  }
  if (message.content.startsWith("!new")) {
	  console.log(getReleases("new"));
	  message.channel.send(getReleases("new"));
  }
});


function getReleases(which){
	var fs = require('fs');
	if(which == "month"){
		var text = fs.readFileSync('/home/pi/newreleases/month-eng.csv', 'utf-8').toString('utf-8');
	}
	else if(which == "6m"){
		text = fs.readFileSync('/home/pi/newreleases/6m-eng.csv', 'utf-8').toString('utf-8'); 
	}
	else if(which == "new"){
		text = fs.readFileSync('/home/pi/newreleases/new-eng.csv', 'utf-8').toString('utf-8');
	}
	var textByLine = text.split("\n")
	newReleases = buildTable(textByLine,3)
	return newReleases;
}

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
        //Save each column length
        var maxLength = 0;
        var colLength = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        for(var y = 0; y < inputArray.length; y++){
                columnSplit = inputArray[y].split(";");
                for(var z = 0; z < columnSplit.length; z++){
			console.log("y="+y+" z="+z+" columnSplit[z].length="+columnSplit[z].length+" colLength[z]="+colLength[z]);
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
        console.log("Max col length: "+colLength);
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
//                              finalString += "/"+splitLine[j].length+"/"+colLength[j]+"#";
                                finalString += "█";
                        }
                        finalString += "\n";
                        //splitLine.length
        }
//      for(var i=800;i<1500;++i) finalString += String.fromCharCode(i);
        finalString += "\n```"
        return finalString;
}


client.login(auth.token);
