// -------------------------------------
// variables
// -------------------------------------

// selectors
let $window = $(window);
let $document = $(document);
let $html = $('html');
let $body = $('body');
let $pageTitle = $('#page-title');
let $notificationsContainer = $('.notifications-container');
let $mainSliderCarousel = $('.main-slider-carousel');
const $serviceCalculatorFormInputs = $('.service-calculator-form :input, .service-calculator-form select');
let $statisticsEl = $('.our-statistics-section .statistics-area');
let $reviewsSection = $('.reviews-section');
let $clientsSection = $('.clients-section');
let $customInputSlider = $('.input-slider');
let $progressCircle = $('.progress-circle');
let $aboutPage = $('.about-us-page');
let $singlePost = $('.single-post');
let $contactPage = $('.contact-page');
let $getQuotePage = $('.get-quote-page');
let $userPage = $('.user-pages');
let $profilePage = $('.profile-page');
let $settingsPage = $('.settings-page');
let $signPage = $('.sign-page');

// elements pages (for demo)
let $progressBarPage = $('.progress-bar-page');


// for the template theme
const appTheme = 'light_theme';
let savedTheme;
let themeSwitcher = $('.top-bar .theme-switcher input, nav .mobile-theme-switcher input');

// for tab trap in side menu
const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]';
let $sideMenuFirstTabStop;
let $sideMenuLastTabStop;
let $isLastTabStopInSideMenu;

// for minimizing the header on scrolling down
const startMinimizingHeaderAt = 100;
// for toggling the top bar on scrolling down
let startTogglingTopBarAt = 0;
// for scroll to top button
const startShowingScrollTopBtnAt = 600;

// sliders direction based on page direction
let sliderDir;
sliderDir = ($html.attr('dir') === 'rtl') ? true : false;

// object for storing setIntervals & setTimeout identifier
const timerIdentifiers = {};

// shipments form data in get quote page
const shipmentsFormData = [{
  index: 0,
  value: null,
  containerDetailsEls: null,
  cargoClassPackingEls: null
}];
const $userDetailsForm = $('#userDetailsForm');


// document ready
$(() => {

  // toggle focus style
  toggleFocusStyle();

  // get a theme to use
  getTheme();
  
  // detect the theme changes
  onThemeChange();

  // scrolling options
  scrollingOptions();

  // scroll to top button
  scrollToTop();
    
  // toggle side menu
  toggleSideMenu();

  // slide toggle for sub menus in side menu
  sideMenuSubMenuToggle();

  // fire owl carousel in main-slider section
  if ($mainSliderCarousel.length) {
    $mainSliderCarousel.owlCarousel({
      autoplay: true,
      loop: true,
      items: 1,
      nav: false,
      dots: true,
      rtl: sliderDir
    });
  }

  // calculate service cost on value changes
  $serviceCalculatorFormInputs.on('change', () => {
    const $serviceCalcForm = $('.service-calculator .service-calculator-form');
    const isOriginToDest = $serviceCalcForm.hasClass('from-origin-to-dest');
    const values = {};
    
    $serviceCalculatorFormInputs.each(function() {

      if ($(this).is('input[type="radio"]')) {

        if ($(this).is(':checked')) {
          values[this.name] = $(this).val();

          // change units in fields placeholder
          if ($(this).is('input[name="unit"]')) {
            $serviceCalcForm.find('input[name="weight"]').attr(
              'placeholder',
              (($html.attr('dir') === 'ltr') ? '0 ' : '٠ ') + $(this).parent('.radio').siblings('label').text()
            );

          } else if ($(this).is('input[name="measure"]')) {
            $serviceCalcForm.find('input[name="length"], input[name="height"], input[name="width"]').attr(
              'placeholder',
              (($html.attr('dir') === 'ltr') ? '0 ' : '٠ ') + $(this).parent('.radio').siblings('label').text()
            );
          }
        }

      } else if ($(this).is(':checkbox')) {

        values[this.name] = $(this).is(':checked');

      } else {

        values[this.name] = $(this).val();
      }
    });

    if (
      (
        (isOriginToDest && values.fromCity) ||
        (!isOriginToDest && calculatorOptions.originCountryCoords)
      ) && values.toCity
    ) {
      let from;
      const toCity = values.toCity.split(',');
      const to = { latitude: +toCity[0], longitude: +toCity[1] };

      if (isOriginToDest) {
        const fromCity = values.fromCity.split(',');

        from = { latitude: +fromCity[0], longitude: +fromCity[1] };
      } else {
        from = calculatorOptions.originCountryCoords;
      }

      values.distance = haversine(from, to);

      // calculating service cost
      calcServiceCost(values);

      // calculating shipping period
      calcShippingPeriod(values.distance);
    }
  });

  // toggling between icons in (calculate service) section
  togglingChildren();

  // show tab content on click in our services section
  ourServicesTabs();

  // trigger statistics counter on window scroll
  if ($statisticsEl.length) {
    triggerStatisticsCounter();
  }

  // toggle accordion on click in choose-us section
  chooseUsToggleAccordion();

  // initially open tab in accordion of choose-us section
  chooseUsAccordionInitiallyOpen();

  // fire owl carousel in reviews section
  if ($reviewsSection.length) {
    $reviewsSection.find('.owl-carousel').owlCarousel({
      autoplay: true,
      loop: true,
      items: 1,
      nav: true,
      dots: false,
      rtl: sliderDir,
      navText: sliderDir ? [
        '<i class="fa fa-chevron-right" aria-hidden="true" title="السابق"></i>',
        '<i class="fa fa-chevron-left" aria-hidden="true" title="التالي"></i>'
      ] : [
        '<i class="fa fa-chevron-left" aria-hidden="true" title="Prev"></i>',
        '<i class="fa fa-chevron-right" aria-hidden="true" title="Next"></i>'
      ]
    });
  }

  // fire owl carousel in clients section
  if ($clientsSection.length) {
    $clientsSection.find('.owl-carousel').owlCarousel({
      autoplay: true,
      loop: true,
      autoplayTimeout: 3000,
      nav: false,
      dots: false,
      rtl: sliderDir,
      responsive: {
        0: {
          items: 1
        },
        600: {
          items: 2
        },
        768: {
          items: 3
        },
        992: {
          items: 4
        }
      }
    });
  }

  // add stagger delay to children elements
  staggerDelay();
    
  // image pan effect on hover
  panEffect();

  // custom input number
  customInputNumber();

  // custom input select
  customInputSelect();

  // custom input file
  customInputFile();

  // custom input radio & checkbox from type img
  customImgRadioCheckbox();

  // count and display number of remaining characters in textarea field
  charRemaining(
    '.form-styled textarea',
    $('.form-styled textarea').parent('.control').siblings('.char-count').children('span:first-of-type')
  );

  // responsive tables
  if ($window.width() < 768) {
    responsiveTables();
  }

  // step progress
  $('.step-progress:not(.history) .steps').each(function () {
    const $stepsChildren = $(this).children('.step');
    const stepsLength = $stepsChildren.length - 1;
    const activeStep = $(this).find('.step.active').index();
    
    // highlight the other steps
    $stepsChildren.eq(activeStep).prevAll('.step').addClass('done');
    $stepsChildren.eq(activeStep).nextAll('.step').removeClass('done');

    if ($(this).parent('.step-progress').hasClass('vertical')) {
      let barHeight = [];

      if ($(this).parents('.step-progress').hasClass('reverse')) {

        // get all steps height without the last one
        $stepsChildren.filter(':visible').each(function (i) {
          if (i !== 0) { barHeight.push($(this).outerHeight()); }
        });

        $(this).siblings('.bar').css('bottom',
          ($stepsChildren.eq(0).outerHeight() - 20) + 'px'
        );

        $(this).siblings('.fill').css('bottom',
          ($stepsChildren.eq(0).outerHeight() - 20) + 'px'
        );

      } else {

        // get all steps height without the last one
        $stepsChildren.filter(':visible').each(function (i) {
          if (i === $stepsChildren.length - 1) { return; }
    
          barHeight.push($(this).outerHeight());
        });
      }
      
      $(this).siblings('.bar').css('height', barHeight.reduce((a, b) => a + b, 0) + 10);
      $(this).siblings('.fill').css('height', barHeight.slice(0, activeStep).reduce((a, b) => a + b, 0) + 10);

    } else {
      $(this).siblings('.fill').css('width', ((100 / stepsLength) * activeStep) + '%');
    }
  });
  stepProgress();

  // history step progress
  $('.step-progress.history').each(function () {
    const activeTab = $(this).find('.step.active').index('.step-progress.history .step');
    
    $(this).find('.history-contents .content').eq(activeTab).addClass('active').siblings('.content').removeClass('active');
  });
  historyStepProgress();

  // trigger demo progress bar in 'progress-bar' elements page
  if ($progressBarPage.length) {
    progressBar('demo');
  }

  // progress circle
  progressCircle();

  // custom input slider
  if ($customInputSlider.length) {
    $customInputSlider.ionRangeSlider({
      skin: 'round',
      min: $(this).attr('data-min'),
      max: $(this).attr('data-max'),
      prettify_separator: ','
    });
  }

  // -------------------------------------
  // about us page functions
  // -------------------------------------
  if ($aboutPage.length) {
    // trigger skills animation on window scroll
    progressBar('skills');
  }

  // -------------------------------------
  // single page functions
  // -------------------------------------
  if ($singlePost.length) {

    // trigger theiaStickySidebar plugin
    $('.single-post .post, .single-post .sidebar').theiaStickySidebar({
      // Settings
      additionalMarginTop: 122,
      additionalMarginBottom: 30
    });

    // reply form validation
    replyFormValidation();

    // comment form
    const $commentForm = $('.single-post .leave-comment-area .comment-form');

    // get saved user data from previous comment
    getUserDataFromPrevComment($commentForm);

    // comment form validation
    commentFormValidation($commentForm);

    // save user data for next comment
    $commentForm.on('submit', () => saveUserDataForNextComment($commentForm));
  }

  // -------------------------------------
  // contact us page functions
  // -------------------------------------
  if ($contactPage.length) {
    // contact us form validation
    contactFormValidation();

    // address location map
    olMap('.address-map #map');
  }

  // -------------------------------------
  // get quote page functions
  // -------------------------------------
  if ($getQuotePage.length) {
    // load shipments form
    loadShipmentsForm();

    // show containerSize & containerType fields if the transportMode is oceanFreight
    isOceanFreight();

    // show more fields if the shipment is hazardous
    isHazardous();

    // user details form validation
    userDetailsFormValidation();
  }

  // -------------------------------------
  // user pages functions
  // -------------------------------------
  if ($userPage.length) {

    // trigger theiaStickySidebar plugin
    $('.user-pages .user-sidebar').theiaStickySidebar({
      // Settings
      additionalMarginTop: 80,
      additionalMarginBottom: 30
    });
  }

  // -------------------------------------
  // profile page functions
  // -------------------------------------
  if ($profilePage.length) {

    // user info form validation
    userInfoFormValidation();
  }

  // -------------------------------------
  // settings page functions
  // -------------------------------------
  if ($settingsPage.length) {
    
    // choose a profile picture by file uploader
    chooseProfilePictureByFileUploader();
    
    // select an avatar as a profile picture
    selectProfilePictureFromAvatars();

    // user settings form validation
    userSettingsFormValidation();
  }

  // -------------------------------------
  // sign in & up page functions
  // -------------------------------------
  if ($signPage.length) {
    // show sign-in-up page content based on url
    showContentBasedOnUrl();

    // sign-in form validation
    signInFormValidation();

    // sign-up form validation
    signUpFormValidation();
  }
});

