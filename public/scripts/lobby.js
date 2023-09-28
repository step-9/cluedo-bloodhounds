const resolveUrl = url => `${window.location.href}/${url}`;

const getLobbyDetails = () =>
  fetch(resolveUrl("details")).then(res => res.json());

const getWaitingAreaContainer = () => document.querySelector(".waiting-area");
const removeAllChilds = container => container.replaceChildren();
const getLobbyDetailsContainer = () => document.querySelector("#lobby-id");

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

const toAbsentPlayerHtml = () => {
  const playerCardTemplate = [
    "div",
    { class: "card empty-card" },
    [
      ["img", { class: "avatar", src: "/svg/lobby-avatar.svg" }],
      ["div", { class: "title" }, "?"]
    ]
  ];

  return generateElement(playerCardTemplate);
};

const renderLobbyPlayers = (playerDetails, noOfPlayers) => {
  const waitingAreaContainer = getWaitingAreaContainer();
  removeAllChilds(waitingAreaContainer);
  const playerDetailsHtml = playerDetails.map(toPlayerCardHtml);

  const noOfRemainingPlayers = noOfPlayers - playerDetails.length;
  const remainingPlayersHtml = new Array(noOfRemainingPlayers)
    .fill("")
    .map(toAbsentPlayerHtml);

  waitingAreaContainer.append(...playerDetailsHtml, ...remainingPlayersHtml);
};

const renderLobbyInfo = lobbyId => {
  const lobbyDetailsContainer = getLobbyDetailsContainer();
  lobbyDetailsContainer.innerText = `Room id: ${lobbyId}`;
};

const isNewData = (prevLobbyDetails, currentLobbyDetails) =>
  prevLobbyDetails.length !== currentLobbyDetails.length;

const main = () => {
  let currentLobbyDetails = [];

  const storeAndRenderLobbyDetails = ({ players, noOfPlayers, lobbyId }) => {
    currentLobbyDetails = players;
    renderLobbyInfo(lobbyId);
    renderLobbyPlayers(players, noOfPlayers);
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
