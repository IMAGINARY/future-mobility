/**
 * Create a multi-language title for the dashboard
 *
 * @param {string[]} languages
 *  Ordered list of languages to use in the title
 * @param {Object.<string, string>} texts
 *  Object with the texts for the title in different languages
 * @return {*|jQuery}
 */
function createTitle(languages, texts) {
  const $answer = $('<div></div>')
    .addClass('dashboard-title');

  const mainLang = languages[0];
  const allTextsAreEqual = languages.every(lang => texts[lang] === texts[mainLang]);

  if (allTextsAreEqual) {
    $answer.append($('<h2>').text(texts[mainLang]));
  } else {
    // Append the title in each language
    $answer.append(languages.map(lang => {
      return $(lang === mainLang ? '<h2>' : '<div>')
        .addClass(lang === mainLang ? 'dashboard-title-main' : 'dashboard-title-translation')
        .text(texts[lang]);
    }))
  }

  return $answer;
}

/**
 * Create a copy of createTitle with the languages bound
 *
 * @param {string[]} languages
 *  Ordered list of languages to use in titles
 * @return {function(Object.<string, string>): *|jQuery}
 */
function bindCreateTitle(languages) {
  return createTitle.bind(null, languages);
}

module.exports = { createTitle, bindCreateTitle };
