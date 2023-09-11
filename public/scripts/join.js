const getJoinGameBtn = () => document.querySelector("#join-game-btn");

const getJoinGameDialog = () => document.querySelector("#join-game-dialog");

const getCloseBtn = () => document.querySelector("#close-join-game-dialog");

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
};

window.onload = main;
