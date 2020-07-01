export default (game, roomGame, keyboardListener) => {
    var connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:5001/game").build();

    function init(start, updateRoom, playGame) {
        connection.start()
            .then(() => {
                registerEvents(start, updateRoom, playGame);
            })
            .catch((e) => {
                console.log(e);
            });
    }

    function registerEvents(start, updateRoom, playGame) {
        connection.on('Start', (connectionId, rooms ) => {
            start(connectionId, rooms);
        });
    
        connection.on('AddRoom', (rooms) => {
            roomGame.addRoom({ rooms, registerPlayer: registerPlayerInRoom });
        });
    
        connection.on('UpdateRoom', (roomId, room) => {
            updateRoom(roomId, room);
        });
    
        connection.on('PlayGame', playGame);
    
        connection.on('RegisterMove', (playerId, player) => {
            game.updatePlayer(playerId, player);
        });
    
        connection.on('PlayerStruck', playerIdStruck => {
            game.playerStruck(playerIdStruck);
        });

        connection.on('PlayerDead', playerIdStruck => {
            if (playerIdStruck === keyboardListener.getPlayer().playerId) keyboardListener.unsubscribeAll();
            game.playerDead(playerIdStruck);
        });
    }

    function registerMove(command) {
        connection.invoke('MovePlayer', keyboardListener.getRoom().roomId, command.playerId, command.keyPressed);
    }
    
    function shoot() {
        connection.invoke('Shoot', keyboardListener.getRoom().roomId, keyboardListener.getPlayer().playerId);
    }

    function loadGame(){
        const roomId = keyboardListener.getRoom().roomId;
        
        if (roomGame.state.rooms[roomId].owner === keyboardListener.getPlayer().playerId) connection.invoke('PlayGame', roomId);
    }

    function registerPlayerInRoom(roomId) {
        const player = keyboardListener.getPlayer();
        keyboardListener.selectRoom(roomId);
        connection.invoke('RegisterPlayerInRoom', player.playerId, player.connectionId, player.name, roomId);
        roomGame.enterRoom(roomId);
    }

    function createNewRoom() {
        connection.invoke('AddRoom', roomGame.state.newRoom.name);
    }

    function removePlayerRoom() {
        connection.invoke("RemovePlayerRoom", keyboardListener.getPlayer().playerId, keyboardListener.getRoom().roomId);
    }

    return {
        init,
        registerMove,
        shoot,
        loadGame,
        registerPlayerInRoom,
        createNewRoom,
        removePlayerRoom
    }
}