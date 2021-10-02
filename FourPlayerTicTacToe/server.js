
//express code
var express = require('express');
var app = express();
var server = app.listen(3200, () => {
  console.log("Server running on port 3200");
})

app.use(express.static('public'));




//sockets code
var sockets = require('socket.io');
var io = sockets(server);

var players = [];

io.on('connection', newConnection);

//communication-handling functions

function newConnection(thisUser){
  io.to(thisUser.id).emit('hasGottenSuggestion');

  thisUser.on('hasGottenSuggestion', function(hasGottenSuggestion) {
    if(!hasGottenSuggestion){
      io.to(thisUser.id).emit('suggestion', getSuggestion(thisUser.id));
    }
  });

  thisUser.on('enter', enter);

  function enter(data){
    suggestionsGiven--;
    removeSuggestionObject(thisUser.id);
    console.log("SuggestionsGiven: "+suggestionsGiven);
    enterGame(thisUser, data.name, data.color, data.char);
  }

  thisUser.on('disconnect', (reason) => {
    if(removeSuggestionObject(thisUser.id)){
      suggestionsGiven--;
      thisUser.viewingSuggestion = false;
      console.log("SuggestionsGiven: "+suggestionsGiven);
    }
  });

}

function enterGame(thisUser, name, color, char){
  if(getPlayer(thisUser.id) == -1){
    players.push(thisUser);
    var playerPosition = getPlayer(thisUser.id);
    playerNames[playerPosition] = name;
    playerColors[playerPosition] = color;
    playerChars[playerPosition] = char;
    console.log("New player: "+playerPosition+" - "+thisUser.id);
  }

  emitData(-1);




  thisUser.on('move', function(data){
    if(!move(data.pos, getPlayer(thisUser.id))){
      io.to(thisUser.id).emit('move-rejected');
    } else{
      var data2 = {
        pos: data.pos,
        player: getPlayer(thisUser.id),
        nextMove: currentMove
      }
      io.emit('moved', data2);
    }
  });




  thisUser.on('disconnect', (reason) => {
    console.log("Player " + getPlayer(thisUser.id) + " disconnected (" + thisUser.id + ")");
    players.splice(getPlayer(thisUser.id), 1);

    printPlayers();
    restart();
    io.emit('restart');
  });

  thisUser.on('getWinConds', () => {
    io.to(thisUser.id).emit('getWinConds', calculateWinConditions());
  });

  thisUser.on('getWinConds2', () => {
    io.to(thisUser.id).emit('getWinConds', winConditions);
  });

  thisUser.on('data', () => {
    emitData(getPlayer(thisUser.id));
  });

  thisUser.on('startNewGame', startNewGame);

  thisUser.on('admin', admin);

}


function emitFinish(isTie){
  var data = {
    winOrder: winOrder,
    tie: isTie
  };
  emitData(-1);
  io.emit('finish', data);
}


function emitData(player){
  var data = getData();
  if(player == -1){
    for(var i = 0; i < players.length; i++){
      data.me = i;
      io.to(players[i].id).emit('data', data);
    }
  } else {
    data.me = player;
    io.to(players[player].id).emit('data', data);
  }
}







//player-management functions

function getPlayer(id){
  for(var i = 0; i < players.length; i++){
    if(players[i].id == id){
      return i;
    }
  }
  return -1;
}

function printPlayers(){
  console.log();
  console.log("Players:");
  for(var i = 0; i < players.length; i++){
    console.log("Player "+i+": "+players[i].id);
  }
  console.log();
}



var suggestionsGiven = 0;
var suggestionObjects = [];

function getSuggestion(id){
  var ind = players.length + suggestionsGiven;
  var name = "Player " + ind;
  var char = getCharSuggestion(ind);
  var color = getColorSuggestion(ind);
  var data = {
    name: name,
    char: char,
    color: color,
    id: id
  }

  suggestionsGiven++;
  suggestionObjects.push(data);
  console.log("SuggestionsGiven: "+suggestionsGiven);

  return data;
}

