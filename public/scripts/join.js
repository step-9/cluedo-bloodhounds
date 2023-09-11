const getJoinGameBtn = () => document.querySelector("#join-game-btn");

const getJoinGameDialog = () => document.querySelector("#join-game-dialog");

const getCloseBtn = () => document.querySelector("#close-join-game-dialog");

const getJoinGameConfirmBtn = () =>
  document.querySelector("#join-game-confirm-btn");

const getJoinGameInputBox = () =>
  document.querySelector("#join-game-input-name");

const read = inputBox => {
  const value = inputBox.value;
  inputBox.value = "";
  return value;
};

const sendJoinLobbyRequest = requestInfo => {
  return fetch("/join", {
    method: "POST",
    body: JSON.stringify(requestInfo),
    headers: { "content-type": "application/json" }
  });
};

const setupNameInputBox = () => {
  const confirmBtn = getJoinGameConfirmBtn();
  const nameInputBox = getJoinGameInputBox();

  confirmBtn.onclick = () => {
    const name = read(nameInputBox);

    if (!name) return;

    sendJoinLobbyRequest({ name })
      .then(res => res.json())
      .then(({ error, redirectUri }) => {
        if (error) return alert("Lobby is Full");
        window.location.href = redirectUri;
      });
  };
};

const setupJoinGameDialog = () => {
  const joinGameDialog = getJoinGameDialog();
  const joinGameBtn = getJoinGameBtn();

  joinGameBtn.onclick = () => {
    joinGameDialog.showModal();
  };
};

const setupCloseDialog = () => {
  const joinGameDialog = getJoinGameDialog();
  const closeBtn = getCloseBtn();

  closeBtn.onclick = () => joinGameDialog.close();
};

const main = () => {
  setupJoinGameDialog();
  setupCloseDialog();
  setupNameInputBox();
};

window.onload = main;
