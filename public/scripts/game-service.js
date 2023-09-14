class GameService {
  constructor() {}

  getInitialData(onResponse) {
    fetch("/game/initial-state")
      .then(res => res.json())
      .then(onResponse);
  }

  getGameState(onResponse) {
    fetch("/game/state")
      .then(res => res.json())
      .then(onResponse);
  }

  endTurn() {
    fetch("/game/end-turn", { method: "POST" });
  }

  getBoardStructure(onData) {
    fetch("/svg/board.svg")
      .then(res => res.text())
      .then(onData);
  }
}