function getCharSuggestion(ind){
  var basicChars = ["X", "O", "A", "B"];
  for(var i = ind; i < ind+4; i++){
    var i2 = i%4;
    var tempBoolCS = true;
    for(var j = 0; j < players.length && j < 4; j++){
      if(playerChars[j] == basicChars[i2]) {
        tempBoolCS = false;
      }
    }
    for(var j = 0; j < suggestionObjects.length; j++){
      if(suggestionObjects[j].char == basicChars[i2]){
        tempBoolCS = false;
      }
    }
    if(tempBoolCS) return basicChars[i2];
  }
  return "";
}

function getColorSuggestion(ind){
  var basicColors = ["red", "blue", "green", "orange"];
  for(var i = ind; i < ind+4; i++){
    var i2 = i%4;
    var tempBoolCS = true;
    for(var j = 0; j < players.length && j < 4; j++){
      if(playerColors[j] == basicColors[i2]) {
        tempBoolCS = false;
      }
    }
    for(var j = 0; j < suggestionObjects.length; j++){
      if(suggestionObjects[j].color == basicColors[i2]){
        tempBoolCS = false;
      }
    }
    if(tempBoolCS) return basicColors[i2];
  }
  return "";
}

function removeSuggestionObject(id){
  for(var i = 0; i < suggestionObjects.length; i++){
    if(suggestionObjects[i].id == id){
      suggestionObjects.splice(i, 1);
      return true;
    }
  }
  return false;
}



//multi-game code

var overallPoints;
var nextFirstMove;
var playerNames = ["Player 0", "Player 1", "Player 2", "Player 3"];
var playerChars = ["X", "O", "A", "B"]; //π
var playerColors = ["red", "blue", "green", "orange"];
var gameIsGoing;

function reset(){
  overallPoints = [0, 0, 0, 0];
  nextFirstMove = 0;
  restart();
  emitData(-1);
}



function finish(isTie){
  gameIsGoing = false;
  for(var i = 0; i < 4; i++){
    if(winOrder[i] == -1){
      for(var j = 0; j < 4; j++){
        if(roundPoints[j] == -1){
          roundPoints[j] = 1;
        }
      }
    } else {
      roundPoints[winOrder[i]] = 3-i;
    }
  }
  for(var i = 0; i < 4; i++){
    overallPoints[i] += roundPoints[i];
  }
  emitFinish(isTie);
}



function startNewGame(){
  io.emit('startNewGame');
  nextFirstMove++;
  nextFirstMove %= 4;
  restart();
  emitData(-1);
}





//game-handling code


var board;
var playerScores;
var currentMove;
var winConditions;
var playing;
var winOrder;
var roundPoints;
var firstMove;
reset();

function resetBoard(){
  board = [];
  for(var i = 0; i < 25; i++){
    board.push(-1);
  }
}

function isAvailable(pos){
  if(firstMove && pos == 12) return false;
  if(board[pos] == -1) return true;
  return false;
}

function move(pos, player){
  if(gameIsGoing && currentMove == player){
    if(isAvailable(pos)){
      board[pos] = player;
      addScore(pos, player);
      toggleMove();
      checkEnd();
      firstMove = false;
      return true;
    }
  }
  return false;
}

function addScore(pos, player){
  playerScores[player] += Math.pow(2, pos);
}

function toggleMove(){
  currentMove++;
  currentMove %= 4;
  if(playing[currentMove] == 0){
    toggleMove();
  }
}


//checking for winning

function checkEnd(){
  for(var i = 0; i < 4; i++){
    if(playing[i] && checkWin(i)){
      end(i);
    }
  }
  if(checkTie() && gameIsGoing){
    end(-1);
  }
}

function checkWin(player){
  var score = playerScores[player];
  for(var i = 0; i < winConditions.length; i++){
    if((score&winConditions[i]) == winConditions[i]){
      return true;
    }
  }
  return false;
}

function checkTie(){
  if((playerScores[0] + playerScores[1] + playerScores[2] + playerScores[3]) == 33554431) return true;
  return false;
}

