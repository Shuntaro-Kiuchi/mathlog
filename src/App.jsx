import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { examStructure } from "./data/examStructure";
import { issueTags } from "./data/tags";
import {
  calculateTopicAnalysis,
  calculateUniversityEvaluation,
  calculateExpectedScore,
  calculateExpectedScoreAnalysis,
  calculateStrategyEvaluation,
} from "./utils/analysis";
import { universityCriteria } from "./data/universityCriteria";
import { ExamSelector } from "./components/ExamSelector";
import { QuestionInput } from "./components/QuestionInput";
import { TopicAnalysis } from "./components/TopicAnalysis";

function App() {
  // 入力中の過去問（1年分）
  const [exam, setExam] = useState({
    university: "",
    year: "",
    score: "",
    time: "",
    questions: [],
  });

  // 保存済みの過去問
  const [exams, setExams] = useState([]);

  // 編集モード管理
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingData, setEditingData] = useState(null);

  // 起動時に localStorage から読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem("exams");
      if (saved) {
        setExams(JSON.parse(saved));
      }
    } catch {
      setExams([]);
    }
  }, []);

  // exams が変わったら保存
  useEffect(() => {
    localStorage.setItem("exams", JSON.stringify(exams));
  }, [exams]);

  // 大学名と年度が変更されたら大問を自動生成
  useEffect(() => {
    if (exam.university && exam.year) {
      const structure = examStructure[exam.university]?.[exam.year];
      if (structure) {
        const existingScores = {};
        exam.questions.forEach((q) => {
          existingScores[q.number] = {
            score: q.score,
            time: q.time,
            issueTags: q.issueTags || [],
          };
        });
        const criteria = universityCriteria[exam.university];
        const newQuestions = structure.map((q) => {
          const expectedScore = calculateExpectedScore(
            q.number,
            q.difficulty,
            q.maxScore,
            exam.university,
            criteria
          );
          const currentScore = Number(existingScores[q.number]?.score || 0);
          const diff = currentScore - expectedScore;
          return {
            number: q.number,
            topicTags: q.topicTags,
            difficulty: q.difficulty,
            frequency: q.frequency,
            maxScore: q.maxScore,
            expectedScore,
            score: existingScores[q.number]?.score || "",
            time: existingScores[q.number]?.time || "",
            issueTags: existingScores[q.number]?.issueTags || [],
            diff,
          };
        });
        setExam((prev) => ({ ...prev, questions: newQuestions }));
      } else {
        setExam((prev) => ({ ...prev, questions: [] }));
      }
    } else {
      setExam((prev) => ({ ...prev, questions: [] }));
    }
  }, [exam.university, exam.year]);

  // ソート済みexams（年度昇順）
  const sortedExams = [...exams].sort(
    (a, b) => Number(a.year || 0) - Number(b.year || 0)
  );

  // グラフ用データ
  const chartData = sortedExams.map((item) => ({
    year: item.year,
    score: item.score,
  }));

  // トピックタグベースの分析データ
  const {
    topicAnalysisWithPriority,
    urgentTopics,
    nextTopics,
    maintainTopics,
  } = calculateTopicAnalysis(exams);

  // 志望校評価データ
  const universityEvaluation = calculateUniversityEvaluation(exams);

  // 期待得点分析データ
  const expectedScoreAnalysis = calculateExpectedScoreAnalysis(exams);

  // 戦略評価データ
  const strategyEvaluation = calculateStrategyEvaluation(exams);

  const demoData = [
    {
      university: "北海道大学",
      year: "2021",
      score: 55,
      time: 120,
      questions: [
        {
          number: 1,
          score: 15,
          time: 30,
          topicTags: ["微分積分"],
          issueTags: ["計算ミス", "時間不足"],
        },
        {
          number: 2,
          score: 20,
          time: 45,
          topicTags: ["確率"],
          issueTags: ["発想が出ない"],
        },
        {
          number: 3,
          score: 20,
          time: 45,
          topicTags: ["整数"],
          issueTags: [],
        },
      ],
    },
    {
      university: "北海道大学",
      year: "2022",
      score: 65,
      time: 120,
      questions: [
        {
          number: 1,
          score: 20,
          time: 35,
          topicTags: ["微分積分"],
          issueTags: ["計算ミス"],
        },
        {
          number: 2,
          score: 25,
          time: 45,
          topicTags: ["確率"],
          issueTags: [],
        },
        {
          number: 3,
          score: 20,
          time: 40,
          topicTags: ["整数"],
          issueTags: ["時間不足"],
        },
      ],
    },
    {
      university: "北海道大学",
      year: "2023",
      score: 75,
      time: 120,
      questions: [
        {
          number: 1,
          score: 25,
          time: 35,
          topicTags: ["微分積分"],
          issueTags: [],
        },
        {
          number: 2,
          score: 25,
          time: 40,
          topicTags: ["確率"],
          issueTags: [],
        },
        {
          number: 3,
          score: 25,
          time: 45,
          topicTags: ["整数"],
          issueTags: [],
        },
      ],
    },
  ];

  return (
    <div className="appContainer">
      <div className="headerSection">
        <h1>数学過去問アプリ</h1>
        <div className="headerActions">
          <button
            className="button-secondary"
            onClick={() => {
              setExams([...exams, ...demoData]);
            }}
          >
            デモデータを追加
          </button>
          <button
            className="button-destructive"
            onClick={() => {
              if (window.confirm("すべての保存済み過去問を削除しますか？")) {
                setExams([]);
              }
            }}
          >
            すべて削除
          </button>
        </div>
      </div>

      <ExamSelector
        university={exam.university}
        year={exam.year}
        onUniversityChange={(e) =>
          setExam({ ...exam, university: e.target.value, year: "" })
        }
        onYearChange={(e) => setExam({ ...exam, year: e.target.value })}
      />

      <QuestionInput
        questions={exam.questions}
        onQuestionChange={(updated) => setExam({ ...exam, questions: updated })}
        onSave={() => {
          const totalScore = exam.questions.reduce(
            (sum, q) => sum + Number(q.score || 0),
            0
          );
          const totalTime = exam.questions.reduce(
            (sum, q) => sum + Number(q.time || 0),
            0
          );
          // expectedScoreとdiffを再計算して保存
          const criteria = universityCriteria[exam.university];
          const structure = examStructure[exam.university]?.[exam.year];
          const questionsWithExpected = exam.questions.map((q) => {
            const structureQ = structure?.find((sq) => sq.number === q.number);
            if (!structureQ) return q;
            const expectedScore = calculateExpectedScore(
              q.number,
              structureQ.difficulty,
              structureQ.maxScore,
              exam.university,
              criteria
            );
            const actualScore = Number(q.score || 0);
            const diff = actualScore - expectedScore;
            return {
              ...q,
              expectedScore,
              diff,
            };
          });
          setExams([
            ...exams,
            {
              ...exam,
              questions: questionsWithExpected,
              score: totalScore,
              time: totalTime,
            },
          ]);
          setExam({
            university: "",
            year: "",
            score: "",
            time: "",
            questions: [],
          });
        }}
      />

      <div className="sectionCard">
        <h2 className="sectionTitle">保存した過去問</h2>
        {sortedExams.length === 0 ? (
          <div className="onboardingCard">
            <h3 className="onboardingTitle">はじめましょう</h3>
            <p className="onboardingDescription">
              過去問の記録を始めるには、以下の手順に従ってください。
            </p>
            <div className="onboardingSteps">
              <div className="onboardingStep">
                <div className="onboardingStepNumber">1</div>
                <div className="onboardingStepText">大学を選ぶ</div>
              </div>
              <div className="onboardingStep">
                <div className="onboardingStepNumber">2</div>
                <div className="onboardingStepText">年度を選ぶ</div>
              </div>
              <div className="onboardingStep">
                <div className="onboardingStepNumber">3</div>
                <div className="onboardingStepText">点数を入力</div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {sortedExams.map((item, sortedIndex) => {
              const originalIndex = exams.findIndex((e) => e === item);
              const isEditing = editingIndex === originalIndex;
              const displayData = isEditing ? editingData : item;
              const editTotalScore = isEditing
                ? displayData.questions.reduce(
                    (sum, q) => sum + Number(q.score || 0),
                    0
                  )
                : item.score;
              const editTotalTime = isEditing
                ? displayData.questions.reduce(
                    (sum, q) => sum + Number(q.time || 0),
                    0
                  )
                : item.time;

              return (
                <div key={originalIndex} className="section">
                  {isEditing ? (
                    <>
                      <select
                        value={displayData.university}
                        onChange={(e) =>
                          setEditingData({
                            ...displayData,
                            university: e.target.value,
                            year: "",
                          })
                        }
                      >
                        <option value="">大学を選択</option>
                        {Object.keys(examStructure).map((univ) => (
                          <option key={univ} value={univ}>
                            {univ}
                          </option>
                        ))}
                      </select>
                      <select
                        value={displayData.year}
                        onChange={(e) =>
                          setEditingData({
                            ...displayData,
                            year: e.target.value,
                          })
                        }
                        disabled={!displayData.university}
                      >
                        <option value="">年度を選択</option>
                        {displayData.university &&
                          Object.keys(
                            examStructure[displayData.university] || {}
                          ).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                      </select>
                      <p>
                        <span className="numericLabel">合計点：</span>
                        <span className="numericValue">{editTotalScore}</span>
                      </p>
                      <p>
                        <span className="numericLabel">合計時間：</span>
                        <span className="numericValue">{editTotalTime}</span>
                        <span className="numericLabel"> 分</span>
                      </p>

                      <p className="sectionSubtitle">大問内訳</p>
                      {displayData.questions.map((q, i) => (
                        <div key={i} className="questionItem">
                          <p className="questionNumber questionItemHeader">
                            大問{q.number}
                          </p>
                          {q.topicTags && q.topicTags.length > 0 && (
                            <div className="topicPillsContainer questionItemTags">
                              {q.topicTags.map((tag) => (
                                <span key={tag} className="topicPill">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <input
                            placeholder="点数"
                            value={q.score}
                            onChange={(e) => {
                              const updated = displayData.questions.map(
                                (question, idx) =>
                                  idx === i
                                    ? { ...question, score: e.target.value }
                                    : question
                              );
                              setEditingData({
                                ...displayData,
                                questions: updated,
                              });
                            }}
                          />
                          <input
                            placeholder="時間（分）"
                            value={q.time}
                            onChange={(e) => {
                              const updated = displayData.questions.map(
                                (question, idx) =>
                                  idx === i
                                    ? { ...question, time: e.target.value }
                                    : question
                              );
                              setEditingData({
                                ...displayData,
                                questions: updated,
                              });
                            }}
                          />
                          <div className="issueChipsContainer questionItemTags">
                            {issueTags.map((tag) => {
                              const isChecked = (q.issueTags || []).includes(
                                tag
                              );
                              return (
                                <label
                                  key={tag}
                                  className={`issueChip ${
                                    isChecked ? "checked" : ""
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const currentTags = q.issueTags || [];
                                      const updatedTags = e.target.checked
                                        ? [...currentTags, tag]
                                        : currentTags.filter((t) => t !== tag);
                                      const updated = displayData.questions.map(
                                        (question, idx) =>
                                          idx === i
                                            ? {
                                                ...question,
                                                issueTags: updatedTags,
                                              }
                                            : question
                                      );
                                      setEditingData({
                                        ...displayData,
                                        questions: updated,
                                      });
                                    }}
                                  />
                                  {tag}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <button
                        className="button-primary"
                        onClick={() => {
                          // expectedScoreとdiffを再計算
                          const criteria =
                            universityCriteria[displayData.university];
                          const structure =
                            examStructure[displayData.university]?.[
                              displayData.year
                            ];
                          const questionsWithExpected =
                            displayData.questions.map((q) => {
                              const structureQ = structure?.find(
                                (sq) => sq.number === q.number
                              );
                              if (!structureQ) return q;
                              const expectedScore = calculateExpectedScore(
                                q.number,
                                structureQ.difficulty,
                                structureQ.maxScore,
                                displayData.university,
                                criteria
                              );
                              const actualScore = Number(q.score || 0);
                              const diff = actualScore - expectedScore;
                              return {
                                ...q,
                                expectedScore,
                                diff,
                              };
                            });
                          const updated = [...exams];
                          updated[originalIndex] = {
                            ...displayData,
                            questions: questionsWithExpected,
                            score: editTotalScore,
                            time: editTotalTime,
                          };
                          setExams(updated);
                          setEditingIndex(null);
                          setEditingData(null);
                        }}
                      >
                        更新
                      </button>
                      <button
                        className="button-secondary"
                        onClick={() => {
                          setEditingIndex(null);
                          setEditingData(null);
                        }}
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <h3>
                        {item.university} / {item.year}
                      </h3>
                      <p>
                        <span className="numericLabel">合計点：</span>
                        <span className="numericValue">{item.score}</span>
                      </p>
                      <p>
                        <span className="numericLabel">合計時間：</span>
                        <span className="numericValue">{item.time}</span>
                        <span className="numericLabel"> 分</span>
                      </p>

                      <p className="sectionSubtitle">大問内訳</p>
                      {item.questions.map((q, i) => (
                        <div key={i} className="questionItemSmall">
                          <div className="questionItemHeader">
                            <p className="questionNumber">大問{q.number}</p>
                            {q.difficulty && (
                              <span
                                className={`difficultyBadge difficultyBadge-${q.difficulty}`}
                              >
                                {q.difficulty === "easy"
                                  ? "基礎"
                                  : q.difficulty === "standard"
                                  ? "標準"
                                  : "難問"}
                              </span>
                            )}
                          </div>
                          {q.topicTags && q.topicTags.length > 0 && (
                            <div className="topicPillsContainer questionItemTagsSmall">
                              {q.topicTags.map((tag) => (
                                <span key={tag} className="topicPill">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <p>
                            <span className="numericLabel">点数：</span>
                            <span className="numericValue">{q.score}</span>
                            <span className="numericLabel">点 / 時間：</span>
                            <span className="numericValue">{q.time}</span>
                            <span className="numericLabel">分</span>
                          </p>
                          {q.issueTags && q.issueTags.length > 0 && (
                            <div className="issueChipsContainer">
                              {q.issueTags.map((tag) => (
                                <span key={tag} className="issueChip checked">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      <button
                        className="button-secondary"
                        onClick={() => {
                          setEditingIndex(originalIndex);
                          setEditingData({ ...item });
                        }}
                      >
                        編集
                      </button>
                      <button
                        className="button-destructive"
                        onClick={() => {
                          setExams(exams.filter((_, i) => i !== originalIndex));
                        }}
                      >
                        削除
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {universityEvaluation && (
        <div className="sectionCard">
          <h2 className="sectionTitle">志望校評価</h2>
          <div className="universityEvaluationCard">
            <div className="universityEvaluationHeader">
              <h3>
                {universityEvaluation.university} {universityEvaluation.year}年
              </h3>
            </div>
            <div className="universityEvaluationScores">
              <div className="universityEvaluationScore">
                <span className="numericLabel">合格想定点：</span>
                <span className="numericValue">
                  {universityEvaluation.targetScore}
                </span>
                <span className="numericLabel">点</span>
              </div>
              <div className="universityEvaluationScore">
                <span className="numericLabel">現在点：</span>
                <span className="numericValue">
                  {universityEvaluation.currentScore}
                </span>
                <span className="numericLabel">点</span>
              </div>
            </div>
            <div className="universityEvaluationIssue">
              <p>{universityEvaluation.issueText}</p>
            </div>
          </div>
        </div>
      )}

      {expectedScoreAnalysis && (
        <div className="sectionCard">
          <h2 className="sectionTitle">期待得点分析</h2>
          <div className="universityEvaluationCard">
            <div className="universityEvaluationScores">
              <div className="universityEvaluationScore">
                <span className="numericLabel">期待得点合計：</span>
                <span className="numericValue">
                  {expectedScoreAnalysis.totalExpected}
                </span>
                <span className="numericLabel">点</span>
              </div>
              <div className="universityEvaluationScore">
                <span className="numericLabel">実得点合計：</span>
                <span className="numericValue">
                  {expectedScoreAnalysis.totalActual}
                </span>
                <span className="numericLabel">点</span>
              </div>
              <div className="universityEvaluationScore">
                <span className="numericLabel">差分：</span>
                <span
                  className={`numericValue ${
                    expectedScoreAnalysis.totalDiff >= 0
                      ? "numericValue-positive"
                      : "numericValue-negative"
                  }`}
                >
                  {expectedScoreAnalysis.totalDiff >= 0 ? "+" : ""}
                  {expectedScoreAnalysis.totalDiff}
                </span>
                <span className="numericLabel">点</span>
              </div>
            </div>
            <div className="universityEvaluationIssue">
              <p>{expectedScoreAnalysis.issueText}</p>
            </div>
          </div>
        </div>
      )}

      {strategyEvaluation && (
        <div className="sectionCard">
          <h2 className="sectionTitle">戦略評価</h2>
          <div className="universityEvaluationCard">
            <div className="universityEvaluationScores">
              <div className="universityEvaluationScore">
                <span className="numericLabel">今回の戦略：</span>
                <span
                  className={`numericValue ${
                    strategyEvaluation.status === "OK"
                      ? "numericValue-positive"
                      : "numericValue-negative"
                  }`}
                >
                  {strategyEvaluation.status}
                </span>
              </div>
            </div>
            <div className="universityEvaluationIssue">
              <p>
                <strong>理由：</strong>
                {strategyEvaluation.reason}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="sectionCard">
        <h2 className="sectionTitle">スコア推移</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>データがありません</p>
        )}
      </div>

      <TopicAnalysis
        topicAnalysisWithPriority={topicAnalysisWithPriority}
        urgentTopics={urgentTopics}
        nextTopics={nextTopics}
        maintainTopics={maintainTopics}
      />
    </div>
  );
}

export default App;
