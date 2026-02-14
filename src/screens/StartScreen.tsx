import { Button } from "@/components/ui/button";

function StartScreen({ onStartGame }: { onStartGame: () => void }) {
  return (
    <div className="relative w-[50vw] h-[50vh] bg-gray-400/60 rounded-md">
      <div className="flex flex-col items-center h-full gap-8">
        <div className="text-6xl font-bold mt-24 mb-12">Dailies</div>
        <div className="flex flex-row gap-4">
          <Button className="cursor-pointer px-8 py-8" onClick={onStartGame}>Hot/Cold Country</Button>
        </div>
      </div>
    </div>
  );
}

export default StartScreen;
