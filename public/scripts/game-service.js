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

  rollDice() {
    return fetch("/game/roll-dice", {
      method: "POST"
    }).then(res => res.json());
  }

  getLastDiceRollCombination() {
    return fetch("/game/dice-combination").then(res => res.json());
  }

  startSuspicion() {
    return fetch("/game/suspicion-state", {
      method: "PATCH",
      body: JSON.stringify({ isSuspecting: true })
    });
  }

  getSuspicionCombination() {
    return fetch("/game/suspicion-combination").then(res => res.json());
  }

  suspect(suspicionCombination) {
    return fetch("/game/suspect", {
      method: "POST",
      body: JSON.stringify(suspicionCombination),
      headers: { "content-type": "application/json" }
    });
  }

  getLastSuspicionPosition() {
    return fetch("/game/last-suspicion-position").then(res => res.json());
  }

  sendInvalidatedCard(title) {
    return fetch("/game/suspect/invalidate", {
      method: "POST",
      body: JSON.stringify({ title }),
      headers: { "content-type": "application/json" }
    });
  }

  getInvalidatedCard() {
    return fetch("/game/suspect/invalidate").then(res => res.json());
  }
}
