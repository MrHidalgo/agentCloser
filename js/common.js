var datePickerPopup = {
  DOM: {
    popup: '.date-popup',
    popupContent: '.date-popup-content',
    header: '.date-popup-header span',
    handleInputs: '.ui.calendar',
    rangeSwitch: '.j-range',
    btnCancel: '.j-cancel',
    btnOk: '.j-ok',
    btnUnsel: '.btn-unsel',
    calendarTitle: '.calendar-title label',
    errors: '.date-popup-errors',

    dateFrom: '.date-from',
    dateTo: '.date-to',
  },

  classes: {
    active: 'active',
    rangeMode: 'range-date',
    hasErrors: 'has-errors',
  },

  rangeDivider: ' - ',
  dateFromSiffix: '+', // suffix if date from choosed only
  dateToPrefix: 'to ', // suffix if date to choosed only

  dateFrom: null,
  dateTo: null,
  formattedDate: '',

  currentTarget: null,

  semanticCalendarParams: {
    type: 'date',
    inline: true,
    /*
    monthFirst: true,
    formatter: {
      date: function (date, settings) {
        date = date.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });

        return date;
      }
    }
    */
  },

  init: function() {
    $(this.DOM.handleInputs).on('click focus', this.show.bind(this));
    $(this.DOM.popup).find(this.DOM.rangeSwitch).on('change', this.rangeSwitchChanged.bind(this));
    $(this.DOM.popup).on('click', this.hide.bind(this));
    $(this.DOM.popup).find(this.DOM.btnCancel).on('click', this.hide.bind(this));
    $(this.DOM.popup).find(this.DOM.btnOk).on('click', this.onOk.bind(this));
    $(this.DOM.popup).find(this.DOM.popupContent).on('click', function(ev) { ev.stopPropagation(); });

    // init datepicker fields
    this.semanticCalendarParams.onChange = this.onDateChange.bind(this, 'dateFrom');
    $(this.DOM.popup).find(this.DOM.dateFrom).calendar(this.semanticCalendarParams);
    $(this.DOM.popup).find(this.DOM.dateFrom).find(this.DOM.btnUnsel).on('click', this.unsel.bind(this, 'dateFrom'));

    this.semanticCalendarParams.onChange = this.onDateChange.bind(this, 'dateTo');
    $(this.DOM.popup).find(this.DOM.dateTo).calendar(this.semanticCalendarParams);
    $(this.DOM.popup).find(this.DOM.dateTo).find(this.DOM.btnUnsel).on('click', this.unsel.bind(this, 'dateTo'));
  },

  onDateChange: function (field, date, text, mode) {
    //console.log('field', field, 'date', date, 'text', text, 'mode', mode);
    if(typeof(this[field]) !== 'object') return;

    this[field] = date;

    this.updateFormattedDate();
    this.validateDates();
  },

  show: function(ev) {
    $(this.DOM.popup).addClass(this.classes.active);
    this.currentTarget = ev.target;

    // copy date to popup
    let tmp = ev.target.value.split(this.rangeDivider);
    let isSingle = true;

    if(tmp.length > 1) { // date is range
      this.dateFrom = this.parseDate(tmp[0]);
      this.dateTo = this.parseDate(tmp[1]);
      isSingle = false;
    }

    if(tmp.length == 1) { // date is single of from/to
      let re = new RegExp(this.dateFromSiffix.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&') + '$');

      if(tmp[0] == '') {
        this.dateFrom = null;
        isSingle = false; // range mode by default
      }

      if(tmp[0].match(re)) { // date is from, remove suffix
        this.dateFrom = this.parseDate(tmp[0].slice(0, tmp[0].length - this.dateFromSiffix.length));
        isSingle = false;
      }

      re = new RegExp('^' + this.dateToPrefix.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'));

      if(tmp[0].match(re)) { // date is to, remove prefix
        this.dateTo = this.parseDate(tmp[0].slice(this.dateToPrefix.length));
        isSingle = false;
      }


    }

    if(isSingle) { // clear checkbox
      this.dateFrom = this.parseDate(tmp[0]);
      this.dateTo = null;
    }

    $(this.DOM.rangeSwitch).prop('checked', !isSingle);
    this.setRangeMode(!isSingle);

    $(this.DOM.popup).find(this.DOM.dateFrom).calendar('set date', this.dateFrom, false, false);
    $(this.DOM.popup).find(this.DOM.dateTo).calendar('set date', this.dateTo, false, false);

    this.updateFormattedDate();
    this.validateDates()
  },

  parseDate: function(val) {
    if(typeof(val) !== 'string' || val.length == 0) return null;

    let tmp = val.split('/');
    tmp[0] = +tmp[0]; // month
    tmp[1] = +tmp[1]; //day
    tmp[2] = +tmp[2]; //year

    if(tmp[2] < 100) tmp[2] += 2000;

    return new Date(tmp[2], tmp[0] - 1, tmp[1]);
  },

  hide: function(ev) {
    $(this.DOM.popup).removeClass(this.classes.active);
  },

  rangeSwitchChanged: function(ev) {
    this.setRangeMode(ev.currentTarget.checked);
  },

  setRangeMode(isRange) {
    if(isRange) {
      $(this.DOM.popup).addClass(this.classes.rangeMode);
      $(this.DOM.dateFrom).find(this.DOM.calendarTitle).text('Date From');
    }
    else {
      $(this.DOM.popup).removeClass(this.classes.rangeMode);
      $(this.DOM.dateFrom).find(this.DOM.calendarTitle).text('Date');
    }
    this.updateFormattedDate();
  },

  stringDate(val) {
    if(!val) return '';

    return val.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  },

  updateFormattedDate() {
    let result = '';

    if($(this.DOM.rangeSwitch).prop('checked')) { // range or from/to

      if(this.dateFrom && this.dateTo) { // range
        result = this.stringDate(this.dateFrom) + this.rangeDivider + this.stringDate(this.dateTo);
      }

      if(this.dateFrom && !this.dateTo) {
        result = this.stringDate(this.dateFrom) + this.dateFromSiffix; //from
      }

      if(!this.dateFrom && this.dateTo) {
        result = this.dateToPrefix + this.stringDate(this.dateTo); //from
      }
    }
    else result = this.stringDate(this.dateFrom);

    this.formattedDate = result;

    if(result.length > 0) {
      $(this.DOM.popup).find(this.DOM.header).text(result);
    }
    else {
      $(this.DOM.popup).find(this.DOM.header).text('not set');
    }
  },

  validateDates: function() {
    if(this.dateFrom && this.dateTo && this.dateFrom.valueOf() > this.dateTo.valueOf()) {
      $(this.DOM.popup).find(this.DOM.errors).text('Start date > end date');
      $(this.DOM.popup).addClass(this.classes.hasErrors);
      return false;
    }

    $(this.DOM.popup).removeClass(this.classes.hasErrors);

    return true;
  },

  onOk: function(ev) {
    if(!this.validateDates()) return;

    this.currentTarget.value = this.formattedDate;
    this.hide();
  },

  unsel: function (field) {
    if(typeof(this[field]) !== 'object') return;
    if(typeof(this.DOM[field]) !== 'string') return;

    this[field] = null;

    this.updateFormattedDate();
    this.validateDates()

    $(this.DOM.popup).find(this.DOM[field]).calendar('set date', null, false, false);
  },
};

$(function () { // jQuery call it on DOM ready
  $('.dropdown').dropdown(); // init all dropdowns
  $('.checkbox').checkbox(); // init all checkboxes

  // init calendar popup
  datePickerPopup.init();

  /**
   * Event handler to close popup
   */
  $('.popup-card .popup-card-close').on('click', function (ev) {
    ev.stopPropagation();
    $('.popup-card').removeClass('active');
  });

  /**
   * Event handler: click by menu group header
   */
  $('.left-panel .menu-group').on('click', function () {
    if($(this).hasClass('opened')) { // current group opened
      $(this).removeClass('opened');
    } else { // current group closed
      $('.left-panel .menu-group').removeClass('opened'); //auto fold other groups
      $(this).addClass('opened'); // show this group
    }
  });
});