// window scroll
$window.on('scroll', () => {
  // scrolling options
  scrollingOptions();
});

// window load
$window.on('load', () => {
  // preloader
  $('.preloader').fadeOut(600);
});

// toggle focus style
function toggleFocusStyle() {
  $document.on('click keydown', function (e) {
    if (e.type === 'keydown' && e.code === 'Tab') {
      $body.addClass('enable-focus-style');

    } else if (e.type === 'click') {
      $body.removeClass('enable-focus-style');
    }
  });
}

// get a theme to use
function getTheme() {
  // get the saved theme from the localStorage
  const storageSavedTheme = localStorage.getItem('azadSavedTheme');

  // Check to see if there a saved theme
  if (storageSavedTheme) {
    savedTheme = storageSavedTheme;

  } else {
    // So, try to get the browser default theme or make your own default

    // Check to see if Media-Queries are supported
    if (window.matchMedia) {

      // Check if the dark-mode Media-Query matches
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        savedTheme = 'dark_theme';
      } else { savedTheme = 'light_theme'; }

    } else {
      // Default (when Media-Queries are not supported)
      savedTheme = appTheme;
    }
  }

  // save the new theme in the localStorage
  localStorage.setItem('azadSavedTheme', savedTheme);

  // set the switcher
  themeSwitcher.prop('checked', (savedTheme === 'dark_theme') ? true : false);

  // set the theme class to the wrapper element
  $html.addClass(savedTheme);
}

// detect the theme changes
function onThemeChange() {
  themeSwitcher.on('change', (e) => {

    if (e.target.checked) {

      savedTheme = 'dark_theme';
      $html.addClass('dark_theme').removeClass('light_theme');

    } else {

      savedTheme = 'light_theme';
      $html.addClass('light_theme').removeClass('dark_theme');
    }

    // save the new theme in the localStorage
    localStorage.setItem('azadSavedTheme', savedTheme);
  });
}

// scrolling options
function scrollingOptions() {
  const scrollPosition = $window.scrollTop();
  const header = $('header');
  const topBar = $('header .top-bar');
  const scrollTopBtn = $('.scroll-to-top');

  // check for current scroll position to minimize the header
  if (scrollPosition >= startMinimizingHeaderAt) {
    header.addClass('header-small').removeClass('header-big');
  } else {
    header.addClass('header-big').removeClass('header-small');
  }

  // check for current scroll position to toggle the top bar
  if (scrollPosition > startTogglingTopBarAt) {
    topBar.addClass('hidden-top-bar');
  } else {
    topBar.removeClass('hidden-top-bar');
  }
  startTogglingTopBarAt = scrollPosition;

  // check for current scroll position to show the scrollTop button
  if (scrollPosition >= startShowingScrollTopBtnAt) {
    scrollTopBtn.addClass('show-scrollTop');
  } else {
    scrollTopBtn.removeClass('show-scrollTop');
  }
}

// scroll to top button
function scrollToTop() {
  $('.scroll-to-top').on('click', () => {
    window.scroll({ top: 0, behavior: 'smooth' });
  });
}

// search for something by search form
function goSearch(e) {
  const $this = $(e.currentTarget);
  const $searchForm = $this.parents('form');
  const url = $searchForm.data('post-url');
  const data = $searchForm.serializeArray().reduce((acc, {name, value}) => ({...acc, [name]: value}), {});

  if (data.search !== '') {
    // dismiss the error alert if has a value
    dismissNotify('#searchValueRequired');

    $.ajax({
      method: 'POST',
      url,
      data,
      cache: false,
      beforeSend: () => { startLoading(); },
      success: (data) => {
        console.log(data);
      },
      error: (xhr, status, err) => {},
      complete: () => { endLoading(); }
    });

  } else {

    // show error alert if there is no value
    setNotify({
      id: 'searchValueRequired',
      class: 'danger',
      msg: $searchForm.find('.errors-msgs .required').val()
    });
  }
}

// animate search form on
function animateSearchFormOn(e) {
  const $nav = $(e.currentTarget).parents('nav');
  $nav.addClass('animate-search-form');
}

// animate search form off
function animateSearchFormOff(e) {
  const $nav = $(e.currentTarget).parents('nav');
  $nav.removeClass('animate-search-form');
}

// trigger statistics counter on window scroll
function triggerStatisticsCounter() {
  $window.on('scroll.statistics', () => {
    const scrollPosition = $window.scrollTop();
    const counterEl = $('.our-statistics-section .statistics-area strong');
  
    // check for current scroll position to trigger counting up in statistic section
    if (scrollPosition >= ($statisticsEl.offset().top - ($statisticsEl.outerHeight() + 200))) {
      counterEl.each((i) => statisticsCounter(counterEl[i], 1000));

      $window.off('scroll.statistics');
    }
  });
}

// statistics counter
function statisticsCounter(el, dur) {
  const frameDuration = 1000 / 60;
  const totalFrames = Math.round((dur / 2) / frameDuration);
  const easeOutQuad = (t) => t * (2 - t);

  let frame = 0;
  const countTo = parseInt(el.getAttribute('data-count'), 10);

  const counter = setInterval(() => {
    frame++;
    const progress = easeOutQuad(frame / totalFrames);
    const currentCount = Math.round(countTo * progress);

    if (parseInt(el.innerHTML, 10) !== currentCount) {
      el.innerHTML = String(currentCount);
    }

    if (frame === totalFrames) { clearInterval(counter); }
  }, frameDuration);
}

// toggle side menu
function toggleSideMenu() {
  $document.on('click keyup', (e) => {

    const $this = $(e.target);
    const $sideMenuBtn = $('header nav .side-menu-btn');
    const $sideMenu = $('header .side-menu');

    if (e.type === 'click') {
      if ($this.closest($sideMenuBtn).length) {
  
        $sideMenuBtn.addClass('open');
        $sideMenu.addClass('open');
        $sideMenu.trigger('focus');
  
      } else if (!$this.closest($sideMenu).length) {
  
        $sideMenuBtn.removeClass('open');
        $sideMenu.removeClass('open');
      }

    } else if (e.type === 'keyup') {
      if ($sideMenu.hasClass('open')) {
        // close side menu on Escape button press
        if (e.code && e.code === 'Escape') {
          $sideMenuBtn.removeClass('open');
          $sideMenu.removeClass('open');
          $sideMenu.trigger('blur');
          $sideMenuBtn.trigger('focus');
        }

        // get first & last focusable elements in the side menu for the tab trap
        const $visibleFocusableEls = $sideMenu.find(focusableElementsString).filter(':visible');
        $sideMenuFirstTabStop = $visibleFocusableEls.eq(0);
        $sideMenuLastTabStop = $visibleFocusableEls.eq($visibleFocusableEls.length -1);

        // if this is the last element go back to the first element
        if ($isLastTabStopInSideMenu) {
          $sideMenuFirstTabStop.trigger('focus');
        }

        // check if last element or not
        if ($(document.activeElement)[0] === $sideMenuLastTabStop[0]) {
          $isLastTabStopInSideMenu = true;
        } else {
          $isLastTabStopInSideMenu = false;
        }
      }
    }
  });
}

// slide toggle for sub menus in side menu
function sideMenuSubMenuToggle() {
  $('header .side-menu .menu-body li.has-children .fa').on('click', (e) => {
    const $this = $(e.currentTarget);
    
    if (!$this.hasClass('open')) {
  
      $this.addClass('open');
      $this.next('.sub-menu').slideDown(300);
  
    } else {
  
      $this.removeClass('open');
      $this.next('.sub-menu').slideUp(300);
    }
  });
}

// calculating service cost
function calcServiceCost(values) {

  // service calculator values
  const calculatorValues = {
    fragileCost: 0,
    expressDeliveryCost: 0,
    insuranceCost: 0,
    packagingCost: 0
  };

  const total =
    (values.distance  * calculatorOptions.distanceUnitCost) +
    (values.weight    * calculatorOptions.weightUnitCost * +values.unit) +
    (values.length    * calculatorOptions.lengthUnitCost * +values.measure) +
    (values.height    * calculatorOptions.heightUnitCost * +values.measure) +
    (values.width     * calculatorOptions.widthUnitCost * +values.measure);

  calculatorValues.fragileCost = (values.fragile === 'yes') ? (total * calculatorOptions.fragileCostRate) : 0;

  calculatorValues.expressDeliveryCost = (values.expressDelivery) ? (total * calculatorOptions.expressDeliveryCostRate) : 0;

  calculatorValues.insuranceCost = (values.insurance) ? (total * calculatorOptions.insuranceCostRate) : 0;

  calculatorValues.packagingCost = (values.packaging) ? (total * calculatorOptions.packagingCostRate) : 0;

  const result = total +
    calculatorValues.fragileCost +
    calculatorValues.expressDeliveryCost +
    calculatorValues.insuranceCost +
    calculatorValues.packagingCost;

  $('.service-calculator .reach-in .total .num').text((result).toFixed(2));
}

// calculating shipping period
function calcShippingPeriod(distance) {
  const shippingHours = Math.ceil(distance) / calculatorOptions.shippingHourDistance;
  const $days = $('.service-calculator .reach-in .days span');

  if (shippingHours <= 24) {
    $days.text('0-1');
  } else {
    $days.text(`${Math.ceil(shippingHours / 24)}-${Math.ceil(shippingHours / 24) + 1}`);
  }
}

// toggling between children (change class 'active')
function togglingChildren() {
  const $parent = $('.toggle-children');
  const $children = $('.toggle-children').children();
  const duration = $('.toggle-children').data('toggle-children-dur');
  let activeIndex = 0;

  $children.eq(activeIndex).addClass('active');

  setTimeout(() => {
    setInterval(() => {
      activeIndex = (activeIndex + 1) % $children.length;
      $children.eq(activeIndex).addClass('active').siblings().removeClass('active');
    }, duration);
  }, duration);
}

// show tab content on click in our services section
function ourServicesTabs() {
  $('.services-section .tabs-menu button').on('click', function () {

    const $el = $(this);
    const activeTab = $el.parent().index();

    $el.addClass('active').parent().siblings().children().removeClass('active');
    $el.parents('.tabs-menu').siblings('.tabs-contents-area').children('.contents').eq(activeTab)
      .addClass('active').siblings('.contents').removeClass('active');
  });
}

// toggle accordion on click in choose-us section
function chooseUsToggleAccordion() {
  $('.choose-us-content .tabs .tab-title').on('click', (e) => {
    const $this = $(e.currentTarget);
    const $tap = $this.parent();

    if (!$tap.hasClass('open')) {

      $tap.addClass('open');
      $tap.children('.tab-content').slideDown(300);

    } else {

      $tap.removeClass('open');
      $tap.children('.tab-content').slideUp(300);
    }
  });
}

// initially open tab in accordion of choose-us section
function chooseUsAccordionInitiallyOpen() {
  $('.choose-us-content .tabs .open').each(function () {
    $(this).children('.tab-content').show();
  });
}

