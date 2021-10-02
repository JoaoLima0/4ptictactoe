
function calculateWinConditions(){
  var tempTTT = [];
  winConditions = [];
  var winConditionsTest = {};
  var winConditionsTemp = [];

  //horizontal
  winConditionsTemp = [];
  for(var i = 0; i < 25; i++){
    if(i%5 < 3){
      var positions = [i, i+1, i+2];
      var condition = points(positions[0]) + points(positions[1]) + points(positions[2]);
      var stringRepres = positions[0] + ", " + (positions[1]) + ", " + (positions[2]);
      var stringRepres2 = points(positions[0]) + " + " + points(positions[1]) + " + " + points(positions[2]);
      var object = {
        value: condition,
        string: stringRepres,
        string2: stringRepres2,
        repres: getArrayRepresentation(positions[0], positions[1], positions[2])
      };
      winConditions.push(condition);
      tempTTT.push(object);
      winConditionsTemp.push(object);
    }
  }
  winConditionsTest.horizontal = winConditionsTemp;


  //vertical
  winConditionsTemp = [];
  for(var i = 0; i < 25; i++){
    if(i < 15){
      var positions = [i, i+5, i+10];
      var condition = points(positions[0]) + points(positions[1]) + points(positions[2]);
      var stringRepres = positions[0] + ", " + (positions[1]) + ", " + (positions[2]);
      var stringRepres2 = points(positions[0]) + " + " + points(positions[1]) + " + " + points(positions[2]);
      var object = {
        value: condition,
        string: stringRepres,
        string2: stringRepres2,
        repres: getArrayRepresentation(positions[0], positions[1], positions[2])
      };
      winConditions.push(condition);
      tempTTT.push(object);
      winConditionsTemp.push(object);
    }
  }
  winConditionsTest.vertical = winConditionsTemp;


  //diagonalFront
  winConditionsTemp = [];
  for(var i = 0; i < 25; i++){
    if(i < 15 && i%5 < 3){
      var positions = [i, i+6, i+12];
      var condition = points(positions[0]) + points(positions[1]) + points(positions[2]);
      var stringRepres = positions[0] + ", " + (positions[1]) + ", " + (positions[2]);
      var stringRepres2 = points(positions[0]) + " + " + points(positions[1]) + " + " + points(positions[2]);
      var object = {
        value: condition,
        string: stringRepres,
        string2: stringRepres2,
        repres: getArrayRepresentation(positions[0], positions[1], positions[2])
      };
      winConditions.push(condition);
      tempTTT.push(object);
      winConditionsTemp.push(object);
    }
  }
  winConditionsTest.diagonalFront = winConditionsTemp;


  //diagonalBack
  winConditionsTemp = [];
  for(var i = 0; i < 25; i++){
    if(i < 15 && i%5 > 1){
      var positions = [i, i+4, i+8];
      var condition = points(positions[0]) + points(positions[1]) + points(positions[2]);
      var stringRepres = positions[0] + ", " + (positions[1]) + ", " + (positions[2]);
      var stringRepres2 = points(positions[0]) + " + " + points(positions[1]) + " + " + points(positions[2]);
      var object = {
        value: condition,
        string: stringRepres,
        string2: stringRepres2,
        repres: getArrayRepresentation(positions[0], positions[1], positions[2])
      };
      winConditions.push(condition);
      tempTTT.push(object);
      winConditionsTemp.push(object);
    }
  }
  winConditionsTest.diagonalBack = winConditionsTemp;


  return tempTTT;
}

function getArrayRepresentation(a, b, c){
  var arrayTemp = [];
  for(var i = 0; i < 5; i++){
    var arrayTemp2 = [];
    for(var j = 0; j < 5; j++){
      arrayTemp2.push(0);
    }
    arrayTemp.push(arrayTemp2);
  }
  arrayTemp[(a-(a%5))/5][a%5] = 1;
  arrayTemp[(b-(b%5))/5][b%5] = 1;
  arrayTemp[(c-(c%5))/5][c%5] = 1;
  return arrayTemp;
}
