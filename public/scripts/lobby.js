const getLobbyDetails = () => fetch("/lobby/details").then(res => res.json());
const getWaitingAreaContainer = () => document.querySelector(".waiting-area");
const removeAllChilds = container => container.replaceChildren();

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

const main = () => {
  let currentLobbyDetails = [];

  const storeAndRenderLobbyDetails = ({ lobbyDetails }) => {
    currentLobbyDetails = lobbyDetails;
    renderLobby(lobbyDetails);
  };

  getLobbyDetails().then(storeAndRenderLobbyDetails);

  const pollingInterval = setInterval(() => {
    getLobbyDetails().then(({ isFull, lobbyDetails }) => {
      if (isNewData(currentLobbyDetails, lobbyDetails))
        storeAndRenderLobbyDetails({ lobbyDetails });

      if (isFull) {
        clearInterval(pollingInterval);
        sendGamePageRequest();
      }
    });
  }, 500);
};

window.onload = main;