function end(result){
  if(result >= 0){
    setPlayingFalse(result);
    addWon(result);
    emitData(-1);
    checkFinished();
  } else if(result == -1){
    finish(true);
  }
}

function setPlayingFalse(player){
  playing[player] = 0;
}

function getPlayersPlaying(){
  return (playing[0] + playing[1] + playing[2] + playing[3]);
}

function addWon(player){
  if(winOrder[0] == -1) winOrder[0] = player;
  else if(winOrder[1] == -1) winOrder[1] = player;
  else if(winOrder[2] == -1) winOrder[2] = player;
  else if(winOrder[3] == -1) winOrder[3] = player;
}

function checkFinished(){
  if(getPlayersPlaying() == 1){
    if(playing[0] == 1) winOrder[3] = 0;
    else if(playing[1] == 1) winOrder[3] = 1;
    else if(playing[2] == 1) winOrder[3] = 2;
    else if(playing[3] == 1) winOrder[3] = 3;
    finish(false);
  }
}




//data-managing

function getData(){
  var data = {
    overallPoints: overallPoints,
    playerNames: playerNames,
    playerChars: playerChars,
    playerColors: playerColors,
    board: board,
    currentMove: currentMove,
    playing: playing,
    winOrder: winOrder,
    firstMove: firstMove
  }
  return data;
}


function restart(){
  resetBoard();
  playerScores = [0, 0, 0, 0];
  currentMove = nextFirstMove;
  setupWinConditions();
  playing = [1, 1, 1, 1];
  winOrder = [-1, -1, -1, -1];
  roundPoints = [-1, -1, -1, -1];
  gameIsGoing = true;
  firstMove = true;
}

function points(pos){
  return Math.pow(2, pos);
}










//admin functions

function admin(data){
  if(data.password == "feijooa"){
    switch (data.command) {
      case "setPlayerNames" :
        adminSetPlayerNames(data.string);
        break;
      case "setPlayerColors" :
        adminSetPlayerColors(data.string);
        break;
      case "setPlayerChars" :
        adminSetPlayerChars(data.string);
        break;
      case "setPoints" :
        adminSetPoints(data.string);
        break;
      case "setCurrentMove" :
        adminSetCurrentMove(data.string);
        break;
      case "setBoardPosition" :
        adminSetBoardPosition(data.string);
        break;
      case "setPlayerOrder" :
        adminSetPlayerOrder(data.string);
        break;
      case "get" :
        adminGet(data.string);
        break;
    }
  }
}

function adminSetPlayerNames(string){
  var namesArray = string.split(",");
  for(var i = 0; i < 4; i++){
    playerNames[i] = namesArray[i];
  }
  emitData(-1);
}

function adminSetPlayerColors(string){
  var colorsArray = string.split(",");
  for(var i = 0; i < 4; i++){
    playerColors[i] = colorsArray[i];
  }
  emitData(-1);
}

function adminSetPlayerChars(string){
  var charsArray = string.split(",");
  for(var i = 0; i < 4; i++){
    playerChars[i] = getCharViaCommand(charsArray[i]);
  }
  emitData(-1);
}

function adminSetPoints(string){
  var pointsArray = string.split(",");
  for(var i = 0; i < 4; i++){
    var pointss = parseInt(pointsArray[i]);
    overallPoints[i] = pointss;
  }
  emitData(-1);
}

function adminSetCurrentMove(string){
  var cur = parseInt(string);
  currentMove = cur;
  emitData(-1);
}

function adminSetBoardPosition(string){
  var array = string.split(",");
  var pos = parseInt(array[0]);
  var player = parseInt(array[1]);
  if(pos >= 0 && pos <= 24 && player > -2 && player < 4){
    board[pos] = player;
  }
  emitData(-1);
}

