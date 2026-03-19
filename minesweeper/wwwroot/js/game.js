let _boardModel;
let _boardHtml;
let _boardHtmlTbody;
//do _boardHtmlTbody.children[Row].cells[Column].children[0] to get the html element of the cellModel 

let _currentBoardSize;
let _fieldAmount;

//reuse lifes in future rounds
let _originalLifeAmount = 1;
let _firstRound = true;
let _lifeAmount = _originalLifeAmount;
let _bombsInGF;

//htmlElements
const _remainingFlags = document.getElementById("remainingFlags");
const _boardProgress = document.getElementById("boardProgress");
const _lifes = document.getElementById("lifes");


//player specific elements
let _lossStreakCount = 0;
let _uncoveredFields;
let _roundStarted;
let _setFlags;

const _fracNumBombs = 4;
const _noNeighboringBombs = "";


function refreshBoardElements() {
    _boardHtml = document.getElementById('board');
    _boardModel = JSON.parse(_boardHtml.dataset.board);
    _boardHtmlTbody = _boardHtml.firstElementChild.firstElementChild;

    _bombsInGF = _boardModel.BombCount;
    _fieldAmount = _boardModel.Rows * _boardModel.Columns;

    _setFlags = 0;
    _uncoveredFields = 0;
    _roundStarted = false;
    _lifeAmount = _originalLifeAmount;

    _remainingFlags.textContent = `Remaining flags: ${_bombsInGF}/${_bombsInGF}`;
    _boardProgress.textContent = `Covered fields: ${_fieldAmount - _bombsInGF}/${_fieldAmount - _bombsInGF}`;
    _lifes.textContent = `Lifes: ${_lifeAmount}`;

    _boardHtml.oncontextmenu = (e) => { e.preventDefault(); }

    _boardHtml.addEventListener('onCellLeftClick', e => {
        const { column, row } = e.detail;
        onFieldClicked(_boardModel.Cells[column][row], _boardHtmlTbody.children[row].cells[column].children[0]);
    });

    _boardHtml.addEventListener('onCellRightClick', e => {
        const { column, row } = e.detail;
        setFlag(_boardModel.Cells[column][row], _boardHtmlTbody.children[row].cells[column].children[0]);
    });

    _boardHtml.addEventListener('onCellHover', e => {
        const { column, row } = e.detail;
        onFieldEnter(_boardModel.Cells[column][row], _boardHtmlTbody.children[row].cells[column].children[0]);
    });

    _boardHtml.addEventListener('onCellHoverEnded', e => {
        const { column, row } = e.detail;
        onFieldLeave(_boardModel.Cells[column][row], _boardHtmlTbody.children[row].cells[column].children[0]);
    });
}

//will reveal the clicked field and performs a specific action based on its attributes
function onFieldClicked(cellModel, cellHtml) {
    _roundStarted = true;

    if (cellModel.IsFlagged) {
        return;
    }
    else if (cellModel.IsBomb) {
        _lifeAmount--;
        _lifes.textContent = `Lifes: ${_lifeAmount}`;

        //treat bomb as flag for chording
        cellModel.IsFlagged = true;
        cellModel.IsExploded = true;
        cellHtml.onclick = () => { };
        cellHtml.oncontextmenu = (e) => { e.preventDefault() };

        if (_lifeAmount <= 0) {
            revealBoard(false);
            changeTitles("Game Over!", ["You lost the game!", "Better luck next time", "Stay determined!"]);
            return;
        }
    }
    // player wants to use chord
    else if (cellModel.IsRevealed) {
        fieldChord(cellModel, cellHtml);
        return;
    }

    cellModel.IsRevealed = true;
    cellHtml.textContent = cellModel.IsBomb ? "💣" : cellModel.NeighboringBombs;
    cellHtml.className = cellModel.NeighboringBombs == 0 ? "empty field" : "field";
    changeBoardProgress(cellModel.IsBomb);

    if (cellModel.NeighboringBombs == 0) {
        uncoverNeighboringFields(cellModel, cellHtml);
    }

    if (isGameFinished()) {
        revealBoard(true);
        changeTitles("Board Finished!", ["Awesome!", "Congrats!!", "Amazing!!!"]);
        return;
    }
}

