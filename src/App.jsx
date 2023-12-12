import { useState, useEffect, useCallback } from "react";
import Board from "./Board";
import { getRandomTetromino } from "./assets/tetrominos/randomTetromino";

export default function App() {
  const [velocity] = useState(1000);
  const [rows] = useState(20);
  const [hiddenRows] = useState(3);
  const [cols] = useState(10);

  const [tetrominos, setTetrominos] = useState([]);

  const fireNewTetromino = useCallback(() => {
    const newTetromino = getRandomTetromino();
    const newTetrominos = [...tetrominos, ...newTetromino];
    setTetrominos(newTetrominos);
  }, [tetrominos]);

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
    ({ tetrominos, inactiveTetrominos }) => {
      const isOutOfBounds = tetrominos.some((tetromino) => {
        return (
          tetromino.colIndex < 0 ||
          tetromino.colIndex >= cols ||
          tetromino.rowIndex < 0 ||
          tetromino.rowIndex >= rows + hiddenRows
        );
      });

      const isInactive = tetrominos.some((tetromino) =>
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

  const deleteFullRows = useCallback(
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

      console.log(fullRowIndexes);

      if (fullRowIndexes.length) {
        const newTetrominos = tetrominos
          .filter((tetromino) => !fullRowIndexes.includes(tetromino.rowIndex))
          .map((tetromino) => {
            if (tetromino.rowIndex < Math.min(...fullRowIndexes)) {
              return {
                ...tetromino,
                rowIndex: tetromino.rowIndex + fullRowIndexes.length,
              };
            } else {
              return tetromino;
            }
          });

        setTetrominos(newTetrominos);
      }
    },
    [cols]
  );

  const move = useCallback(
    (direction) => {
      const activeTetrominos = getTetrominos({ tetrominos, status: "active" });
      const inactiveTetrominos = getTetrominos({
        tetrominos,
        status: "inactive",
      });

      if (activeTetrominos.length) {
        const newActiveTetrominos = getNewActiveTetrominos({
          direction,
          activeTetrominos,
        });

        const isValid = canPlace({
          tetrominos: newActiveTetrominos,
          inactiveTetrominos,
        });

        if (!isValid) {
          if (direction === "down") {
            const newTetrominos = [
              ...inactiveTetrominos,
              ...activeTetrominos.map((activeTetromino) => ({
                ...activeTetromino,
                status: "inactive",
              })),
            ];
            setTetrominos(newTetrominos);
            deleteFullRows({ tetrominos: newTetrominos });
            return;
          }
          return;
        }

        setTetrominos([...inactiveTetrominos, ...newActiveTetrominos]);
      } else {
        fireNewTetromino();
      }
    },
    [
      tetrominos,
      fireNewTetromino,
      getNewActiveTetrominos,
      getTetrominos,
      canPlace,
      deleteFullRows,
    ]
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
