const playerOrder = ["scarlet", "mustard", "white", "green", "peacock", "plum"];
const MARKINGS = { tick: "✓", cross: "✕", none: " " };
const ROOMS = [
  "hall",
  "lounge",
  "library",
  "kitchen",
  "ball-room",
  "dining-room",
  "billiard-room",
  "conservatory",
  "study"
];
const SUSPECTS = ["scarlet", "mustard", "white", "green", "peacock", "plum"];
const WEAPONS = [
  "spanner",
  "dagger",
  "revolver",
  "rope",
  "lead-pipe",
  "candle-stick"
];

const isRoom = name => ROOMS.includes(name);
const isSuspect = name => SUSPECTS.includes(name);
const isWeapon = name => WEAPONS.includes(name);
const getInitialMarkings = () => new Array(6).fill(MARKINGS.none);

const getItemMarkingClassName = value => {
  const markings = Object.entries(MARKINGS);
  for (const [markingName, markingValue] of markings) {
    if (markingValue === value) return markingName;
  }
};

const getClueSheet = () => {
  const clueSheet = { room: ROOMS, suspect: SUSPECTS, weapon: WEAPONS };

  return Object.fromEntries(
    Object.entries(clueSheet).map(([categoryName, cardNames]) => {
      cardWithInitialMarkings = Object.fromEntries(
        cardNames.map(cardName => [cardName, getInitialMarkings()])
      );

      return [categoryName, cardWithInitialMarkings];
    })
  );
};

const CLUE_SHEET = getClueSheet();

const getClueChartData = () => {
  return JSON.parse(localStorage.getItem("clue-chart-data"));
};

class ClueChart {
  #clueChartData;
  #clueChartContainer;

  constructor({ clueChartData, clueChartContainer }) {
    this.#clueChartContainer = clueChartContainer;
    this.#clueChartData = clueChartData || CLUE_SHEET;
  }

  #updateStorage() {
    localStorage.setItem(
      "clue-chart-data",
      JSON.stringify(this.#clueChartData)
    );
  }

