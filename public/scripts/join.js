const getJoinGameBtn = () => document.querySelector("#join-game-btn");

const getHostGameBtn = () => document.querySelector("#host-game-btn");

const getJoinGameDialog = () => document.querySelector("#join-game-dialog");

const getHostGameDialog = () => document.querySelector("#host-game-dialog");

const getJoinGameCloseBtn = () =>
  document.querySelector("#close-join-game-dialog");

const getHostGameCloseBtn = () =>
  document.querySelector("#close-host-game-dialog");

const getJoinGameConfirmBtn = () =>
  document.querySelector("#join-game-confirm-btn");

const getHostGameConfirmBtn = () =>
  document.querySelector("#host-game-confirm-btn");

const getJoinGameNameInputBox = () =>
  document.querySelector("#join-game-input-name");

const getJoinGameLobbyIdInputBox = () =>
  document.querySelector("#join-game-input-lobby-id");

const getHostGameNameInputBox = () =>
  document.querySelector("#host-game-input-name");

const getNoOfPlayersInputBox = () =>
  document.querySelector("#host-game-input-players");

const read = inputBox => {
  const value = inputBox.value;
  inputBox.value = "";
  return value;
};

const sendJoinLobbyRequest = requestInfo => {
  return fetch("/lobby/join", {
    method: "POST",
    body: JSON.stringify(requestInfo),
    headers: { "content-type": "application/json" }
  });
};

const setupJoinInputBox = () => {
  const confirmBtn = getJoinGameConfirmBtn();
  const nameInputBox = getJoinGameNameInputBox();
  const lobbyIdInputBox = getJoinGameLobbyIdInputBox();

  confirmBtn.onclick = () => {
    const name = read(nameInputBox);
    const lobbyId = read(lobbyIdInputBox);

    if (!name || !lobbyId) return;

    sendJoinLobbyRequest({ name, lobbyId })
      .then(res => res.json())
      .then(({ error, redirectUri }) => {
        if (error) return alert(error);
        window.location.href = redirectUri;
      });
  };
};

const sendHostGameRequest = requestInfo => {
  return fetch("/lobby/host", {
    method: "POST",
    body: JSON.stringify(requestInfo),
    headers: { "content-type": "application/json" }
  });
};

const setupHostInputBox = () => {
  const confirmBtn = getHostGameConfirmBtn();
  const nameInputBox = getHostGameNameInputBox();
  const noOfPlayersInputBox = getNoOfPlayersInputBox();

  confirmBtn.onclick = () => {
    const name = read(nameInputBox);
    const noOfPlayers = read(noOfPlayersInputBox);

    if (!name || !noOfPlayers) return;

    sendHostGameRequest({ name, noOfPlayers })
      .then(res => res.json())
      .then(({ redirectUri }) => {
        window.location.href = redirectUri;
      });
  };
};

const setupJoinGameDialog = () => {
  const joinGameDialog = getJoinGameDialog();
  const joinGameBtn = getJoinGameBtn();

  const closeBtn = getJoinGameCloseBtn();

  closeBtn.onclick = () => joinGameDialog.close();

  joinGameBtn.onclick = () => {
    joinGameDialog.showModal();
  };
};

const setupHostGameDialog = () => {
  const hostGameDialog = getHostGameDialog();
  const hostGameBtn = getHostGameBtn();
  const closeBtn = getHostGameCloseBtn();

  closeBtn.onclick = () => hostGameDialog.close();

  hostGameBtn.onclick = () => {
    hostGameDialog.showModal();
  };
};

const main = () => {
  setupJoinGameDialog();
  setupHostGameDialog();
  setupJoinInputBox();
  setupHostInputBox();
};

window.onload = main;