//uncover neighbors if the flags on the neighbors is equal/greater than the neigboring bombs
function fieldChord(cellModel, cellHtml) {
    let flaggedNeighbors = 0;
    let neighbors = [];

    //loop around cellModels neigbors
    for (let cCol = cellModel.Column - 1; cCol < cellModel.Column + 2; cCol++) {
        if (cCol < 0 || cCol > _boardModel.Columns - 1) {           //dont go out of the board
            continue;
        }

        for (let cRow = cellModel.Row - 1; cRow < cellModel.Row + 2; cRow++) {
            if (cRow < 0 || cRow > _boardModel.Rows - 1) {          //dont go out of the board
                continue;
            }

            const neighborModel = _boardModel.Cells[cCol][cRow];
            const neighborHtml = _boardHtmlTbody.children[cRow].cells[cCol].children[0];

            //ignore self
            if (neighborModel === cellModel) {
                continue;
            }
            flaggedNeighbors = neighborModel.IsFlagged ? flaggedNeighbors + 1 : flaggedNeighbors;
            neighbors.push({ model: neighborModel, html: neighborHtml });
        }
    }

    //check if theres a correct amount of flags placed around it
    if (flaggedNeighbors >= cellModel.NeighboringBombs) {
        neighbors.forEach(index  => {
            //ignore self, uncovered and flagged fields
            if (index.model === cellModel || index.model.IsRevealed || index.model.IsFlagged) {
                return;
            }

            //uncover neigbors
            onFieldClicked(index.model, index.html);
        })
    }
}

//highlight the neigbors of an uncovered field by adding a classname
function onFieldEnter(cellModel, cellHtml) {
    //only neighbors of uncovered fields should be marked
    if (!cellModel.IsRevealed) {
        return;
    }

    //loop around cellModels neigbors
    for (let cCol = cellModel.Column - 1; cCol < cellModel.Column + 2; cCol++) {
        if (cCol < 0 || cCol > _boardModel.Columns -1) {           //dont go out of the board
            continue;
        }

        for (let cRow = cellModel.Row - 1; cRow < cellModel.Row + 2; cRow++) {
            if (cRow < 0 || cRow > _boardModel.Rows -1) {          //dont go out of the board
                continue;
            }

            const neighborModel = _boardModel.Cells[cCol][cRow];
            const neighborHtml = _boardHtmlTbody.children[cRow].cells[cCol].children[0];

            //ignore self, revealed cells and flagged cells since they wont be marked
            if (neighborModel === cellModel || neighborModel.IsRevealed || neighborModel.IsFlagged) {
                continue;
            }

            if (!neighborHtml.className.includes(" hovering")) {
                neighborHtml.className += " hovering";
            }
        }
    }
}

//remove a classname of the neighbors from an uncovered field so its not highlighted anymore
function onFieldLeave(cellModel) {
    if (!cellModel.IsRevealed) {            //ignore covered fields since their neigbors wont be marked
        return;
    }

    //loop around cellModels neigbors
    for (let cCol = cellModel.Column -1; cCol < cellModel.Column + 2; cCol++) {
        if (cCol < 0 || cCol > _boardModel.Columns -1) {           //dont go out of the board
            continue;
        }

        for (let cRow = cellModel.Row - 1; cRow < cellModel.Row + 2; cRow++) {
            if (cRow < 0 || cRow > _boardModel.Rows -1) {          //dont go out of the board
                continue;
            }

            const neighborModel = _boardModel.Cells[cCol][cRow];
            const neighborHtml = _boardHtmlTbody.children[cRow].cells[cCol].children[0];

            //ignore self, revealed cells and flagged cells since they wont be marked
            if (neighborModel === cellModel || neighborModel.IsRevealed || neighborModel.IsFlagged) {
                continue;
            }

            if (neighborHtml.className.includes(" hovering")) {
                neighborHtml.className = neighborHtml.className.substring(0, neighborHtml.className.length - " hovering".length);
            }
        }
    }
}

function changeBoardProgress(fieldWasBomb) {
    if (!fieldWasBomb) {
        _uncoveredFields++;
        _boardProgress.textContent = `Covered fields: ${(_fieldAmount - _bombsInGF) - _uncoveredFields}/${_fieldAmount - _bombsInGF}`;
    }
}

//uncovers neighbors if the current field has no neigboring bombs
function uncoverNeighboringFields(cellModel, cellHtml) {
    cellHtml.onclick = () => { };
    cellHtml.oncontextmenu = (cursor) => {
        cursor.preventDefault();
    };

    //loop around cellModels neigbors
    for (let cCol = cellModel.Column - 1; cCol < cellModel.Column + 2; cCol++) {
        if (cCol < 0 || cCol > _boardModel.Columns - 1) {           //dont go out of the board
            continue;
        }

        for (let cRow = cellModel.Row - 1; cRow < cellModel.Row + 2; cRow++) {
            if (cRow < 0 || cRow > _boardModel.Rows - 1) {          //dont go out of the board
                continue;
            }

            const neighborModel = _boardModel.Cells[cCol][cRow];
            const neighborHtml = _boardHtmlTbody.children[cRow].cells[cCol].children[0];

            //ignore self and uncovered fields
            if (neighborModel === cellModel || neighborModel.IsRevealed) {
                continue;
            }

            neighborModel.IsRevealed = true;
            neighborHtml.className = "field";
            neighborHtml.textContent = neighborModel.NeighboringBombs;
            changeBoardProgress();

            //give player their flag back
            if (neighborModel.IsFlagged) {
                _setFlags--;
                neighborModel.IsFlagged = false;
                _remainingFlags.textContent = `Remaining flags: ${_bombsInGF - _setFlags}/${_bombsInGF}`;
            }

            //continue uncovering fields that have no bombs as neigbors!!!
            if (neighborModel.NeighboringBombs == _noNeighboringBombs) {
                neighborHtml.className = "empty field";
                uncoverNeighboringFields(neighborModel, neighborHtml);
            }
        }
    }
}

