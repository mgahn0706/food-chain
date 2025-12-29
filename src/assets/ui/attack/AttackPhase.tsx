export default function AttackPhase({
  round,
  onNextPhase,
}: {
  round: number;
  onNextPhase: () => void;
}) {
  console.log("AttackPhase rendered", round);
  return <div>AttackPhase</div>;
}