function adminSetPlayerOrder(string){
  var orders = string.split(" -> ");
  if(orders.length == 2 && orders[0] == "0,1,2,3"){
    var after = orders[1].split(",");
    if(after.length == 4 && arrayIsAllDiffPlayers(after)){
      // var nextPlayers = [];
      // nextPlayers[0] = players[parseInt(after[0])];
      // nextPlayers[1] = players[parseInt(after[1])];
      // nextPlayers[2] = players[parseInt(after[2])];
      // nextPlayers[3] = players[parseInt(after[3])];
      // players[0] = nextPlayers[0];
      // players[1] = nextPlayers[1];
      // players[2] = nextPlayers[2];
      // players[3] = nextPlayers[3];
      players = reorderArray(players, after);
      playerNames = reorderArray(playerNames, after);
      playerChars = reorderArray(playerChars, after);
      playerColors = reorderArray(playerColors, after);
    }
  }
  emitData(-1);
}

function adminGet(string){
  if(string == "playerScores"){
    return playerScores;
  } else if(string == "winOrder"){
    return winOrder;
  } else if(string == "nextFirstMove"){
    return (nextFirstMove + 1)%4;
  } else {
    return null;
  }

}





function reorderArray(array, order){
  if(array.length != order.length) return array;
  var tempArray = [];
  for(var i = 0; i < order.length; i++){
    tempArray[i] = array[parseInt(order[i])];
  }
  return tempArray;
}

function arrayIsAllDiffPlayers(array){
  if(!arrayIsAllPlayers(array)){
    return false;
  }
  var tempArray = [0, 0, 0, 0];
  for(var i = 0; i < array.length; i++){
    if(!tempArray[parseInt(array[i])] == 0){
      return false;
    }
    tempArray[parseInt(array[i])]++;
  }
  return true;
}

function arrayIsAllPlayers(array){
  for(var i = 0; i < array.length; i++){
    if(!isPlayer(array[i])){
      return false;
    }
  }
  return true;
}

function isPlayer(number){
  return (number >= 0 && number <= 3);
}


function getCharViaCommand(command){
  var char = "";
  var passed = true;
  switch(command){
    case "pi" :
      char = "π";
      break;

    case "espadas" :
      char = "♠️";
      break;

    case "copas" :
      char = "♥️";
      break;

    case "ouros" :
      char = "♦️";
      break;

    case "paus" :
      char = "♣️";
      break;

    case "radioactive" :
      char = "☢️";
      break;

    case "biohazard" :
      char = "☣️";
      break;

    default :
      passed = false;
      break;
  }
  if(!passed){
    for(var i = 0; i < command.length; i++){
      if(command.charAt(i) != " "){
        char = command.charAt(i);
        break;
      }
    }
  }
  return char;
}





//functions for getting win conditions

function setupWinConditions(){
  winConditions = [];

  //vertical
  winConditions.push(7);
  winConditions.push(14);
  winConditions.push(28);
  winConditions.push(224);
  winConditions.push(448);
  winConditions.push(896);
  winConditions.push(7168);
  winConditions.push(14336);
  winConditions.push(28672);
  winConditions.push(229376);
  winConditions.push(458752);
  winConditions.push(917504);
  winConditions.push(7340032);
  winConditions.push(14680064);
  winConditions.push(29360128);

  //horizontal
  winConditions.push(1057);
  winConditions.push(2114);
  winConditions.push(4228);
  winConditions.push(8456);
  winConditions.push(16912);
  winConditions.push(33824);
  winConditions.push(67648);
  winConditions.push(135296);
  winConditions.push(270592);
  winConditions.push(541184);
  winConditions.push(1082368);
  winConditions.push(2164736);
  winConditions.push(4329472);
  winConditions.push(8658944);
  winConditions.push(17317888);

  //diagonalFront
  winConditions.push(4161);
  winConditions.push(8322);
  winConditions.push(16644);
  winConditions.push(133152);
  winConditions.push(266304);
  winConditions.push(532608);
  winConditions.push(4260864);
  winConditions.push(8521728);
  winConditions.push(17043456);

  //diagonalBack
  winConditions.push(1092);
  winConditions.push(2184);
  winConditions.push(4368);
  winConditions.push(34944);
  winConditions.push(69888);
  winConditions.push(139776);
  winConditions.push(1118208);
  winConditions.push(2236416);
  winConditions.push(4472832);
}
