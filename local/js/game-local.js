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
let playCols = [];

// Game variables.
let gameRunning = false;
let currentPlayerActive = 0;
let turn = 0;

// Holds all of the taken fields by the players.
let takenFields = {
    'playerOne': [],
    'playerTwo': []
}

let chosenFields = [];
let lastChooseField = Node;
let playerWon = undefined;

/*

    --- Initialization ---

*/

document.addEventListener('DOMContentLoaded', function(){    
    GeneratePlayField();
    StartGame();
});

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
            output += '<div class="field-col" data-number="' + chooseMatrix[i][x] + '">' + '<p>' + chooseMatrix[i][x] + '</p>' + '</div>';
        }
        output += '</div>';
    }
    choosefield.innerHTML = output;
}

// Starts the game loop.
function StartGame()
{
    choosefield.classList.add('game-active');
    choosefield.classList.add('player-one-active');
    currentPlayerActive = 1;

    // Add choose column logic.
    let chooseColumns = document.querySelectorAll(".gamefield.choose-field .field-col");
    if(chooseColumns.length > 0)
    {
        for(let column of chooseColumns)
        {
            column.addEventListener('click', ChooseColumn);
        }
    }

    // Get all of the field columns from the playfield.
    playCols = document.querySelectorAll("#game-field > .gamefield .field-row .field-col");

    // Debug
    // for(let col of playCols)
    // {
    //     col.addEventListener('click', function(){
    //         this.classList.add('chosen');
    //         this.classList.add('player-one');
    //     })
    // }

    gameRunning = true;
}

/*

    --- Game logic ---

*/

function ChooseColumn()
{
    // Make sure that the game is running.
    if(gameRunning == false)
        return;

    
    let curPlayer = currentPlayerActive == 1 ? 'player-one' : 'player-two';

    // In the first turn the first player can choose two columns.
    if(turn == 0)
    {
        // Make sure that there are two fields chosen before the next player can choose.
        if(chosenFields.length < 1)
        {
            this.classList.add('chosen');
            this.classList.add(curPlayer);
            chosenFields.push(this);
            
            return;
        }

        this.classList.add('chosen');
        this.classList.add(curPlayer);
        chosenFields.push(this);

        EndTurn();
        return;
    }

    // Make sure that the column is empty.
    if(ColumnIsEmpty(this))
    {
        // Move the second column to the first position, and overwrite the second position.
        chosenFields[0].classList.remove('chosen');
        chosenFields[0].classList.remove('player-one');
        chosenFields[0].classList.remove('player-two');

        chosenFields[0] = chosenFields[1];
        chosenFields[0].classList.remove('chosen');
        
        this.classList.add('chosen');
        this.classList.add(curPlayer);
        chosenFields[1] = this;
        
        EndTurn();
        return;
    }

    // Column is not empty show an error message.
    console.log("Column is already taken.");
}

function ColumnIsEmpty(newCol)
{
    if(chosenFields.length < 2)
        return;
 
    output = true;

    let firstNumber = chosenFields[1].getAttribute('data-number');
    let secondNumber = newCol.getAttribute('data-number');

    // Get the column that corresponds to the outcome of the final number.
    let finalNumber = firstNumber * secondNumber;

    for(let column of playCols)
    {
        if(column.getAttribute('data-number') == finalNumber)
        {
            if(column.classList.contains('chosen'))
                output = false;
        }
    }

    return output;
}

// Ends the turn selects fields, updates the total turns and calculates possible outcomes.
function EndTurn()
{
    if(chosenFields.length < 2)
        return;

    let firstNumber = chosenFields[0].getAttribute('data-number');
    let secondNumber = chosenFields[1].getAttribute('data-number');

    // Get the column that corresponds to the outcome of the final number.
    let finalNumber = firstNumber * secondNumber;

    for(let column of playCols)
    {
        if(column.getAttribute('data-number') == finalNumber)
        {
            column.classList.add('chosen');

            if(currentPlayerActive == 1)
            {
                column.classList.add('player-one');
            }
            else if(currentPlayerActive == 2)
            {
                column.classList.add('player-two');
            }
        }
    }

    if(CheckDraw(chosenFields[1]) == false)
    {
        // Check any potential wins.
        if(CheckWin() == true)
        {
            EndGame("win");
        }

        if(currentPlayerActive == 1)
        {
            choosefield.classList.replace('player-one-active', 'player-two-active');
            currentPlayerActive = 2;
        }
        else
        {
            choosefield.classList.replace('player-two-active', 'player-one-active');
            currentPlayerActive = 1;
        }

        turn += 1;
    }
    else
    {
        EndGame("draw");
    }
}

// Checks if the game can still be continued, if not it will terminate the game.
function CheckDraw(column)
{
    let output = true;
    let chooseValue = column.getAttribute('data-number');

    let outcomes = [];
    for(let i = 1; i <= 9; i += 1)
    {
        outcomes.push(chooseValue * i);
    }

    for(let column of playCols)
    {
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

function EndGame(type)
{
    choosefield.classList.remove('game-active');
    gameRunning == false;

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
    if(type == "win")
    {
        // A player won the game, display a modal whichs shows the player that won.

        // Change the status message.
        let statusMessage = document.querySelector("#gamefield-popup .messagebox .status");
        if(currentPlayerActive == 1)
            statusMessage.innerHTML = 'Speler 1 heeft gewonnen';
        else if(currentPlayerActive == 2)
            statusMessage.innerHTML = 'Speler 2 heeft gewonnen';

        // Display the popup.
        let popup = document.querySelector("#gamefield-popup");
        popup.classList.add('show');
    }
    else if(type == "draw")
    {
        // Change the status message.
        let statusMessage = document.querySelector("#gamefield-popup .messagebox .status");
        statusMessage.innerHTML = 'Gelijkspel';

        // Display the popup.
        let popup = document.querySelector("#gamefield-popup");
        popup.classList.add('show');
    }
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

    for(let column of playCols)
    {
        let colX = column.getAttribute('data-x');
        let colY = column.getAttribute('data-y');

        playArea.items['x' + colX + 'y' + colY] = {
            'x': Number(column.getAttribute('data-x')),
            'y': Number(column.getAttribute('data-y')),
            'player': column.classList.contains('player-one') ? 'player-one': column.classList.contains('player-two') ? 'player-two' : 'none',
            'value': column.innerHTML,
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

function homePage() {
    window.location = "/";
}