const resolveUrl = url => `${window.location.href}/${url}`;

class GameService {
  constructor() {}

  getGameState(onResponse) {
    fetch(resolveUrl("state"))
      .then(res => {
        if (res.redirected) return window.location.replace(res.url);
        return res.json();
      })
      .then(onResponse);
  }

  getInitialData() {
    return fetch(resolveUrl("initial-state")).then(res => {
      if (res.redirected) return window.location.replace(res.url);
      return res.json();
    });
  }

  endTurn() {
    fetch(resolveUrl("end-turn"), { method: "POST" });
  }

  getBoardStructure() {
    return fetch("/svg/board.svg").then(res => res.text());
  }

  getCardsInfo() {
    return fetch(resolveUrl("cards")).then(res => res.json());
  }

  startAccusation() {
    return fetch(resolveUrl("accusation-state"), {
      method: "PATCH",
      body: JSON.stringify({ isAccusing: true })
    });
  }

  sendDenySuspicionReq() {
    return fetch(resolveUrl("deny-suspicion"), {
      method: "PATCH",
      body: JSON.stringify({ canSuspect: false })
    });
  }

  accuse(accusationCombination) {
    return fetch(resolveUrl("accuse"), {
      method: "POST",
      body: JSON.stringify(accusationCombination),
      headers: { "content-type": "application/json" }
    }).then(res => res.json());
  }

  sendMovePawnReq(tileId) {
    return fetch(resolveUrl("move-pawn"), {
      method: "PATCH",
      body: JSON.stringify(tileId),
      headers: { "content-type": "application/json" }
    });
  }

  sendPlayAgainRequest() {
    window.location.href = "/";
  }

  getUpdatedPositions() {
    return fetch(resolveUrl("character-positions")).then(res => res.json());
  }

  getAccusationResult() {
    return fetch(resolveUrl("accusation-result")).then(res => res.json());
  }

  getGameOverInfo() {
    return fetch(resolveUrl("game-over-info")).then(res => res.json());
  }

  rollDice() {
    return fetch(resolveUrl("roll-dice"), {
      method: "POST"
    }).then(res => res.json());
  }

  getLastDiceRollCombination() {
    return fetch(resolveUrl("dice-combination")).then(res => res.json());
  }

  startSuspicion() {
    return fetch(resolveUrl("suspicion-state"), {
      method: "PATCH",
      body: JSON.stringify({ isSuspecting: true })
    });
  }

  getSuspicionCombination() {
    return fetch(resolveUrl("suspicion-combination")).then(res => res.json());
  }

  suspect(suspicionCombination) {
    return fetch(resolveUrl("suspect"), {
      method: "POST",
      body: JSON.stringify(suspicionCombination),
      headers: { "content-type": "application/json" }
    });
  }

  getLastSuspicionPosition() {
    return fetch(resolveUrl("last-suspicion-position")).then(res => res.json());
  }

  sendInvalidatedCard(title) {
    return fetch(resolveUrl("suspect/invalidate"), {
      method: "POST",
      body: JSON.stringify({ title }),
      headers: { "content-type": "application/json" }
    });
  }

  getInvalidatedCard() {
    return fetch(resolveUrl("suspect/invalidate")).then(res => res.json());
  }

  cancelAccusation() {
    return fetch(resolveUrl("accuse"), {
      method: "PATCH",
      body: JSON.stringify({ isAccusing: false }),
      headers: { "content-type": "application/json" }
    });
  }
}
