// トピックタグベースの分析ロジック
import { examStructure } from "../data/examStructure";
import { universityCriteria } from "../data/universityCriteria";

// difficulty × 大学ポリシーからexpectedScoreを計算
export function calculateExpectedScore(
  questionNumber,
  difficulty,
  maxScore,
  university,
  criteria
) {
  if (!criteria) return 0;

  const isMustSolve = criteria.mustSolve.includes(questionNumber);
  const isOptionalSolve = criteria.optionalSolve.includes(questionNumber);
  const isCanSkip = criteria.canSkip.includes(questionNumber);

  // mustSolve: 難易度に関係なく高得点を期待
  if (isMustSolve) {
    if (difficulty === "easy") return maxScore * 0.95;
    if (difficulty === "standard") return maxScore * 0.85;
    if (difficulty === "hard") return maxScore * 0.7;
  }

  // optionalSolve: 難易度に応じた得点を期待
  if (isOptionalSolve) {
    if (difficulty === "easy") return maxScore * 0.9;
    if (difficulty === "standard") return maxScore * 0.75;
    if (difficulty === "hard") return maxScore * 0.5;
  }

  // canSkip: 低得点でも可
  if (isCanSkip) {
    if (difficulty === "easy") return maxScore * 0.6;
    if (difficulty === "standard") return maxScore * 0.4;
    if (difficulty === "hard") return maxScore * 0.2;
  }

  // デフォルト: 難易度のみで判断
  if (difficulty === "easy") return maxScore * 0.85;
  if (difficulty === "standard") return maxScore * 0.7;
  if (difficulty === "hard") return maxScore * 0.5;

  return 0;
}

export function calculateTopicAnalysis(exams) {
  // トピックタグベースの分析データ
  const topicStats = {};
  exams.forEach((exam) => {
    exam.questions.forEach((q) => {
      const tags = q.topicTags || [];
      tags.forEach((tag) => {
        if (!topicStats[tag]) {
          topicStats[tag] = {
            scores: [],
            times: [],
            issueTagCounts: {},
          };
        }
        topicStats[tag].scores.push(Number(q.score || 0));
        topicStats[tag].times.push(Number(q.time || 0));
        const issueTags = q.issueTags || [];
        issueTags.forEach((issueTag) => {
          topicStats[tag].issueTagCounts[issueTag] =
            (topicStats[tag].issueTagCounts[issueTag] || 0) + 1;
        });
      });
    });
  });

  const topicAnalysis = Object.keys(topicStats)
    .map((tag) => {
      const stats = topicStats[tag];
      const avgScore =
        stats.scores.length > 0
          ? stats.scores.reduce((sum, s) => sum + s, 0) / stats.scores.length
          : 0;
      const avgTime =
        stats.times.length > 0
          ? stats.times.reduce((sum, t) => sum + t, 0) / stats.times.length
          : 0;

      // 主要なissueTagを特定（最も出現回数が多いもの）
      const mainIssueTag =
        Object.keys(stats.issueTagCounts).length > 0
          ? Object.entries(stats.issueTagCounts).sort(
              (a, b) => b[1] - a[1]
            )[0][0]
          : null;

      return {
        topic: tag,
        avgScore,
        avgTime,
        count: stats.scores.length,
        issueTagCounts: stats.issueTagCounts,
        mainIssueTag,
      };
    })
    .sort((a, b) => a.avgScore - b.avgScore);

  // 優先度を計算（平均得点に基づく）
  const allScores = topicAnalysis.map((t) => t.avgScore);
  const minScore = Math.min(...allScores);
  const maxScore = Math.max(...allScores);
  const scoreRange = maxScore - minScore || 1;

  const topicAnalysisWithPriority = topicAnalysis.map((topic) => {
    const scorePercentile = (topic.avgScore - minScore) / scoreRange;
    let priority;
    if (scorePercentile < 0.3) {
      priority = "urgent";
    } else if (scorePercentile < 0.7) {
      priority = "next";
    } else {
      priority = "maintain";
    }
    return { ...topic, priority };
  });

  const urgentTopics = topicAnalysisWithPriority.filter(
    (t) => t.priority === "urgent"
  );
  const nextTopics = topicAnalysisWithPriority.filter(
    (t) => t.priority === "next"
  );
  const maintainTopics = topicAnalysisWithPriority.filter(
    (t) => t.priority === "maintain"
  );

  return {
    topicAnalysisWithPriority,
    urgentTopics,
    nextTopics,
    maintainTopics,
  };
}

