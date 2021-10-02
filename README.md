# 4ptictactoe
Online version of 4 player tic tac toe, played in a 5x5 board

- Players places their character one at a time. 
- Win condition: place 3 of your characters in a row, column or diagonal
- When each player wins, they stop playing for that round and get placement points:
    - First place: 3 points 
    - Second place: 2 points
    - Third place: 1 point
    - Fourth place: 0 points
- In the event of a draw, the remaining players get 1 point each
- The player who starts can't place in the center square in the first turn
- The move order rotates every round:
    - The first player to move will be the last in the next round;
    - The second player to move will be the first in the next round;
    - The third player to move will be the second in the next round;
    - The last player to move will be the third in the next round;
