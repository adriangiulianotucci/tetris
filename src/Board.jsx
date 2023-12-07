export default function Board(props) {
  const { cols, rows, hiddenRows, tetrominos } = props;

  function getColor({ rowIndex, colIndex }) {
    const tetromino = tetrominos.find(
      (elem) => elem.rowIndex === rowIndex && elem.colIndex === colIndex
    );

    if (tetromino) {
      return tetromino.color;
    }
    return "bg-slate-500";
  }

  return (
    <div className="flex flex-col">
      {[...Array(rows + hiddenRows)].map((row, rowIndex) => (
        <div
          className={`flex justify-center ${
            rowIndex < hiddenRows && "opacity-50"
          }`}
          key={rowIndex}
        >
          {[...Array(cols)].map((col, colIndex) => (
            <div
              key={colIndex}
              className={`w-6 h-6 ${getColor({ rowIndex, colIndex })}`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}
