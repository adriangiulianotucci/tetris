import { useState, useEffect, useCallback } from "react";
import Board from "./Board";
import { getRandomTetromino } from "./assets/tetrominos/randomTetromino";

export default function App() {
  const [velocity, setVelocity] = useState(1000);
  const [rows] = useState(20);
  const [hiddenRows] = useState(2);
  const [cols] = useState(10);

  const [tetrominos, setTetrominos] = useState([]);

  const rotateTetrominos = useCallback(({ tetrominos }) => {
    const angle = -Math.PI / 2;

    const { rowIndex: centerRowIndex, colIndex: centerColIndex } =
      tetrominos.find((tetromino) => tetromino.center);

    return tetrominos.map((tetromino) => {
      const newRowIndex = Math.round(
        Math.cos(angle) * (tetromino.rowIndex - centerRowIndex) -
          Math.sin(angle) * (tetromino.colIndex - centerColIndex) +
          centerRowIndex
      );
      const newColIndex = Math.round(
        Math.sin(angle) * (tetromino.rowIndex - centerRowIndex) +
          Math.cos(angle) * (tetromino.colIndex - centerColIndex) +
          centerColIndex
      );
      return { ...tetromino, rowIndex: newRowIndex, colIndex: newColIndex };
    });
  }, []);

  const getNewActiveTetrominos = useCallback(
    ({ direction, activeTetrominos }) => {
      switch (direction) {
        case "down":
          return activeTetrominos.map((activeTetromino) => ({
            ...activeTetromino,
            rowIndex: activeTetromino.rowIndex + 1,
          }));

        case "left":
          return activeTetrominos.map((activeTetromino) => ({
            ...activeTetromino,
            colIndex: activeTetromino.colIndex - 1,
          }));

        case "right":
          return activeTetrominos.map((activeTetromino) => ({
            ...activeTetromino,
            colIndex: activeTetromino.colIndex + 1,
          }));

        case "rotate":
          return rotateTetrominos({ tetrominos: activeTetrominos });

        default:
          return activeTetrominos;
      }
    },
    [rotateTetrominos]
  );

  const getTetrominos = useCallback(({ tetrominos, status }) => {
    return tetrominos.filter((tetromino) => tetromino.status === status);
  }, []);

  const canPlace = useCallback(
    ({ newTetrominos, inactiveTetrominos }) => {
      const isOutOfBounds = newTetrominos.some((tetromino) => {
        return (
          tetromino.colIndex < 0 ||
          tetromino.colIndex >= cols ||
          tetromino.rowIndex < 0 ||
          tetromino.rowIndex >= rows + hiddenRows
        );
      });

      const isInactive = newTetrominos.some((tetromino) =>
        inactiveTetrominos.some(
          (inactiveTetromino) =>
            inactiveTetromino.colIndex === tetromino.colIndex &&
            inactiveTetromino.rowIndex === tetromino.rowIndex
        )
      );

      return !isOutOfBounds && !isInactive;
    },
    [cols, rows, hiddenRows]
  );

  const deletedFullRows = useCallback(
    ({ tetrominos }) => {
      const orderedTetrominos = tetrominos.reduce((acc, tetromino) => {
        if (acc[tetromino.rowIndex]) {
          acc[tetromino.rowIndex].push(tetromino);
        } else {
          acc[tetromino.rowIndex] = [tetromino];
        }
        return acc;
      }, []);

      const fullRowIndexes = orderedTetrominos.reduce(
        (acc, orderedTetromino, index) => {
          if (orderedTetromino?.length === cols) {
            acc.push(index);
          }
          return acc;
        },
        []
      );

      if (fullRowIndexes.length) {
        const newTetrominos = tetrominos
          .filter((tetromino) => !fullRowIndexes.includes(tetromino.rowIndex))
          .map((tetromino) => {
            if (tetromino.rowIndex < Math.max(...fullRowIndexes)) {
              const newRowIndex =
                fullRowIndexes.length -
                fullRowIndexes.findIndex(
                  (fullRowIndex) => tetromino.rowIndex < fullRowIndex
                );

              return {
                ...tetromino,
                rowIndex: tetromino.rowIndex + newRowIndex,
              };
            } else {
              return tetromino;
            }
          });
        setVelocity((prevVelocity) => prevVelocity * 0.95);
        return [...newTetrominos];
      }
      return [...tetrominos];
    },
    [cols]
  );

  const move = useCallback(
    (direction) => {
      setTetrominos((prevTetrominos) => {
        const tetrominos = [...prevTetrominos];

        const activeTetrominos = getTetrominos({
          tetrominos: tetrominos,
          status: "active",
        });
        const inactiveTetrominos = getTetrominos({
          tetrominos: tetrominos,
          status: "inactive",
        });

        if (activeTetrominos.length) {
          const newActiveTetrominos = getNewActiveTetrominos({
            direction,
            activeTetrominos,
          });

          const isValid = canPlace({
            newTetrominos: newActiveTetrominos,
            inactiveTetrominos,
          });

          if (!isValid) {
            if (direction === "down") {
              const placedTetrominos = [
                ...inactiveTetrominos,
                ...activeTetrominos.map((activeTetromino) => ({
                  ...activeTetromino,
                  status: "inactive",
                })),
              ];
              return [...deletedFullRows({ tetrominos: placedTetrominos })];
            }
            return [...tetrominos];
          }

          return [...inactiveTetrominos, ...newActiveTetrominos];
        } else {
          const newRandomTetrominos = getRandomTetromino();

          return [...inactiveTetrominos, ...newRandomTetrominos];
        }
      });
    },
    [getNewActiveTetrominos, getTetrominos, canPlace, deletedFullRows]
  );

  useEffect(() => {
    const downHandler = ({ code }) => {
      switch (code) {
        case "Space":
        case "ArrowDown":
          move("down");
          break;

        case "ArrowUp":
          move("rotate");
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
  }, [move]);

  useEffect(() => {
    const interval = setInterval(() => {
      move("down");
    }, velocity);
    return () => clearInterval(interval);
  }, [velocity, move]);

  return (
    <div className="h-[calc(100dvh)] flex justify-center items-center">
      <Board
        cols={cols}
        rows={rows}
        hiddenRows={hiddenRows}
        tetrominos={tetrominos}
      />
    </div>
  );
}
