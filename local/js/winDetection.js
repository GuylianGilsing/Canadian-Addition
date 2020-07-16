document.addEventListener('DOMContentLoaded', OnLoad);

function OnLoad()
{
    let matrix = [
    //   0  1  2  3  4
        [1, 0, 0, 0, 1], // 0
        [0, 1, 0, 1, 0], // 1
        [0, 0, 0, 0, 0], // 2 
        [0, 1, 0, 1, 0], // 3
        [1, 0, 0, 0, 0], // 4
    ];

    let data = GetMatrixData(matrix);

    let startPoint = data.items['x4y0'];
    // console.log(startPoint);
    let horizontalMatches = HasHorizontalMatches(data, startPoint);
    let verticalMatches = HasVerticalMatches(data, startPoint);
    let diagonalMatches = HasDiagonalMatches(data, startPoint);
    // console.log(horizontalMatches);
    // console.log(verticalMatches);
}

// Returns an overview of the matrix width and height,
// and a list of all of the columns within the matrix.
function GetMatrixData(matrix)
{
    let MatrixDataObject = {
        'width': 0,
        'height': 0,
        'items': {}
    };

    let width = 0;
    let height = 0;

    let posX = 0;
    let posY = 0;

    for(let row of matrix)
    {
        height += 1;
        width += 1;
        
        for(let child of row)
        {
            MatrixDataObject.items['x' + posX + 'y' + posY] = {
                'x': posX,
                'y': posY,
                'value': Number(child)
            };

            posX += 1;
        }

        posY += 1;
        posX = 0;
    }

    MatrixDataObject.width = width;
    MatrixDataObject.height = height;

    return MatrixDataObject;
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
        searchValue = column.value;
    }

    // Check if we can go right.
    if(column.x < (columnData.width - 1))
    {
        let newPoint = columnData.items['x' + (column.x + 1) + 'y' + column.y];
        let value = newPoint.value;

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
        let matched = {'matched': false, 'columns': [column], 'searchValue': column.value};
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
        searchValue = column.value;
    }

    // Check if we can go right.
    if(column.y < (columnData.height - 1))
    {
        let newPoint = columnData.items['x' + column.x + 'y' + (column.y  + 1)];
        let value = newPoint.value;

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
        let matched = {'matched': false, 'columns': [column], 'searchValue': column.value};
        for(let col of matchedColumns)
        {
            matched.columns.push(col)
        }

        if(matched.columns.length >= 4)
            matched.matched = true;

        return matched;
    }
}

function HasDiagonalMatches(columnData, column)
{
    let diagonalMatchesOne = HasDiagonalTopLeftToBottomRightMatches(columnData, column);
    let diagonalMatchesTwo = HasDiagonalTopRightToBottomLeftMatches(columnData, column);
    console.log(diagonalMatchesOne);
    console.log(diagonalMatchesTwo);
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
        searchValue = column.value;
    }

    // Check if we can go right.
    if(column.x < (columnData.width - 1) && column.y < (columnData.height - 1))
    {
        let newPoint = columnData.items['x' + (column.x + 1) + 'y' + (column.y + 1)];
        let value = newPoint.value;

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
        let matched = {'matched': false, 'columns': [column], 'searchValue': column.value};
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
        searchValue = column.value;
    }

    // Check if we can go right.
    if(column.x > 0 && column.y < (columnData.height - 1))
    {
        let newPoint = columnData.items['x' + (column.x - 1) + 'y' + (column.y + 1)];
        let value = newPoint.value;

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
        let matched = {'matched': false, 'columns': [column], 'searchValue': column.value};
        for(let col of matchedColumns)
        {
            matched.columns.push(col)
        }

        if(matched.columns.length >= 4)
            matched.matched = true;

        return matched;
    }
}