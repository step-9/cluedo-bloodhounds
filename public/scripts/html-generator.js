const generateElement = ([tagName, attributes, children]) => {
  const element = document.createElement(tagName);

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  if (typeof children === "string") element.innerText = children;
  else if (Array.isArray(children))
    element.append(...children.map(generateElement));
  else element.append(children);

  return element;
};
