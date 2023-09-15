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
    return fetch("/game/accuse", {
      method: "PATCH",
      body: JSON.stringify({ isAccusing: true })
    });
  }

  sendMovePawnReq(tileId) {
    return fetch("/game/move-pawn", {
      method: "PATCH",
      body: JSON.stringify(tileId),
      headers: { "content-type": "application/json" }
    });
  }
}
