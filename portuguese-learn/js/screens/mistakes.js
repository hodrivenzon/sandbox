/* Falar — "Review your mistakes": a flashcard deck built from the items you keep
   getting wrong (low box + low accuracy, or words that lapsed out of mastery).
   Reuses the shared flashcard runner from practice.js. */
(function () {
  function queue() {
    return PT.store.strugglingFrom(PT.content.allItems()).slice(0, 30);
  }
  function render(host) {
    PT.runFlashcards(host, {
      items: queue(),
      title: "Your mistakes",
      again: queue,
      backHref: "#/practice",
      emptyMsg: "No weak spots right now — you're on top of your tricky words. 💪"
    });
  }
  PT.screens.mistakes = { title: "Review mistakes", tab: "practice", render: render, onLeave: function () { PT.stopFlashcards(); } };
})();
