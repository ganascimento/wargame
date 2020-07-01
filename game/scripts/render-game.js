export default (document) => {
    
    function renderGame(canvas, requestAnimationFrame, game, myPlayer) {
        const context = canvas.getContext('2d');
        context.fillStyle = 'white';
        context.clearRect(0,0,50,50);

        for (const player in game.state.players){
            const currentPlayer = myPlayer.playerId === player ? true : false;
            
            drawPlayer(context, game.state.players[player], currentPlayer, myPlayer.color);
            drawShot(context, game.state.players[player].shot);
        }

        requestAnimationFrame(() => {
            renderGame(canvas, requestAnimationFrame, game, myPlayer);
        });
    }

    function renderRooms(command) {
        drawRoom(document, command);
    }

    function renderPlayer(command) {
        drawPlayerRoom(document, command);
    }

    function renderInfoPlayer(command) {
        drawPlayersInfoGame(document, command);
    }

    return {
        renderGame,
        renderRooms,
        renderPlayer,
        renderInfoPlayer
    };
}

function drawPlayer(context, player, currentPlayer, color) {
    const { x, y, move } = player;

    const moves = {
        Up(context, x, y) {
            context.fillRect(x, y+3, 1, 1);
            context.fillRect(x+2, y+3, 1, 1);
            context.fillRect(x, y+1, 3, 2);
            context.fillRect(x+1, y, 1, 1);
        },
        Down(context, x, y) {
            context.fillRect(x, y, 1, 1);
            context.fillRect(x+2, y, 1, 1);
            context.fillRect(x, y+1, 3, 2);
            context.fillRect(x+1, y+3, 1, 1);
        },
        Left(context, x, y) {
            context.fillRect(x+3, y, 1, 1);
            context.fillRect(x+3, y+2, 1, 1);
            context.fillRect(x+1, y, 2, 3);
            context.fillRect(x, y+1, 1, 1);
        },
        Right(context, x, y) {
            context.fillRect(x, y, 1, 1);
            context.fillRect(x, y+2, 1, 1);
            context.fillRect(x+1, y, 2, 3);
            context.fillRect(x+3, y+1, 1, 1);
        }
    }

    const movement = moves[move];
    
    if (movement) {
        if (currentPlayer && player.struck) context.fillStyle = 'red';
        else if (currentPlayer) context.fillStyle = color;
        else if (player.struck) context.fillStyle = 'red';
        else context.fillStyle = 'rgb(160,160,160)';
        movement(context, x, y);
    }
}

function drawShot(context, shot) {
    if (shot.enable) return;
    context.fillStyle = 'red';
    context.fillRect(shot.x, shot.y, 1, 1);
}

function drawRoom(document, command) {    
    let contentHtml = '';
    
    for (const roomId in command.rooms) {
        const numberPlayers = command.rooms[roomId].players ? Object.keys(command.rooms[roomId].players).length : 0;
        contentHtml += `<div class="room-item" room-id="${roomId}"><p>${command.rooms[roomId].name}</p><span>${numberPlayers}/4</span></div>`;
    }

    const contentRooms = document.getElementById('content-rooms');
    contentRooms.innerHTML = contentHtml;

    const roomItems = document.querySelectorAll('.room-item');

    roomItems.forEach(item => {        
        item.addEventListener('click', () => {
            command.registerPlayer(item.getAttribute('room-id'));
        });
    });
}

function drawPlayerRoom(document, command) {
    let contentHtml = '';
    const playBtn = document.getElementById('play-game');

    for (const playerId in command.rooms[command.myRoomId].players) {
        if (command.rooms[command.myRoomId].owner === command.myPlayerId) playBtn.style.display = 'block';
        else playBtn.style.display = 'none';
        contentHtml += `<div class="room-item"><p>${command.rooms[command.myRoomId].players[playerId].name}</p></div>`;
    }

    document.getElementById('content-player').innerHTML = contentHtml;
}

function drawPlayersInfoGame(document, command) {
    let contentHtml = '';

    const players = command.rooms[command.myRoomId].players;
    let playerDead = true;

    for (const playerId in players) {
        if (command.myPlayerId != playerId) contentHtml += `<div class="align-center content-player-info"><div>${players[playerId].name}</div><div class="content-life"><div style="width:${players[playerId].life}%" class="life"></div></div></div>`;
        else {
            document.getElementById('my-life').style.width = players[playerId].life + '%';
            playerDead = false;
        }
    }

    if (playerDead) document.getElementById('my-life').style.width = '0%';

    document.getElementById('status-other-players').innerHTML = contentHtml;
}