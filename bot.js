const Discord = require("discord.js");
var logger = require('winston');
const client = new Discord.Client();
var auth = require('./auth.json');

client.on("ready", () => {
    console.log("I am ready!");
    console.log(client.user.tag + ' ///// ' + client.user.id); //client.username + ' - (' + client.id + ')');
});

client.on("message", (message) => {
    if (message.content.startsWith("!")) {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];
        switch (cmd) {
            case "ping":
                message.channel.send("pong!");
                break;
			case "soon":
				console.log(getReleases("month"));
				message.channel.send(getReleases("month"));			
				break;
			case "new":
	            console.log(getReleases("new"));
				message.channel.send(getReleases("new"));
				break;
			case "ziemniaczek":
				sendPotato(message);
				break;
			case "addslavtop":
				if(args.length > 1){
					console.log("Found slav top cmd with arg1: "+args[1]);
					addSlavTop(args[1]);
				}
				break;
			case "test":
				const list = client.guilds.cache.get(message.guild.id); 
				list.members.cache.forEach(member => console.log(member.user.username)); 
				//message.channel.send("pong!");
				break;
			case "addsteam":
				if(args.length > 1){
					addSteamIdToScanner(args[1], message);
					addSteamIdToProfileList(args[1], message);
				}
        }
    }
	if(message.author.username == "Vyqe" || message.author.username == "Pasza" ){
		console.log("Giving an apple to "+message.author.username);
		message.react('🍎');
	}
});

function addSlavMan(){
	var fs = require('fs');
	fs.writeFile('/home/pi/slavtop/slavmen.txt',name+"\n", function (err) {
		if (err) return console.log(err);
		console.log('Hello World > helloworld.txt');
		});
}

function addSlavTop(name){
	var fs = require('fs');
	fs.writeFile('/home/pi/slavtop/top.txt',name+"\n", function (err) {
		if (err) return console.log(err);
		console.log('Hello World > helloworld.txt');
		});
}

function getSteamId(input, message){

	console.log("input: "+input);
	input = input.replace("http://","");
	input = input.replace("https://","");
	input = input.split("/");
	console.log("input2:"+input[0]+" --- "+input[1]+" --- "+input[2]);
	if(input[1] == "profiles"){
		steamId = input[2].replace("/","");
		console.log("steamID: "+steamId);
		output = steamId;
		return output;
	}
	else if(input[1] == "id"){
		customId = input[2].replace("/","");
		console.log("customId: "+customId);
		var request = require('request');
		request('https://www.steamidfinder.com/lookup/'+customId, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				//body.forEach(line => console.log(line));
				body = body.split("\n");
				for(line in body){
					if(body[line].includes("steamID64 (Dec)")){
						output = body[line].replace(" ","").replace(/\s+/g,"").replace("<br>","").replace("<code>","");
						output = output.replace("<br>","").replace("\t","").replace("steamID64(Dec)","").replace("</code>","").replace(":","");
						output = output.replace("\"","").replace("\\","").replace("\/","").replace("}","").replace("(","").replace(")","");
						console.log("Found SteamID: "+output);
						return output;
					}
				}
			}
		});
	}
	else{
		console.log("Error, wrong url");
		return 0;
	}
}

function addSteamIdToScanner(steamid, message){
	//Error if wrong id
	if(steamid == 0 || !steamid){
		console.log("AddSteamIdToScanner - Wrong Steam ID: "+steamid);
		return 0;
	}
	
	// I have SteamID64 - variable "output"
	const { exec } = require('child_process');
	console.log("AddSteamIdToScanner - SteamID OK, adding: "+steamid);
	exec('/home/pi/steamtracker/addnewid.sh '+steamid, (err, stdout, stderr) => {
		if (err) {
			//some err occurred
			console.error(err)
		} else {
			// the *entire* stdout and stderr (buffered)
			console.log(`stdout: ${stdout}`);
			if(stdout.includes("User exists")){
				message.channel.send("SteamID "+steamid+" already exists in the database.");
			}
			else{
				message.channel.send("Scanning profile "+steamid+", please wait a few minutes");
				exec('/home/pi/steamtracker/full-workflow.sh '+auth.dbuser+" "+auth.dbpass+" "+output, (err, stdout, stderr) => {
					if (err) { console.error(err); }
					else {
						message.channel.send("Scanning profile "+steamid+" complete.");
					}
				});
			}
		}
	});
}

function addSteamIdToProfileList(steamid, message){
	var fs = require('fs');
	var text = fs.readFileSync('/home/pi/steamsumup/profileList', 'utf-8').toString('utf-8');
	var text = text.split("\n")
	for(line in text){
		if(text[line] == steamid){
			console.log("Found Steam ID "+steamid+" in profileList.");
			return 0;
		}
	}
	console.log("No Steam ID "+steamid+" in profileList. Adding.");
	fs.writeFile('/home/pi/steamsumup/profileList',steamid+"\n", function (err) {
		if (err) return console.log(err);
		console.log('Added '+steamid+' to profileList.');
		});
	
}

function sendPotato(message){
	random = Math.floor(Math.random() * 5) + 1;
	console.log("Wysylam ziemniak");
	message.channel.send("", { files: ["/home/pi/ziemniaki/ziemniak" + random + ".png"]});
}

function getReleases(which) {
    var fs = require('fs');
    if (which == "month") {
        var text = fs.readFileSync('/home/pi/newreleases/month-eng.csv', 'utf-8').toString('utf-8');
    } else if (which == "6m") {
        text = fs.readFileSync('/home/pi/newreleases/6m-eng.csv', 'utf-8').toString('utf-8');
    } else if (which == "new") {
        text = fs.readFileSync('/home/pi/newreleases/new-eng.csv', 'utf-8').toString('utf-8');
    }
    var textByLine = text.split("\n")
    newReleases = buildTable(textByLine, 3)
    return newReleases;
}

function pasteDivider(length) {
    divider = "";
    for (var i = -1; i < length; i++) {
        divider += "█"; //String.fromCharCode(219)
    }
    return divider + "\n";
}

function buildTable(inputArray, maxWidth) {
    finalString = "```\n";
    if (inputArray.length < 2) {
        return 0;
    }
    //Save each column length
    var maxLength = 0;
    var colLength = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var y = 0; y < inputArray.length; y++) {
        columnSplit = inputArray[y].split(";");
        for (var z = 0; z < columnSplit.length; z++) {
            console.log("y=" + y + " z=" + z + " columnSplit[z].length=" + columnSplit[z].length + " colLength[z]=" + colLength[z]);
            if (columnSplit[z].length > colLength[z]) {
                colLength[z] = columnSplit[z].length;
            }
        }
    }
    //Get Max line length by summing MAX columns
    for (var x = 0; x < colLength.length; x++) {
        maxLength += colLength[x];
        if (colLength[x] > 0) maxLength += 1;
    }
    console.log("Max col length: " + colLength);
    //Print it
    for (var i = 0; i < Math.min(20, inputArray.length); i++) {
        if (i == 1) {
            finalString += pasteDivider(maxLength);
        }
        splitLine = inputArray[i].split(";");
        finalString += "█";
        for (var j = 0; j < Math.min(maxWidth, splitLine.length); j++) {
            logger.info(splitLine[j] + "====" + splitLine[j].length);
            finalString += splitLine[j];
            if (splitLine[j].length < colLength[j]) {
                for (var k = splitLine[j].length; k < colLength[j]; k++) {
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
