import QuestionItem from "./QuestionItem";

function ExamForm({ exam, setExam, exams, setExams }) {
  const totalScore = exam.questions.reduce(
    (sum, q) => sum + Number(q.score || 0),
    0
  );
  const totalTime = exam.questions.reduce(
    (sum, q) => sum + Number(q.time || 0),
    0
  );

  return (
    <>
      <h2>基本情報</h2>

      <input
        placeholder="大学名"
        value={exam.university}
        onChange={(e) =>
          setExam({ ...exam, university: e.target.value })
        }
      />

      <input
        placeholder="年度"
        value={exam.year}
        onChange={(e) =>
          setExam({ ...exam, year: e.target.value })
        }
      />

      <h2>大問</h2>

      {exam.questions.map((q, index) => (
        <QuestionItem
          key={index}
          question={q}
          index={index}
          exam={exam}
          setExam={setExam}
        />
      ))}

      <button
        onClick={() =>
          setExam((prev) => ({
            ...prev,
            questions: [
              ...prev.questions,
              {
                number: prev.questions.length + 1,
                score: "",
                time: "",
              },
            ],
          }))
        }
      >
        大問を追加
      </button>

      <h3>合計</h3>
      <p>合計点：{totalScore}</p>
      <p>合計時間：{totalTime} 分</p>

      <button
        onClick={() => {
          setExams([
            ...exams,
            { ...exam, score: totalScore, time: totalTime },
          ]);
          setExam({
            university: "",
            year: "",
            questions: [],
          });
        }}
      >
        保存
      </button>
    </>
  );
}

export default ExamForm;
