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

// Game variables.

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

// Indicates if the turn timer gets used.
let turnTimerEnabled = true;

// The name of the winning player gets save to this variable.
let playerWon = undefined;

let gameUI = {
    'player-active': document.querySelector("#game-ui.player-active"),
}

// Simple turn timer.
var TurnTimer = {
    'turnTimerElement': document.querySelector("#turntimer"),
    'timerObject': null,
    'time': {
        'seconds': 0,
        'minutes': 0,
        'hours': 0
    },
    'settings': {
        'countType': "down",
        'presetSeconds': 5,
        'presetMinutes': 0,
        'presetHours': 0,
    },
    // Starts the timer.
    start()
    {
        if(TurnTimer.settings.countType == "down")
        {
            TurnTimer.time.seconds = TurnTimer.settings.presetSeconds;
            TurnTimer.time.minutes = TurnTimer.settings.presetMinutes;
            TurnTimer.time.hours = TurnTimer.settings.presetHours;
        }

        TurnTimer.turnTimerElement.innerHTML = 'Tijd: ' + TurnTimer.getTime();
        TurnTimer.timerObject = setInterval(TurnTimer.timerTick, 1000);
    },
    stop()
    {
        TurnTimer.time.seconds = 0;
        TurnTimer.time.minutes = 0;
        TurnTimer.time.hours = 0;

        clearInterval(TurnTimer.timerObject);
        TurnTimer.turnTimerElement.innerHTML = 'Tijd: ' + TurnTimer.getTime();
    },
    timerTick()
    {
        // Add per tick 1 second to the seconds timer.

        if(TurnTimer.settings.countType == "down")
        {
            // Check if we surpassed 60 seconds.
            if(TurnTimer.time.seconds <= 0)
            {
                // Check if we surpassed 60 minutes.
                if(TurnTimer.time.minutes <= 0)
                {
                    if((TurnTimer.time.hours - 1) <= 0)
                    {
                        // Clear the timeout and call the timeSurpassed function.
                        clearInterval(TurnTimer.timerObject);
                        TurnTimer.timeSurpassed();
                        return;
                    }

                    TurnTimer.time.minutes = 59;
                    TurnTimer.time.hours -= 1;
                }

                TurnTimer.time.minutes -= 1;
                TurnTimer.time.seconds = 59;
            }
            else
            {
                TurnTimer.time.seconds -= 1;
            }
        }
        else
        {
            // Check if we surpassed 60 seconds.
            if(TurnTimer.time.seconds >= 60)
            {
                // Check if we surpassed 60 minutes.
                if(TurnTimer.time.minutes >= 60)
                {
                    TurnTimer.time.minutes = 0;
                    TurnTimer.time.hours += 1;
                }

                TurnTimer.time.seconds = 1;
            }
            else
            {
                TurnTimer.time.seconds += 1;
            }

            // Check if we have surpassed the preset time.
            if( TurnTimer.time.seconds >= TurnTimer.settings.presetSeconds &&
                TurnTimer.time.minutes >= TurnTimer.settings.presetMinutes &&
                TurnTimer.time.hours >= TurnTimer.settings.presetHours
            )
            {
                // Clear the timeout and call the timeSurpassed function.
                clearInterval(TurnTimer.timerObject);
                TurnTimer.timeSurpassed();
            }
        }

        TurnTimer.turnTimerElement.innerHTML = 'Tijd: ' + TurnTimer.getTime();
    },
    getTime()
    {
        let output = "";
        
        // Add hours.
        if(TurnTimer.time.hours < 10)
            output += "0" + String(TurnTimer.time.hours) + ":";
        else
            output += String(TurnTimer.time.hours) + ":";

        // Add minutes.
        if(TurnTimer.time.minutes < 10)
            output += "0" + String(TurnTimer.time.minutes) + ":";
        else
            output += String(TurnTimer.time.minutes) + ":";

        // Add seconds.
        if(TurnTimer.time.seconds < 10)
            output += "0" + String(TurnTimer.time.seconds);
        else
            output += String(TurnTimer.time.seconds);

        return output;
    },
    // This function needs to be overwritten.
    timeSurpassed: () => {
        socket.emit('endTurn', chosenColumns);
    }
}

