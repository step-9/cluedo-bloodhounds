const getLoader = () => document.querySelector(".loader");

const showLoader = () => {
  const loader = getLoader();
  let counter = 0;

  setInterval(() => {
    loader.innerText += ".";
    counter += 1;
    if (counter % 4 === 0) loader.innerText = "";
  }, 500);
};
