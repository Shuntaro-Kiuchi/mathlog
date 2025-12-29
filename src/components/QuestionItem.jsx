function QuestionItem({ question, index, exam, setExam }) {
  const updateQuestion = (key, value) => {
    const updated = exam.questions.map((q, i) =>
      i === index ? { ...q, [key]: value } : q
    );
    setExam({ ...exam, questions: updated });
  };

  const deleteQuestion = () => {
    const filtered = exam.questions.filter((_, i) => i !== index);
    setExam({ ...exam, questions: filtered });
  };

  return (
    <div style={{ border: "1px solid #ccc", margin: "8px", padding: "8px" }}>
      <p>大問 {question.number}</p>

      <input
        placeholder="点数"
        value={question.score}
        onChange={(e) => updateQuestion("score", e.target.value)}
      />

      <input
        placeholder="時間"
        value={question.time}
        onChange={(e) => updateQuestion("time", e.target.value)}
      />

      <button onClick={deleteQuestion}>削除</button>
    </div>
  );
}

export default QuestionItem;
