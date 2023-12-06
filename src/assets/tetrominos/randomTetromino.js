import { block } from "./block";
import { tShaped } from "./tShaped";
import { lShaped } from "./lShaped";
import { reversedLShaped } from "./reversedLShaped";
import { straight } from "./straight";
import { leftZigZag } from "./leftZigZag";
import { rightZigZag } from "./rightZigZag";

export function getRandomTetromino() {
  const tetrominos = [
    block,
    tShaped,
    lShaped,
    reversedLShaped,
    straight,
    leftZigZag,
    rightZigZag,
  ];
  return tetrominos[Math.floor(Math.random() * tetrominos.length)];
}
