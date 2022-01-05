////////////////////////// 
// qBot by Paszq
// 2021-2022
// v0.1.0	- 2021-10-19 - Paszq - first versioned commit
// v0.2.0 - 2021-12-18 - Paszq - cleaned up code
// v0.3.0 - 2021-12-29 - Paszq - initial vote code
// v0.4.0 - 2022-01-02 - Paszq - voting works
// v0.4.1 - 2022-01-05 - Paszq - comments, partial code clean up
//////////////////////////

////////////////////////// 
// Requires
//////////////////////////
const Discord = require("discord.js");
var logger = require('winston');
const client = new Discord.Client();
var auth = require('./auth.json');
var cron = require("node-cron");


//////////////////////////
// Running the bot, initialization on launch
//////////////////////////
client.on("ready", () => {
    console.log("I am ready!");
    console.log(client.user.tag + ' ///// ' + client.user.id);
    enableCronJobs();  // Enables scheduled jobs on start
	loadVotePosts();   // On launch checks and prepares posts that were saved to voteposts.csv
});

//////////////////////////
// Running the bot, listening for messages
//////////////////////////
client.on("message", (message) => {
    if (message.content.startsWith("!")) {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];
        switch (cmd) {
            case "ping":
                message.channel.send("pong!");
                break;
			case "qbot": // Needs to be updated, lists old stuff only
				console.log("Print info about qBot");
				message.channel.send(
					pasteEmoji()+pasteEmoji()+pasteEmoji()+
					"\nHello, I am qBot. My sole purpose is to protect and serve Slav Squat Squad and Our Glorious Leader Vyqe. I am a bit slow, so please give me time to respond to you.\n"+
					pasteEmoji()+pasteEmoji()+pasteEmoji()+
					"\nMy commands:"+
					"\n!soon - show games which are set to release within the next weeks"+
					"\n!new - show games which have been released recently"+
					"\n!potato - grants a free potato"+
					"\n!steak - grants a free steak"+
					"\n!slavtop - shows a list of 25 most played games by Slav Squat Squad"+
					"\n!showslavs - shows a list of players participating in Slav Top 25"+
					"\n!addsteam STEAM_PROFILE_URL - adds specified Steam profile to the list above"+
					"\n"+
					pasteEmoji()+pasteEmoji()+pasteEmoji()
					);
				break;
			case "soon":
				showReleasesImage(message, "month"); // show games coming out in the next month
				break;
			case "new":
				showReleasesImage(message, "new"); // show games that were released recently
				break;
			case "potato":
				sendPotato(message); // paste random potato
				break;
			case "steak":
				message.channel.send("We ran out of steaks. Why not a potato?"); // no steak mode
				break;
			case "addsteam": // add steam id to slavs
				if(args.length > 1){
					runAddSteam(args[1], message);
					//addSteamIdToScanner(args[1], message);
					//addSteamIdToProfileList(args[1], message);
				}
				break;
			case "showslavs": // show slav profile list
				showSlavsImage(message);
				break;
			case "slavtop": // show slav top
				//message.channel.send(pasteEmoji()+" Generating list, give me a second "+pasteEmoji());
				//showTotalTimes(message);
				getSlavTopImage(message);
				break;
			case "updatetop":
				updateTotalTimes(message);
				break;
			case "welcome":
				sayHello(message);
				break;
			case "cron":
				enableCronJobs();
				break;
			case "twitchslavs":
				showTwitchImage(message);
				break;
			case "addtwitch":
				addTwitchUser(args[1], message); 
				break;
			case "removetwitch":
				removeTwitchUser(args[1], message);
				break;
			case "price":
				getGamePrice(args.slice(1).join(' '), message);
				break;
			case "sss":
				pasteAnthemImage(message);
				break;
			case "qvote":
				createVotingMessage(message);
				break;
        }
    }
	if(message.author.username == "Vyqe" || message.author.username == "Pasza" ){
		console.log("Not giving an apple to "+message.author.username);
	}
});

