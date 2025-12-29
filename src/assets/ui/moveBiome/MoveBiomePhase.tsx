export default function MoveBiomePhase({
  round,
  onNextPhase,
}: {
  round: number;
  onNextPhase: () => void;
}) {
  console.log("MoveBiomePhase rendered", round);
  return <div>AttackPhase</div>;
}
