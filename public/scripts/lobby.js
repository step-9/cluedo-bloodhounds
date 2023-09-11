const getLobbyDetails = () => fetch("/lobby-details");
const getWaitingAreaContainer = () => document.querySelector(".waiting-area");

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

const renderLobby = playerDetails => {
  const waitingAreaContainer = getWaitingAreaContainer();
  const playerDetailsHtml = playerDetails.map(toPlayerCardHtml);
  waitingAreaContainer.append(...playerDetailsHtml);
};

const main = () => {
  showLoader();

  getLobbyDetails()
    .then(res => res.json())
    .then(renderLobby);
};

window.onload = main;