///////////////////////////////////////////
////////////////////////// SIMPLE STUFF 
///////////////////////////////////////////
function sayHello(message){
	message.channel.send("", { files: ["/home/pi/qBot/hello.png"]}); //pastes hello image
}

function showSteamHelp(channel){
	client.channels.cache.get(channel).send("", { files: ["/home/pi/qBot/steamhelp.png"]}); //pastes Steam account help image
}

function pasteEmoji(){
	return '<:SSSstar:597057563770748928>' // Generic - return server-specific emoji
}

///////////////////////////////////////////
////////////////////////// TWITCH STUFF
///////////////////////////////////////////
function showTwitchImage(message){ // Take entire message info as argument
        console.log(ReturnDate()+" [INFO] Started showTwitchImage()");
        const { exec } = require('child_process');
        exec('python3 /home/pi/twitchinfo/getInfo.py', (err, stdout, stderr) => { //Run python script
                if (err) {
                        console.log(ReturnDate()+" [ERROR] Error generatic Twitch image.");
                        message.channel.send("Error generating Twitch image."); //Send response to message's channel in case of error
                } else {
                        console.log(ReturnDate()+" [INFO] Launched Twitch getInfo.py successfully.");
                        message.channel.send("", { files: ["/home/pi/twitchinfo/twitchInfo.png"]}); //If successful, paste Twitch image on the same channel as message
                }
        });
}


function addTwitchUser(input, message){ //Take message and its first argument
        console.log(ReleaseDate()+" [INFO] Started showTwitchImage()");
        const { exec } = require('child_process');
        exec('/home/pi/twitchinfo/addTwitch.sh '+input, (err, stdout, stderr) => { //Run Python script with the taken argument
                if (err) {
                        console.log(ReturnDate()+" [ERROR] Error adding a new twitch user, it might already exist - argument: "+input); // Error
                        message.channel.send("Error adding a new Twitch user - it might already exist."); 
                } else {
                        console.log(ReturnDate()+" [INFO] Added new twitch user - "+input); // Adding successful
			message.channel.send("Added a new Twitch user: "+input);
                }
        });

}

function removeTwitchUser(input, message){ //Taken message and its first argument
        console.log(ReturnDate()+" [INFO] Started remove Twitch User()");
        const { exec } = require('child_process');
        exec('/home/pi/twitchinfo/removeTwitch.sh '+input, (err, stdout, stderr) => {
                if (err) {
                        console.log(ReturnDate()+" [ERROR] Error removing a twitch user - "+input); // Error
                        message.channel.send("Error removing a new Twitch user - it might not exist.");
                } else {
                        console.log(ReturnDate()+" [INFO] Removed Twitch user - "+input); //Success
                        message.channel.send("Removed a Twitch user: "+input);
                }
        });

}

///////////////////////////////////////////
////////////////////////// GAME PRICE STUFF
///////////////////////////////////////////

function getGamePrice(args, message){ //take all arguments and the message
        console.log("Started getGamePrice()");
        const { exec } = require('child_process');
        exec('python3 /home/pi/gameprice/getPrice.py "'+args+'"', (err, stdout, stderr) => { //Put all arguments within ' ' and run Python script with it
                if (err) {
                        console.log(ReturnDate()+" [ERROR] Error checking price for args: "+args)
                        message.channel.send("Error checking price.");  //Inform about the error in a message
                } else {
                        console.log(ReturnDate()+" [INFO] Checking price - "+args);
                        content = stdout.split("\n");
						message.channel.send(content, { files: ["/home/pi/gameprice/price.png"]}); //Paste image with price if PYthon script was successful
            }
        });

}
///////////////////////////////////////////
////////////////////////// SCHEDULED CRON JOBS
///////////////////////////////////////////
function enableCronJobs(){
	console.log(ReturnDate()+" [INFO] Enabling Cron Jobs");
	// Every thursday at 17:00 and 30 seconds
	cron.schedule("30 00 17 * * 4", function(){
		console.log("Run schedule - show releases...");
		// fresh releases
		showReleasesImageToChannel("787465529984155658","new");//890640686947381258","new");
		// upcoming releases
		showReleasesImageToChannel("787465529984155658","month");//890640686947381258","month");
	});
	
}