/*

    --- Initialization ---

*/

function SetPlayfieldMode(mode)
{
    switch(mode)
    {
        case "E":
            // Matrix of the playfield.
            fieldMatrix = [
                [1, 2, 3, 4, 5, 6],
                [7, 8, 9, 10, 12, 14],
                [15, 16, 18, 20, 21, 24],
                [25, 27, 28, 30, 32, 35],
                [36, 40, 42, 45, 48, 49],
                [54, 56, 63, 64, 72, 81]
            ];

            chooseMatrix = [
                [7, 8, 9],
                [1, 2, 3, 4, 5, 6]
            ];
            break;
        case "T":
            fieldMatrix = [
                [100, 200, 300, 400, 500, 600],
                [700, 800, 900, 1000, 1200, 1400],
                [1500, 1600, 1800, 2000, 2100, 2400],
                [2500, 2700, 2800, 3000, 3200, 3500],
                [3600, 4000, 4200, 4500, 4800, 4900],
                [5400, 5600, 6300, 6400, 7200, 8100]
            ];

            chooseMatrix = [
                [70, 80, 90],
                [10, 20, 30, 40, 50, 60]
            ];
            break;
    }
}

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
        // Get all of the custom attributes from the HTML elements.
        let colX = Number(col.getAttribute('data-x'));
        let colY = Number(col.getAttribute('data-y'));
        let colNumber = Number(col.getAttribute('data-number'));
        let colOwner = col.classList.contains('player-one') ? 'player-one' : col.classList.contains('player-two') ? 'player-two' : 'none'
        
        // Create an object with all of the values, this will get used throughout the game logic.
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
    if((currentPlayer == 'player-one' && currentTurn == 0) || turnTimerEnabled)
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

