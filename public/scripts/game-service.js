class GameService {
  constructor() {}

  getGameState(onResponse) {
    fetch("/game/state")
      .then(res => {
        if (res.redirected) return window.location.replace(res.url);
        return res.json();
      })
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

  getCardsInfo() {
    return fetch("/game/cards").then(res => res.json());
  }

  startAccusation() {
    return fetch("/game/accusation-state", {
      method: "PATCH",
      body: JSON.stringify({ isAccusing: true })
    });
  }

  accuse(accusationCombination) {
    return fetch("/game/accuse", {
      method: "POST",
      body: JSON.stringify(accusationCombination),
      headers: { "content-type": "application/json" }
    }).then(res => res.json());
  }

  sendMovePawnReq(tileId) {
    return fetch("/game/move-pawn", {
      method: "PATCH",
      body: JSON.stringify(tileId),
      headers: { "content-type": "application/json" }
    });
  }

  sendPlayAgainRequest() {
    window.location.href = "/";
  }

  getUpdatedPositions() {
    return fetch("/game/character-positions").then(res => res.json());
  }

  getAccusationResult() {
    return fetch("/game/accusation-result").then(res => res.json());
  }

  getGameOverInfo() {
    return fetch("/game/game-over-info").then(res => res.json());
  }
}
