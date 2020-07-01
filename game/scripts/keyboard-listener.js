export default (document) => {
    document.addEventListener('keydown', handleKeyDown);

    const state = {
        observers: [],
        player: {
            playerId: null,
            connectionId: null,
            color: null,
            name: null
        },
        room: {
            roomId: null
        }
        
    }

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

    function registerPlayer(playerId, connectionId, player) {
        state.player.playerId = playerId;
        state.player.connectionId = connectionId;
        state.player.name = player.name;
        state.player.color = player.color;
    }

    function selectRoom(roomId) {
        state.room.roomId = roomId;
    }

    function clearRoom() {
        state.room.roomId = null;
    }

    function handleKeyDown(event) {
        const keyPressed = event.key;

        const command = {
            playerId: state.player.playerId,
            keyPressed
        }

        notifyAll(command);
    }

    function getPlayer() {
        return state.player;
    }

    function getRoom(){
        return state.room;
    }

    return {
        subscribe,
        registerPlayer,
        selectRoom,
        getPlayer,
        getRoom,
        unsubscribeAll,
        clearRoom
    }
}