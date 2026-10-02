import { useEffect, useMemo, useState, useRef } from "react";
import StartScreen from "./components/StartScreen";
import LobbyScreen from "./components/LobbyScreen";
import GameHeader from "./components/GameHeader";
import MaskedCharacter from "./components/MaskedCharacter";
import ColorControls from "./components/ColorControls";
import ColorPreview from "./components/ColorPreview";
import ResultModal from "./components/ResultModal";
import GameSummary from "./components/GameSummary";
import CharacterEditor from "./components/CharacterEditor";
import { CHALLENGES } from "./data/challenges";
import { calculateAccuracy } from "./utils/color";
import {
  initializePeer,
  connectToHost,
  listenForIncomingConnections,
  broadcastMessage,
  disconnectPeer,
} from "./utils/multiplayer";

const INITIAL_COLOR = { h: 0, s: 50, l: 50 };

function getRandomChallenge(currentId = null, usedIds = []) {
  const usedSet = new Set(usedIds);
  const available = CHALLENGES.filter((c) => c.id !== currentId && !usedSet.has(c.id));
  const list = available.length > 0 ? available : CHALLENGES.filter((c) => c.id !== currentId);
  return list[Math.floor(Math.random() * list.length)];
}

export default function App() {
  const [screen, setScreen] = useState("start");

  // Perfil del jugador local
  const [playerName, setPlayerName] = useState("");
  const [roundDuration, setRoundDuration] = useState(20);
  const [totalRounds, setTotalRounds] = useState(5);

  // Estado del juego
  const [challenge, setChallenge] = useState(() => getRandomChallenge());
  const [selectedColor, setSelectedColor] = useState(INITIAL_COLOR);
  const [timeLeft, setTimeLeft] = useState(roundDuration);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [round, setRound] = useState(1);
  const [showResultModal, setShowResultModal] = useState(false);

  // Resultados local y multijugador
  const [accuracy, setAccuracy] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [roundResults, setRoundResults] = useState([]);
  const [multiplayerLeaderboard, setMultiplayerLeaderboard] = useState([]);
  const [currentRoundRanking, setCurrentRoundRanking] = useState([]);
  const [waitingForOthers, setWaitingForOthers] = useState(false);

  // Red
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [lobbyPlayers, setLobbyPlayers] = useState([]);

  // Referencias para timers y estado sincrónico
  const timerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const pongReceivedRef = useRef(true);
  const hostStateRef = useRef({
    submittedColors: {},
    players: [],
    round: 1,
    challenge: null,
  });

  const targetColor = useMemo(() => challenge.target, [challenge]);

  // Temporizador centralizado
  useEffect(() => {
    if (screen !== "game" || !isRoundActive) return undefined;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          if (!isMultiplayer || isHost) {
            handleRoundTimeOut();
          }
          return 0;
        }
        const nextTime = prev - 1;
        if (isMultiplayer && isHost) {
          broadcastMessage({ type: "TIMER_SYNC", timeLeft: nextTime });
        }
        return nextTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [screen, isRoundActive, isMultiplayer, isHost]);

  // Handler para notificar desconexión al cerrar la pestaña
  useEffect(() => {
    if (!isMultiplayer) return;

    const handleBeforeUnload = () => {
      broadcastMessage({ type: "PLAYER_DISCONNECTED", playerId: isHost ? "host" : "guest" });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isMultiplayer, isHost]);

  // Heartbeat / Ping-Pong: solo el Host verifica conexión del invitado
  useEffect(() => {
    if (!isMultiplayer || !isHost) return;

    const sendPing = () => {
      // REGLA 1: Si está solo en el lobby inicial, no hay timeout
      if (screen === "lobby" && lobbyPlayers.length <= 1) {
        pongReceivedRef.current = true; // Mantener vivo falsamente mientras espera
        return;
      }

      // REGLA 2: Si ya inició la partida y se queda solo, se activa la expulsión inmediata
      if (screen !== "lobby" && lobbyPlayers.length <= 1) {
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        alert("El invitado ha abandonado la sala.");
        handleLeaveLobby();
        return;
      }

      if (!pongReceivedRef.current) {
        // No recibimos pong en el ciclo anterior -> invitado desconectado
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        alert("Se ha perdido la conexión con el invitado.");
        handleLeaveLobby();
        return;
      }
      pongReceivedRef.current = false;
      broadcastMessage({ type: "PING" });
    };

    // Intervalo aleatorio entre 5 y 8 segundos
    const intervalMs = 5000 + Math.random() * 3000;
    heartbeatRef.current = setInterval(sendPing, intervalMs);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [isMultiplayer, isHost, screen, lobbyPlayers]);

  // MODO SINGLEPLAYER
  function startGame() {
    const cleanName = playerName.trim() || "Jugador";
    setIsMultiplayer(false);
    setIsHost(false);
    setPlayerName(cleanName);

    const initialChallenge = getRandomChallenge();
    setChallenge(initialChallenge);
    setSelectedColor(INITIAL_COLOR);
    setTimeLeft(roundDuration);
    setIsRoundActive(true);
    setHasSubmitted(false);
    setShowResultModal(false);
    setAccuracy(null);
    setRound(1);
    setTotalScore(0);
    setRoundResults([]);
    setScreen("game");
  }

  // MULTI - Crear Sala (Host)
  function handleStartMultiplayerHost() {
    const cleanName = playerName.trim() || "Anfitrión";
    setPlayerName(cleanName);
    setIsMultiplayer(true);
    setIsHost(true);

    initializePeer((id) => {
      setRoomId(id);
      const hostPlayer = { id, name: cleanName, isHost: true, score: 0 };
      const initialList = [hostPlayer];
      setLobbyPlayers(initialList);
      hostStateRef.current.players = initialList;
      setScreen("lobby");
    });

    listenForIncomingConnections(
      (connection) => {
        connection.on("close", () => {
          const peerId = connection.peer;
          const foundPlayer = lobbyPlayers.find(p => p.id === peerId);
          const playerName = foundPlayer ? foundPlayer.name : "Jugador";
          setLobbyPlayers(prev => prev.filter(p => p.id !== peerId));
          hostStateRef.current.players = hostStateRef.current.players.filter(p => p.id !== peerId);
          broadcastMessage({ type: "PLAYER_DISCONNECTED", playerId: peerId, playerName });
        });
      },
      (data, senderPeerId) => {
        handleHostIncomingMessage(data, senderPeerId);
      }
    );
  }

  function handleHostIncomingMessage(data, senderPeerId) {
    if (data.type === "PONG") {
      // Recibimos respuesta del invitado -> conexión viva
      pongReceivedRef.current = true;
      return;
    }

    if (data.type === "JOIN_LOBBY") {
      setLobbyPlayers((prev) => {
        if (prev.some((p) => p.id === senderPeerId)) return prev;
        const updated = [
          ...prev,
          { id: senderPeerId, name: data.playerName, isHost: false, score: 0 },
        ];
        hostStateRef.current.players = updated;
        broadcastMessage({ type: "PLAYER_LIST_UPDATE", players: updated });
        return updated;
      });
    }

    if (data.type === "PLAYER_DISCONNECTED") {
      const disconnectedName = data.playerName || "Un jugador";
      setLobbyPlayers(prev => prev.filter(p => p.id !== data.playerId));
      hostStateRef.current.players = hostStateRef.current.players.filter(p => p.id !== data.playerId);
      // Alertar al anfitrión
      alert(`El invitado ${disconnectedName} ha abandonado la sala.`);
      // No rebroadcast - we received this from the disconnecting player
      return;
    }

    if (data.type === "SUBMIT_COLOR") {
      hostStateRef.current.submittedColors[senderPeerId] = {
        color: data.color,
        name: data.playerName,
      };

      const totalPlayers = hostStateRef.current.players.length;
      const totalSubmissions = Object.keys(
        hostStateRef.current.submittedColors
      ).length;

      if (totalSubmissions >= totalPlayers) {
        evaluateAndBroadcastRoundResults();
      }
    }
  }

  // MULTI - Unirse a Sala (Guest)
  function handleJoinMultiplayerGuest(targetRoomId) {
    const cleanName = playerName.trim() || "Invitado";
    setPlayerName(cleanName);
    setIsMultiplayer(true);
    setIsHost(false);
    setRoomId(targetRoomId);

    initializePeer((myPeerId) => {
      connectToHost(
        targetRoomId,
        () => {
          setScreen("lobby");
          broadcastMessage({
            type: "JOIN_LOBBY",
            playerName: cleanName,
          });
        },
        (data) => handleGuestIncomingMessage(data, myPeerId),
        () => {
          broadcastMessage({ type: "PLAYER_DISCONNECTED", playerId: myPeerId, playerName: cleanName });
          // No alert here - the alert will come from PLAYER_DISCONNECTED handler
          handleLeaveLobby();
        }
      );
    });
  }

  function handleGuestIncomingMessage(data, myPeerId) {
    if (data.type === "PLAYER_LIST_UPDATE") {
      setLobbyPlayers(data.players);
    }

    if (data.type === "PING") {
      // Responder con PONG al latido del host
      broadcastMessage({ type: "PONG" });
      return;
    }

    if (data.type === "PLAYER_DISCONNECTED") {
      // El host siempre envía playerId="host" en beforeunload
      if (data.playerId === "host") {
        alert("El anfitrión ha abandonado la partida.");
      } else {
        // Fallback por si acaso (fallo de red inesperado)
        alert("Se ha perdido la conexión con la sala.");
      }
      handleLeaveLobby();
      return;
    }

    if (data.type === "START_ROUND") {
      setChallenge(data.challenge);
      setSelectedColor(INITIAL_COLOR);
      setTimeLeft(data.roundDuration);
      setRound(data.round);
      setIsRoundActive(true);
      setHasSubmitted(false);
      setWaitingForOthers(false);
      setShowResultModal(false);
      setAccuracy(null);
      setCurrentRoundRanking([]);
      setScreen("game");
    }

    if (data.type === "TIMER_SYNC") {
      setTimeLeft(data.timeLeft);
    }

    if (data.type === "ROUND_RESULTS") {
      setIsRoundActive(false);
      setWaitingForOthers(false);
      setCurrentRoundRanking(data.roundRanking);
      setMultiplayerLeaderboard(data.leaderboard);

      const myResult = data.roundRanking.find((r) => r.id === myPeerId);
      if (myResult) {
        setAccuracy(myResult.accuracy);
        setTotalScore((prev) => prev + myResult.accuracy);
      }
      setHasSubmitted(true);
      setShowResultModal(true);
    }

    if (data.type === "GAME_OVER") {
      setMultiplayerLeaderboard(data.finalLeaderboard);
      setScreen("summary");
    }
  }

  function handleLeaveLobby() {
    disconnectPeer();
    setIsMultiplayer(false);
    setIsHost(false);
    setRoomId("");
    setLobbyPlayers([]);
    setScreen("start");
  }

  function startMultiplayerGameHost() {
    if (!isHost) return;
    hostStateRef.current.usedChallengeIds = [];
    hostStateRef.current.round = 1;
    startNewMultiplayerRound(1);
  }

  function startNewMultiplayerRound(nextRoundNumber) {
    const usedIds = hostStateRef.current.usedChallengeIds || [];
    const currentId = hostStateRef.current.challenge ? hostStateRef.current.challenge.id : null;
    const newChallenge = getRandomChallenge(currentId, usedIds);
    hostStateRef.current.challenge = newChallenge;
    hostStateRef.current.submittedColors = {};
    hostStateRef.current.usedChallengeIds = [...usedIds, newChallenge.id];

    setChallenge(newChallenge);
    setSelectedColor(INITIAL_COLOR);
    setTimeLeft(roundDuration);
    setRound(nextRoundNumber);
    setIsRoundActive(true);
    setHasSubmitted(false);
    setWaitingForOthers(false);
    setShowResultModal(false);
    setAccuracy(null);
    setCurrentRoundRanking([]);
    setScreen("game");

    broadcastMessage({
      type: "START_ROUND",
      challenge: newChallenge,
      round: nextRoundNumber,
      roundDuration: roundDuration,
    });
  }

  function handleSendColor() {
    if (hasSubmitted || !isRoundActive) return;

    if (!isMultiplayer) {
      const res = calculateAccuracy(selectedColor, targetColor);
      setAccuracy(res);
      setTotalScore((prev) => prev + res);
      setRoundResults((prev) => [
        ...prev,
        { round, characterId: challenge.id, characterName: challenge.characterName, accuracy: res },
      ]);
      setHasSubmitted(true);
      setIsRoundActive(false);
      setShowResultModal(true);
      return;
    }

    setHasSubmitted(true);
    setWaitingForOthers(true);

    if (isHost) {
      const hostPlayer = lobbyPlayers.find((p) => p.isHost);
      const hostId = hostPlayer ? hostPlayer.id : "host";
      hostStateRef.current.submittedColors[hostId] = {
        color: selectedColor,
        name: playerName,
      };

      const totalPlayers = hostStateRef.current.players.length;
      const totalSubmissions = Object.keys(
        hostStateRef.current.submittedColors
      ).length;

      if (totalSubmissions >= totalPlayers) {
        evaluateAndBroadcastRoundResults();
      }
    } else {
      broadcastMessage({
        type: "SUBMIT_COLOR",
        color: selectedColor,
        playerName: playerName,
      });
    }
  }

  function handleRoundTimeOut() {
    if (isMultiplayer && isHost) {
      evaluateAndBroadcastRoundResults();
    } else if (!isMultiplayer) {
      handleSendColor();
    }
  }

  function evaluateAndBroadcastRoundResults() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRoundActive(false);

    const ranking = Object.entries(hostStateRef.current.submittedColors).map(
      ([id, data]) => {
        const acc = calculateAccuracy(data.color, targetColor);
        return { id, name: data.name, color: data.color, accuracy: acc };
      }
    );

    ranking.sort((a, b) => b.accuracy - a.accuracy);

    // Actualizar puntajes acumulados en el estado global de la sala
    hostStateRef.current.players = hostStateRef.current.players.map((p) => {
      const roundData = ranking.find((r) => r.id === p.id);
      return {
        ...p,
        score: p.score + (roundData ? roundData.accuracy : 0),
      };
    });

    const leaderboard = [...hostStateRef.current.players].sort(
      (a, b) => b.score - a.score
    );

    const hostPlayer = lobbyPlayers.find((p) => p.isHost);
    const hostPlayerId = hostPlayer ? hostPlayer.id : "host";
    const hostResult = ranking.find((r) => r.id === hostPlayerId);
    if (hostResult) {
      setAccuracy(hostResult.accuracy);
      setTotalScore((prev) => prev + hostResult.accuracy);
    }

    setCurrentRoundRanking(ranking);
    setMultiplayerLeaderboard(leaderboard);
    setWaitingForOthers(false);
    setShowResultModal(true);

    broadcastMessage({
      type: "ROUND_RESULTS",
      roundRanking: ranking,
      leaderboard: leaderboard,
    });
  }

  function handleNextRound() {
    setShowResultModal(false);

    if (!isMultiplayer) {
      if (round >= totalRounds) {
        setScreen("summary");
      } else {
        const usedIds = roundResults.map(r => r.characterId).filter(Boolean);
        setChallenge(getRandomChallenge(challenge.id, usedIds));
        setSelectedColor(INITIAL_COLOR);
        setTimeLeft(roundDuration);
        setAccuracy(null);
        setHasSubmitted(false);
        setIsRoundActive(true);
        setRound((prev) => prev + 1);
      }
      return;
    }

    if (isHost) {
      if (round >= totalRounds) {
        broadcastMessage({
          type: "GAME_OVER",
          finalLeaderboard: hostStateRef.current.players,
        });
        setMultiplayerLeaderboard(hostStateRef.current.players);
        setScreen("summary");
      } else {
        startNewMultiplayerRound(round + 1);
      }
    }
  }

  if (screen === "start") {
    return (
      <StartScreen
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
        roundDuration={roundDuration}
        onRoundDurationChange={setRoundDuration}
        totalRounds={totalRounds}
        onTotalRoundsChange={setTotalRounds}
        onStartGame={startGame}
        onStartMultiplayerHost={handleStartMultiplayerHost}
        onJoinMultiplayerGuest={handleJoinMultiplayerGuest}
        onOpenEditor={() => setScreen("editor")}
      />
    );
  }

  if (screen === "lobby") {
    return (
      <LobbyScreen
        roomId={roomId}
        players={lobbyPlayers}
        isHost={isHost}
        onStartGame={startMultiplayerGameHost}
        onLeaveLobby={handleLeaveLobby}
      />
    );
  }

  if (screen === "editor") {
    return <CharacterEditor onBackToMenu={() => setScreen("start")} />;
  }

  if (screen === "summary") {
    return (
      <GameSummary
        playerName={playerName}
        totalScore={totalScore}
        totalRounds={totalRounds}
        roundResults={roundResults}
        isMultiplayer={isMultiplayer}
        leaderboard={multiplayerLeaderboard}
        onBackToMenu={handleLeaveLobby}
      />
    );
  }

  return (
    <main className="app-shell">
      <div className="game-container">
        <GameHeader
          round={round}
          timeLeft={timeLeft}
          isRoundActive={isRoundActive}
          totalScore={totalScore}
          onLeaveGame={handleLeaveLobby}
        />

        <section className="game-grid">
          <MaskedCharacter
            key={challenge.id}
            color={selectedColor}
            characterName={challenge.characterName}
            zoneName={challenge.zoneName}
            baseImage={challenge.baseImage}
            maskImage={challenge.maskImage}
          />

          <aside className="control-column">
            <ColorControls
              color={selectedColor}
              onColorChange={setSelectedColor}
              disabled={!isRoundActive || hasSubmitted}
            />

            <ColorPreview color={selectedColor} />

            <button
              className="primary-button submit-button"
              onClick={handleSendColor}
              disabled={!isRoundActive || hasSubmitted}
            >
              {hasSubmitted ? "Color Enviado" : "Enviar color"}
            </button>

            {waitingForOthers && (
              <p className="help-text waiting-text">
                Esperando a que los demás jugadores respondan...
              </p>
            )}
          </aside>
        </section>

        {showResultModal && (
          <ResultModal
            accuracy={accuracy}
            selectedColor={selectedColor}
            targetColor={targetColor}
            challenge={challenge}
            isMultiplayer={isMultiplayer}
            isHost={isHost}
            roundRanking={currentRoundRanking}
            leaderboard={multiplayerLeaderboard}
            onNextRound={handleNextRound}
          />
        )}
      </div>
    </main>
  );
}