/*

    --- Websocket entry points ---

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
    document.getElementById("invite-container").style.display = "none";
    playfield.classList.remove('hide');
    document.querySelector("#preloader.show").remove();

    SetPlayfieldMode("enkeltallen");
    GeneratePlayField();
    StartGame();
    
    currentPlayerActive = 1;
    chatMessagesContainer.innerHTML += '<p class="chat-message global">Speler 1 is aan de beurt</p>';

    // Start the turn timer.
    if(turnTimerEnabled)
    {
        if((currentPlayerActive == 1 && currentPlayer == 'player-one') || 
           (currentPlayerActive == 2 && currentPlayer == 'player-two')
        )
        {
            TurnTimer.start();
        }
    }

    // Limit player input.
    ProhibitInput();
})

// Ends a turn.
socket.on('endTurn', (columns) => {
    console.log(columns);
    // Disable the turn timer.
    if(turnTimerEnabled == true)
        TurnTimer.stop();

    UpdateInternalGameFieldColumns();

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

    // Check if the columns are undefined, if so then start a new turn.
    console.log(columns);
    console.log('colLength: ' + columns.length + ' chooseAmmount: ' + chooseColumnAmmountInTurn);
    console.log((columns.length - 1) < chooseColumnAmmountInTurn);

    if(columns.length <= 0 || columns == undefined || (columns.length - 1) < chooseColumnAmmountInTurn)
    {
        console.log("TURNTIMEROVER");
        chosenColumns = [];

        // Prepare the new turn data.
        let playerActive = currentPlayerActive == 1 ? 'player-one' : 'player-two';

        let newTurnData = {
            'player': playerActive,
            'turns': currentTurn,
            'lastSelectedChooseColumn': columns[1] != undefined ? columns[1] : columns[0]
        };

        // Make sure that the startNewTurn event only gets called by the current active player,
        // this will prevent that the turn gets started twice.
        if((currentPlayerActive == 1 && currentPlayer == 'player-one') || 
           (currentPlayerActive == 2 && currentPlayer == 'player-two')
        )
        {
            socket.emit('startNewTurn', newTurnData);
        }

        return;
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

    // Check if there is a draw.
    if(CheckDraw(columns[1]) == false)
    {
        // Check any potential wins.
        if(CheckWin() == true)
        {
            // Emit the endGame logic to all players.
            socket.emit('endGame', {'type': "win", 'winner': playerWon});
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

            // Make sure that the startNewTurn event only gets called by the current active player,
            // this will prevent that the turn gets started twice.
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
        // Emit the endGame logic to all players.
        socket.emit('endGame', {'type': "draw"});
    }
});

// Starts a new turn.
socket.on('startNewTurn', (data) => {
    // Set the last selected choose column as the first chosen column,
    // this way we can calculate based on the last en new chosen columns.
    chosenColumns = [];

    // Make sure that there is a selected column.
    if(data.lastSelectedChooseColumn != undefined && data.lastSelectedChooseColumn != null)
    {
        chosenColumns[0] = data.lastSelectedChooseColumn;
        chooseColumnAmmountInTurn = 1;
    }

    // Enable the game logic for the next player.
    currentPlayerActive = data.activePlayer;
    currentTurn = data.turns;

    // Only remove the chosen classes of the choose columns when there aren't two colums chosen to start the game,
    // or when there are more than 2 columns chosen.
    if((chosenColumns.length - 1) <= chooseColumnAmmountInTurn && chooseColumnAmmountInTurn == 2)
    {
        // Loop over all of the choose columns and remove the chose classes.
        for(let key in fieldColumns.chooseField)
        {
            let col = fieldColumns.chooseField[key];
            col.element.classList.remove('chosen');
            col.element.classList.remove(data.player);
        }
    }
    else if(chosenColumns.length >= chooseColumnAmmountInTurn && chooseColumnAmmountInTurn != 2)
    {
        // Loop over all of the choose columns and remove the chose classes.
        for(let key in fieldColumns.chooseField)
        {
            let col = fieldColumns.chooseField[key];
            col.element.classList.remove('chosen');
            col.element.classList.remove(data.player);
        }
    }

    // Select the last chosen choose column.
    if(data.lastSelectedChooseColumn != undefined)
    {
        let lastChooseCol = fieldColumns.chooseField['x' + chosenColumns[0].x + 'y' + chosenColumns[0].y].element;
        lastChooseCol.classList.add('chosen');
        lastChooseCol.classList.add(data.player);
    }

    // Change the choose column hover.
    let chooseFieldHoverClass = '';
    if(currentPlayerActive == 1)
    {
        chooseFieldHoverClass = 'player-one-active';
        chatMessagesContainer.innerHTML += '<p class="chat-message global">Speler 1 is aan de beurt</p>';
        ScrollChatToBottom();
    }
    else
    {
        chooseFieldHoverClass = 'player-two-active';
        chatMessagesContainer.innerHTML += '<p class="chat-message global">Speler 2 is aan de beurt</p>';
        ScrollChatToBottom();
    }

    // Set the new player active class to the choose field to change the hover.
    choosefield.classList.remove('prohibit-input');
    choosefield.classList.remove('player-one-active');
    choosefield.classList.remove('player-two-active');
    choosefield.classList.add(chooseFieldHoverClass);

    // Limit the player interactability.
    ProhibitInput();  

    UpdateInternalGameFieldColumns();

    // Start the turn timer if it is enabled.
    if(turnTimerEnabled)
    {
        if((currentPlayerActive == 1 && currentPlayer == 'player-one') || 
           (currentPlayerActive == 2 && currentPlayer == 'player-two')
        )
        {
            console.log(chosenColumns);
            TurnTimer.start();
        }
    }
});

// Ends the game.
socket.on('endGame', (data) => {
    choosefield.classList.remove('game-active');
    gameRunning == false;

    // Stop the turn timer.
    if(turnTimerEnabled)
        TurnTimer.stop();
    
    // Remove eventListeners.
    let chooseColumns = document.querySelectorAll(".gamefield.choose-field .choose-row .field-col");
    if(chooseColumns.length > 0)
    {
        for(let column of chooseColumns)
        {
            column.removeEventListener('click', ChooseColumn);
        }
    }

    // Give an appropiate response to the type.
    if(data.type == "win")
    {
        // A player won the game, display a modal whichs shows the player that won.

        // Change the status message.
        let statusMessage = document.querySelector("#gamefield-popup .messagebox .status");
        if(data.winner == 'player-one')
            statusMessage.innerHTML = 'Speler 1 heeft gewonnen';
        else if(data.winner == 'player-two')
            statusMessage.innerHTML = 'Speler 2 heeft gewonnen';

        // Display the popup.
        let popup = document.querySelector("#gamefield-popup");
        popup.classList.add('show');
    }
    else if(data.type == "draw")
    {
        // Change the status message.
        let statusMessage = document.querySelector("#gamefield-popup .messagebox .status");
        statusMessage.innerHTML = 'Gelijkspel';

        // Display the popup.
        let popup = document.querySelector("#gamefield-popup");
        popup.classList.add('show');
    }
});

/*

    --- Game logic ---

*/

