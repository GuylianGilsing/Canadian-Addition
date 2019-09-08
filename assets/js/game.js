/*

    --- Canadian Multiplication Game Logic ---
               By Guylian Gilsing.

*/

// Matrix of the playfield.
let fieldMatrix = [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 12, 14],
    [15, 16, 18, 20, 21, 24],
    [25, 27, 28, 30, 32, 35],
    [36, 40, 42, 45, 48, 49],
    [54, 56, 63, 64, 72, 81]
];

let chooseMatrix = [
    [7, 8, 9],
    [1, 2, 3, 4, 5, 6]
];

let playfield = document.querySelector("#game-field > .gamefield");
let choosefield = document.querySelector("#game-field > .gamefield.choose-field");
let chatMessagesContainer = document.querySelector("#game-chat > .messages");

let playCols = [];

// Game variables.

let turn = 0;

// Holds all of the taken fields by the players.
let takenFields = {
    'playerOne': [],
    'playerTwo': []
}

let chosenFields = [];
let lastChooseField = Node;

// NEW VARIABLES.

// Keeps track of all of the columns from both game fields.
let fieldColumns = {
    'gameField': {},
    'chooseField': {}
}

// Dictates if the game in the client is running.
let gameRunning = false;

// Keeps track of which browser is wich player.
let currentPlayer = undefined;

// Dictates how many times the user can choose a column per turn.
let chooseColumnAmmountInTurn = 0;

// Keeps track of the ammount of turns there already have been.
let currentTurn = 0;

// Keeps track of which player is currently active.
let currentPlayerActive = 0;

// Keeps track of which columns are selected by the player in a turn.
let chosenColumns = [];

// The name of the winning player get's save to this variable.
let playerWon = undefined;

let gameUI = {
    'player-active': document.querySelector("#game-ui.player-active"),
}

/*

    --- Initialization ---

*/

// Player one joins.
socket.on('playerOne', () => {
    currentPlayer = 'player-one';
    console.log(currentPlayer);
});

// Player two joins.
socket.on('playerTwo', () => {
    if(currentPlayer == undefined)
    {
        currentPlayer = 'player-two';
        console.log(currentPlayer);
    }
});

// All players are joined.
socket.on('allPlayersJoined', () => {
    playfield.classList.remove('hide');
    document.querySelector("#preloader.show").remove();
    GeneratePlayField();
    StartGame();
    currentPlayerActive = 1;
})

// Ends a turn.
socket.on('endTurn', (columns) => {
    UpdateInternalGameFieldColumns();
    console.log(columns);

    // Loop over the columns array and show the objects in the game and choose field.
    for(let i = 0; i < columns.length; i += 1)
    {
        let col = columns[i];

        if(columns.length > 1)
        {
            if(col.gameField == "choose-field" && i == 1)
            {
                let column = fieldColumns.chooseField['x' + col.x + 'y' + col.y];

                column.element.classList.add('chosen');
                column.element.classList.add(column.owner);
            }
        }
    }

    // Get the two selected column' numbers and calculate the sum of them.
    // After that we get the gamefield column that has the finalnumber.
    let finalNumber = columns[0].number * columns[1].number;
    for(let key in fieldColumns.gameField)
    {
        let col = fieldColumns.gameField[key];

        if(col.number == finalNumber)
        {
            col.element.classList.add('chosen');
            col.element.classList.add(columns[1].owner);
        }
    }

    if(CheckDraw(columns[1]) == false)
    {
        // Check any potential wins.
        if(CheckWin() == true)
        {
            socket.emit('winGame', currentPlayer);
        }
        else
        {
            // Prepare the new turn data.
            let playerActive = currentPlayerActive == 1 ? 'player-one' : 'player-two';

            let newTurnData = {
                'player': playerActive,
                'turns': currentTurn,
                'lastSelectedChooseColumn': columns[1]
            };

            if((currentPlayerActive == 1 && currentPlayer == 'player-one') || 
            (currentPlayerActive == 2 && currentPlayer == 'player-two')
            )
            {
                socket.emit('startNewTurn', newTurnData);
            }
        }
    }
    else
    {
        EndGame();
    }
});