// track a shipment by tracking form
function trackShipment(e) {
  const $this = $(e.currentTarget);
  const $trackingForm = $this.parents('form');
  const url = $trackingForm.data('post-url');
  const data = $trackingForm.serializeArray().reduce((acc, {name, value}) => ({...acc, [name]: value}), {});

  if (data.trackingNumber === '') {
    // show error alert if there is no value
    setNotify({
      id: 'trackingNumberRequired',
      class: 'danger',
      msg: $trackingForm.find('.errors-msgs .required').val()
    });

    // dismiss the error alert if the value is number
    dismissNotify('#trackingNumberInvalid');

  } else if (isNaN(data.trackingNumber)) {
    // show error alert if the value is not a number
    setNotify({
      id: 'trackingNumberInvalid',
      class: 'danger',
      msg: $trackingForm.find('.errors-msgs .invalid').val()
    });

    // dismiss the error alert if has a value
    dismissNotify('#trackingNumberRequired');

  } else {

    // dismiss the error alert if has a value
    dismissNotify('#trackingNumberRequired');

    // dismiss the error alert if the value is number
    dismissNotify('#trackingNumberInvalid');

    $.ajax({
      method: 'POST',
      url,
      data,
      cache: false,
      beforeSend: () => { startLoading(); },
      success: (data) => {
        $trackingForm.trigger('reset');
        console.log(data);
      },
      error: (xhr, status, err) => {},
      complete: () => { endLoading(); }
    });
  }
}

// subscribe to newsletter
function newsletterSubscribe(e) {
  const $this = $(e.currentTarget);
  const $newsletterForm = $this.parents('form');
  const url = $newsletterForm.data('post-url');
  const data = $newsletterForm.serializeArray().reduce((acc, {name, value}) => ({...acc, [name]: value}), {});

  // newsletter email required validation
  if (data.newsletterEmail !== '') {

    // dismiss the error alert if has a value
    dismissNotify('#newsletterEmailRequired');

    // newsletter email validation
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(data.newsletterEmail)) {
      
      // show error alert if invalid email
      setNotify({
        id: 'newsletterEmailInvalid',
        class: 'danger',
        msg: $newsletterForm.find('.errors-msgs .invalid').val()
      });

    } else {
      // dismiss the error alert if valid email
      dismissNotify('#newsletterEmailInvalid');

      $.ajax({
        method: 'POST',
        url,
        data,
        cache: false,
        beforeSend: () => { startLoading(); },
        success: (data) => {
          $newsletterForm.trigger('reset');
          console.log(data);
        },
        error: (xhr, status, err) => {},
        complete: () => { endLoading(); }
      });
    }
  } else {

    // show error alert if there is no value
    setNotify({
      id: 'newsletterEmailRequired',
      class: 'danger',
      msg: $newsletterForm.find('.errors-msgs .required').val()
    });
  }
}

// add stagger delay to children elements
function staggerDelay() {
  $('.stagger-delay').each(function() {
    $(this).children().each(function(i) {
      $(this).css('animation-delay', `${(i + 1) * 100}ms`);
    });
  });
}

// image pan effect on hover
function panEffect() {
  $('.pan-effect').on('mousemove', function (e) {
    $(this).find('img').css({
      transformOrigin: ((e.pageX - $(this).offset().left) / $(this).width()) * 100 + '% ' +
      ((e.pageY - $(this).offset().top) / $(this).height()) * 100 + '%'
    });
  });
}

// custom input number
function customInputNumber() {
  $document.on('click', '.custom-number .fa-angle-up', (e) => {
    const $this = $(e.currentTarget);
    const $number = $this.siblings('.number:enabled');
    
    $number.val(+$number.val() + 1).trigger('change');
  });

  $document.on('click', '.custom-number .fa-angle-down', (e) => {
    const $this = $(e.currentTarget);
    const $number = $this.siblings('.number:enabled');

    if ($number.val() > 1) {
      $number.val(+$number.val() - 1).trigger('change');
    }
  });
}

// custom input select
function customInputSelect() {
  $('select:not(.select-hidden)').each(function () {
    const $select = $(this);

    $select.addClass('select-hidden');
    $select.wrap('<div class="select"></div>');

    if ($select.is(':enabled')) {
      $select.after('<div class="select-styled" tabindex="0"></div>');

    } else {
      $select.after('<div class="select-styled"></div>');
    }

    const $styledSelect = $select.next('div.select-styled');
    let searchEl;
    let noResultsMsg;

    if ($html.attr('dir') === 'ltr') {
      searchEl = '<input type="search" placeholder="Search...">';
      noResultsMsg = 'No results found...';

    } else if ($html.attr('dir') === 'rtl') {
      searchEl = '<input type="search" placeholder="بحث...">';
      noResultsMsg = 'لا توجد نتائج...';
    }

    const iconUrl = $select.children('option:selected').data('icon-url');
    const optionIcon = iconUrl ? `<img class="icon" src="${iconUrl}">` : '';

    $styledSelect.html(`
    ${searchEl}
    ${optionIcon}
    <span>${$select.children('option:selected').text()}</span>
    `);

    const $list = $('<ul class="select-options"></ul>').insertAfter($styledSelect);

    // generate select options
    generateSelectOptions();

    if ($select.is(':enabled')) {
      $styledSelect.on("click keydown", function (e) {
        if (e.type === 'click' || (e.key && e.key === 'Enter')) {
          e.stopPropagation();

          const $this = $(this);
          const $search = $this.find('input[type=search]');
          const $options = $this.next('ul.select-options');

          // hide all other select lists
          $('div.select-styled.active').not($this).each(function () {
            $(this).removeClass('active').next('ul.select-options').hide();
          });

          // show this select dropdown menu
          $this.toggleClass('active').next('ul.select-options').toggle();

          $list.empty();

          // generate select options
          generateSelectOptions();

          // scroll to the selected item when the menu opens
          if ($this.hasClass('active') && $options.children('.selected').length > 0) {
            $options.scrollTop(0).scrollTop($options.children('.selected').position().top);
          }

          // show search input
          $search.val('').show('fast', () => $search.trigger('focus')).on("click", (e) => e.stopPropagation());

          // filter results on typing in search input
          $search.on("keyup", () => {
            $list.children('li').each(function () {
              const $listItem = $(this);

              if ($listItem.text().toLowerCase().indexOf($search.val().toLowerCase()) === -1) {
                $listItem.hide();
              } else {
                $listItem.not('.hidden, .no-results-msg').show();
              }

              // show no-results-msg if there is no results
              const $noResultsEl = $list.find('.no-results-msg');

              ($list.children('li:not(.no-results-msg):visible').length === 0) ? $noResultsEl.show() : $noResultsEl.hide();
              $noResultsEl.on('click', (e) => e.stopPropagation());
            });
          });
        }
      });
    }

    // actions on click on an option
    $list.on("click keydown", "li:not(.no-results-msg)", function (e) {
      const $that = $(this);

      if (e.type === 'click' || (e.key && e.key === 'Enter')) {
        e.stopPropagation();

        $styledSelect.html(`${searchEl}${$that.html()}`).removeClass('active');
        $select.val($that.data('value')).trigger('change');
        $that.addClass('selected').siblings().removeClass('selected');
        $select.children('option').eq($that.index() - 1).attr('selected', 'selected').siblings().attr('selected', null);
        $list.hide();
      }
    });

    // update the menu items on load a new option
    $select.on("DOMNodeInserted", "option", () => {
      $styledSelect.html(`
      <input type="search">
      <span>${$select.children('option:first').text()}</span>
      `);

      $list.empty();
      
      // generate select options
      generateSelectOptions();
    });

    // update the menu items on reset
    $select.on("change", () => {
      if (!$(this).val()) {
        $(this).children().removeAttr('selected');
        $styledSelect.html($(this).children().eq(0).text());
      }
    });

    // close the dropdown menu 
    $document.on("click keydown", function (e) {
      if (e.type === 'click' || (e.code && e.code === 'Escape')) {
        $styledSelect.removeClass('active');
        $list.hide();
      }
    });

    // generate select options
    function generateSelectOptions() {
      $list.append(`<li class="no-results-msg">${noResultsMsg}</li>`);

      for (let i = 0; i < $select.children('option').length; i++) {
        const optionText = `<span>${$select.children('option').eq(i).text()}</span>`;
        const optionValue = $select.children('option').eq(i).val();
        const iconUrl = $select.children('option').eq(i).data('icon-url');
        const optionIcon = iconUrl ? `<img class="icon" src="${iconUrl}">` : '';
        let optionClasses = [];

        i === 0 ? optionClasses.push('hidden') : null;
        $select.children('option').eq(i).attr('selected') ? optionClasses.push('selected') : null;

        const optionClass = optionClasses.length ? ` class="${optionClasses.join(' ')}"` : '';

        $list.append(`<li${optionClass} data-value="${optionValue}" tabindex="0">${optionIcon}${optionText}</li>`);
      }
    }
  });
}

// custom input file
function customInputFile() {
  $('.custom-input-file input[type="file"]').on('change', function () {
    const $this = $(this);
    const $label = $this.siblings('label');
    const labelText = $label.data('content');
    const files = $this.prop("files");

    if (files.length) {
      const length = files.length;
      const names = $.map(files, val => val.name + ', ');
      
      names[length - 1] = names[length - 1].replace(', ', '');
    
      $label.text(names);
    } else {

      $label.text(labelText);
    }
  });
}

// custom input radio & checkbox from type img
function customImgRadioCheckbox() {
  $('.radio-container.img input[type=radio], .checkbox-container.img input[type=checkbox]').on('change', function () {
    const $this = $(this);
    const $parent = $this.parents(`.${$this.attr('type')}-container.img`);

    if ($this.is(':checked')) {
      $parent.addClass('checked');

      if ($this.is('input[type="radio"]')) {
        $parent.parent('.control').siblings('.control').children('.checked').removeClass('checked');
      }

    } else {
      $parent.removeClass('checked');
    }
  });
}

// count and display number of remaining characters
function charRemaining(targetEl, $counterEl) {
  let valLength;

  $(targetEl).on('keyup keydown change', (e) => {
    valLength = $(e.target).val().length || 0;
    
    $counterEl.text(valLength);
  });
}

// responsive tables
function responsiveTables() {
  $("table.table-styled tbody tr td").each(function () {
    $(this).before("<td class='fake-title'></td>");
  });

  $("table.table-styled").each(function () {

    const tHeadTh = [];

    $(this).find("thead th").each(function (i) {
      tHeadTh[i] = $(this).text();
    });

    $(this).find("tbody tr").each(function () {
      $(this).children('td.fake-title').each(function (i) {
        $(this).text(tHeadTh[i]);
      });
    });
  });
}

