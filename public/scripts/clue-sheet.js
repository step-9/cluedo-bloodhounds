const playerOrder = ["scarlet", "mustard", "white", "green", "peacock", "plum"];

const cluesheet = {
  room: {
    hall: [],
    lounge: [],
    library: [],
    kitchen: [],
    "ball-room": [],
    "dining-room": [],
    "billiard-room": [],
    conservatory: [],
    study: []
  },

  suspect: {
    scarlet: [],
    mustard: [],
    white: [],
    green: [],
    peacock: [],
    plum: []
  },

  weapon: {
    spanner: [],
    dagger: [],
    revolver: [],
    rope: [],
    "lead-pipe": [],
    "candle-stick": []
  }
};

const getItemStatusMarkers = itemName => {
  const noOfCheckBoxes = 6;

  return new Array(noOfCheckBoxes).fill("").map((_, index) => {
    const id = `${itemName}-${index + 1}`;
    return ["div", { class: "item-status", id }, ""];
  });
};

const getCategoryTemplates = categoryName => {
  const items = Object.keys(cluesheet[categoryName]);

  return items.map(itemName => {
    return [
      "div",
      { class: `item-${itemName} item` },
      [
        ["div", { class: "item-header" }, itemName.replace("-", " ")],
        ...getItemStatusMarkers(itemName)
      ]
    ];
  });
};

const generateClueChartTemplate = () => {
  return Object.keys(cluesheet).map(categoryName => {
    return [
      "div",
      { class: `${categoryName} clue-category` },
      [
        ["h4", { class: "category-header" }, categoryName],
        ...getCategoryTemplates(categoryName)
      ]
    ];
  });
};

const renderClueChart = () => {
  const clueChartTemplate = [
    "div",
    { class: "clue-chart" },
    generateClueChartTemplate()
  ];

  console.log(clueChartTemplate);

  const clueChartElement = generateElement(clueChartTemplate);
  const clueChartContainer = document.querySelector(".clue-chart-container");
  clueChartContainer.append(clueChartElement);
};