socket.on('startNewTurn', (data) => {
    // Set the last selected choose column as the first chosen column,
    // this way we can calculate based on the last en new chosen columns.
    chosenColumns = [];
    chosenColumns[0] = data.lastSelectedChooseColumn;

    // Enable the game logic for the next player.
    chooseColumnAmmountInTurn = 1;
    currentPlayerActive = data.activePlayer;
    currentTurn = data.turns;

    // Loop over all of the choose columns and remove the chose classes.
    for(let key in fieldColumns.chooseField)
    {
        let col = fieldColumns.chooseField[key];
        col.element.classList.remove('chosen');
        col.element.classList.remove(data.player);
    }

    // Select the last chosen choose column.
    let lastChooseCol = fieldColumns.chooseField['x' + chosenColumns[0].x + 'y' + chosenColumns[0].y].element;
    lastChooseCol.classList.add('chosen');
    lastChooseCol.classList.add(data.player);

    // Change the choose column hover.
    let chooseFieldHoverClass = '';
    if(currentPlayerActive == 1)
        chooseFieldHoverClass = 'player-one-active';
    else
        chooseFieldHoverClass = 'player-two-active';

    choosefield.classList.remove('player-one-active');
    choosefield.classList.remove('player-two-active');
    choosefield.classList.add(chooseFieldHoverClass);

    UpdateInternalGameFieldColumns();

});

// socket.on("beginNewTurn", (gameData) => {
//     console.log(gameData);

//     for(let column of playCols)
//     {
//         if(Number(column.getAttribute('data-x')) == gameData.column.x && Number(column.getAttribute('data-y')) == gameData.column.y)
//         {
//             column.classList.add('chosen');

//             if(gameData.player == 'player-one')
//             {
//                 column.classList.add('player-one');                
//             }
//             else
//             {
//                 column.classList.add('player-two');
//             }
//         }
//     }

//     currentPlayerActive = gameData.activePlayer;
//     turn = gameData.turns;
//     chosenFields = gameData.chosenFields;
// });

// socket.on('winGame', (player) => {
//     if(player == currentPlayer)
//         WinGame();
//     else
//         EndGame();
// });

function GeneratePlayField()
{
    // Generate playfield.
    let output = '';
    playfield.innerHTML = '';
    for(let i = 0; i < fieldMatrix.length; i += 1)
    {
        output += '<div class="field-row">';
        for(let x = 0; x < fieldMatrix[i].length; x += 1)
        {
            output += '<div class="field-col" data-x="' + x + '" data-y="' + i + '" data-number="' + fieldMatrix[i][x] + '">' + '<p>' + fieldMatrix[i][x] + '</p>' + '</div>';
        }
        output += '</div>';
    }
    playfield.innerHTML = output;

    // Generate choosefield.
    output = '';
    choosefield.innerHTML = '';
    for(let i = 0; i < chooseMatrix.length; i += 1)
    {
        output += '<div class="choose-row">';
        for(let x = 0; x < chooseMatrix[i].length; x += 1)
        {
            output += '<div class="field-col" data-x="' + x + '" data-y="' + i + '" data-number="' + chooseMatrix[i][x] + '">' + '<p>' + chooseMatrix[i][x] + '</p>' + '</div>';
        }
        output += '</div>';
    }
    choosefield.innerHTML = output;

    // Update the internal game and choose field columns.
    UpdateInternalGameFieldColumns();
}

// Updates the internal game and choose field columns.
function UpdateInternalGameFieldColumns()
{
    let gameFieldCols = document.querySelectorAll(".gamefield .field-row .field-col");
    let chooseFieldCols = document.querySelectorAll(".gamefield.choose-field .choose-row .field-col");

    // Get all of the gameFieldCols metadata.
    for(let col of gameFieldCols)
    {
        let colX = Number(col.getAttribute('data-x'));
        let colY = Number(col.getAttribute('data-y'));
        let colNumber = Number(col.getAttribute('data-number'));
        let colOwner = col.classList.contains('player-one') ? 'player-one' : col.classList.contains('player-two') ? 'player-two' : 'none'
        

        fieldColumns.gameField['x' + colX + 'y' + colY] = {
            'x': colX,
            'y': colY,
            'number': colNumber,
            'owner': colOwner,
            'element': col
        }
    }

    // Get all of the chooseFieldCols metadata.
    for(let col of chooseFieldCols)
    {
        let colX = Number(col.getAttribute('data-x'));
        let colY = Number(col.getAttribute('data-y'));
        let colNumber = Number(col.getAttribute('data-number'));
        let colOwner = col.classList.contains('player-one') ? 'player-one' : col.classList.contains('player-two') ? 'player-two' : 'none'
        

        fieldColumns.chooseField['x' + colX + 'y' + colY] = {
            'x': colX,
            'y': colY,
            'number': colNumber,
            'owner': colOwner,
            'element': col
        }
    }
}