// step progress
function stepProgress() {
  $document.on('click', '.step-progress.interactive:not(.history) .step', function () {
    const $stepsChildren = $(this).parent('.steps').children('.step');
    const stepsLength = $(this).siblings('.step').length;
    const stepIndex = $(this).index();

    $(this).addClass('active').siblings('.step').removeClass('active');
    
    // highlight the other steps
    $(this).prevAll('.step').addClass('done');
    $(this).nextAll('.step').removeClass('done');

    if ($(this).parents('.step-progress').hasClass('vertical')) {
      let barHeight = [];

      if ($(this).parents('.step-progress').hasClass('reverse')) {

        // get all steps height without the last one
        $stepsChildren.filter(':visible').each(function (i) {
          if (i !== 0) { barHeight.push($(this).outerHeight()); }
        });

      } else {

        // get all steps height without the last one
        $stepsChildren.filter(':visible').each(function (i) {
          if (i === $stepsChildren.length - 1) { return; }
    
          barHeight.push($(this).outerHeight());
        });
      }
      
      $(this).parents('.step-progress').find('.bar').css('height', barHeight.reduce((a, b) => a + b, 0) + 10);
      $(this).parents('.step-progress').find('.fill').css('height', barHeight.slice(0, stepIndex).reduce((a, b) => a + b, 0) + 10);

    } else {
      $(this).parents('.step-progress').find('.fill').css('width', ((100 / stepsLength) * stepIndex) + '%');
    }
  });
}

// history step progress
function historyStepProgress() {
  $document.on('click', '.step-progress.history .step', function () {
    const thisTab = $(this).index();

    $(this).addClass('active').siblings('.step').removeClass('active');

    $(this).parent('.steps').siblings('.history-contents').children().eq(thisTab)
      .addClass('active').siblings('.content').removeClass('active');
  });
}

// progress bar animation on window scroll
function progressBar(id = Date.now()) {
  const $progressBarItemsContainer = $('.progress-bar-items');

  $window.on(`scroll.${id}`, () => {
    const scrollPosition = $window.scrollTop();
    const progressBarItems = $('.progress-bar-items .item');
  
    // check for current scroll position to trigger the animation
    if (scrollPosition >= ($progressBarItemsContainer.offset().top - ($progressBarItemsContainer.outerHeight() + 200))) {
      progressBarItems.each((i) => {
        const $item = $(progressBarItems[i]);
        const pct = $item.data('pct');

        if ($html.attr('lang') === 'ar') {
          $item.find('.count').text(`${pct.toLocaleString('ar-EG')}٪`);
        } else {
          $item.find('.count').text(`${pct}%`);
        }

        $item.find('.count').css({'width': `${pct}%`});
        $item.find('.count').css({'display': 'block'});
        $item.find('.fill').css({'width': `${pct}%`});
      });

      $window.off(`scroll.${id}`);
    }
  });
}

// progress circle
function progressCircle() {
  if ($progressCircle.length) {
    $progressCircle.each(function () {
      const $this = $(this);
      const id = Date.now();
      const value = $this.data('value');
      const barColor = $this.css('border-bottom-color');
      const fillColor = $this.css('border-top-color');

      $this.circleProgress({
        size: 140,
        startAngle: 4.74,
        thickness: 4,
        fill: fillColor,
        emptyFill: barColor,
        value: 0,
        animation: { duration: 1200 }
      });

      $window.on(`scroll.${id}-${$this.index('.progress-circle')}`, () => {
        const scrollPosition = $window.scrollTop();

        if (scrollPosition >= ($this.offset().top - $window.height() + 200)) {

          $this.circleProgress({ value }).on('circle-animation-progress', (event, progress) => {
            if ($html.attr('lang') === 'ar') {
              $this.find('strong').html(Math.round(value * 100 * progress).toLocaleString('ar-EG') + '٪');
            } else {
              $this.find('strong').html(Math.round(value * 100 * progress) + '%');
            }
          });

          $window.off(`scroll.${id}-${$this.index('.progress-circle')}`);
        }
      });
    });
  }
}

// generate progress bars in graph style
function generateGraphProgress(numbers, types, container, coordinatesGrid) {
  const $targetEl = $(container);
  const id = Date.now();
  const $tableEl = coordinatesGrid ? $('<table class="graph-progress coordinates-grid"></table>') : $('<table class="graph-progress"></table>');

  // styles for responsive
  $targetEl.css({
    'max-width': '100%',
    'padding-top': '10px',
    'overflow-x': 'auto'
  });

  for (let n = numbers.length - 1; n >= 0; n--) {
    const $trEl = $(`
    <tr>
      <td>
        ${numbers[n]}
        <strong>${numbers[n]}</strong>
      </td>
      <td><strong></strong></td>
    </tr>
    `);

    for (let t = 0; t < types.length; t++) {
      if (n === 0) {
        $trEl.append(`
        <td><strong>${types[t].title}</strong></td>
        <td><strong></strong></td>
        `);
        
      } else if (n === 1) {
        $trEl.append(`
        <td><strong class="col" data-value="${numbers.indexOf(types[t].value)}"></strong></td>
        <td><strong></strong></td>
        `);
        
      } else {
        $trEl.append(`<td><strong></strong></td><td><strong></strong></td>`);
      }
    }

    $tableEl.append($trEl);
  }
  $targetEl.append($tableEl);

  // trigger the animation on scroll
  $window.on(`scroll.${id}`, () => {
    const scrollPosition = $window.scrollTop();
    const graphCols = $targetEl.find('.graph-progress .col');
  
    // check for current scroll position to trigger the animation
    if (scrollPosition >= ($targetEl.offset().top - ($targetEl.outerHeight()))) {
      graphCols.each((i) => {
        const $col = $(graphCols[i]);
        const value = $col.data('value');
        
        $col.css({ 'height': value * 50 });
      });

      $window.off(`scroll.${id}`);
    }
  });
}

// toggle password visibility
function togglePasswordVisibility(e) {
  const $el = $(e.target);
  const $passwordInput = $el.siblings('input');

  if ($passwordInput.attr('type') === 'password') {
    $el.removeClass('fa-eye');
    $el.addClass('fa-eye-slash');

    $passwordInput.attr('type' , 'text');

  } else {

    $el.removeClass('fa-eye-slash');
    $el.addClass('fa-eye');

    $passwordInput.attr('type' , 'password');
  }
}

// focus sibling input
function focusSiblingInput(e) {
  const $el = $(e.target);
  const $siblingInput = $el.siblings('input');

  if (!$siblingInput.is(':disabled')) {
    $siblingInput.trigger('focus').trigger('click');
  }
}

// read uploaded file url
function readUploadedFileURL(inputFile, $previewImg) {
  if (inputFile.files && inputFile.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      $previewImg.attr('src', e.target.result);
    }

    reader.readAsDataURL(inputFile.files[0]); // convert to base64 string
  }
}

// add ajax loading spinner
function startLoading() {
  const $loadingSpinner = ('<div class="ajax-loading"><span></span></div>');

  // add the spinner element to the document
  $body.prepend($loadingSpinner);
}

// remove ajax loading spinner
function endLoading() {
  // remove the spinner element from the document
  $body.find('.ajax-loading').remove();
}

// show messages by toast notifications
function setNotify(options) {
  const notificationLength = $notificationsContainer.children().length;
  const notificationElId = options.id || notificationLength;
  const $notificationEl = (`
  <li id="${notificationElId}" class="notification ${options.class}${options.time ? ' timer' : ''}">
    ${options.msg}
    <i class="fa fa-times" aria-hidden="true" onclick="dismissNotify('#${notificationElId}')"></i>
    ${options.time ? `<span class="disappearing-time" style="animation-duration: ${options.time / 1000}s"></span>` : ''}
  </li>
  `);

  // add the notification to the document
  if (options.id) {

    // check if it's repeated notification
    if (!$notificationsContainer.has(`#${options.id}`).length) {

      // if not exist, add it
      $notificationsContainer.append($notificationEl);

      // remove this notification from the document after (n) seconds
      if (options.time) {
        timerIdentifiers.dismissNotifyTimer = setTimeout(() => dismissNotify(`#${notificationElId}`), options.time);
      }
    }

  } else {
    // add the notification to the document
    $notificationsContainer.append($notificationEl);

    // remove this notification from the document after (n) seconds
    if (options.time) {
      timerIdentifiers.dismissNotifyTimer = setTimeout(() => dismissNotify(`#${notificationElId}`), options.time);
    }
  }
}

// dismiss the notifications
function dismissNotify(id) {
  $notificationsContainer.find(id).slideUp(function () {$(this).remove()});

  // kill the disappearing timer
  clearTimeout(timerIdentifiers.dismissNotifyTimer);
}

// OpenLayers map
function olMap(targetEl) {
  const $mapEl = $(targetEl);

  const coords = ol.proj.transform([
    $mapEl.data('lng'),
    $mapEl.data('lat')
  ],
  'EPSG:4326', 'EPSG:3857');

  let iconFeature = new ol.Feature({ geometry: new ol.geom.Point(coords) });

  let iconStyle = new ol.style.Style({
    image: new ol.style.Icon({ src: $mapEl.data('marker-src') })
  });
  iconFeature.setStyle(iconStyle);

  const map = new ol.Map({
    target: 'map',
    controls: ol.control.defaults().extend([new ol.control.FullScreen()]),
    layers: [
      // style
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        })
      }),
      // icon feature
      new ol.layer.Vector({
        source: new ol.source.Vector({ features: [iconFeature] })
      })
    ],
    view: new ol.View({
      // coords
      center: coords,
      // initial zoom
      zoom: $mapEl.data('zoom')
    })
  });
}

// -------------------------------------
// single page functions
// -------------------------------------

// load reply box
function loadReplyBox(e) {
  const $this = $(e.currentTarget);
  const $targetEl = $this.siblings('.reply-box');
  const replyFormLength = $singlePost.find('.reply-box form').length;

  // remove the reply button after click
  $this.remove();

  // load the reply box
  $.get($targetEl.data('content'), function (data) {
    const uniqueData = data.replace(/_autoUniqueId/g, replyFormLength);
    $(uniqueData).appendTo($targetEl).slideDown(400, 'linear', () => {

      // focus reply field
      $targetEl.find('textarea').trigger('focus');
    });
  });
}

// reply form validation
function replyFormValidation() {
  $('.single-post .comments-area .reply-box').each(function () {
    $(this).on('keyup keydown change', 'textarea', (e) => {
      const $reply = $(e.currentTarget);
      const $submitBtn = $reply.parents('form').find('.submit-btn');

      $reply.val() ? $submitBtn.removeAttr('disabled') : $submitBtn.attr('disabled', 'disabled');
    });
  });
}

// send new reply
function sendReply(e) {
  const $replyForm = $(e.currentTarget).parents('form');
  const url = $replyForm.data('post-url');
  const data = $replyForm.serializeArray().reduce((acc, {name, value}) => ({...acc, [name]: value}), {});

  $.ajax({
    method: 'POST',
    url,
    data,
    cache: false,
    beforeSend: () => { startLoading(); },
    success: (data) => {
      // reset the reply field
      $replyForm.trigger('reset');

      // disabled the submit button
      $replyForm.find('.submit-btn').attr('disabled', 'disabled');

      console.log(data);
    },
    error: (xhr, status, err) => {},
    complete: () => { endLoading(); }
  });
}

// get saved user data from previous comment
function getUserDataFromPrevComment(form) {
  const userCommentData = localStorage.getItem('azadUserCommentData');
  if (userCommentData) {
    const data = JSON.parse(userCommentData);

    form.find('input[name="name"]').val(data.name);
    form.find('input[name="email"]').val(data.email);
  }
}

