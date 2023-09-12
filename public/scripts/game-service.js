class GameService {
  constructor() {}

  getInitialData(onData) {
    fetch("/game/initial-state")
      .then(res => res.json())
      .then(onData);
  }
}
