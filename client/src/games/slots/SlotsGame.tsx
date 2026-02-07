import { useState } from "react";
import { audioManager } from "../../audio/AudioManager";

type SpinResult = {
  reels: string[];
  win: boolean;
  payout: number;
  sound: string;
};

export default function SlotsGame() {
  const [reels, setReels] = useState<string[]>(["?", "?", "?"]);
  const [spinning, setSpinning] = useState(false);
  const [isWin, setIsWin] = useState(false);

  const spin = async () => {
    if (spinning) return;

    setSpinning(true);
    setIsWin(false);
    audioManager.play("spin");

    try {
      const res = await fetch("/api/slots/spin", {
        method: "POST"
      });

      const data: SpinResult = await res.json();

      setTimeout(() => {
        setReels(data.reels);
        setSpinning(false);

        if (data.win) {
          setIsWin(true);
          audioManager.play("slot_win");
        }
      }, 700);

    } catch (err) {
      console.error("Spin failed", err);
      setSpinning(false);
    }
  };

  return (
    <div className="slots-container">
      <h2>Slots</h2>

      <div className={`reels ${isWin ? "win" : ""}`}>
        {reels.map((symbol, i) => (
          <div key={i} className="reel">
            {symbol}
          </div>
        ))}
      </div>

      {isWin && (
        <div className="win-line">
          WIN LINE
        </div>
      )}

      <button onClick={spin} disabled={spinning}>
        {spinning ? "Spinning..." : "SPIN"}
      </button>
    </div>
  );
}