function StartGame()
{
    // Show hover options in the choose-field.
    choosefield.classList.add('game-active');
    choosefield.classList.add('player-one-active');

    // Set the ammount of turns for player one.
    if(currentPlayer == 'player-one' && currentTurn == 0)
        chooseColumnAmmountInTurn = 2;

    // Add choose column logic.
    let chooseColumns = document.querySelectorAll(".gamefield.choose-field .choose-row .field-col");
    if(chooseColumns.length > 0)
    {
        for(let column of chooseColumns)
        {
            column.addEventListener('click', ChooseColumn);
        }
    }

    gameRunning = true;
}

// // Starts the game loop.
// function StartGame()
// {
//     choosefield.classList.add('game-active');
//     choosefield.classList.add('player-one-active');
//     currentPlayerActive = 1;

//     chatMessagesContainer.innerHTML += '<p class="chat-message global">Speler 1 is aan de beurt</p>';

//     // Add choose column logic.
//     let chooseColumns = document.querySelectorAll(".gamefield.choose-field .field-col");
//     if(chooseColumns.length > 0)
//     {
//         for(let column of chooseColumns)
//         {
//             column.addEventListener('click', ChooseColumn);
//         }
//     }

//     // Get all of the field columns from the playfield.
//     playCols = document.querySelectorAll("#game-field > .gamefield .field-row .field-col");

//     for(let col of playCols)
//     {
//         col.addEventListener('click', function(){
//             this.classList.add('chosen');
//             this.classList.add('player-one');
//         })
//     }

//     gameRunning = true;
// }

/*

    --- Game logic ---

*/

// function ChooseColumn()
// {
//     // Make sure that the game is running.
//     if(gameRunning == false)
//         return;

//     // Make sure that the current active player can only click on the buttons.
//     if((currentPlayerActive == 1 && currentPlayer == 'player-two') || (currentPlayerActive == 2 && currentPlayer == 'player-one'))
//         return;

//     // In the first turn the first player can choose two columns.
//     if(turn == 0)
//     {
//         // Make sure that there are two fields chosen before the next player can choose.
//         if(chosenFields.length < 1)
//         {
//             this.classList.add('chosen');
//             chosenFields.push({'x': this.getAttribute('data-x'), 'y': this.getAttribute('data-y'), 'number': this.getAttribute('data-number')});
//             return;
//         }

//         this.classList.add('chosen');
//         chosenFields.push({'x': this.getAttribute('data-x'), 'y': this.getAttribute('data-y'), 'number': this.getAttribute('data-number')});
//         EndTurn();
//         return;
//     }

//     // Make sure that the column is empty.
//     if(ColumnIsEmpty(this))
//     {
//         console.log(this);
//         // Move the second column to the first position, and overwrite the second position.
//         console.log(chosenFields[0]);
        
//         GetColumnByCoordinates("choose", chosenFields[0].x, chosenFields[0].y).classList.remove('chosen');
//         chosenFields[0] = chosenFields[1];
        
//         GetColumnByCoordinates("choose", chosenFields[0].x, chosenFields[0].y).classList.remove('chosen');
//         chosenFields[1] = {'x': this.getAttribute('data-x'), 'y': this.getAttribute('data-y'), 'number': this.getAttribute('data-number')};
        
//         this.classList.add('chosen');
//         EndTurn();
//         return;
//     }

//     // Column is not empty show an error message.
//     console.log("Column is already taken.");
// }

function ChooseColumn()
{
    console.log(currentPlayerActive);

    // Make sure that the game is running.
    if(gameRunning == false)
        return;

    // Make sure that the current active player can only click on the buttons.
    if((currentPlayerActive == 1 && currentPlayer == 'player-two') || (currentPlayerActive == 2 && currentPlayer == 'player-one'))
        return;

    chosenColumns.push({
        'x': Number(this.getAttribute('data-x')),
        'y': Number(this.getAttribute('data-y')),
        'number': Number(this.getAttribute('data-number')),
        'owner': currentPlayer,
        'gameField': "choose-field"
    });
    
    console.log(chosenColumns.length + ' | ' + chooseColumnAmmountInTurn);
    if(chosenColumns.length >= chooseColumnAmmountInTurn)
    {
        let columnIsEmpty = false;
        console.log(chosenColumns);

        // Get the two selected column' numbers and calculate the sum of them.
        // After that we get the gamefield column that has the finalnumber.
        let finalNumber = chosenColumns[0].number * chosenColumns[1].number;
        for(let key in fieldColumns.gameField)
        {
            let col = fieldColumns.gameField[key];

            if(col.number == finalNumber)
            {
                // Check if the column is empty.
                columnIsEmpty = ColumnIsEmpty(col);
            }
        }

        // Make sure that the column is empty when we want to end the turn.
        if(columnIsEmpty)
        {
            this.classList.add('chosen');
            this.classList.add(currentPlayer);

            socket.emit('endTurn', chosenColumns);
        }
        else
        {
            chosenColumns.pop();
            console.log("Column has already been chosen.");
        }
    }
}

