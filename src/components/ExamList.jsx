function ExamList({ exams }) {
  return (
    <>
      <h2>保存した過去問</h2>

      {exams.length === 0 && <p>まだ保存されていません</p>}

      {exams.map((exam, index) => (
        <div
          key={index}
          style={{
            border: "2px solid black",
            margin: "10px",
            padding: "10px",
          }}
        >
          <h3>
            {exam.university} / {exam.year}
          </h3>
          <p>合計点：{exam.score}</p>
          <p>合計時間：{exam.time} 分</p>

          <p>大問内訳</p>
          {exam.questions.map((q, i) => (
            <p key={i}>
              大問{q.number}：{q.score}点 / {q.time}分
            </p>
          ))}
        </div>
      ))}
    </>
  );
}

export default ExamList;
