import { issueTags } from "../data/tags";

export function QuestionInput({ questions, onQuestionChange, onSave }) {
  const totalScore = questions.reduce(
    (sum, q) => sum + Number(q.score || 0),
    0
  );
  const totalTime = questions.reduce((sum, q) => sum + Number(q.time || 0), 0);

  return (
    <div className="sectionCard">
      <h2 className="sectionTitle">大問入力</h2>
      {questions.length === 0 && <p>まだ大問がありません</p>}

      {questions.map((q, index) => (
        <div key={index} className="questionCard">
          <div className="questionCardHeader">
            <div className="questionCardHeaderTop">
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
              <div className="topicPillsContainer">
                {q.topicTags.map((tag) => (
                  <span key={tag} className="topicPill">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="questionCardInputs">
            <div>
              <input
                placeholder="点数"
                value={q.score}
                onChange={(e) => {
                  const updated = questions.map((item, i) =>
                    i === index ? { ...item, score: e.target.value } : item
                  );
                  onQuestionChange(updated);
                }}
              />
              <span className="inputUnit">点</span>
            </div>
            <div>
              <input
                placeholder="時間"
                value={q.time}
                onChange={(e) => {
                  const updated = questions.map((item, i) =>
                    i === index ? { ...item, time: e.target.value } : item
                  );
                  onQuestionChange(updated);
                }}
              />
              <span className="inputUnit">分</span>
            </div>
          </div>

          <div className="issueChipsContainer">
            {issueTags.map((tag) => {
              const isChecked = (q.issueTags || []).includes(tag);
              return (
                <label
                  key={tag}
                  className={`issueChip ${isChecked ? "checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const currentTags = q.issueTags || [];
                      const updatedTags = e.target.checked
                        ? [...currentTags, tag]
                        : currentTags.filter((t) => t !== tag);
                      const updated = questions.map((item, i) =>
                        i === index ? { ...item, issueTags: updatedTags } : item
                      );
                      onQuestionChange(updated);
                    }}
                  />
                  {tag}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div className="summarySection">
        <h3>合計</h3>
        <p>
          <span className="numericLabel">合計点：</span>
          <span className="numericValue">{totalScore}</span>
        </p>
        <p>
          <span className="numericLabel">合計時間：</span>
          <span className="numericValue">{totalTime}</span>
          <span className="numericLabel"> 分</span>
        </p>

        <button className="button-primary" onClick={onSave}>
          保存
        </button>
      </div>
    </div>
  );
}
