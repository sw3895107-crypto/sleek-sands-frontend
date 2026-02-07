type Suit = "hearts" | "diamonds" | "clubs" | "spades";

const valueMap: Record<string, string> = {
  A: "ace",
  K: "king",
  Q: "queen",
  J: "jack"
};

export function getCardImage(value: string, suit: Suit) {
  const normalizedValue =
    valueMap[value.toUpperCase()] || value.toLowerCase();

  return `/cards/${normalizedValue}_of_${suit}.png`;
}
