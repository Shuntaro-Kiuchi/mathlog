// 大学別の合格基準データ
export const universityCriteria = {
  北海道大学: {
    targetScore: 60,
    mustSolve: [1, 2], // 必須で解くべき大問番号
    optionalSolve: [3], // できれば解くべき大問番号
    canSkip: [], // スキップしてもよい大問番号
  },
  東北大学: {
    targetScore: 65,
    mustSolve: [1, 2],
    optionalSolve: [3],
    canSkip: [4],
  },
  東京大学: {
    targetScore: 70,
    mustSolve: [1, 2, 3],
    optionalSolve: [4],
    canSkip: [5, 6],
  },
  京都大学: {
    targetScore: 70,
    mustSolve: [1, 2, 3],
    optionalSolve: [4],
    canSkip: [5, 6],
  },
};