function ColumnIsEmpty(column)
{ 
    output = true;

    for(let key in fieldColumns.gameField)
    {
        let col = fieldColumns.gameField[key];
        if(col.number == column.number)
        {
            let colElement = col.element;
            if(colElement.classList.contains('chosen'))
                output = false;
        }
    }

    return output;
}

function GetColumnByCoordinates(field, x, y)
{
    let output = undefined;

    if(field == "play")
        output = document.querySelector('.field-row .field-col[data-x="' + x + '"][data-y="' + y + '"]');
    else
        output = document.querySelector('.choose-row .field-col[data-x="' + x + '"][data-y="' + y + '"]');    

    return output;
}

// Ends the turn selects fields, updates the total turns and calculates possible outcomes.
// function EndTurn()
// {
//     if(chosenFields.length < 2)
//         return;

//     let firstNumber = chosenFields[0].number;
//     let secondNumber = chosenFields[1].number;

//     // Get the column that corresponds to the outcome of the final number.
//     let finalNumber = firstNumber * secondNumber;
//     let selectedColumn = undefined;

//     for(let column of playCols)
//     {
//         if(column.getAttribute('data-number') == finalNumber)
//         {
//             selectedColumn = {
//                 'x': Number(column.getAttribute('data-x')),
//                 'y': Number(column.getAttribute('data-y')),
//             };

//             column.classList.add('chosen');

//             if(currentPlayerActive == 1)
//             {
//                 column.classList.add('player-one');
//             }
//             else if(currentPlayerActive == 2)
//             {
//                 column.classList.add('player-two');
//             }
//         }
//     }

//     if(currentPlayerActive == 1)
//     {
//         choosefield.classList.replace('player-one-active', 'player-two-active');
//         currentPlayerActive = 2;
//     }
//     else
//     {
//         choosefield.classList.replace('player-two-active', 'player-one-active');
//         currentPlayerActive = 1;
//     }

//     if(CheckDraw(chosenFields[1]) == false)
//     {
//         // Check any potential wins.
//         if(CheckWin() == true)
//         {
//             socket.emit('winGame', currentPlayer);
//         }
//         else
//         {
//             if(currentPlayerActive == 1)
//                 chatMessagesContainer.innerHTML += '<p class="chat-message global">Speler 1 is aan de beurt</p>';
//             if(currentPlayerActive == 2)
//                 chatMessagesContainer.innerHTML += '<p class="chat-message global">Speler 2 is aan de beurt</p>';

//             socket.emit("newTurn", {'player': currentPlayer, 'column': selectedColumn, 'turns': turn, 'chosenFields': chosenFields});
//         }
//     }
//     else
//     {
//         EndGame();
//     }
// }

// Checks if the game can still be continued, if not it will terminate the game.
function CheckDraw(col)
{
    let output = true;
    let chooseValue = col.number;

    let outcomes = [];
    for(let i = 1; i <= 9; i += 1)
    {
        outcomes.push(chooseValue * i);
    }

    for(let key in fieldColumns.gameField)
    {
        let column = fieldColumns.gameField[key].element;
        let colNumber = column.getAttribute('data-number');

        for(let i = 0; i < outcomes.length; i += 1)
        {
            if(colNumber == outcomes[i] && column.classList.contains('chosen') == false)
            {
                output = false;
            }
        }
    }

    return output;
}

function WinGame()
{
    choosefield.classList.remove('game-active');
    gameRunning == false;

    for(let column of playCols)
    {
        column.removeEventListener('click', ChooseColumn);
    }

    console.log("GAME WON!!! by player: " + playerWon)
}

