import createRenderScreen from './render-game.js'
import createGame from './game.js';
import createKeyboardListener  from './keyboard-listener.js';
import createInitGame from './home.js'
import createRoom from './room.js';
import createSocket from './socket.js';

const keyboardListener = createKeyboardListener(document);
const game = createGame();
const initGame = createInitGame(document, init);
const roomGame = createRoom(document, createNewRoom, keyboardListener, enterRoomRegister, returnLobbyRegister);
const renderScreen = createRenderScreen(document);
const socket = createSocket(game, roomGame, keyboardListener);

document.getElementById('play-game').addEventListener('click', socket.loadGame);
document.getElementById('return-game-btn').addEventListener('click', backGame);

function init() {
    socket.init(start, updateRoom, playGame);
}

function createNewRoom() {
    socket.createNewRoom();
}

function start(connectionId, rooms) {
    const playerId = `${initGame.state.name}${connectionId}`;
    keyboardListener.registerPlayer(playerId, connectionId, initGame.state);
    roomGame.subscribe(renderScreen.renderRooms);
    initGame.startGame();
    roomGame.addRoom({ rooms, registerPlayer: socket.registerPlayerInRoom });
}

function enterRoomRegister() {
    roomGame.subscribe(renderScreen.renderPlayer);
}

function returnLobbyRegister() {
    roomGame.unsubscribeAll();
    roomGame.subscribe(renderScreen.renderRooms);
    socket.removePlayerRoom();
    keyboardListener.clearRoom();
}

function updateRoom(roomId, room) {
    const command = {
        roomId,
        room,
        registerPlayer: socket.registerPlayerInRoom
    };

    roomGame.updateRoom(command);
    game.updatePlayers(room.players);
}

function playGame(room) {
    document.getElementById('select-room').style.display = 'none';
    document.getElementById('screen-game').style.display = 'flex';
    document.getElementById('color-player-icon').style.backgroundColor = keyboardListener.getPlayer().color;
    document.getElementById('name-player-game').innerHTML = keyboardListener.getPlayer().name;
    game.addPlayers({ players: room.players });
    renderScreen.renderGame(document.getElementById('screen'), requestAnimationFrame, game, keyboardListener.getPlayer());
    keyboardListener.subscribe(game.movePlayer);
    keyboardListener.subscribe(socket.registerMove);
    game.subscribe(socket.shoot);
    roomGame.unsubscribeAll();
    roomGame.subscribe(renderScreen.renderInfoPlayer);
    roomGame.notifyStartGame();
}

function backGame() {
    document.getElementById('screen-game').style.display = 'none';
    document.getElementById('lobby').style.display = 'flex';
    keyboardListener.unsubscribeAll();
    game.unsubscribeAll();
    returnLobbyRegister();
}