// 志望校評価分析
export function calculateUniversityEvaluation(exams) {
  if (exams.length === 0) {
    return null;
  }

  // 最新の試験を取得
  const latestExam = exams
    .filter((e) => e.university && e.year)
    .sort((a, b) => Number(b.year) - Number(a.year))[0];

  if (!latestExam) {
    return null;
  }

  const criteria = universityCriteria[latestExam.university];
  if (!criteria) {
    return null;
  }

  const structure = examStructure[latestExam.university]?.[latestExam.year];
  if (!structure) {
    return null;
  }

  // easy失点の検出
  const easyQuestions = structure.filter((q) => q.difficulty === "easy");
  const easyLosses = [];
  easyQuestions.forEach((q) => {
    const question = latestExam.questions.find((eq) => eq.number === q.number);
    if (question) {
      const score = Number(question.score || 0);
      const maxScore = 25; // 仮の満点（実際は構造から取得すべき）
      if (score < maxScore * 0.8) {
        easyLosses.push({
          number: q.number,
          score,
          expected: maxScore * 0.8,
        });
      }
    }
  });

  // hard時間超過の検出
  const hardQuestions = structure.filter((q) => q.difficulty === "hard");
  const hardTimeOver = [];
  hardQuestions.forEach((q) => {
    const question = latestExam.questions.find((eq) => eq.number === q.number);
    if (question) {
      const time = Number(question.time || 0);
      const expectedTime = 45; // 仮の期待時間
      if (time > expectedTime * 1.2) {
        hardTimeOver.push({
          number: q.number,
          time,
          expected: expectedTime,
        });
      }
    }
  });

  // 志望校基準とのズレ
  const currentScore = Number(latestExam.score || 0);
  const scoreDiff = currentScore - criteria.targetScore;
  const mustSolveScore = latestExam.questions
    .filter((q) => criteria.mustSolve.includes(q.number))
    .reduce((sum, q) => sum + Number(q.score || 0), 0);
  const mustSolveExpected = criteria.mustSolve.length * 20; // 仮の期待値

  // 問題点を文章で生成
  let issueText = "";
  if (scoreDiff < -10) {
    issueText = `合格想定点（${criteria.targetScore}点）に対して${Math.abs(
      scoreDiff
    )}点不足しています。基礎問題の確実な得点が必要です。`;
  } else if (easyLosses.length > 0) {
    issueText = `基礎問題（大問${easyLosses
      .map((e) => e.number)
      .join("、")}）で失点があります。基礎を固めることが優先です。`;
  } else if (hardTimeOver.length > 0) {
    issueText = `難問（大問${hardTimeOver
      .map((h) => h.number)
      .join("、")}）に時間をかけすぎています。時間配分の見直しが必要です。`;
  } else if (mustSolveScore < mustSolveExpected * 0.8) {
    issueText = `必須問題の得点が不足しています。基礎・標準問題の確実な得点を目指してください。`;
  } else if (scoreDiff >= 0) {
    issueText = `合格想定点をクリアしています。この調子で安定した得点を目指しましょう。`;
  } else {
    issueText = `合格想定点まであと${Math.abs(
      scoreDiff
    )}点です。基礎問題の見直しで得点アップが期待できます。`;
  }

  return {
    university: latestExam.university,
    year: latestExam.year,
    targetScore: criteria.targetScore,
    currentScore,
    scoreDiff,
    issueText,
  };
}