function EndGame()
{
    choosefield.classList.remove('game-active');
    gameRunning == false;

    for(let column of playCols)
    {
        column.removeEventListener('click', ChooseColumn);
    }

    console.log("GAME END!!!");
}

// Checks if someone won the game.
// To check if someone has 4 pairs we want to first have all of their 'taken' columns.
// Then we check if each column has 4 columns above, under, diagonally near him.
function CheckWin()
{
    let winDetected = false;

    // Construct an array with objects with all of the x, y, player and innerHTML values.
    let playArea = {
        'width': fieldMatrix[0].length,
        'height': fieldMatrix.length,
        'items': []
    };

    for(let key in fieldColumns.gameField)
    {
        let column = fieldColumns.gameField[key];

        let colX = column.x;
        let colY = column.y;

        playArea.items['x' + colX + 'y' + colY] = {
            'x': colX,
            'y': colY,
            'player': column.element.classList.contains('player-one') ? 'player-one': column.element.classList.contains('player-two') ? 'player-two' : 'none',
            'value': column.number,
        };
    }

    // Loop over all of the columns and check if they have any matches around them.
    for(let key in playArea.items)
    {
        let column = playArea.items[key];

        // Make sure that the column is owned by a player.
        if(column.player == "none")
            continue;

        // Check the horizontal matches.
        let matched = HasHorizontalMatches(playArea, column);

        // No horizontal matches found, check the vertical matches.
        if(matched.matched == false)
        {
            // Check the vertical matches.
            matched = HasVerticalMatches(playArea, column);

            // No vertical matches found, check the diagonal matches.
            if(matched.matched == false)
            {
                matched = HasDiagonalMatches(playArea, column);

                if(matched.matched)
                {
                    winDetected = true;                    
                    playerWon = matched.columns[0].player;
                }
            }
            else
            {
                playerWon = matched.columns[0].player;
                winDetected = true;
            }
        }
        else
        {
            playerWon = matched.columns[0].player;
            winDetected = true;
        }
    }

    return winDetected;
}

// Tries to get horizontal matches based on the searchValue.
function HasHorizontalMatches(columnData, column, searchValue=null)
{    
    let matchedColumns = [];

    // If there is no searchValue given it means that this column is the startFunction.
    let isStartFunction = false;
    if(searchValue == null)
    {
        isStartFunction = true;
        searchValue = column.player;
    }

    // Check if we can go right.
    if(column.x < (columnData.width - 1))
    {
        let newPoint = columnData.items['x' + (column.x + 1) + 'y' + column.y];
        let value = newPoint.player;

        if(value == searchValue)
        {
            let nextPoint = HasHorizontalMatches(columnData, newPoint, searchValue);

            // Make sure that the nexPoint has the same value as the searchValue.
            if(nextPoint == false)
                return false;

            let matches = [newPoint];

            // Merge the nextPoint array into the new matches array.
            if(nextPoint != undefined && nextPoint.length > 0)
            {
                for(let i = 0; i < nextPoint.length; i += 1)
                {
                    matches.push(nextPoint[i]);
                }
            }

            // Make sure that the recursion ends.
            if(isStartFunction == false)
                return matches;
            else
                matchedColumns = matches;
        }

        // Make sure that the recursion ends.
        if(isStartFunction == false)
            return newPoint;
    }

    if(isStartFunction)
    {
        // Merge all of the columns together.
        let matched = {'matched': false, 'columns': [column], 'searchValue': column.player};
        for(let col of matchedColumns)
        {
            matched.columns.push(col)
        }

        if(matched.columns.length >= 4)
            matched.matched = true;

        return matched;
    }
}

// Tries to get vertical matches based on the searchValue.
function HasVerticalMatches(columnData, column, searchValue=null)
{    
    let matchedColumns = [];

    // If there is no searchValue given it means that this column is the startFunction.
    let isStartFunction = false;
    if(searchValue == null)
    {
        isStartFunction = true;
        searchValue = column.player;
    }

    // Check if we can go right.
    if(column.y < (columnData.height - 1))
    {
        let newPoint = columnData.items['x' + column.x + 'y' + (column.y  + 1)];
        let value = newPoint.player;

        if(value == searchValue)
        {
            let nextPoint = HasVerticalMatches(columnData, newPoint, searchValue);

            // Make sure that the nexPoint has the same value as the searchValue.
            if(nextPoint == false)
                return false;

            let matches = [newPoint];

            // Merge the nextPoint array into the new matches array.
            if(nextPoint != undefined && nextPoint.length > 0)
            {
                for(let i = 0; i < nextPoint.length; i += 1)
                {
                    matches.push(nextPoint[i]);
                }
            }

            // Make sure that the recursion ends.
            if(isStartFunction == false)
                return matches;
            else
                matchedColumns = matches;
        }

        // Make sure that the recursion ends.
        if(isStartFunction == false)
            return newPoint;
    }

    if(isStartFunction)
    {
        // Merge all of the columns together.
        let matched = {'matched': false, 'columns': [column], 'searchValue': column.player};
        for(let col of matchedColumns)
        {
            matched.columns.push(col)
        }

        if(matched.columns.length >= 4)
            matched.matched = true;

        return matched;
    }
}