// comment form validation
function commentFormValidation(form) {

  // comment form
  const $commentForm = form;

  // form controls
  const $formInputs     = $('.single-post .leave-comment-area .comment-form :input');
  const $comment        = $commentForm.find('textarea');
  const $name           = $commentForm.find('input[name="name"]');
  const $email          = $commentForm.find('input[name="email"]');
  const $phone          = $commentForm.find('input[name="phone"]');
  const $website        = $commentForm.find('input[name="website"]');
  const $submitBtn      = $commentForm.find('.submit-btn');

  // form validation status
  let isValid = {
    comment: false,
    name: $name.val() ? true : false,
    email: $email.val() ? true : false,
    phone: true,
    website: true,
    saveMyData: true
  };

  // comment validation
  $comment.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      minLength: true
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'commentRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#commentRequired');
    }

    // minlength validation
    if ($this.val().length > 0 && $this.val().length < $this.attr('minlength')) {
      errors.minLength = true;
      setNotify({
        id: 'commentMinLength',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .minLength').val()
      });

    } else {
      errors.minLength = false;
      dismissNotify('#commentMinLength');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.comment = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.comment = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // name validation
  $name.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      minLength: true
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'nameRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#nameRequired');
    }

    // minlength validation
    if ($this.val().length > 0 && $this.val().length < $this.attr('minlength')) {
      errors.minLength = true;
      setNotify({
        id: 'nameMinLength',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .minLength').val()
      });

    } else {
      errors.minLength = false;
      dismissNotify('#nameMinLength');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.name = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.name = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // email validation
  $email.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      invalid: true
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'emailRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#emailRequired');
    }

    // email validation
    if ($this.val().length > 0 && !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test($this.val())) {
      errors.invalid = true;
      setNotify({
        id: 'emailInvalid',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .invalid').val()
      });

    } else {
      errors.invalid = false;
      dismissNotify('#emailInvalid');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.email = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.email = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // phone validation
  $phone.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = { invalid: true };

    // phone validation
    if ($this.val().length > 0 && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test($this.val())) {
      errors.invalid = true;
      setNotify({
        id: 'phoneInvalid',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .invalid').val()
      });

    } else {
      errors.invalid = false;
      dismissNotify('#phoneInvalid');
    }

    // make the direction ltr on typing in rtl page
    if ($html.attr('dir') === 'rtl' && $this.val() !== '') {
      $this.addClass('ltr-dir');
    } else {
      $this.removeClass('ltr-dir');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.phone = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.phone = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // website validation
  $website.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = { invalid: true };

    // website validation
    const regex = new RegExp('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?');
    if ($this.val().length > 0 && !$this.val().match(regex)) {
      errors.invalid = true;
      setNotify({
        id: 'websiteInvalid',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .invalid').val()
      });

    } else {
      errors.invalid = false;
      dismissNotify('#websiteInvalid');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.website = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.website = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // on value changes
  $formInputs.on('keyup change', () => {
    // toggle invalid errors
    if (Object.keys(isValid).every(control => isValid[control] === true)) {
      $submitBtn.removeAttr('disabled');
    } else {
      $submitBtn.attr('disabled', 'disabled');
    }
  });
}

// send new comment
function sendComment(e) {
  const $commentForm = $(e.currentTarget).parents('form');
  const url = $commentForm.data('post-url');
  const data = $commentForm.serializeArray().reduce((acc, {name, value}) => ({...acc, [name]: value}), {});

  $.ajax({
    method: 'POST',
    url,
    data,
    cache: false,
    beforeSend: () => { startLoading(); },
    success: (data) => {
      // reset the form after submission
      $commentForm.trigger('reset');

      // remove valid classes
      $commentForm.find(':input').removeClass('valid');

      // disabled the submit button
      $commentForm.find('.submit-btn').attr('disabled', 'disabled');

      console.log(data);
    },
    error: (xhr, status, err) => {},
    complete: () => { endLoading(); }
  });
}

// save user data for next comment
function saveUserDataForNextComment(form) {
  if (form.find('input[name="saveMyData"]').is(':checked')) {
    localStorage.setItem('azadUserCommentData', JSON.stringify({
      name: form.find('input[name="name"]').val(),
      email: form.find('input[name="email"]').val()
    }));
  }
}

// -------------------------------------
// contact us page functions
// -------------------------------------

// contact form validation
function contactFormValidation() {

  // contact form
  const $contactForm = $('.contact-page .contact-form form');

  // form validation status
  let isValid = {
    name: false,
    email: false,
    phone: true,
    message: false
  };

  // form controls
  const $formInputs     = $('.contact-page .contact-form form :input');
  const $name           = $contactForm.find('input[name="name"]');
  const $email          = $contactForm.find('input[name="email"]');
  const $phone          = $contactForm.find('input[name="phone"]');
  const $message        = $contactForm.find('textarea');
  const $submitBtn      = $contactForm.find('.submit-btn');

  // name validation
  $name.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      minLength: true
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'nameRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#nameRequired');
    }

    // minlength validation
    if ($this.val().length > 0 && $this.val().length < $this.attr('minlength')) {
      errors.minLength = true;
      setNotify({
        id: 'nameMinLength',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .minLength').val()
      });

    } else {
      errors.minLength = false;
      dismissNotify('#nameMinLength');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.name = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.name = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // email validation
  $email.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      invalid: true
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'emailRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#emailRequired');
    }

    // email validation
    if ($this.val().length > 0 && !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test($this.val())) {
      errors.invalid = true;
      setNotify({
        id: 'emailInvalid',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .invalid').val()
      });

    } else {
      errors.invalid = false;
      dismissNotify('#emailInvalid');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.email = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.email = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // phone validation
  $phone.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = { invalid: true };

    // phone validation
    if ($this.val().length > 0 && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test($this.val())) {
      errors.invalid = true;
      setNotify({
        id: 'phoneInvalid',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .invalid').val()
      });

    } else {
      errors.invalid = false;
      dismissNotify('#phoneInvalid');
    }

    // make the direction ltr on typing in rtl page
    if ($html.attr('dir') === 'rtl' && $this.val() !== '') {
      $this.addClass('ltr-dir');
    } else {
      $this.removeClass('ltr-dir');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.phone = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.phone = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // message validation
  $message.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      minLength: true
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'messageRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#messageRequired');
    }

    // minlength validation
    if ($this.val().length > 0 && $this.val().length < $this.attr('minlength')) {
      errors.minLength = true;
      setNotify({
        id: 'messageMinLength',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .minLength').val()
      });

    } else {
      errors.minLength = false;
      dismissNotify('#messageMinLength');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.message = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.message = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // on value changes
  $formInputs.on('keyup change', () => {
    // toggle invalid errors
    if (Object.keys(isValid).every(control => isValid[control] === true)) {
      $submitBtn.removeAttr('disabled');
    } else {
      $submitBtn.attr('disabled', 'disabled');
    }
  });
}

// send messages from contact form
function sendContactFormMessages() {
  const $contactForm = $contactPage.find('#contactForm');
  const url = $contactForm.attr('action');
  const data = $contactForm.serializeArray().reduce((acc, {name, value}) => ({...acc, [name]: value}), {});

  $.ajax({
    method: 'POST',
    url,
    data,
    cache: false,
    beforeSend: () => { startLoading(); },
    success: (data) => {
      if (data === 'success') {
        setNotify({
          class: 'success',
          msg: $contactForm.data('success-msg'),
          time: 5000
        });
        $contactForm.trigger('reset');

        // remove valid classes
        $contactForm.find(':input').removeClass('valid');

      } else if (data === 'error') {
        setNotify({
          class: 'danger',
          msg: $contactForm.data('err-msg'),
          time: 5000
        });
      }

      console.log(data);
    },
    error: (xhr, status, err) => {
      setNotify({
        class: 'danger',
        msg: $contactForm.data('err-msg'),
        time: 5000
      });
    },
    complete: () => { endLoading(); }
  });
}

// -------------------------------------
// get quote page functions
// -------------------------------------

// load shipments form
function loadShipmentsForm() {
  const $targetEl = $getQuotePage.find('.my-shipments-content');

  $.get($targetEl.data('content'), function (data) {
    const uniqueData = data.replace(/_autoUniqueId/g, shipmentsFormData.length);
    $(uniqueData).appendTo($targetEl).slideDown(600);

    // custom input select
    customInputSelect();

    // show containerSize & containerType fields if the transportMode is oceanFreight
    isOceanFreight();

    // show more fields if the shipment is hazardous
    isHazardous();
  });
}

// load confirmation section
function loadConfirmationSection() {
  const $targetEl = $getQuotePage;

  $.get($targetEl.data('confirmation'), function (data) {
    $targetEl.html('');
    window.scroll({ top: $targetEl.position().top - 300, behavior: 'smooth' });
    $(data).appendTo($targetEl).fadeIn(600);
  });
}

// go to next step
function goToNextStep(e) {
  const $this = $(e.currentTarget);
  const $shipmentsForm = $this.parents('.shipments-form');
  const currentStep = +$shipmentsForm.attr('data-current-step');
  const stepsLength = +$shipmentsForm.attr('data-steps-length');

  if (currentStep < stepsLength) {
    $shipmentsForm.attr('data-current-step', currentStep + 1);
    $('.step-progress .step').eq(currentStep).trigger('click');

    // focus the first input for keyboard users
    $shipmentsForm.children().eq(currentStep).trigger('focus');
  }
}

// go to prev step
function goToPrevStep(e) {
  const $this = $(e.currentTarget);
  const $shipmentsForm = $this.parents('.shipments-form');
  const currentStep = $shipmentsForm.attr('data-current-step');

  if (currentStep > 1) {
    $shipmentsForm.attr('data-current-step', currentStep - 1);
    $('.step-progress .step').eq(currentStep - 2).trigger('click');

    // focus the first input for keyboard users
    $shipmentsForm.children().eq(currentStep -2).trigger('focus');
  }
}

// go to specific step by steps-progress-bar
function goToStep(e, targetStep) {
  const $this = $(e.currentTarget);
  const $shipmentsForm = $this.parents('.step-progress').siblings('.shipments-form');

  $shipmentsForm.attr('data-current-step', +targetStep);

  // show request details
  showRequestDetails(e);
}

// show containerSize & containerType fields if the transportMode is oceanFreight
function isOceanFreight() {
  $getQuotePage.find('input[name="transportMode"]').on('change', function () {
    const $shipmentsForm = $(this).parents('.shipments-form');
    const thisShipmentsIndex = $shipmentsForm.index('.shipments-form');
    const $parent = $(this).parents('.group');
    const $targetEls = $parent.siblings('.containerSize, .containerType');

    if ($(this).val() === 'oceanFreight') {
      if (!$targetEls.length) {
        shipmentsFormData[thisShipmentsIndex].containerDetailsEls.insertAfter($parent).slideDown(300);
      }

    } else {

      $targetEls.slideUp(300, function () {
        shipmentsFormData[thisShipmentsIndex].containerDetailsEls = $targetEls.detach();
      });
    };
  });
}