//changes both title and subtitle
function changeTitles(titleText, subtitleText) {
    let title = document.getElementById("title");
    let subtitle = document.getElementById("subtitle");

    title.textContent = titleText;
    subtitle.textContent = subtitleText[Math.floor(Math.random() * subtitleText.length)];
}

//iterates through the entire board to check if all non bomb fields have been revealed (game is finished)
function isGameFinished() {
    if (_lifeAmount <= 0) {
        return true;
    }

    let isFinished = true;
    _boardModel.Cells.forEach((row) => {
        row.forEach((cellModel) => {
            //ignore bombs since they shouldnt be uncovered to win
            if (cellModel.IsBomb) {
                return;
            }
            isFinished = cellModel.IsRevealed ? isFinished : false;
        });
    });

    return isFinished;
}

//reveals all bombs and disables events of all fields
//will only be called when the game is finished by winning or losing
function revealBoard(wonGame) {
    _boardHtml.className = wonGame ? _boardHtml.className + "won" : _boardHtml.className;
    _lossStreakCount = wonGame ? 0 : _lossStreakCount + 1;

    _boardModel.Cells.forEach((row) => {
        row.forEach((cellModel) => {
            const cellView = _boardHtmlTbody.children[cellModel.Row].cells[cellModel.Column].children[0];

            cellView.removeEventListener('click', dispatchLeftClick);
            cellView.removeEventListener('contextmenu', dispatchRightClick);
            cellView.removeEventListener('mouseenter', dispatchMouseEnter);
            cellView.removeEventListener('mouseleave', dispatchMouseLeave);

            cellView.oncontextmenu = (e) => { e.preventDefault(); };

            //reveal all uncovered bombs
            if (cellModel.IsExploded)
            {
                cellView.textContent = "💥";
            }
            else if (!cellModel.IsRevealed && cellModel.IsBomb) {
                cellView.textContent = "💣";
            }

            if (cellView.className.includes("hovering")) {
                cellView.className = cellView.className.substring(0, cellView.className.indexOf("hovering") - 1);
            }

            cellView.className = wonGame ? cellView.className + " won-game finished" : cellView.className + " finished";
        })
    });
}

function setFlag(cellModel, cellHtml) {
    if (cellModel.IsRevealed) {
        return;
    }

    //remove the flag
    if (cellModel.IsFlagged) {
        _setFlags--;
        cellModel.IsFlagged = false;
        cellHtml.textContent = "";
    }
    //only add a flag if the amount of set flags is lesser than the amount of bombs
    else if (_setFlags < _bombsInGF) {
        _setFlags++;
        cellModel.IsFlagged = true;
        cellHtml.textContent = "🚩";
    }

    _remainingFlags.textContent = `Remaining flags: ${_bombsInGF - _setFlags}/${_bombsInGF}`;
}

//accepts the custom size if its valid and resets the board
function confirmCustomSize() {
    let customRow = parseInt(document.getElementById("customRow").value);
    let customColumn = parseInt(document.getElementById("customColumn").value);

    if (customRow < 4 || customRow > 100 || isNaN(customRow) ||
        customColumn < 4 || customColumn > 100 || isNaN(customColumn)) {
        alert("Please choose a value between 5 and 99.");
        return;
    }

    resetGame(`${customRow}x${customColumn}`);
}

//change the life amount and reset the game
function confirmLifeAmount() {
    let userAmount = parseInt(document.getElementById("customLifes").value);

    if (userAmount > 99 || userAmount < 1 || isNaN(userAmount)) {
        alert("Please choose a life amount between 1 and 99");
        return;
    }

    //warn user about the reset
    if (_roundStarted && !isGameFinished() && !confirm("Applying new settings will also reset the current round." +
        "\nAre you sure you want to continue?")) {
        return;
    }

    _originalLifeAmount = userAmount;
    _lifes.textContent = `Lifes: ${_lifeAmount}`;

    changeTitlesOnLoss();
    setUpField(_currentBoardSize);
}

function changeTitlesOnLoss() {
    changeTitles("Good luck!", [_lossStreakCount + 1 + (_lossStreakCount + 1 == 1 ? "st " :
        _lossStreakCount + 1 == 2 ? "nd " :
            _lossStreakCount + 1 == 3 ? "rd " : "th ") + "try's a charm"]);
}