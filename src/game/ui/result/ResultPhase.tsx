export default function ResultPhase({
  onNextPhase,
}: {
  onNextPhase: () => void;
}) {
  return <div onClick={onNextPhase}>Result Phase - Click to proceed</div>;
}
