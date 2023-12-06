import { useState, useEffect } from "react";
import Board from "./Board";
import { getRandomTetromino } from "./assets/tetrominos/randomTetromino";

export default function App() {
  const [velocity, setVelocity] = useState(1000);
  const [rows, setRows] = useState(20);
  const [hiddenRows, setHiddenRows] = useState(3);
  const [cols, setCols] = useState(10);

  const [tetrominos, setTetrominos] = useState([]);

  useEffect(() => {
    const downHandler = ({ code }) => {
      switch (code) {
        case "Space":
        case "ArrowDown":
          move("down");
          break;

        case "ArrowLeft":
          move("left");
          break;

        case "ArrowRight":
          move("right");
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", downHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      move("down");
    }, velocity);
    return () => clearInterval(interval);
  }, [velocity]);

  function move(direction) {
    const activeTetrominos = getTetrominos({ status: "active" });
    const inactiveTetrominos = getTetrominos({ status: "inactive" });

    if (activeTetrominos.length) {
      const newActiveTetrominos = getNewActiveTetrominos({
        direction,
        activeTetrominos,
      });

      setTetrominos([...inactiveTetrominos, ...newActiveTetrominos]);

      // VALIDATE IF ROW COMPLETE
    } else {
      fireNewTetromino();
    }
  }

  function fireNewTetromino() {
    const newTetromino = getRandomTetromino();
    const newTetrominos = [...tetrominos, ...newTetromino];
    setTetrominos(newTetrominos);
  }

  function getNewActiveTetrominos({ direction, activeTetrominos }) {
    switch (direction) {
      case "down":
        return canMove({ activeTetrominos, direction })
          ? activeTetrominos.map((activeTetromino) => ({
              ...activeTetromino,
              rowIndex: activeTetromino.rowIndex + 1,
            }))
          : activeTetrominos.map((activeTetromino) => ({
              ...activeTetromino,
              status: "inactive",
            }));

      case "left":
        return canMove({ activeTetrominos, direction })
          ? activeTetrominos.map((activeTetromino) => ({
              ...activeTetromino,
              colIndex: activeTetromino.colIndex - 1,
            }))
          : activeTetrominos;

      case "right":
        return canMove({ activeTetrominos, direction })
          ? activeTetrominos.map((activeTetromino) => ({
              ...activeTetromino,
              colIndex: activeTetromino.colIndex + 1,
            }))
          : activeTetrominos;

      default:
        return activeTetrominos;
    }
  }

  function canMove({ activeTetrominos, direction }) {
    let isNextToBorder, isNextToInactive;

    switch (direction) {
      case "down":
        const bottomIndex = activeTetrominos.reduce(
          (acc, activeTetromino) => Math.max(acc, activeTetromino.rowIndex),
          0
        );

        isNextToBorder = bottomIndex + 1 >= rows + hiddenRows;

        isNextToInactive = activeTetrominos.some((activeTetromino) =>
          tetrominos.some(
            (tetromino) =>
              activeTetromino.rowIndex + 1 === tetromino.rowIndex &&
              activeTetromino.colIndex === tetromino.colIndex &&
              tetromino.status === "inactive"
          )
        );

        return !isNextToInactive && !isNextToBorder;

      case "left":
        const leftIndex = activeTetrominos.reduce(
          (acc, activeTetromino) => Math.min(acc, activeTetromino.colIndex),
          cols
        );

        isNextToBorder = leftIndex === 0;

        isNextToInactive = activeTetrominos.some((activeTetromino) =>
          tetrominos.some(
            (tetromino) =>
              activeTetromino.rowIndex === tetromino.rowIndex &&
              activeTetromino.colIndex - 1 === tetromino.colIndex &&
              tetromino.status === "inactive"
          )
        );

        return !isNextToInactive && !isNextToBorder;

      case "right":
        const rightIndex = activeTetrominos.reduce(
          (acc, activeTetromino) => Math.max(acc, activeTetromino.colIndex),
          0
        );

        isNextToBorder = rightIndex + 1 >= cols;

        isNextToInactive = activeTetrominos.some((activeTetromino) =>
          tetrominos.some(
            (tetromino) =>
              activeTetromino.rowIndex === tetromino.rowIndex &&
              activeTetromino.colIndex + 1 === tetromino.colIndex &&
              tetromino.status === "inactive"
          )
        );

        return !isNextToInactive && !isNextToBorder;

      default:
        return true;
    }
  }

  function getTetrominos({ status }) {
    return tetrominos.filter((tetromino) => tetromino.status === status);
  }

  return (
    <>
      <button
        onClick={() => move("left")}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Left
      </button>
      <button
        onClick={() => move("down")}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Down
      </button>
      <button
        onClick={() => move("right")}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Right
      </button>
      <Board
        cols={cols}
        rows={rows}
        hiddenRows={hiddenRows}
        tetrominos={tetrominos}
      />
    </>
  );
}
