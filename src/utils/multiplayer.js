import Peer from "peerjs";

let peerInstance = null;
let activeConnections = [];

export function initializePeer(onOpen) {
  if (peerInstance) {
    peerInstance.destroy();
  }
  try {
    peerInstance = new Peer({
      config: {
        // Pega aquí la lista exacta de iceServers que te dio Metered.ca
        iceServers: [
          {
            urls: "stun:stun.relay.metered.ca:80",
          },
          {
            urls: "turn:global.relay.metered.ca:80",
            username: "3e3fed6870ed92db3ae7d228",
            credential: "TvtZmp5UctYry9td",
          },
          {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "3e3fed6870ed92db3ae7d228",
            credential: "TvtZmp5UctYry9td",
          },
          {
            urls: "turn:global.relay.metered.ca:443",
            username: "3e3fed6870ed92db3ae7d228",
            credential: "TvtZmp5UctYry9td",
          },
          {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: "3e3fed6870ed92db3ae7d228",
            credential: "TvtZmp5UctYry9td",
          },
        ],
        sdpSemantics: "unified-plan"
      }
    });

    peerInstance.on("open", (id) => {
      console.log("ID de sala generado con éxito:", id);
      if (onOpen) onOpen(id);
    });

    peerInstance.on("error", (err) => {
      console.error("Error en el objeto Peer:", err);
    });

  } catch (error) {
    console.error("Error al instanciar Peer:", error);
  }

  return peerInstance;
}

export function connectToHost(hostId, onOpen, onData, onClose) {
  if (!peerInstance) return null;

  const connection = peerInstance.connect(hostId);

  connection.on("open", () => {
    activeConnections = [connection];
    if (onOpen) onOpen();
  });

  connection.on("data", (data) => {
    if (onData) onData(data);
  });

  connection.on("close", () => {
    if (onClose) onClose();
  });

  return connection;
}

export function listenForIncomingConnections(onConnection, onData) {
  if (!peerInstance) return;

  peerInstance.on("connection", (connection) => {
    activeConnections.push(connection);

    if (onConnection) onConnection(connection);

    connection.on("data", (data) => {
      if (onData) onData(data, connection.peer);
    });

    connection.on("close", () => {
      activeConnections = activeConnections.filter((c) => c.peer !== connection.peer);
    });
  });
}

export function broadcastMessage(message) {
  activeConnections.forEach((connection) => {
    if (connection.open) {
      connection.send(message);
    }
  });
}

export function sendMessageToPeer(connection, message) {
  if (connection && connection.open) {
    connection.send(message);
  }
}

export function sendPing(connection) {
  if (connection && connection.open) {
    connection.send({ type: "PING" });
    return true;
  }
  return false;
}

export function sendPong(connection) {
  if (connection && connection.open) {
    connection.send({ type: "PONG" });
    return true;
  }
  return false;
}

export function disconnectPeer() {
  if (peerInstance) {
    peerInstance.destroy();
    peerInstance = null;
  }
  activeConnections = [];
}