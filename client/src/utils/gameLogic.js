export const createDeck = () => {
  const suits = ["Spade", "Club", "Diamond", "Heart"]; // Bích, Chuồn, Rô, Cơ
  const values = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];
  let deck = [];

  for (let s of suits) {
    for (let v of values) {
      deck.push({ suit: s, value: v, weight: values.indexOf(v) });
    }
  }
  return deck.sort(() => Math.random() - 0.5); // Xáo bài
};