// show more fields if the shipment is hazardous
function isHazardous() {
  // remove by default
  shipmentsFormData[shipmentsFormData.length -1].cargoClassPackingEls =
    $getQuotePage.find('.shipments-form').eq(shipmentsFormData.length -1).find('.cargoClassPacking').detach();

  // listen to changes
  $getQuotePage.find('input[name="isHazardous"]').on('change', function () {
    const $shipmentsForm = $(this).parents('.shipments-form');
    const thisShipmentsIndex = $shipmentsForm.index('.shipments-form');
    const $parent = $(this).parents('.group');
    const $targetEl = $parent.next('.cargoClassPacking');

    if ($(this).val() == 'true') {
      shipmentsFormData[thisShipmentsIndex].cargoClassPackingEls.insertAfter($parent).slideDown(300);

    } else {

      $targetEl.slideUp(300, function () {
        shipmentsFormData[thisShipmentsIndex].cargoClassPackingEls = $targetEl.detach();
      });
    }
  });
}

// delete this shipment or clear it if there is only one
function clearOrDelete(e) {
  const $shipmentsForm = $(e.currentTarget).parents('.shipments-form');
  const slideDur = 600;

  if ($('.shipments-form').length > 1) {
    $shipmentsForm.parent('.request-body').slideUp(slideDur, function () {
      // remove it's saved data
      shipmentsFormData.splice($shipmentsForm.index('.shipments-form'), 1);

      // remove it from the dom
      $(this).remove();
    });

  } else {
    $shipmentsForm.trigger('reset');
    $shipmentsForm.find('select').prop('selectedIndex', 0).trigger('change');
    $shipmentsForm.find('input[name="transportMode"]').eq(0).trigger('change');
    $shipmentsForm.find('input[name="isHazardous"]').eq(0).trigger('change');

    // reset it's saved data
    shipmentsFormData[$shipmentsForm.index('.shipments-form')].value = null;
  }

  setTimeout(() => {
    // we don't have a shipment so, disable userDetailsForm
    if (!shipmentsFormData.some(s => s.value)) {
      $userDetailsForm.addClass('disabled');
    }
  }, slideDur + 50);
}

// show request details
function showRequestDetails(e) {
  const $this = $(e.currentTarget);
  const $requestBody = $this.parents('.request-body');

  // mark the request incomplete
  $requestBody.addClass('incomplete-request').removeClass('completed-request');
  $requestBody.find('.step-progress').removeClass('completed');
}

// collect shipments form data
function collectShipmentsFormData(e, createNew = false) {

  const $this = $(e.currentTarget);
  const $requestBody = $this.parents('.request-body');
  const $shipmentsForm = $this.parents('.shipments-form');

  // form validation status
  let isValid = {
    loadingPort: false,
    dischargePort: false,
    weight: false,
    shipmentVolume: false
  };

  // form controls
  const $loadingPort    = $shipmentsForm.find('select[name="loadingPort"]');
  const $dischargePort  = $shipmentsForm.find('select[name="dischargePort"]');
  const $weight         = $shipmentsForm.find('input[name="weight"]');
  const $shipmentVolume = $shipmentsForm.find('select[name="shipmentVolume"]');

  // check validity of 'loadingPort' control
  if ($loadingPort.val() === '') {
    isValid.loadingPort = false;
    $loadingPort.removeClass('valid').addClass('invalid');
  } else {
    isValid.loadingPort = true;
    $loadingPort.removeClass('invalid').addClass('valid');
  }

  // check validity of 'dischargePort' control
  if ($dischargePort.val() === '') {
    isValid.dischargePort = false;
    $dischargePort.removeClass('valid').addClass('invalid');
  } else {
    isValid.dischargePort = true;
    $dischargePort.removeClass('invalid').addClass('valid');
  }

  // check validity of 'weight' control
  if ($weight.val() === '' || $weight.val() < 1) {
    isValid.weight = false;
    $weight.removeClass('valid').addClass('invalid');
  } else {
    isValid.weight = true;
    $weight.removeClass('invalid').addClass('valid');
  }

  // check validity of 'shipmentVolume' control
  if ($shipmentVolume.val() === '') {
    isValid.shipmentVolume = false;
    $shipmentVolume.removeClass('valid').addClass('invalid');
  } else {
    isValid.shipmentVolume = true;
    $shipmentVolume.removeClass('invalid').addClass('valid');
  }

  // show danger alert if there any error
  if (Object.keys(isValid).every(control => isValid[control] === true)) {
    dismissNotify('#shipmentsFormInvalid');
    shipmentsFormData[$shipmentsForm.index('.shipments-form')].value =
      $shipmentsForm.serializeArray().reduce((acc, {name, value}) => ({...acc, [name]: value}), {});

    if (createNew) {
      shipmentsFormData.push({ index: shipmentsFormData.length, value: null });

      // load new shipments form for another request
      loadShipmentsForm();
    }

    // mark the request as completed
    $requestBody.addClass('completed-request').removeClass('incomplete-request');
    $requestBody.find('.step-progress').addClass('completed');

    // now we have a shipment so, enable userDetailsForm
    $userDetailsForm.find(':input, select').attr('tabindex', 0);
    $userDetailsForm.removeClass('disabled');

  } else {
    setNotify({
      id: 'shipmentsFormInvalid',
      class: 'danger',
      msg: $shipmentsForm.find('.form-invalid-msg').val()
    });
  }
}

