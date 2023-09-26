const playerOrder = ["scarlet", "mustard", "white", "green", "peacock", "plum"];

const MARKINGS = {
  tick: "✓",
  cross: "✕",
  none: " "
};

const getInitialMarkings = () => new Array(6).fill(MARKINGS.none);

const getClueSheet = () => {
  const clueSheet = {
    room: [
      "hall",
      "lounge",
      "library",
      "kitchen",
      "ball-room",
      "dining-room",
      "billiard-room",
      "conservatory",
      "study"
    ],
    suspect: ["scarlet", "mustard", "white", "green", "peacock", "plum"],
    weapon: [
      "spanner",
      "dagger",
      "revolver",
      "rope",
      "lead-pipe",
      "candle-stick"
    ]
  };

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

class ClueChart {
  #clueChartData;
  #clueChartContainer;

  constructor({ clueChartData, clueChartContainer }) {
    this.#clueChartContainer = clueChartContainer;
    this.#clueChartData = clueChartData || CLUE_SHEET;
  }

  #getItemStatusMarkers(itemName, itemMarkStatuses) {
    return itemMarkStatuses.map((value, index) => {
      const id = `${itemName}-${index + 1}`;
      const itemMarkStatusTemplate = [
        "div",
        { class: "item-status", id },
        value
      ];

      return generateElement(itemMarkStatusTemplate);
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

  #addTickOption(itemStatusElement, popUp) {
    const tickBtn = document.createElement("button");
    tickBtn.innerText = MARKINGS.tick;
    tickBtn.classList.add("tick");
    popUp.append(tickBtn);

    tickBtn.onclick = () => {
      itemStatusElement.innerText = MARKINGS.tick;
      itemStatusElement.classList.add("tick");
      itemStatusElement.classList.remove("cross");
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
        const markPopup = document.querySelector(".mark-popup");

        markPopup?.remove();

        this.#addMarkingPopup(itemStatusElement);
      };
    });
  }

  render() {
    const clueChartElement = this.#createClueChartElement();
    this.#clueChartContainer.append(clueChartElement);
    this.#setupListeners();
  }
}
