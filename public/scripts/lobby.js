const getLobbyDetails = () => fetch("/lobby-details").then(res => res.json());
const getWaitingAreaContainer = () => document.querySelector(".waiting-area");
const removeAllChilds = container => container.replaceChildren();

const toPlayerCardHtml = ({ name }) => {
  const playerCardTemplate = [
    "div",
    { class: "card" },
    [
      ["img", { class: "avatar", src: "/images/waiting-person-avatar.png" }],
      ["div", { class: "title" }, name]
    ]
  ];

  return generateElement(playerCardTemplate);
};

const sendGamePageRequest = () => {
  setTimeout(() => {
    window.location.href = "/game";
  }, 500);
};

const renderLobby = playerDetails => {
  const waitingAreaContainer = getWaitingAreaContainer();
  removeAllChilds(waitingAreaContainer);
  const playerDetailsHtml = playerDetails.map(toPlayerCardHtml);
  waitingAreaContainer.append(...playerDetailsHtml);
};

const isNewData = (prevLobbyDetails, currentLobbyDetails) =>
  prevLobbyDetails.length !== currentLobbyDetails.length;

const startGameWhenPlayersJoined = currentLobbyDetails => {
  if (currentLobbyDetails.length === 3) sendGamePageRequest();
};

const main = () => {
  showLoader();

  let currentLobbyDetails = [];

  const storeAndRenderLobbyDetails = lobbyDetails => {
    currentLobbyDetails = lobbyDetails;
    renderLobby(lobbyDetails);
  };

  getLobbyDetails().then(storeAndRenderLobbyDetails);

  setInterval(() => {
    getLobbyDetails().then(lobbyDetails => {
      if (isNewData(currentLobbyDetails, lobbyDetails))
        storeAndRenderLobbyDetails(lobbyDetails);

      startGameWhenPlayersJoined(currentLobbyDetails);
    });
  }, 500);
};

window.onload = main;
