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
			case "qbot":
				console.log("Print info about qBot");
				message.channel.send(
					pasteEmoji()+pasteEmoji()+pasteEmoji()+
					"\nHello, I am qBot. My sole purpose is to protect and serve Slav Squat Squad and our glorious leader Vyqe.\n"+
					pasteEmoji()+pasteEmoji()+pasteEmoji()+
					"\nMy commands:"+
					"\n!soon - show games which are set to release within the next weeks"+
					"\n!new - show games which have been released recently"+
					"\n!potato - grants a free potato"+
					"\n!steak - grants a free steak"+
					"\n!slavtop - shows a list of 25 most played games by Slav Squat Squad"+
					"\n!showslav - shows a list of players participating in Slav Top 25"+
					"\n!addsteam STEAM_PROFILE_URL - adds specified Steam profile to the list above"+
					"\n"+
					pasteEmoji()+pasteEmoji()+pasteEmoji()
					);
				break;
			case "soon":
				//console.log(getReleases("month"));
				getReleases(message, "month");
				break;
			case "new":
				//console.log(getReleases("new"));
				getReleases(message, "new");
				break;
			case "potato":
				sendPotato(message);
				break;
			case "steak":
				message.channel.send("We ran out of steaks. Why not a potato?");
				break;
//			case "addslavtop":
//				if(args.length > 1){
//					console.log("Found slav top cmd with arg1: "+args[1]);
//					addSlavTop(args[1]);
//				}
//				break;
//			case "test":
//				const list = client.guilds.cache.get(message.guild.id); 
//				list.members.cache.forEach(member => console.log(member.user.username)); 
//				//message.channel.send("pong!");
//				break;
			case "addsteam":
				if(args.length > 1){
					runAddSteam(args[1], message);
					//addSteamIdToScanner(args[1], message);
					//addSteamIdToProfileList(args[1], message);
				}
				break;
			case "showslavs":
				showProfileList(message);
				break;
			case "slavtop":
				message.channel.send(pasteEmoji()+" Generating list, give me a second "+pasteEmoji());
				showTotalTimes(message);
				break;
			case "updatetop":
				updateTotalTimes(message);
				break;
        }
    }
	if(message.author.username == "Vyqe" || message.author.username == "Pasza" ){
		console.log("Not giving an apple to "+message.author.username);
		//message.react(pasteEmoji());
	}
});


function pasteEmoji(){
	//return client.emojis.cache.get("892713333420089354");
	return '<:SSSstar:597057563770748928>'
}
function showProfileList(message){
	const { exec } = require('child_process');
	exec('/home/pi/steamsumup/showList.sh', (err, stdout, stderr) => {
		if (err) {
			console.error(err);
			message.channel.send("Error showing profile list.");
		} else {
			message.channel.send(buildTable(`SteamID;name\n${stdout}`, 2, 40));
		}
	});
}

function showTotalTimes(message){
	console.log("Started showTotalTimes()");
	const { exec } = require('child_process');
	exec('python3 /home/pi/steamsumup/showTop.py', (err, stdout, stderr) => {
		if (err) {
			console.error(err);
			message.channel.send("Error showing top list.");
		} else {
			console.log("Launched showTop.py");
			message.channel.send(buildTable(`${stdout}`, 4, 25));
			message.channel.send(pasteEmoji()+" This list sums up gametimes for all willing participants "+pasteEmoji()+"\n"+pasteEmoji()+" To add yourself to the Slav list just type \!addsteam YOUR_STEAM_PROFILE_URL, ex. !addsteam <https://steamcommunity.com/id/vyqe> "+pasteEmoji()+"\n"+pasteEmoji()+" Current Slav list can be viewed by typing !showslavs "+pasteEmoji());
		}
	});
	//message.channel.send("show total times");
}

function updateTotalTimes(message){
	console.log("Started updateTotalTimes()");
	const { exec } = require('child_process');
	exec('python3 /home/pi/steamsumup/sumUp.py', (err, stdout, stderr) => {
		if (err) {
			console.error(err);
			message.channel.send("Error running top list update.");
		} else {
			console.log("Launched sumUp.py");
			message.channel.send("Top list should be updated soon. It might take a couple of minutes.");
		}
	});
}

function runAddSteam(input, message){
	//console.log("input: "+input);
	input = input.replace("http://","");
	input = input.replace("https://","");
	input = input.replace(";","");
	input = input.replace("\"","");
	input = input.replace("\'","");
	input = input.replace("\`","");
	input = input.replace("\\","");
	input = input.replace(" ","");
	input = input.split("/");
	//console.log("input cleaned:"+input);
	const { exec } = require('child_process');
	exec('/home/pi/qBot/addsteam.sh '+input+" "+auth.dbuser+" "+auth.dbpass, (err, stdout, stderr) => {
		if (err) {
			//some err occurred
			console.error(err);
			message.channel.send("Error adding ID");
		} else {
			// the *entire* stdout and stderr (buffered)
			console.log(`stdout: ${stdout}`);
			//reply = message.channel.send(`${stdout}`);
			message.channel.send(pasteEmoji()+" Steam ID has been added or had already existed. Total times should be updated within a few minutes. "+pasteEmoji());
		}
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

function getReleases(message, which) {
    var fs = require('fs');
    if (which == "month") {
	 console.log("Displaying next month games");
	    message.channel.send(pasteEmoji()+" Games, which release soon "+pasteEmoji());
        var text = fs.readFileSync('/home/pi/newreleases/month-eng.csv', 'utf-8').toString('utf-8');
	    console.log(text);
    } else if (which == "6m") {
	    console.log("Displaying next 6 months games");
        text = fs.readFileSync('/home/pi/newreleases/6m-eng.csv', 'utf-8').toString('utf-8');
    } else if (which == "new") {
	    message.channel.send(pasteEmoji()+" Games, which have been released recently "+pasteEmoji());
	    console.log("Displaying recently released games");
        text = fs.readFileSync('/home/pi/newreleases/new-eng.csv', 'utf-8').toString('utf-8');
    }
    //var textByLine = text.split("\n");
	//console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz\n"+textByLine);
    newReleases = buildTable(text, 3, 20)
	console.log(newReleases);
    message.channel.send(newReleases);
}

function pasteDivider(length) {
    divider = "";
    for (var i = -1; i < length; i++) {
        divider += "█"; //String.fromCharCode(219)
    }
    return divider + "\n";
}

function buildTable(inputArray, maxWidth, maxRows) {
	//console.log("LEN:"+inputArray.length);
	//console.log("ARRAY:\n"+inputArray);
	inputArray = inputArray+"";
	inputArray = inputArray.split("\n");
	inputArray = inputArray.slice(0, -1);
	console.log("LEN"+inputArray.length);
	console.log("[Building table] Input array length: "+inputArray.length);
	console.log(inputArray);
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
	console.log("---");
    //Get Max line length by summing MAX columns
    for (var x = 0; x < colLength.length; x++) {
        maxLength += colLength[x];
        if (colLength[x] > 0) maxLength += 1;
    }
    console.log("Max col length: " + colLength);
    //Print it
    for (var i = 0; i < Math.min(maxRows, inputArray.length); i++) {
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