  #getItemStatusMarkers(itemName, itemMarkStatuses) {
    return itemMarkStatuses.map((value, index) => {
      const id = `${itemName}-${index + 1}`;
      const itemMarkStatusTemplate = [
        "div",
        { class: "item-status", id },
        value || " "
      ];

      const itemStatusElement = generateElement(itemMarkStatusTemplate);
      const itemStatusClass = getItemMarkingClassName(value);
      if (itemStatusClass) itemStatusElement.classList.add(itemStatusClass);

      return itemStatusElement;
    });
  }

  #generateCategoryItemElement(itemName, itemMarkStatuses) {
    const categoryItemElement = document.createElement("div");
    categoryItemElement.classList.add("item", `item-${itemName}`);

    const categoryItemTitleTemplate = [
      "div",
      { class: "item-header" },
      itemName.replace("-", " ")
    ];
    const categoryItemTitle = generateElement(categoryItemTitleTemplate);

    const itemStatusMarkers = this.#getItemStatusMarkers(
      itemName,
      itemMarkStatuses
    );

    categoryItemElement.append(categoryItemTitle, ...itemStatusMarkers);

    return categoryItemElement;
  }

  #generateCategoryItemElems(categoryName) {
    const categoryItemNames = this.#clueChartData[categoryName];

    return Object.entries(categoryItemNames).map(
      ([itemName, itemMarkStatuses]) =>
        this.#generateCategoryItemElement(itemName, itemMarkStatuses)
    );
  }

  #generateCategorySection(categoryName) {
    const categorySection = document.createElement("div");
    categorySection.classList.add(categoryName, "clue-category");

    const headerTemplate = ["h4", { class: "category-header" }, categoryName];
    const categorySectionHeader = generateElement(headerTemplate);

    const categoryItemElems = this.#generateCategoryItemElems(categoryName);

    categorySection.append(categorySectionHeader, ...categoryItemElems);

    return categorySection;
  }

  #generateClueChartSections() {
    return Object.keys(this.#clueChartData).map(categoryName =>
      this.#generateCategorySection(categoryName)
    );
  }

  #createClueChartElement() {
    const clueChartElement = document.createElement("div");
    clueChartElement.classList.add("clue-chart");
    const clueChartSections = this.#generateClueChartSections();
    clueChartElement.append(...clueChartSections);

    return clueChartElement;
  }

  #determineItemDetails(itemStatusId) {
    const itemStatusChunks = itemStatusId.split("-");
    const itemStatusIndex = itemStatusChunks.pop() - 1;
    const itemTitle = itemStatusChunks.join("-");

    return { itemStatusIndex, itemTitle };
  }

  #determineCategory(itemTitle) {
    if (isRoom(itemTitle)) return "room";
    if (isSuspect(itemTitle)) return "suspect";
    if (isWeapon(itemTitle)) return "weapon";
  }

  #getClueItem(itemStatusId) {
    const { itemTitle, itemStatusIndex } =
      this.#determineItemDetails(itemStatusId);
    const category = this.#determineCategory(itemTitle);

    const clueCategory = this.#clueChartData[category];
    if (!clueCategory) throw new Error(`${category} category not found`);

    const clueItem = clueCategory[itemTitle];
    if (!clueItem) throw new Error(`${clueItem} item not found`);

    if (!clueItem[itemStatusIndex])
      throw new Error(`${itemStatusIndex + 1} Invalid status id`);

    return { itemStatusIndex, clueItem };
  }

  #updateItemStatus(itemStatusId, markingName) {
    const { clueItem, itemStatusIndex } = this.#getClueItem(itemStatusId);
    clueItem[itemStatusIndex] = MARKINGS[markingName];
    this.#updateStorage();
  }

  #addTickOption(itemStatusElement, popUp) {
    const tickBtn = document.createElement("button");
    tickBtn.innerText = MARKINGS.tick;
    tickBtn.classList.add("tick");
    popUp.append(tickBtn);

    tickBtn.onclick = () => {
      itemStatusElement.innerText = MARKINGS.tick;
      itemStatusElement.classList.add("tick");
      itemStatusElement.classList.remove("cross");
      this.#updateItemStatus(itemStatusElement.id, "tick");
      popUp.remove();
    };
  }

  #addCrossOption(itemStatusElement, popUp) {
    const crossBtn = document.createElement("button");
    crossBtn.innerText = MARKINGS.cross;
    crossBtn.classList.add("cross");
    popUp.append(crossBtn);

    crossBtn.onclick = () => {
      itemStatusElement.innerText = MARKINGS.cross;
      itemStatusElement.classList.add("cross");
      itemStatusElement.classList.remove("tick");
      this.#updateItemStatus(itemStatusElement.id, "cross");
      popUp.remove();
    };
  }

  #addClearOption(itemStatusElement, popUp) {
    const clearBtn = document.createElement("button");
    clearBtn.innerText = "⌫";
    popUp.append(clearBtn);

    clearBtn.onclick = () => {
      itemStatusElement.innerText = MARKINGS.none;
      itemStatusElement.classList.remove("tick", "cross");
      this.#updateItemStatus(itemStatusElement.id, "none");
      popUp.remove();
    };
  }

  #addMarkingOptions(itemStatusElement, popUp) {
    this.#addTickOption(itemStatusElement, popUp);
    this.#addCrossOption(itemStatusElement, popUp);
    this.#addClearOption(itemStatusElement, popUp);
  }

  #addMarkingPopup(itemStatusElement) {
    const popUp = document.createElement("div");
    popUp.classList.add("mark-popup");

    this.#addMarkingOptions(itemStatusElement, popUp);

    popUp.style.position = "absolute";
    this.#clueChartContainer.append(popUp);

    popUp.style.left = itemStatusElement.offsetLeft;
    popUp.style.top = itemStatusElement.offsetTop;
  }

  #setupListeners() {
    const itemStatusElements = document.querySelectorAll(".item-status");

    itemStatusElements.forEach(itemStatusElement => {
      itemStatusElement.onclick = () => {
        const existingMarkPopup = document.querySelector(".mark-popup");
        existingMarkPopup?.remove();

        this.#addMarkingPopup(itemStatusElement);
      };
    });
  }

  render() {
    const clueChartElement = this.#createClueChartElement();
    this.#clueChartContainer.append(clueChartElement);
    this.#setupListeners();
  }

  disable() {
    this.#clueChartContainer.style.cursor = "not-allowed";
    const children = this.#clueChartContainer.querySelectorAll("*");
    children.forEach(child => {
      child.onclick = () => {};
      child.style.cursor = "not-allowed";
    });
  }

  clear() {
    localStorage.removeItem("clue-chart-data");
  }
}
