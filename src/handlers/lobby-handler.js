const sendRoomFullError = (_, res) =>
  res.status(406).send({ error: "Room is Full" });

const handleJoinRequest = (req, res) => {
  const { lobby } = req.app.context;
  const { name } = req.body;

  const { isFull, playerId } = lobby.registerPlayer({ name });

  if (isFull) return sendRoomFullError(req, res);
  res.status(201).json({ playerId, isFull });
};

const serveLobbyPage = (req, res) => {
  res.sendFile("lobby.html", { root: "private/pages" });
};

module.exports = { handleJoinRequest, serveLobbyPage };