// Wrapper that uses the two functions to check diagonal matches.
function HasDiagonalMatches(columnData, column)
{
    let diagonalMatches = HasDiagonalTopLeftToBottomRightMatches(columnData, column);

    if(diagonalMatches.matched == false)
        diagonalMatches = HasDiagonalTopRightToBottomLeftMatches(columnData, column);

    return diagonalMatches;
}

// Tries to get vertical matches based on the searchValue.
function HasDiagonalTopLeftToBottomRightMatches(columnData, column, searchValue=null)
{    
    let matchedColumns = [];

    // If there is no searchValue given it means that this column is the startFunction.
    let isStartFunction = false;
    if(searchValue == null)
    {
        isStartFunction = true;
        searchValue = column.player;
    }

    // Check if we can go right.
    if(column.x < (columnData.width - 1) && column.y < (columnData.height - 1))
    {
        let newPoint = columnData.items['x' + (column.x + 1) + 'y' + (column.y + 1)];
        let value = newPoint.player;

        if(value == searchValue)
        {
            let nextPoint = HasDiagonalTopLeftToBottomRightMatches(columnData, newPoint, searchValue);

            // Make sure that the nexPoint has the same value as the searchValue.
            if(nextPoint == false)
                return false;

            let matches = [newPoint];

            // Merge the nextPoint array into the new matches array.
            if(nextPoint != undefined && nextPoint.length > 0)
            {
                for(let i = 0; i < nextPoint.length; i += 1)
                {
                    matches.push(nextPoint[i]);
                }
            }

            // Make sure that the recursion ends.
            if(isStartFunction == false)
                return matches;
            else
                matchedColumns = matches;
        }

        // Make sure that the recursion ends.
        if(isStartFunction == false)
            return newPoint;
    }

    if(isStartFunction)
    {
        // Merge all of the columns together.
        let matched = {'matched': false, 'columns': [column], 'searchValue': column.player};
        for(let col of matchedColumns)
        {
            matched.columns.push(col)
        }

        if(matched.columns.length >= 4)
            matched.matched = true;

        return matched;
    }
}

// Tries to get vertical matches based on the searchValue.
function HasDiagonalTopRightToBottomLeftMatches(columnData, column, searchValue=null)
{    
    let matchedColumns = [];

    // If there is no searchValue given it means that this column is the startFunction.
    let isStartFunction = false;
    if(searchValue == null)
    {
        isStartFunction = true;
        searchValue = column.player;
    }

    // Check if we can go right.
    if(column.x > 0 && column.y < (columnData.height - 1))
    {
        let newPoint = columnData.items['x' + (column.x - 1) + 'y' + (column.y + 1)];
        let value = newPoint.player;

        if(value == searchValue)
        {
            let nextPoint = HasDiagonalTopRightToBottomLeftMatches(columnData, newPoint, searchValue);

            // Make sure that the nexPoint has the same value as the searchValue.
            if(nextPoint == false)
                return false;

            let matches = [newPoint];

            // Merge the nextPoint array into the new matches array.
            if(nextPoint != undefined && nextPoint.length > 0)
            {
                for(let i = 0; i < nextPoint.length; i += 1)
                {
                    matches.push(nextPoint[i]);
                }
            }

            // Make sure that the recursion ends.
            if(isStartFunction == false)
                return matches;
            else
                matchedColumns = matches;
        }

        // Make sure that the recursion ends.
        if(isStartFunction == false)
            return newPoint;
    }

    if(isStartFunction)
    {
        // Merge all of the columns together.
        let matched = {'matched': false, 'columns': [column], 'searchValue': column.player};
        for(let col of matchedColumns)
        {
            matched.columns.push(col)
        }

        if(matched.columns.length >= 4)
            matched.matched = true;

        return matched;
    }
}