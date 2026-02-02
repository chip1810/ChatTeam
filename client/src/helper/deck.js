const SUITS = ["♠", "♣", "♦", "♥"];
const VALUES = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];

export function createDeck() {
  let deck = [];
  SUITS.forEach(suit => {
    VALUES.forEach(value => {
      deck.push({ suit, value, id: value + suit });
    });
  });
  return deck.sort(() => Math.random() - 0.5); // Xáo bài đơn giản
}

export function dealCards(deck, playersCount) {
  // Chia mỗi người 13 lá (Tiến lên)
  const hands = [];
  for (let i = 0; i < playersCount; i++) {
    hands.push(deck.splice(0, 13));
  }
  return hands;
}