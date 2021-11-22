function createTitle(texts) {
  const $answer = $('<div></div>')
    .addClass('dashboard-title');

  const { de, en } = texts;
  if (de === en) {
    $answer.append($('<h2>').text(de));
  } else {
    $answer.append(
      $('<h2>')
        .text(de),
      $('<div></div>')
        .addClass('dashboard-title-translation')
        .text(en)
    );
  }

  return $answer;
}

module.exports = { createTitle };