// Prohibits input from inactive players.
function ProhibitInput()
{
    if((currentPlayerActive == 1 && currentPlayer == 'player-two') || 
       (currentPlayerActive == 2 && currentPlayer == 'player-one')
    )
    {
        choosefield.classList.add('prohibit-input');
    }
}

function ChooseColumn()
{
    // Make sure that the game is running.
    if(gameRunning == false)
        return;

    // Make sure that the current active player can only click on the buttons.
    if((currentPlayerActive == 1 && currentPlayer == 'player-two') || (currentPlayerActive == 2 && currentPlayer == 'player-one'))
        return;

    // Add the selection classes.
    if(chosenColumns.length == 0)
    {
        this.classList.add('chosen');
        this.classList.add(currentPlayer);
    }

    // add the clicked choose column to the chosenColumns array.
    chosenColumns.push({
        'x': Number(this.getAttribute('data-x')),
        'y': Number(this.getAttribute('data-y')),
        'number': Number(this.getAttribute('data-number')),
        'owner': currentPlayer,
        'gameField': "choose-field"
    });
    
    if(chosenColumns.length >= chooseColumnAmmountInTurn)
    {
        let columnIsEmpty = false;

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

        // CONTINUE

        // Make sure that the column is empty when we want to end the turn.
        if(columnIsEmpty)
        {
            socket.emit('endTurn', chosenColumns);
        }
        else
        {
            // Remove the last element from the chosenColumns array.
            chosenColumns.pop();
            chatMessagesContainer.innerHTML += '<p class="chat-message global txt-color-red">Kolom is al gekozen</p>';
            ScrollChatToBottom();
        }
    }
}

// Checks if a column is empty.
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

// Gets a column object by coordinates and game field.
function GetColumnByCoordinates(field, x, y)
{
    let output = undefined;

    if(field == "play")
        output = document.querySelector('.field-row .field-col[data-x="' + x + '"][data-y="' + y + '"]');
    else
        output = document.querySelector('.choose-row .field-col[data-x="' + x + '"][data-y="' + y + '"]');    

    return output;
}

// Checks if the game can still be continued, if not it will terminate the game.
function CheckDraw(col)
{
    let output = true;
    let chooseValue = col.number;

    // Calculate all of the values with the choosefield numbers,
    // this way we can switch matrixes more easily.
    let outcomes = [];
    for(let key in fieldColumns.chooseField)
    {
        outcomes.push(chooseValue * fieldColumns.chooseField[key].number);
    }

    // Loop over all of the outcomes and check if there is a unchosen column with the same value.
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