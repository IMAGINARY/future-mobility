class IndexView {
  constructor(config, id, definition) {
    this.config = config;
    this.id = id;
    this.definition = definition;
    this.languages = this.config.dashboard.languages;
    this.mainLanguage = this.languages[0];
    this.value = null;
    this.$valueElement = $('<div></div>').addClass('value');
    this.$element = $('<div></div>')
      .addClass(['index', `index-${this.id}`])
      .append([
        $('<div></div>').addClass('description')
          .append(
            this.languages.map(lang => (
              $('<div></div>')
                .addClass(`name name-${lang}`)
                .addClass(lang === this.mainLanguage ? 'name-main' : 'name-translation')
                .text(this.definition.name[lang])
            ))
          ),
        this.$valueElement,
      ]);
  }

  setValue(value) {
    if (value !== this.value) {
      if (this.value !== null) {
        this.$element.removeClass(`value-${this.value}`);
      }
      this.value = value;
      this.$element.addClass(`value-${this.value}`);
    }
  }
}

module.exports = IndexView;