// 期待得点分析
export function calculateExpectedScoreAnalysis(exams) {
  if (exams.length === 0) {
    return null;
  }

  // 最新の試験を取得
  const latestExam = exams
    .filter((e) => e.university && e.year)
    .sort((a, b) => Number(b.year) - Number(a.year))[0];

  if (!latestExam) {
    return null;
  }

  const criteria = universityCriteria[latestExam.university];
  if (!criteria) {
    return null;
  }

  const structure = examStructure[latestExam.university]?.[latestExam.year];
  if (!structure) {
    return null;
  }

  // 各大問の期待得点・実得点・差分を計算
  const questionAnalyses = latestExam.questions
    .map((q) => {
      const structureQ = structure.find((sq) => sq.number === q.number);
      if (!structureQ) return null;

      const expectedScore = calculateExpectedScore(
        q.number,
        structureQ.difficulty,
        structureQ.maxScore,
        latestExam.university,
        criteria
      );
      const actualScore = Number(q.score || 0);
      const diff = actualScore - expectedScore;

      return {
        number: q.number,
        expectedScore,
        actualScore,
        diff,
      };
    })
    .filter(Boolean);

  // 合計を計算
  const totalExpected = questionAnalyses.reduce(
    (sum, q) => sum + q.expectedScore,
    0
  );
  const totalActual = questionAnalyses.reduce(
    (sum, q) => sum + q.actualScore,
    0
  );
  const totalDiff = totalActual - totalExpected;

  // 差分が最大の大問を特定
  const maxDiffQuestion = questionAnalyses.reduce((max, q) => {
    return Math.abs(q.diff) > Math.abs(max.diff) ? q : max;
  }, questionAnalyses[0] || { number: 0, diff: 0 });

  // 問題点を文章で生成
  let issueText = "";
  if (maxDiffQuestion && Math.abs(maxDiffQuestion.diff) > 2) {
    if (maxDiffQuestion.diff < 0) {
      issueText = `大問${maxDiffQuestion.number}が期待得点より${Math.abs(
        maxDiffQuestion.diff
      ).toFixed(1)}点不足しています。`;
    } else {
      issueText = `大問${
        maxDiffQuestion.number
      }が期待得点より${maxDiffQuestion.diff.toFixed(1)}点上回っています。`;
    }
  } else if (totalDiff < -5) {
    issueText = `合計で期待得点より${Math.abs(totalDiff).toFixed(
      1
    )}点不足しています。`;
  } else if (totalDiff >= 0) {
    issueText = `期待得点をクリアしています。`;
  } else {
    issueText = `期待得点まであと${Math.abs(totalDiff).toFixed(1)}点です。`;
  }

  return {
    totalExpected: Math.round(totalExpected * 10) / 10,
    totalActual,
    totalDiff: Math.round(totalDiff * 10) / 10,
    issueText,
  };
}

// 戦略評価ロジック
export function calculateStrategyEvaluation(exams) {
  if (exams.length === 0) {
    return null;
  }

  // 最新の試験を取得
  const latestExam = exams
    .filter((e) => e.university && e.year)
    .sort((a, b) => Number(b.year) - Number(a.year))[0];

  if (!latestExam) {
    return null;
  }

  const structure = examStructure[latestExam.university]?.[latestExam.year];
  if (!structure) {
    return null;
  }

  // easy問題でscore=0の検出
  const easyZeroQuestions = [];
  latestExam.questions.forEach((q) => {
    const structureQ = structure.find((sq) => sq.number === q.number);
    if (structureQ && structureQ.difficulty === "easy") {
      const score = Number(q.score || 0);
      if (score === 0) {
        easyZeroQuestions.push(q.number);
      }
    }
  });

  // frequency=high かつ 平均得点が低い問題の検出
  const highFrequencyLowScore = [];
  const highFrequencyQuestions = structure.filter(
    (sq) => sq.frequency === "high"
  );

  highFrequencyQuestions.forEach((structureQ) => {
    const question = latestExam.questions.find(
      (q) => q.number === structureQ.number
    );
    if (question) {
      const score = Number(question.score || 0);
      const maxScore = structureQ.maxScore || 20;
      const avgRatio = score / maxScore;
      // 平均得点が50%未満を「低い」と判定
      if (avgRatio < 0.5) {
        highFrequencyLowScore.push({
          number: structureQ.number,
          score,
          maxScore,
        });
      }
    }
  });

  // 戦略評価
  let isOK = true;
  let reason = "";

  if (easyZeroQuestions.length > 0) {
    isOK = false;
    reason = `基礎問題（大問${easyZeroQuestions.join(
      "、"
    )}）で0点です。基礎問題は必ず得点すべきです。`;
  } else if (highFrequencyLowScore.length > 0) {
    isOK = false;
    const questionNumbers = highFrequencyLowScore
      .map((q) => q.number)
      .join("、");
    reason = `出題頻度の高い問題（大問${questionNumbers}）の得点が低いです。頻出問題の対策が必要です。`;
  } else {
    isOK = true;
    reason = "基礎問題と頻出問題の得点が確保できています。";
  }

  return {
    status: isOK ? "OK" : "NG",
    reason,
  };
}
