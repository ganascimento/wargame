export default (document, createNewRoom, keyboardListener, enterRoomRegister, returnLobbyRegister) => {
    const state = {
        rooms: {},
        newRoom: {
            name: null
        },
        observers: []
    };

    function subscribe(observerFunction) {
        state.observers.push(observerFunction);
    }

    function unsubscribeAll() {
        state.observers = [];
    }

    function notifyAll(command) {
        for (const observerFunction of state.observers) {
            observerFunction(command);
        }
    }

    const createRoomBtn = document.getElementById('create-room');
    const contentRoom = document.getElementById('content-create-room');
    const btnOpenModal = document.getElementById('open-modal-create-room');
    const myRoom = document.getElementById('select-room');
    const contentNameRoom = document.getElementById('content-name-room');
    const lobby = document.getElementById('lobby');

    createRoomBtn.addEventListener('click', createRoom);
    document.getElementById('name-room').addEventListener('change', setNewRoom);
    document.getElementById('return-btn').addEventListener('click', returnToLobby);
    
    window.onclick = event => {
        if (event.target === contentRoom) {
            contentRoom.style.display = 'none';
        }
    }

    btnOpenModal.onclick =  () => {
        contentRoom.style.display = 'flex';
    }

    function setNewRoom(event) {
        state.newRoom.name = event.target.value;
        validForm();
    }

    function createRoom() {
        if (validForm()) {
            createNewRoom();
            contentRoom.style.display = 'none';
        }
        else {
            alert("Preencha o nome da sala");
        }
    }

    function validForm() {
        if (state.newRoom.name != null && state.newRoom.name.trim() !== '') {
            createRoomBtn.classList.remove('game-btn-disabled');
            createRoomBtn.classList.add('game-btn-enable');
            return true;
        }
        else {
            createRoomBtn.classList.remove('game-btn-enable');
            createRoomBtn.classList.add('game-btn-disabled');
            return false;
        }
    }
    
    function addRoom(command) {
        for (const roomId in command.rooms) {
            state.rooms[roomId] = command.rooms[roomId];
        }

        notifyAll({
            rooms: state.rooms,
            registerPlayer: command.registerPlayer
        });
    }

    function updateRoom(command) {
        state.rooms[command.roomId] = command.room;

        notifyAll({
            rooms: state.rooms,
            registerPlayer: command.registerPlayer,
            myRoomId: keyboardListener.getRoom().roomId,
            myPlayerId: keyboardListener.getPlayer().playerId
        });
    }

    function enterRoom(roomId) {
        lobby.style.display = "none";
        myRoom.style.display = "flex";
        contentNameRoom.innerHTML = state.rooms[roomId].name;
        enterRoomRegister();
    }

    function returnToLobby() {
        myRoom.style.display = "none";
        lobby.style.display = "flex";
        returnLobbyRegister();
    }

    function notifyStartGame(){
        notifyAll({
            rooms: state.rooms,
            myRoomId: keyboardListener.getRoom().roomId,
            myPlayerId: keyboardListener.getPlayer().playerId
        });
    }

    return {
        state,
        subscribe,
        addRoom,
        updateRoom,
        enterRoom,
        unsubscribeAll,
        notifyStartGame
    }
}