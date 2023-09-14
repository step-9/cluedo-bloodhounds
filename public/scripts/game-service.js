class GameService {
  constructor() {}

  getGameState(onResponse) {
    fetch("/game/state")
      .then(res => res.json())
      .then(onResponse);
  }

  getInitialData() {
    return fetch("/game/initial-state").then(res => res.json());
  }

  endTurn() {
    fetch("/game/end-turn", { method: "POST" });
  }

  getBoardStructure() {
    return fetch("/svg/board.svg").then(res => res.text());
  }

  sendMovePawnReq(tileId) {
    fetch("/game/move-pawn", {
      method: "PATCH",
      body: JSON.stringify(tileId)
    });
  }
}
