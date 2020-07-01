export default () => {
    const state = {
        players: {},
        observers: []
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

    function addPlayers(command) {
        for (const playerId in command.players) {
            state.players[playerId] = command.players[playerId];
        }
    }

    function updatePlayer(playerId, player) {
        state.players[playerId] = player;
    }

    function updatePlayers(players) {
        state.players = players;
    }

    function movePlayer(command) {
        const accpetMoves = {
            ArrowUp(player) {
                if (player.y <= 0) return;
                player.y -= 1;
                player.move = 'Up';
            },
            ArrowDown(player) {
                if (player.y >= 47) return;
                player.y += 1;
                player.move = 'Down';
            },
            ArrowLeft(player) {
                if (player.x <= 0) return;
                player.x -= 1;
                player.move = 'Left';
            },
            ArrowRight(player) {
                if (player.x >= 47) return;
                player.x += 1;
                player.move = 'Right';
            },
            f(player, playerId) {
                if (!player.shot.enable) return;
                player.shot.enable = false;
                fireShot(playerId);
            }
        }

        const keyPressed = command.keyPressed;
        const playerId = command.playerId;
        const player = state.players[playerId];
        const moveFunction = accpetMoves[keyPressed];
        
        if (player && moveFunction) {
            moveFunction(player, playerId);
        }
    }

    function fireShot(playerId) {
        notifyAll({ players: state.players });

        const player = state.players[playerId];

        setTimeout(() => {
            if (!player.shot.enable) {
                fireShot(playerId);
            }
        }, 25);
    }

    function playerStruck(playerId) {
        state.players[playerId].struck = true;

        setTimeout(() => {
            state.players[playerId].struck = false;
        }, 200);
    }

    function playerDead(playerId) {
        state.players[playerId].struck = true;

        setTimeout(() => {
            delete state.players[playerId];
        }, 500);
    }

    return {
        state,
        subscribe,
        movePlayer,
        addPlayers,
        updatePlayer,
        playerStruck,
        playerDead,
        unsubscribeAll,
        updatePlayers
    }
}