// user details form validation
function userDetailsFormValidation() {

  // user details form
  const $userDetailsForm = $('.get-quote-page #userDetailsForm');

  // form validation status
  let isValid = {
    name: false,
    companyName: false,
    email: false,
    phone: true,
    comments: true,
    termsAndConditions: false
  };

  // form controls
  const $formInputs           = $('.get-quote-page #userDetailsForm :input');
  const $name                 = $userDetailsForm.find('#name');
  const $companyName          = $userDetailsForm.find('#companyName');
  const $email                = $userDetailsForm.find('#email');
  const $phone                = $userDetailsForm.find('#phone');
  const $comments             = $userDetailsForm.find('#comments');
  const $termsAndConditions   = $userDetailsForm.find('#termsAndConditions');
  const $submitBtn            = $userDetailsForm.find('.submit-btn');

  // name validation
  $name.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      minLength: true
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'nameRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#nameRequired');
    }

    // minlength validation
    if ($this.val().length > 0 && $this.val().length < $this.attr('minlength')) {
      errors.minLength = true;
      setNotify({
        id: 'nameMinLength',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .minLength').val()
      });

    } else {
      errors.minLength = false;
      dismissNotify('#nameMinLength');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.name = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.name = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // companyName validation
  $companyName.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = { required: true };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'companyNameRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#companyNameRequired');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.companyName = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.companyName = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // email validation
  $email.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      invalid: true
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'emailRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#emailRequired');
    }

    // email validation
    if ($this.val().length > 0 && !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test($this.val())) {
      errors.invalid = true;
      setNotify({
        id: 'emailInvalid',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .invalid').val()
      });

    } else {
      errors.invalid = false;
      dismissNotify('#emailInvalid');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.email = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.email = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // phone validation
  $phone.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = { invalid: true };

    // phone validation
    if ($this.val().length > 0 && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test($this.val())) {
      errors.invalid = true;
      setNotify({
        id: 'phoneInvalid',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .invalid').val()
      });

    } else {
      errors.invalid = false;
      dismissNotify('#phoneInvalid');
    }

    // make the direction ltr on typing in rtl page
    if ($html.attr('dir') === 'rtl' && $this.val() !== '') {
      $this.addClass('ltr-dir');
    } else {
      $this.removeClass('ltr-dir');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.phone = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.phone = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // termsAndConditions validation
  $termsAndConditions.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = { required: true };

    // required validation
    if (!$this.is(':checked')) {
      errors.required = true;
      setNotify({
        id: 'termsAndConditionsRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#termsAndConditionsRequired');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.termsAndConditions = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.termsAndConditions = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // on value changes
  $formInputs.on('keyup change', () => {
    // toggle invalid errors
    if (Object.keys(isValid).every(control => isValid[control] === true)) {
      $submitBtn.removeAttr('disabled');
    } else {
      $submitBtn.attr('disabled', 'disabled');
    }
  });
}

// send shipments data and user details
function sendShipmentsAndUserDetails() {
  const url = $userDetailsForm.data('post-url');
  const formsData = {
    seqNo: Date.now(),
    shipments: shipmentsFormData.reduce((result, s) => [...result, ...s.value ? [s.value] : []], []),
    userDetails: $userDetailsForm.serializeArray().reduce((acc, {name, value}) => ({...acc, [name]: value}), {})
  };

  $.ajax({
    method: 'POST',
    url,
    data: formsData,
    cache: false,
    beforeSend: () => { startLoading(); },
    success: (data) => {
      // load confirmation section
      loadConfirmationSection();
      console.log(data);
    },
    error: (xhr, status, err) => {
      setNotify({
        class: 'danger',
        msg: $getQuotePage.data('err-msg'),
        time: 5000
      });
    },
    complete: () => { endLoading(); }
  });
}

// -------------------------------------
// profile page functions
// -------------------------------------

// add new social network
function addNewSocialNetwork(e) {
  const $this = $(e.currentTarget).parent('.add-new');
  const $socialNetworks = $this.parents('.social-networks-group');
  const networksLength = $socialNetworks.children('.network').length;

  const $network = $(`
  <div class="network two-fields" style="display: none;">
    <div class="group">
      <label for="network-name${networksLength}">
        ${($html.attr('dir') === 'ltr') ? 'Network Name' : 'اسم الشبكة'}
      </label>
      <div class="control">
        <input id="network-name${networksLength}"
          type="text"
          name="networkName${networksLength}"
          placeholder="${($html.attr('dir') === 'ltr') ? 'e.g. Facebook' : 'مثل: فيسبوك'}"
          required>
      </div>
    </div>
    <div class="group">
      <label for="network-link${networksLength}">
        ${($html.attr('dir') === 'ltr') ? 'Network Link' : 'رابط الشبكة'}
      </label>
      <div class="control">
        <input id="network-link${networksLength}" class="ltr-dir"
          type="url"
          inputmode="url"
          name="networkLink${networksLength}"
          placeholder="#"
          required>
      </div>
    </div>
    <div class="remove">
      <button type="button"
        title="${($html.attr('dir') === 'ltr') ? 'Remove' : 'إزالة'}"
        onclick="removeSocialNetwork(event)">
      </button>
    </div>
  </div>
  `);

  $network.insertBefore($this).slideDown(400);
}

// remove social network
function removeSocialNetwork(e) {
  const $this = $(e.currentTarget).parent('.remove');
  const $network = $this.parent('.network');
  const networkIndex = $profilePage.find('.network').index($network);

  $profilePage.find('.network').eq(networkIndex).addClass('bg-danger').slideUp(400, function () {
    $(this).remove();
  });
}

// user info form validation
function userInfoFormValidation() {

  // user info form
  const $userInfoForm = $('#userInfoForm');

  // form validation status
  let isValid = {
    name: false,
    email: false,
    phone: true,
    address: true,
    networkName: false,
    networkLink: false
  };

  // form controls
  const $formInputs     = $('#userInfoForm :input');
  const $name           = $userInfoForm.find('input[name="name"]');
  const $email          = $userInfoForm.find('input[name="email"]');
  const $phone          = $userInfoForm.find('input[name="phone"]');
  const $networkName    = $('input[name*="networkName"]');
  const $networkLink    = $('input[name*="networkLink"]');
  const $submitBtn      = $userInfoForm.find('.submit-btn');

  // name validation
  $name.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      minLength: true
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'nameRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#nameRequired');
    }

    // minlength validation
    if ($this.val().length > 0 && $this.val().length < $this.attr('minlength')) {
      errors.minLength = true;
      setNotify({
        id: 'nameMinLength',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .minLength').val()
      });

    } else {
      errors.minLength = false;
      dismissNotify('#nameMinLength');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.name = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.name = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // email validation
  $email.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      invalid: true
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'emailRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#emailRequired');
    }

    // email validation
    if ($this.val().length > 0 && !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test($this.val())) {
      errors.invalid = true;
      setNotify({
        id: 'emailInvalid',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .invalid').val()
      });

    } else {
      errors.invalid = false;
      dismissNotify('#emailInvalid');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.email = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.email = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // phone validation
  $phone.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = { invalid: true };

    // phone validation
    if ($this.val().length > 0 && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test($this.val())) {
      errors.invalid = true;
      setNotify({
        id: 'phoneInvalid',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .invalid').val()
      });

    } else {
      errors.invalid = false;
      dismissNotify('#phoneInvalid');
    }

    // make the direction ltr on typing in rtl page
    if ($html.attr('dir') === 'rtl' && $this.val() !== '') {
      $this.addClass('ltr-dir');
    } else {
      $this.removeClass('ltr-dir');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.phone = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.phone = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // networkName validation
  $userInfoForm.on('keyup change', 'input[name*="networkName"]', (e) => {
    const $this = $(e.target);
    const errors = { required: true };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: `networkNameRequired${$networkName.index($this)}`,
        class: 'danger',
        msg: $this.parents('.social-networks-group').find('.social-networks-errors-msgs .requiredName').val()
      });

    } else {
      errors.required = false;
      dismissNotify(`#networkNameRequired${$networkName.index($this)}`);
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.networkName = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.networkName = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // networkLink validation
  $userInfoForm.on('keyup change', 'input[name*="networkLink"]', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      invalid: true
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: `networkLinkRequired${$networkLink.index($this)}`,
        class: 'danger',
        msg: $this.parents('.social-networks-group').find('.social-networks-errors-msgs .requiredLink').val()
      });

    } else {
      errors.required = false;
      dismissNotify(`#networkLinkRequired${$networkLink.index($this)}`);
    }

    // networkLink validation
    const regex = new RegExp('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?');
    if ($this.val().length > 0 && !$this.val().match(regex)) {
      errors.invalid = true;
      setNotify({
        id: `networkLinkInvalid${$networkLink.index($this)}`,
        class: 'danger',
        msg: $this.parents('.social-networks-group').find('.social-networks-errors-msgs .invalidLink').val()
      });

    } else {
      errors.invalid = false;
      dismissNotify(`#networkLinkInvalid${$networkLink.index($this)}`);
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.networkLink = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.networkLink = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // on value changes
  $formInputs.on('keyup change', () => {
    // if it's default networks make the networkName valid
    if (!$userInfoForm.find('input[name*="networkName"]').length) {
      isValid.networkName = true;
    }

    // toggle invalid errors
    if (Object.keys(isValid).every(control => isValid[control] === true)) {
      $submitBtn.removeAttr('disabled');
    } else {
      $submitBtn.attr('disabled', 'disabled');
    }
  });
}

// send user-info form data
function sendUserInfoFormData() {
  const url = 'https://reqres.in/api/users'; // replace url value it's just for demonstration
  const $userInfoForm = $profilePage.find('#userInfoForm');
  const data = $userInfoForm.serializeArray().reduce((acc, {name, value}) => ({...acc, [name]: value}), {});

  $.ajax({
    method: 'POST',
    url,
    data,
    cache: false,
    beforeSend: () => { startLoading(); },
    success: (data) => {
      setNotify({
        class: 'success',
        msg: $userInfoForm.data('success-msg'),
        time: 5000
      });
      // disable submit button again after finished
      $userInfoForm.find('.submit-btn').attr('disabled', 'disabled');
      console.log(data);
    },
    error: (xhr, status, err) => {
      setNotify({
        class: 'danger',
        msg: $userInfoForm.data('err-msg'),
        time: 5000
      });
    },
    complete: () => { endLoading(); }
  });
}

// -------------------------------------
// settings page functions
// -------------------------------------

// choose a profile picture by file uploader
function chooseProfilePictureByFileUploader() {
  $('.settings-page form input[name="uploadedProfilePicture"]').on('change', function () {
    const $avatarProfilePicture = $('.settings-page form input[name="avatarProfilePicture"]');

    if ($(this).prop('files').length) {
      // reset avatar profile picture
      $avatarProfilePicture.prop('checked', false).trigger('change');
  
      // show selected picture in sidebar for preview
      readUploadedFileURL(this, $('.settings-page .user-sidebar .user-avatar img'));
    }
  });
}

// select an avatar as a profile picture
function selectProfilePictureFromAvatars() {
  $('.settings-page form .radio-container.img input[type=radio]').on('change', function () {
    const $this = $(this);

    if ($this.is(':checked')) {
      const selectedImg = $this.val();
      const $uploadedProfilePicture = $('.settings-page form input[name="uploadedProfilePicture"]');

      // reset uploaded profile picture
      $uploadedProfilePicture.val('').trigger('change');

      // show selected picture in sidebar for preview
      $('.settings-page .user-sidebar .user-avatar img').attr('src', selectedImg);
    }
  });
}

// user settings form validation
function userSettingsFormValidation() {

  // user settings form
  const $userSettingsForm = $('.settings-page main form');

  // form validation status
  let isValid = {
    uploadedProfilePicture: true,
    avatarProfilePicture: true,
    oldPassword: true,
    newPassword: true,
    retypePassword: true
  };

  // form controls
  const $formInputs               = $('.settings-page main form :input');
  const $uploadedProfilePicture   = $userSettingsForm.find('input[name="uploadedProfilePicture"]');
  const $avatarProfilePicture     = $userSettingsForm.find('input[name="avatarProfilePicture"]');
  const $oldPassword              = $userSettingsForm.find('input[name="oldPassword"]');
  const $newPassword              = $userSettingsForm.find('input[name="newPassword"]');
  const $retypePassword           = $userSettingsForm.find('input[name="retypePassword"]');
  const $submitBtn                = $userSettingsForm.find('.submit-btn');

  // old password validation
  $oldPassword.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      minLength: true,
      hasSpaces: false
    };

    // required validation
    if (
      $this.val() === '' &&
      (isValid.newPassword === true && $newPassword.val()) &&
      (isValid.retypePassword === true && $retypePassword.val())
      ) {

      errors.required = true;
      setNotify({
        id: 'oldPasswordRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#oldPasswordRequired');
    }

    // minlength validation
    if ($this.val().length > 0 && $this.val().length < $this.attr('minlength')) {
      errors.minLength = true;
      setNotify({
        id: 'oldPasswordMinLength',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .minLength').val()
      });

    } else {
      errors.minLength = false;
      dismissNotify('#oldPasswordMinLength');
    }

    // cannot contain spaces validation
    if ($this.val().indexOf(' ') > -1) {
      errors.hasSpaces = true;
      setNotify({
        id: 'oldPasswordHasSpaces',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .hasSpaces').val()
      });

    } else {
      errors.hasSpaces = false;
      dismissNotify('#oldPasswordHasSpaces');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.oldPassword = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.oldPassword = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // new password validation
  $newPassword.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      minLength: true,
      hasSpaces: false,
      equalsOldPassword: false
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'newPasswordRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });
      dismissNotify('#retypePasswordRequired');

    } else {
      errors.required = false;
      dismissNotify('#newPasswordRequired');
      dismissNotify('#retypePasswordNewPasswordFirst');
    }

    // minlength validation
    if ($this.val().length > 0 && $this.val().length < $this.attr('minlength')) {
      errors.minLength = true;
      setNotify({
        id: 'newPasswordMinLength',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .minLength').val()
      });

    } else {
      errors.minLength = false;
      dismissNotify('#newPasswordMinLength');
    }

    // cannot contain spaces validation
    if ($this.val().indexOf(' ') > -1) {
      errors.hasSpaces = true;
      setNotify({
        id: 'newPasswordHasSpaces',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .hasSpaces').val()
      });

    } else {
      errors.hasSpaces = false;
      dismissNotify('#newPasswordHasSpaces');
    }

    // new password equals old password validation
    if (
      isValid.oldPassword === true && $this.val() !== '' &&
      $this.val() === $oldPassword.val()
      ) {

      errors.equalsOldPassword = true;
      setNotify({
        id: 'newPasswordEqualsOldPassword',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .equalsOldPassword').val()
      });

    } else if (isValid.oldPassword === true && $this.val() !== $oldPassword.val()) {
      errors.equalsOldPassword = false;
      dismissNotify('#newPasswordEqualsOldPassword');

    } else if (isValid.oldPassword === false && $this.val() === '') {
      errors.equalsOldPassword = false;
      dismissNotify('#newPasswordEqualsOldPassword');

    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.newPassword = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.newPassword = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // retype password validation
  $retypePassword.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      notEqual: true
    };

    // required validation
    if ($this.val() === '' && isValid.newPassword === true && $newPassword.val()) {
      errors.required = true;
      errors.notEqual = false;
      setNotify({
        id: 'retypePasswordRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });
      dismissNotify('#retypePasswordNotEqual');

    } else if ($this.val() !== '' && !$newPassword.val()) {

      errors.required = false;
      setNotify({
        id: 'retypePasswordNewPasswordFirst',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .newPasswordFirst').val()
      });
      dismissNotify('#retypePasswordRequired');
      
    } else if ($this.val() !== '') {

      errors.required = false;
      dismissNotify('#retypePasswordRequired');
    }

    // passwords match validation
    if (isValid.newPassword === true && $newPassword.val() && errors.required === false && $this.val() !== $newPassword.val()) {
      errors.notEqual = true;
      setNotify({
        id: 'retypePasswordNotEqual',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .notEqual').val()
      });

    } else if (isValid.newPassword === true && $newPassword.val() && $this.val() === $newPassword.val()) {
      errors.notEqual = false;
      dismissNotify('#retypePasswordNotEqual');

    } else if (isValid.newPassword === false && !$this.val()) {
      errors.notEqual = false;
      dismissNotify('#retypePasswordNotEqual');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.retypePassword = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.retypePassword = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // on value changes
  $formInputs.on('keyup change', () => {
    // toggle invalid errors
    if (
      // uploadedProfilePicture valid & passwords have valid value or doesn't have value
      (($uploadedProfilePicture.val() !== '' && isValid.uploadedProfilePicture === true) &&
      (($oldPassword.val() !== '' && isValid.oldPassword === true) &&
      ($newPassword.val() !== '' && isValid.newPassword === true) &&
      ($retypePassword.val() !== '' && isValid.retypePassword === true)) ||
      ($oldPassword.val() === '' && $newPassword.val() === '' && $retypePassword.val() === '')) ||

      // avatarProfilePicture valid & passwords have valid value or doesn't have value
      (($avatarProfilePicture.is(':checked') && isValid.avatarProfilePicture === true) &&
      (($oldPassword.val() !== '' && isValid.oldPassword === true) &&
      ($newPassword.val() !== '' && isValid.newPassword === true) &&
      ($retypePassword.val() !== '' && isValid.retypePassword === true)) ||
      ($oldPassword.val() === '' && $newPassword.val() === '' && $retypePassword.val() === '')) ||

      // all passwords fields have valid value
      (($oldPassword.val() !== '' && isValid.oldPassword === true) &&
      ($newPassword.val() !== '' && isValid.newPassword === true) &&
      ($retypePassword.val() !== '' && isValid.retypePassword === true))
      ) {
      $submitBtn.removeAttr('disabled');
    } else {
      $submitBtn.attr('disabled', 'disabled');
    }
  });
}

// send user-settings form data
function sendUserSettingsFormData() {
  const url = 'https://reqres.in/api/users'; // replace url value it's just for demonstration
  const $userSettingsForm = $settingsPage.find('#userSettingsForm');
  const data = $userSettingsForm.serializeArray().reduce((acc, {name, value}) => ({...acc, [name]: value}), {});

  $.ajax({
    method: 'POST',
    url,
    data,
    cache: false,
    beforeSend: () => { startLoading(); },
    success: (data) => {
      setNotify({
        class: 'success',
        msg: $userSettingsForm.data('success-msg'),
        time: 5000
      });
      // disable submit button again after finished
      $userSettingsForm.find('.submit-btn').attr('disabled', 'disabled');
      console.log(data);
    },
    error: (xhr, status, err) => {
      setNotify({
        class: 'danger',
        msg: $userSettingsForm.data('err-msg'),
        time: 5000
      });
    },
    complete: () => { endLoading(); }
  });
}

// -------------------------------------
// sign in & up page functions
// -------------------------------------

// show sign-in-up page content based on url
function showContentBasedOnUrl() {

  // get page type from window url
  const pageType = location.hash.substr(1);

  if (pageType === 'in') {

    $pageTitle.html($pageTitle.attr('data-title-sign-in'));
    $signPage.find('.sign-page-content').removeClass('sign-up').addClass('sign-in');
    
  } else if (pageType === 'up') {
    
    $pageTitle.html($pageTitle.attr('data-title-sign-up'));
    $signPage.find('.sign-page-content').removeClass('sign-in').addClass('sign-up');
  }
}

// change sign page type (sign-in or sign-out) onclick
function changePageType(e) {
  const $this = $(e.currentTarget);

  location.href = $this.attr('href');
  window.scroll({ top: 0, behavior: 'smooth' });

  setTimeout(() => showContentBasedOnUrl());
}

// sign-in form validation
function signInFormValidation() {

  // sign-in form
  const $signInForm = $('.sign-page .sign-in-form');

  // form validation status
  let isValid = {
    email: false,
    password: false
  };

  // form controls
  const $formInputs     = $('.sign-page .sign-in-form :input');
  const $email          = $signInForm.find('input[name="email"]');
  const $password       = $signInForm.find('input[name="password"]');
  const $submitBtn      = $signInForm.find('.submit-btn');

  // email validation
  $email.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      invalid: true
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'emailRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#emailRequired');
    }

    // email validation
    if ($this.val().length > 0 && !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test($this.val())) {
      errors.invalid = true;
      setNotify({
        id: 'emailInvalid',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .invalid').val()
      });

    } else {
      errors.invalid = false;
      dismissNotify('#emailInvalid');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.email = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.email = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // password validation
  $password.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      minLength: true,
      hasSpaces: false
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'passwordRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#passwordRequired');
    }

    // minlength validation
    if ($this.val().length > 0 && $this.val().length < $this.attr('minlength')) {
      errors.minLength = true;
      setNotify({
        id: 'passwordMinLength',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .minLength').val()
      });

    } else {
      errors.minLength = false;
      dismissNotify('#passwordMinLength');
    }

    // cannot contain spaces validation
    if ($this.val().indexOf(' ') > -1) {
      errors.hasSpaces = true;
      setNotify({
        id: 'passwordHasSpaces',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .hasSpaces').val()
      });

    } else {
      errors.hasSpaces = false;
      dismissNotify('#passwordHasSpaces');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.password = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.password = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // on value changes
  $formInputs.on('keyup change', () => {
    // toggle invalid errors
    if (Object.keys(isValid).every(control => isValid[control] === true)) {
      $submitBtn.removeAttr('disabled');
    } else {
      $submitBtn.attr('disabled', 'disabled');
    }
  });
}

// send sign-in form data
function sendSignInFormData() {
  const url = 'https://reqres.in/api/users'; // replace url value it's just for demonstration
  const $signInForm = $signPage.find('#signInForm');
  const data = $signInForm.serializeArray().reduce((acc, {name, value}) => ({...acc, [name]: value}), {});

  $.ajax({
    method: 'POST',
    url,
    data,
    cache: false,
    beforeSend: () => { startLoading(); },
    success: (data) => {
      setNotify({
        class: 'success',
        msg: $signInForm.data('success-msg'),
        time: 2000
      });
      // reset the form
      $signInForm.trigger('reset');

      // remove valid classes
      $signInForm.find(':input').removeClass('valid');

      // go to homepage
      setTimeout(() => {
        location.href='../index.html';
      }, 2000);

      console.log(data);
    },
    error: (xhr, status, err) => {
      setNotify({
        class: 'danger',
        msg: $signInForm.data('err-msg'),
        time: 5000
      });
    },
    complete: () => { endLoading(); }
  });
}

// sign-up form validation
function signUpFormValidation() {

  // sign-up form
  const $signUpForm = $('.sign-page .sign-up-form');

  // form validation status
  let isValid = {
    email: false,
    password: false,
    confirmPassword: false,
    termsAndConditions: false
  };

  // form controls
  const $formInputs          = $('.sign-page .sign-up-form :input');
  const $email               = $signUpForm.find('input[name="email"]');
  const $password            = $signUpForm.find('input[name="password"]');
  const $confirmPassword     = $signUpForm.find('input[name="confirmPassword"]');
  const $termsAndConditions  = $signUpForm.find('input[name="termsAndConditions"]');
  const $submitBtn           = $signUpForm.find('.submit-btn');

  // email validation
  $email.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      invalid: true
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'emailRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#emailRequired');
    }

    // email validation
    if ($this.val().length > 0 && !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test($this.val())) {
      errors.invalid = true;
      setNotify({
        id: 'emailInvalid',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .invalid').val()
      });

    } else {
      errors.invalid = false;
      dismissNotify('#emailInvalid');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.email = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.email = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // password validation
  $password.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      minLength: true,
      hasSpaces: false
    };

    // required validation
    if ($this.val() === '') {
      errors.required = true;
      setNotify({
        id: 'passwordRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });

    } else {
      errors.required = false;
      dismissNotify('#passwordRequired');
      dismissNotify('#confirmPasswordPasswordFirst');
    }

    // minlength validation
    if ($this.val().length > 0 && $this.val().length < $this.attr('minlength')) {
      errors.minLength = true;
      setNotify({
        id: 'passwordMinLength',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .minLength').val()
      });

    } else {
      errors.minLength = false;
      dismissNotify('#passwordMinLength');
    }

    // cannot contain spaces validation
    if ($this.val().indexOf(' ') > -1) {
      errors.hasSpaces = true;
      setNotify({
        id: 'passwordHasSpaces',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .hasSpaces').val()
      });

    } else {
      errors.hasSpaces = false;
      dismissNotify('#passwordHasSpaces');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.password = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.password = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // confirm password validation
  $confirmPassword.on('keyup change', (e) => {
    const $this = $(e.target);
    const errors = {
      required: true,
      notEqual: true
    };

    // required validation
    if ($this.val() === '' && isValid.password === true) {
      errors.required = true;
      setNotify({
        id: 'confirmPasswordRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });
      dismissNotify('#confirmPasswordNotEqual');

    } else if ($this.val() !== '' && isValid.password === false) {

      errors.required = false;
      setNotify({
        id: 'confirmPasswordPasswordFirst',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .passwordFirst').val()
      });
      dismissNotify('#confirmPasswordRequired');
      
    } else if ($this.val() !== '') {

      errors.required = false;
      dismissNotify('#confirmPasswordRequired');
    }

    // passwords match validation
    if (isValid.password === true && errors.required === false && $this.val() !== $password.val()) {
      errors.notEqual = true;
      setNotify({
        id: 'confirmPasswordNotEqual',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .notEqual').val()
      });

    } else if (isValid.password === true && $password.val() && $this.val() === $password.val()) {
      errors.notEqual = false;
      dismissNotify('#confirmPasswordNotEqual');

    } else if (isValid.password === false && !$this.val()) {
      errors.notEqual = false;
      dismissNotify('#confirmPasswordNotEqual');
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.confirmPassword = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.confirmPassword = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // terms & conditions validation
  $termsAndConditions.on('change', (e) => {
    const $this = $(e.target);
    const errors = { required: true };

    // required validation
    if ($this.is(':checked')) {
      errors.required = false;
      dismissNotify('#termsAndConditionsRequired');

    } else {
      errors.required = true;
      setNotify({
        id: 'termsAndConditionsRequired',
        class: 'danger',
        msg: $this.parents('.control').find('.errors-msgs .required').val()
      });
    }

    // toggle invalid errors & style classes
    if (Object.keys(errors).some(err => errors[err] === true)) {
      isValid.termsAndConditions = false;
      $this.removeClass('valid').addClass('invalid');
    } else {
      isValid.termsAndConditions = true;
      $this.removeClass('invalid').addClass('valid');
    }
  });

  // on value changes
  $formInputs.on('keyup change', () => {
    // toggle invalid errors
    if (Object.keys(isValid).every(control => isValid[control] === true)) {
      $submitBtn.removeAttr('disabled');
    } else {
      $submitBtn.attr('disabled', 'disabled');
    }
  });
}

// send sign-up form data
function sendSignUpFormData() {
  const url = 'https://reqres.in/api/users'; // replace url value it's just for demonstration
  const $signUpForm = $signPage.find('#signUpForm');
  const data = $signUpForm.serializeArray().reduce((acc, {name, value}) => ({...acc, [name]: value}), {});

  $.ajax({
    method: 'POST',
    url,
    data,
    cache: false,
    beforeSend: () => { startLoading(); },
    success: (data) => {
      setNotify({
        class: 'success',
        msg: $signUpForm.data('success-msg'),
        time: 2000
      });
      // reset the form
      $signUpForm.trigger('reset');

      // remove valid classes
      $signUpForm.find(':input').removeClass('valid');

      // go to homepage
      setTimeout(() => {
        location.href='../index.html';
      }, 2000);

      console.log(data);
    },
    error: (xhr, status, err) => {
      setNotify({
        class: 'danger',
        msg: $signUpForm.data('err-msg'),
        time: 5000
      });
    },
    complete: () => { endLoading(); }
  });
}

// sign in & up with popup
function signWithPopup(providerName) {

  // Sign with google
  if (providerName === 'googleSignIn') {

    console.log('Sign with google');

    // Sign with facebook
  } else if (providerName === 'fbSignIn') {

    console.log('Sign with facebook');

    // Sign with twitter
  } else if (providerName === 'twSignIn') {

    console.log('Sign with twitter');

    // Sign with linkedin
  } else if (providerName === 'linkedinSignIn') {

    console.log('Sign with linkedin');
  }
}
