class DevToolsComponent {
  constructor() {
    this.$element = $('<div></div>')
      .addClass('dev-tools-component');

    this.$accordion = $('<div></div>')
      .addClass('accordion')
      .appendTo(this.$element);

    this.sections = {};
  }

  addSection(id, title, opened = false) {
    const headingId = `devtools-h-${id}`;
    const collapaseId = `devtools-c-${id}`;

    if (this.sections[id]) {
      throw new Error(`DevTools: Attempted to add section with duplicate id ${id}.`);
    }

    // Determine classes and attributes based on "opened"
    const buttonClasses = ['accordion-button'];
    if (!opened) buttonClasses.push('collapsed');
    const collapseClasses = ['accordion-collapse', 'collapse'];
    if (opened) collapseClasses.push('show');

    this.sections[id] = $('<div></div>')
      .addClass('accordion-item')
      .appendTo(this.$accordion)
      .append($('<h2></h2>')
        .addClass('accordion-header')
        .attr('id', headingId)
        .append($('<button></button>')
          .addClass(buttonClasses)
          .attr('type', 'button')
          .attr('data-bs-toggle', 'collapse')
          .attr('data-bs-target', `#${collapaseId}`)
          .attr('aria-expanded', opened ? 'true' : 'false')
          .attr('aria-controls', collapaseId)
          .text(title)))
      .append($('<div></div>')
        .attr('id', collapaseId)
        .addClass(collapseClasses)
        .attr('aria-labelledby', headingId)
        .append($('<div></div>')
          .addClass('accordion-body')
          .attr('data-component', id)));
  }

  addToSection(id, $element) {
    if (!this.sections[id]) {
      throw new Error(`DevTools: Attempted to add element to non-existent section ${id}.`);
    }

    this.sections[id].find('.accordion-body').append($element);
  }
}

module.exports = DevToolsComponent;
