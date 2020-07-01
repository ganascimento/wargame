export default (document, init) => {
    const state = {
        name: null,
        color: null
    }

    const playerInfos = document.getElementById('player-infos');
    const lobby = document.getElementById('lobby');
    const colors = document.querySelectorAll('.color-select');
    const nameInput = document.getElementById('name-user');
    const startBtn = document.getElementById('start-game');

    startBtn.addEventListener('click', initGame);
    nameInput.addEventListener('change', setName);
    colors.forEach(color => {        
        const _color = color;
        color.addEventListener('click', () => { setColor(_color); })
    });

    function setColor(element) {
        const color = element.getAttribute('color');        
        state.color = color;

        colors.forEach(elementColor => {        
            elementColor.style.border = 'none';
        });

        element.style.border = "2px solid red";
        validForm();
    }

    function setName(event) {
        state.name = event.target.value;
        validForm();
    }

    function initGame() {
        if (validForm()) {
            init();
        }
        else {
            alert('Preencha o nome e escolha uma cor');
        }
    }

    function validForm() {
        if (state.name !== null && state.name.trim() !== '' && state.color !== null) {
            startBtn.classList.remove('game-btn-disabled');
            startBtn.classList.add('game-btn-enable');
            return true;
        }
        else {
            startBtn.classList.remove('game-btn-enable');
            startBtn.classList.add('game-btn-disabled');
            return false;
        }
    }

    function startGame() {
        playerInfos.style.display = 'none';
        lobby.style.display = 'flex';
    }

    return {
        state,
        startGame
    }
}