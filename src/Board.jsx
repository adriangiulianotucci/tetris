import PropTypes from "prop-types";

function Board(props) {
  const { cols, rows, hiddenRows, tetrominos } = props;

  function getColor({ rowIndex, colIndex }) {
    const tetromino = tetrominos.find(
      (elem) => elem.rowIndex === rowIndex && elem.colIndex === colIndex
    );

    if (tetromino) {
      return `${tetromino.color} shadow-inner`;
    }
    return "bg-slate-500";
  }

  return (
    <div className="flex flex-col">
      {[...Array(rows + hiddenRows)].map((row, rowIndex) => (
        <div
          className={`flex justify-center ${rowIndex < hiddenRows && "hidden"}`}
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

Board.propTypes = {
  cols: PropTypes.number,
  rows: PropTypes.number,
  hiddenRows: PropTypes.number,
  tetrominos: PropTypes.arrayOf(
    PropTypes.shape({
      rowIndex: PropTypes.number,
      colIndex: PropTypes.number,
      color: PropTypes.string,
      status: PropTypes.string,
    })
  ),
};

export default Board;
