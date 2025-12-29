export function TopicAnalysis({
  topicAnalysisWithPriority,
  urgentTopics,
  nextTopics,
  maintainTopics,
}) {
  if (topicAnalysisWithPriority.length === 0) {
    return (
      <div className="sectionCard">
        <h2 className="sectionTitle">分野別診断</h2>
        <p>データがありません</p>
      </div>
    );
  }

  return (
    <div className="sectionCard">
      <h2 className="sectionTitle">分野別診断</h2>
      {urgentTopics.length > 0 && (
        <div className="prioritySection">
          <h3 className="priorityTitle priorityTitleUrgent">
            🔴 優先的に対応が必要
          </h3>
          {urgentTopics.map((topic) => (
            <div
              key={topic.topic}
              className="topicAnalysisCard topicAnalysisCardUrgent"
            >
              <div className="topicAnalysisHeader">
                <span className="topicPill">{topic.topic}</span>
                <span className="topicAnalysisCount">
                  出題数：{topic.count}回
                </span>
              </div>
              <div className="topicAnalysisMetrics">
                <div className="topicAnalysisMetric">
                  <span className="numericLabel">平均得点</span>
                  <span className="numericValue">
                    {topic.avgScore.toFixed(1)}
                  </span>
                  <span className="numericLabel">点</span>
                </div>
                <div className="topicAnalysisMetric">
                  <span className="numericLabel">出題数</span>
                  <span className="numericValue">{topic.count}</span>
                  <span className="numericLabel">回</span>
                </div>
                {topic.mainIssueTag && (
                  <div className="topicAnalysisMetric">
                    <span className="numericLabel">つまずき</span>
                    <span className="topicAnalysisIssueTag">
                      {topic.mainIssueTag}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {nextTopics.length > 0 && (
        <div className="prioritySection">
          <h3 className="priorityTitle priorityTitleNext">
            🟠 次に対応すべき分野
          </h3>
          {nextTopics.map((topic) => (
            <div
              key={topic.topic}
              className="topicAnalysisCard topicAnalysisCardNext"
            >
              <div className="topicAnalysisHeader">
                <span className="topicPill">{topic.topic}</span>
                <span className="topicAnalysisCount">
                  出題数：{topic.count}回
                </span>
              </div>
              <div className="topicAnalysisMetrics">
                <div className="topicAnalysisMetric">
                  <span className="numericLabel">平均得点</span>
                  <span className="numericValue">
                    {topic.avgScore.toFixed(1)}
                  </span>
                  <span className="numericLabel">点</span>
                </div>
                <div className="topicAnalysisMetric">
                  <span className="numericLabel">出題数</span>
                  <span className="numericValue">{topic.count}</span>
                  <span className="numericLabel">回</span>
                </div>
                {topic.mainIssueTag && (
                  <div className="topicAnalysisMetric">
                    <span className="numericLabel">つまずき</span>
                    <span className="topicAnalysisIssueTag">
                      {topic.mainIssueTag}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {maintainTopics.length > 0 && (
        <div>
          <h3 className="priorityTitle priorityTitleMaintain">
            🟢 維持すべき分野
          </h3>
          {maintainTopics.map((topic) => (
            <div
              key={topic.topic}
              className="topicAnalysisCard topicAnalysisCardMaintain"
            >
              <div className="topicAnalysisHeader">
                <span className="topicPill">{topic.topic}</span>
                <span className="topicAnalysisCount">
                  出題数：{topic.count}回
                </span>
              </div>
              <div className="topicAnalysisMetrics">
                <div className="topicAnalysisMetric">
                  <span className="numericLabel">平均得点</span>
                  <span className="numericValue">
                    {topic.avgScore.toFixed(1)}
                  </span>
                  <span className="numericLabel">点</span>
                </div>
                <div className="topicAnalysisMetric">
                  <span className="numericLabel">出題数</span>
                  <span className="numericValue">{topic.count}</span>
                  <span className="numericLabel">回</span>
                </div>
                {topic.mainIssueTag && (
                  <div className="topicAnalysisMetric">
                    <span className="numericLabel">つまずき</span>
                    <span className="topicAnalysisIssueTag">
                      {topic.mainIssueTag}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
