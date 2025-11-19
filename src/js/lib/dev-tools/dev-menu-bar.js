const { logger } = require('../helpers/logger');

class DevMenuBar {
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

    this.menus = {};
  }

  /**
   * Add a menu to the dev menu bar.
   *
   * @param {string} id
   * @param {string} label
   */
  addMenu(id, label) {
    if (this.menus[id]) {
      logger.warn(`Menu with id ${id} already exists`);
    }

    const dropdown = $('<ul></ul>').addClass('dropdown-menu');

    this.menus[id] = {
      dropdown,
      updateHandlers: [],
    };

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
        .append(dropdown)
        .on('show.bs.dropdown', () => { this.menus[id].updateHandlers.forEach((h) => h()); })
    );
  }

  /**
   * Add an item to a menu.
   *
   * @param {string} menuId
   * @param {string} label
   * @param {Function} callback
   * @param {Object} options
   * @param {Function} options.checked Function that returns whether the item is checked
   * @param {Function} options.enabled Function that returns whether the item is enabled
   */
  addItem(menuId, label, callback, options = {}) {
    if (!this.menus[menuId]) {
      logger.warn(`Menu with id ${menuId} does not exist`);
      return;
    }

    const $item = $('<li></li>')
      .append($('<a></a>')
        .addClass('dropdown-item')
        .attr('href', '#')
        .text(label)
        .on('click', (e) => {
          e.preventDefault();
          callback();
        }))
      .appendTo(this.menus[menuId].dropdown);

    if (options.checked) {
      const updateChecked = () => {
        if (options.checked()) {
          $item.find('a').addClass('checked');
        } else {
          $item.find('a').removeClass('checked');
        }
      };
      updateChecked();
      this.menus[menuId].updateHandlers.push(updateChecked);
    }

    if (options.enabled) {
      const updateEnabled = () => {
        if (options.enabled()) {
          $item.find('a').removeClass('disabled').attr('aria-disabled', 'false');
        } else {
          $item.find('a').addClass('disabled').attr('aria-disabled', 'true');
        }
      };
      updateEnabled();
      this.menus[menuId].updateHandlers.push(updateEnabled);
    }
  }
}

module.exports = DevMenuBar;
