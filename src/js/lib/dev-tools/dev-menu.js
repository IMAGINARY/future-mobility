class DevMenu {
  constructor(brand = 'Editor') {
    this.$element = $('<nav></nav>')
      .addClass(['dev-menu', 'navbar', 'fixed-top', 'bg-dark']);

    this.$container = $('<div></div>')
      .addClass('container-fluid')
      .append(
        // Brand
        $('<div></div>')
          .addClass('navbar-brand')
          .text(brand)
      )
      .appendTo(this.$element);

    this.$nav = $('<ul></ul>')
      .addClass(['nav', 'me-auto', 'mb-2', 'mb-lg-0'])
      .appendTo(this.$container);
  }

  /**
   * Add a dropdown menu to the dev menu.
   *
   * @param {string} label
   *  Label for the dropdown
   * @param {Object} items
   *   Object where keys are item labels and values are callbacks
   */
  addDropdown(label, items) {
    this.$nav.append(
      $('<li></li>')
        .addClass(['nav-item', 'dropdown'])
        .append($('<a></a>')
          .addClass(['nav-link', 'dropdown-toggle'])
          .attr('href', '#')
          .attr('role', 'button')
          .attr('data-bs-toggle', 'dropdown')
          .attr('aria-expanded', 'false')
          .text(label))
        .append($('<ul></ul>')
          .addClass('dropdown-menu')
          .append(Object.entries(items).map(([itemLabel, callback]) => (
            $('<li></li>')
              .append($('<a></a>')
                .addClass('dropdown-item')
                .attr('href', '#')
                .text(itemLabel)
                .on('click', (e) => {
                  e.preventDefault();
                  callback();
                }))))))
    );
  }
}

module.exports = DevMenu;
