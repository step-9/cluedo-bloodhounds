class GameService {
  constructor() {}

  getInitialData(onData) {
    fetch("/game/initial-state")
      .then(res => res.json())
      .then(onData);
  }

  getBoardStructure(onData) {
    fetch("/svg/board.svg")
      .then(res => res.text())
      .then(onData);
  }
}