///////////////////////////////////////////
////////////////////////// SLAV MOST PLAYED GAMES 1
///////////////////////////////////////////

// Show SlavTop - most played games
function getSlavTopImage(message){
	console.log(ReturnDate()+" [INFO] Get SLAV TOP image");
	message.channel.send("", { files: ["/home/pi/steamsumup/latest-slav-top.png"]}); // Sends an image with most played games
	// .... and sends a text info regarding how to add your account to calculations:
	message.channel.send(pasteEmoji()+" This list sums up gametimes for all willing participants "+pasteEmoji()+"\n"+pasteEmoji()+" To add yourself to the Slav list just type \!addsteam YOUR_STEAM_PROFILE_URL, ex. !addsteam <https://steamcommunity.com/id/vyqe> "+pasteEmoji()+"\n"+pasteEmoji()+" Current Slav list can be viewed by typing !showslavs "+pasteEmoji());
}

//Show Slavs - list of participants
function showSlavsImage(message){
        console.log(ReturnDate()+" [INFO] Started showSlavsImage()");
        const { exec } = require('child_process');
        exec('python3 /home/pi/steamsumup/generateImageProfiles.py', (err, stdout, stderr) => { //Run Python script
                if (err) {
                        console.log(ReturnDate()+" [ERROR] Error generating SlavTop participants image.");
                        message.channel.send("Error generating profiles image."); // Inform about error
                } else {
                        console.log(ReturnDate()+" [INFO] Launched showTop.py");
						message.channel.send("", { files: ["/home/pi/steamsumup/current-slavs.png"]}); //Success = paste image
                }
        });
}

///////////////////////////////////////////
////////////////////////// ANTHEM
///////////////////////////////////////////

function pasteAnthemImage(message){
	console.log("Pasting Anthem.");
	message.channel.send("", { files: ["/home/pi/qBot/sssanthem.png"]}); //Just paste an image
}

///////////////////////////////////////////
////////////////////////// NEW RELEASES STUFF
///////////////////////////////////////////

function showReleasesImage(message, which){
	console.log(ReturnDate()+" [INFO] Showing Releases Image");
	message.channel.send("", { files: ["/home/pi/newreleases/"+which+"-eng.png"]}); // Just paste chosen image as a response
}

function showReleasesImageToChannel(toChannel, which){
	console.log(ReturnDate()+" [INFO] Sending newreleases ("+which+" to channel ID: "+toChannel+"...");
	client.channels.cache.get(toChannel).send("", { files: ["/home/pi/newreleases/"+which+"-eng.png"]}); // Paste chosen image to channel in the parameter
}

