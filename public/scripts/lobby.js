const resolveUrl = url => `${window.location.href}/${url}`;

const getLobbyDetails = () =>
  fetch(resolveUrl("details")).then(res => res.json());

const getWaitingAreaContainer = () => document.querySelector(".waiting-area");
const removeAllChilds = container => container.replaceChildren();
const getLobbyDetailsContainer = () => document.querySelector("#no-of-players");
const getNoOfPlayersContainer = () => document.querySelector("#lobby-id");

const toPlayerCardHtml = ({ name }) => {
  const playerCardTemplate = [
    "div",
    { class: "card" },
    [
      ["img", { class: "avatar", src: "/svg/lobby-avatar.svg" }],
      ["div", { class: "title" }, name]
    ]
  ];

  return generateElement(playerCardTemplate);
};

const sendGamePageRequest = lobbyId => {
  setTimeout(() => {
    window.location.href = `/game/${lobbyId}`;
  }, 500);
};

const renderLobbyPlayers = playerDetails => {
  const waitingAreaContainer = getWaitingAreaContainer();
  removeAllChilds(waitingAreaContainer);
  const playerDetailsHtml = playerDetails.map(toPlayerCardHtml);
  waitingAreaContainer.append(...playerDetailsHtml);
};

const renderLobbyInfo = (noOfPlayers, lobbyId) => {
  const lobbyDetailsContainer = getLobbyDetailsContainer();
  const noOfPlayersContainer = getNoOfPlayersContainer();
  lobbyDetailsContainer.innerText = `Room id: ${lobbyId}`;
  noOfPlayersContainer.innerText = `Number of players: ${noOfPlayers}`;
};

const isNewData = (prevLobbyDetails, currentLobbyDetails) =>
  prevLobbyDetails.length !== currentLobbyDetails.length;

const main = () => {
  let currentLobbyDetails = [];

  const storeAndRenderLobbyDetails = ({ players, noOfPlayers, lobbyId }) => {
    currentLobbyDetails = players;
    renderLobbyInfo(noOfPlayers, lobbyId);
    renderLobbyPlayers(players);
  };

  getLobbyDetails().then(storeAndRenderLobbyDetails);

  const pollingInterval = setInterval(() => {
    getLobbyDetails().then(({ isFull, players, noOfPlayers, lobbyId }) => {
      if (isNewData(currentLobbyDetails, players))
        storeAndRenderLobbyDetails({ players, noOfPlayers, lobbyId });

      if (isFull) {
        clearInterval(pollingInterval);
        sendGamePageRequest(lobbyId);
      }
    });
  }, 500);
};

window.onload = main;
