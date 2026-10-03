import Peer from "peerjs";

let peerInstance = null;
let activeConnections = [];

export function initializePeer(onOpen) {
  if (peerInstance) {
    peerInstance.destroy();
  }

    peerInstance = new Peer({
    host: "peerjs-signaling.metered.ca", // ← ESTA ES LA DIRECCIÓN REAL Y ACTIVA DE METERED
    port: 443,                          // Puerto HTTPS seguro obligatorio para GitHub Pages
    secure: true,                       // Forzar cifrado SSL para saltarse Firewalls
    path: "/",
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    }
  });

  peerInstance.on("open", (id) => {
    if (onOpen) onOpen(id);
  });

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