///////////////////////////////////////////
//////////////////////////  SLAV MOST PLAYED STUFF 2
/////////////////////////////////////////// 
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
			message.channel.send(buildTable(`${stdout}`, 4, 26));
			message.channel.send(pasteEmoji()+" This list sums up gametimes for all willing participants "+pasteEmoji()+"\n"+pasteEmoji()+" To add yourself to the Slav list just type \!addsteam YOUR_STEAM_PROFILE_URL, ex. !addsteam <https://steamcommunity.com/id/vyqe> "+pasteEmoji()+"\n"+pasteEmoji()+" Current Slav list can be viewed by typing !showslavs "+pasteEmoji());
		}
	});
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
	input = input.replace("http://","");
	input = input.replace("https://","");
	input = input.replace(";","");
	input = input.replace("\"","");
	input = input.replace("\'","");
	input = input.replace("\`","");
	input = input.replace("\\","");
	input = input.replace(" ","");
	input = input.split("/");
	const { exec } = require('child_process');
	exec('/home/pi/qBot/addsteam.sh '+input+" "+auth.dbuser+" "+auth.dbpass, (err, stdout, stderr) => {
		if (err) {
			console.error(err);
			message.channel.send("Error adding ID");
		} else {
			console.log(`stdout: ${stdout}`);
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
///////////////////////////////////////////
//////////////////////////  POTATO 
///////////////////////////////////////////
function sendPotato(message){
	random = Math.floor(Math.random() * 5) + 1;
	console.log(ReturnDate()+" [INFO] Sending a potato.");
	message.channel.send("", { files: ["/home/pi/ziemniaki/ziemniak" + random + ".png"]});
}

///////////////////////////////////////////
////////////////////////// GAME RELEASES STUFF
///////////////////////////////////////////

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
////////////////////////// VOTE TOOL //////////////////////////

function ReturnDate(){
	d = new Date();
	year = d.getFullYear();
	month = d.getMonth() + 1;
	if(month < 10){
		month = "0" + month;
	}
	day = d.getDate();
	if(day < 10){
		day = "0" + day;
	}
	hours = d.getHours();
	if(hours < 10){
		hours ="0" + hours;
	}
	minutes = d.getMinutes();
	if(minutes < 10){
		minutes = "0" + minutes;
	}
	seconds = d.getSeconds();
	if(seconds < 10){
		seconds = "0" + seconds;
	}
	return "["+year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds+"]";
}

function createVotingMessage(message){
	if(message.author.id == "300339016312553473" || message.author.id == "472290226707103774"){ //paszq or vyqe
		votingEntry = message.guild.channels.cache.find(ch => ch.name === '⭐-toplist-shite').send(message.content.substr(7)).then(sent => {
			//votingEntry = message.channel.send(message.content.substr(7)).then(sent => { // 'sent' is that message you just sent
			let id = sent.id;
			console.log(id);
			//client.channels.cache.get("890362452833873924").messages.fetch(id).react("👍");
			const channel = message.guild.channels.cache.find(ch => ch.name === '⭐-toplist-shite'); //voting channel name
		        channel.messages.fetch(id).then(rrmsg => {
				rrmsg.react("♻️"); 	
				rrmsg.react("1️⃣");
				rrmsg.react("2️⃣");
				rrmsg.react("3️⃣");
				rrmsg.react("4️⃣");
				rrmsg.react("5️⃣");
				const { exec } = require('child_process');
				exec('python3 /home/pi/qBot/votes/addVotePost.py '+id+'', (err, stdout, stderr) => {
					if (err) { console.log(ReturnDate()+"[ERROR] [CreateVote] id: "+id); }
					else {
						console.log(ReturnDate()+"[INFO] [CreateVote] Added vote post: "+id);
					}
				});
			}); 
		});
		console.log(ReturnDate()+ "[INFO] [CreateVote] Voting entry created.");
	}
}

function getMessageReactions(message){
	//channelID = "890362452833873924";
	//channelID = "926880936497414144";
	channelID = "926975700517417011";
	messageID = "921783763678167110";
	emoji = ("3️⃣");
	console.log("GetMessageReactions 0");
	//var getReactedUsers = async(message, channelID, messageID, emoji) => {
	let cacheChannel = message.guild.channels.cache.get(channelID); 
	console.log("GetMessageReactions 1");
	if(cacheChannel){
		console.log("GetMessageReactions 2");
		cacheChannel.messages.fetch(messageID).then(reactionMessage => {
			console.log("GetMessageReactions 3 MESSAGE");
			console.log(reactionMessage.content);
			contentText = reactionMessage.content;
			emojis = [ "♻️", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣" ];
			//for(i = 0; i < emojis.length; i++){
			/*	
			console.log(" - "+emojis);
			console.log(reactionMessage.reactions);
			console.log("----");
			console.log(reactionMessage.reactions.length);
			console.log("----");
			console.log(reactionMessage.reactions.cache.length);
			console.log("----");
			console.log(reactionMessage.reactions.ReactionUserManager);
			*/
			reactionMessage.reactions.resolve("♻️").users.fetch().then(userList => {
				userList.forEach(element => {
					if(element.id != "890360407695425536"){
						console.log("♻️ - "+element.id);
						const { exec } = require('child_process');
						exec('python3 /home/pi/qBot/votes/addReaction.py R '+element.id+' "'+reactionMessage.content+'"', (err, stdout, stderr) => {
							if (err) { console.error(err); }
							else {
								console.log("Added reaction R");
							}
						});
						reactionMessage.reactions.resolve("♻️").users.remove(element.id);
					}
				})
			});

			reactionMessage.reactions.resolve("1️⃣").users.fetch().then(userList => {
				//console.log("GetMessageReactions 4");
				userList.forEach(element => {
					if(element.id != "890360407695425536"){
						console.log("1️⃣ - "+element.id);
						const { exec } = require('child_process');
						exec('python3 /home/pi/qBot/votes/addReaction.py 1 '+element.id+' "'+reactionMessage.content+'"', (err, stdout, stderr) => {
							if (err) { console.error(err); }
							else {
								console.log("Added reaction 1");
							}
						});
						//console.log(userList.map((user) => user.id));
						reactionMessage.reactions.resolve("1️⃣").users.remove(element.id);
					}
				})
			});
			
			reactionMessage.reactions.resolve("2️⃣").users.fetch().then(userList => {
				//console.log("GetMessageReactions 4");
				userList.forEach(element => {
					if(element.id != "890360407695425536"){
						console.log("2️⃣ - "+element.id);
						const { exec } = require('child_process');
						exec('python3 /home/pi/qBot/votes/addReaction.py 2 '+element.id+' "'+reactionMessage.content+'"', (err, stdout, stderr) => {
							if (err) { console.error(err); }
							else {
								console.log("Added reaction 2");
							}
						});
						//const msg = await channel.messages.fetch(MessageID);
						reactionMessage.reactions.resolve("2️⃣").users.remove(element.id);
					}
				})
			});

			reactionMessage.reactions.resolve("3️⃣").users.fetch().then(userList => {
				//console.log("GetMessageReactions 4");
				userList.forEach(element => {
					if(element.id != "890360407695425536"){
						console.log("3️⃣ - "+element.id);
						const { exec } = require('child_process');
						exec('python3 /home/pi/qBot/votes/addReaction.py 3 '+element.id+' "'+reactionMessage.content+'"', (err, stdout, stderr) => {
							if (err) { console.error(err); }
							else {
								console.log("Added reaction 3");
							}
						});
						reactionMessage.reactions.resolve("3️⃣").users.remove(element.id);
					}
				})
			});
			
			reactionMessage.reactions.resolve("4️⃣").users.fetch().then(userList => {
				//console.log("GetMessageReactions 4");
				userList.forEach(element => {
					if(element.id != "890360407695425536"){
						console.log("4️⃣ - "+element.id);
						const { exec } = require('child_process');
						exec('python3 /home/pi/qBot/votes/addReaction.py 4 '+element.id+' "'+reactionMessage.content+'"', (err, stdout, stderr) => {
							if (err) { console.error(err); }
							else {
								console.log("Added reaction 4");
							}
						});
						reactionMessage.reactions.resolve("4️⃣").users.remove(element.id);
					}
				})
			});
			reactionMessage.reactions.resolve("5️⃣").users.fetch().then(userList => {
				//console.log("GetMessageReactions 4");
				userList.forEach(element => {
					if(element.id != "890360407695425536"){
						console.log("5️⃣ - "+element.id);
						const { exec } = require('child_process');
						exec('python3 /home/pi/qBot/votes/addReaction.py 5 '+element.id+' "'+reactionMessage.content+'"', (err, stdout, stderr) => {
							if (err) { console.error(err); }
							else {
								console.log("Added reaction 5");
							}
						});
						reactionMessage.reactions.resolve("5️⃣").users.remove(element.id);
					}
				})
			});
			//}
		});
	}
	//}
}
////////////////////

function loadVotePosts(){
	console.log(ReturnDate()+" [INFO] [LoadVote] Loading vote posts...");
	var fs = require('fs');
	var array = fs.readFileSync('/home/pi/qBot/votes/voteposts.csv').toString().split("\n");
	const channel = client.channels.cache.get("926975700517417011"); //Toplist Shite channel, TestServer: 926880936497414144");
	
	for(i in array) {
		if(array[i] != ''){
			channel.messages.fetch(array[i]).then(message => message.react("♻️"));
			channel.messages.fetch(array[i]).then(message => message.react("1️⃣"));
			channel.messages.fetch(array[i]).then(message => message.react("2️⃣"));
			channel.messages.fetch(array[i]).then(message => message.react("3️⃣"));
			channel.messages.fetch(array[i]).then(message => message.react("4️⃣"));
			channel.messages.fetch(array[i]).then(message => message.react("5️⃣"));
		}
	}
	for(i in array) {		
		if(array[i] != ''){
			channel.messages.fetch(array[i])
			.then(message => {
				message.reactions.resolve("♻️").users.fetch().then(userList => {
					userList.forEach(element => {
						if(element.id != "890360407695425536"){
							console.log(ReturnDate()+" [INFO] [LoadVote] i: "+i+" | Found reaction 'R' from user ID: "+element.id+" for "+message.content+" - removing.");
							message.reactions.resolve("♻️").users.remove(element);
							saveVote(element.id,message.content, 'R');
						}
					});
				});

				message.reactions.resolve("1️⃣").users.fetch().then(userList => {
				userList.forEach(element => {
					if(element.id != "890360407695425536"){
						console.log(ReturnDate()+" [INFO] [LoadVote] i: "+i+" | Found reaction '1' from user ID: "+element.id+" for "+message.content+" - removing.");
						message.reactions.resolve("1️⃣").users.remove(element);
						saveVote(element.id, message.content, '1');
					}
				});
				});
				
				message.reactions.resolve("2️⃣").users.fetch().then(userList => {
				userList.forEach(element => {
					if(element.id != "890360407695425536"){
						console.log(ReturnDate()+" [INFO] [LoadVote] Found reaction '2' from user ID: "+element.id+" for "+message.content+" - removing.");
						message.reactions.resolve("2️⃣").users.remove(element);
						saveVote(element.id, message.content, '2');
					}
				});
				});
				
                                message.reactions.resolve("3️⃣").users.fetch().then(userList => {
                                userList.forEach(element => {
                                        if(element.id != "890360407695425536"){
                                                console.log(ReturnDate()+" [INFO] [LoadVote] Found reaction '3' from user ID: "+element.id+" for "+message.content+" - removing.");
                                                message.reactions.resolve("3️⃣").users.remove(element);
                                                saveVote(element.id, message.content, '3');
                                        }
                                });
                                });
				
                                message.reactions.resolve("4️⃣").users.fetch().then(userList => {
                                userList.forEach(element => {
                                        if(element.id != "890360407695425536"){
                                                console.log(ReturnDate()+" [INFO] [LoadVote] Found reaction '4' from user ID: "+element.id+" for "+message.content+" - removing.");
                                                message.reactions.resolve("4️⃣").users.remove(element);
                                                saveVote(element.id, message.content, '4');
                                        }
                                });
                                });
				
                                message.reactions.resolve("5️⃣").users.fetch().then(userList => {
                                userList.forEach(element => {
                                        if(element.id != "890360407695425536"){
                                                console.log(ReturnDate()+" [INFO] [LoadVote] Found reaction '5' from user ID: "+element.id+" for "+message.content+" - removing.");
                                                message.reactions.resolve("5️⃣").users.remove(element);
                                                saveVote(element.id, message.content, '5');
                                        }
                                });
                                });
			})
			.catch(i+" -> "+array[i]+" -> [ERROR] Message not found.");
		}
	}
}

function saveVote(userId, entryName, vote){
	if(userId == 890360407695425536){
		console.log(ReturnDate()+" [INFO] [SaveVote] Bot entry ignored.");
		return true;
	}
	const { exec } = require('child_process');
	exec('python3 /home/pi/qBot/votes/addReaction.py '+vote+' '+userId+' "'+entryName+'"', (err, stdout, stderr) => {
		if (err) {
			console.log(ReturnDate()+" [ERROR] [SaveVote] Vote "+vote+" | userID: "+userId+" | entryName "+entryName);
		}
		else {
			console.log(ReturnDate()+" [INFO] [SaveVote] Added reaction "+vote+" for user "+userId+" for entry: "+entryName);
		}
	});
}

client.on('messageReactionAdd', (reaction, user) => {
	console.log(ReturnDate()+' [INFO] [Reaction add] UserID: '+user.id+" | Message: "+reaction.message.content+" | MsgID: "+reaction.message.id+" | EmojiName: "+reaction.emoji.name);
	const { exec } = require('child_process');
	exec('python3 /home/pi/qBot/votes/checkVotePosts.py '+reaction.message.id+'', (err, stdout, stderr) => {
		if (!stdout.includes("Found")){
			console.log(ReturnDate()+"[INFO] [Reaction add] MsgID: "+reaction.message.id+" | Wrong message, ignoring.");
			return null;
		}
		if (user.id == "890360407695425536") return null;
		switch (reaction.emoji.name) {
		case "1️⃣":
			saveVote(user.id, reaction.message.content, 1);
			reaction.message.reactions.resolve("1️⃣").users.remove(user);
			break;
		case "2️⃣":
			saveVote(user.id, reaction.message.content, 2);
			reaction.message.reactions.resolve("2️⃣").users.remove(user);
			break;
		case "3️⃣":
			saveVote(user.id, reaction.message.content, 3);
			reaction.message.reactions.resolve("3️⃣").users.remove(user);
			break;
		case "4️⃣":
			saveVote(user.id, reaction.message.content, 4);
			reaction.message.reactions.resolve("4️⃣").users.remove(user);
			break;
		case "5️⃣":
			saveVote(user.id, reaction.message.content, 5);
			reaction.message.reactions.resolve("5️⃣").users.remove(user);
			break;
		default:
			// in case you want to log when they don't reply with the correct emoji.
			break;
		}
	});
});


///////////////////////////////////////////
////////////////////////// TABLE BUILDER GENERIC
///////////////////////////////////////////

// It takes input array and sends a message with a formatted table.
// Old solution, for text-based responses. Bot is using image generation now mostly.
function buildTable(inputArray, maxWidth, maxRows) {
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
	    //console.log(inputArray[y]);
            console.log("[ Y " + y + " ][ Z " + z + " ] CS[Z].length [ " + columnSplit[z].length + " ] colLength[z] " + colLength[z] + " ||| "+inputArray[y]);
            if (columnSplit[z].length > colLength[z]) {
                colLength[z] = columnSplit[z].length;
            }
        }
    }
	console.log("-------------------------------------");
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
            finalString += "█";
        }
        finalString += "\n";
    }
    finalString += "\n```"
    console.log(finalString);
    return finalString;
}

///////////////////////////////////////////
//////////////////////////  LOGIN 
///////////////////////////////////////////
client.login(auth.token);
