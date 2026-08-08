import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
} from "recharts";
import type { FinalEvaluation } from "@/types/interview";

interface Props {
  feedback: FinalEvaluation;
}

export function CandidateRadarChart({ feedback }: Props) {
  const overall = feedback.scores.overall;
  const depth = feedback.scores.conceptualDepth;
  const comm = feedback.scores.communication;
  const arch = Math.round((overall + depth) / 2);
  const tradeoffs = Math.max(20, Math.round(overall * 0.9));

  const data = [
    { subject: "Conceptual Depth", score: depth, fullMark: 100 },
    { subject: "System Architecture", score: arch, fullMark: 100 },
    { subject: "Trade-off Reasoning", score: tradeoffs, fullMark: 100 },
    { subject: "Communication", score: comm, fullMark: 100 },
    { subject: "Overall Competency", score: overall, fullMark: 100 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 9 }} />
          <Radar
            name="Candidate"
            dataKey="score"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.4}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
