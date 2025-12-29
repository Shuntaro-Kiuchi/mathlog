import { examStructure } from "../data/examStructure";

export function ExamSelector({
  university,
  year,
  onUniversityChange,
  onYearChange,
}) {
  return (
    <div className="sectionCard">
      <h2 className="sectionTitle">試験情報</h2>
      <div className="card">
        <select value={university} onChange={onUniversityChange}>
          <option value="">大学を選択</option>
          {Object.keys(examStructure).map((univ) => (
            <option key={univ} value={univ}>
              {univ}
            </option>
          ))}
        </select>
        <select value={year} onChange={onYearChange} disabled={!university}>
          <option value="">年度を選択</option>
          {university &&
            Object.keys(examStructure[university] || {}).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
        </select>
        <p className="notice">
          ※ 大問構成・分野タグは公式過去問構成に基づいて自動生成されます
        </p>
      </div>
    </div>
  );
}
