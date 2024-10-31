/*!
 * @preserve WPL Javascripts
 * @Copyright Realtyna Inc. Co 2015
 * @Author Steve M. | UI Department
 */

//region + Global variables
var _j = wplj = jQuery.noConflict();

// Global variables
var _rta_app_dirs = {js: 'js/', libs: 'libs/'},
    _rta_baseUrl = wpl_baseUrl,
    _rta_urlAssets = 'wp-content/plugins/' + wpl_baseName + '/assets/',
    _rta_urlJs = _rta_baseUrl + _rta_urlAssets + _rta_app_dirs.js,
    _rta_urlJsLibs = _rta_baseUrl + _rta_urlAssets + _rta_app_dirs.js + ((_rta_app_dirs.js == _rta_app_dirs.libs) ? '' : _rta_app_dirs.libs),
    _rta_frontViews = {},
    _rta_backViews = {};
//endregion

//region + Custom Javascript methods

// - Escape unwanted characters
function escapeRegExp(str) {
	
	if (typeof str === 'string' && str.length > 0) {		
	
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		
	}
	
	return '';
	
}
;
// - Trim String
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

// - To Camel Case
String.prototype.toCamel = function () {
    return this.replace(/(\-[a-z])/g, function ($1) {
        return $1.toUpperCase().replace('-', '');
    });
};

// - To Dashed from Camel Case
String.prototype.toDash = function () {
    return this.replace(/([A-Z])/g, function ($1) {
        return "-" + $1.toLowerCase();
    });
};

// - To Underscore from Camel Case
String.prototype.toUnderscore = function () {
    return this.replace(/([A-Z])/g, function ($1) {
        return "_" + $1.toLowerCase();
    });
};

// - Replace all string that match
String.prototype.WPLReplaceAll = function (find, replace) {
    return this.replace(new RegExp(escapeRegExp(find), 'g'), replace);
};

// + Date functions

// - Today
Date.prototype.today = function () {
    return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "/" + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "/" + this.getFullYear()
};

// - Now
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
};

//endregion

// + Add necessary CSS class to HTML for WPL only views.
function isWPL() {
    _j('html').attr('data-wpl-plugin', '');
}

//region + Custom jQuery Plugins
/**
 * Steve.M
 * Get inline style value
 * Usage:
 wplj("#someElem").inlineStyle("width");
 * @param {string} prop
 * @returns {string}
 */
wplj.fn.inlineStyle = function (prop) {
    var styles = this.attr("style"),
        value;
    styles && styles.split(";").forEach(function (e) {
        var style = e.split(":");
        if (wplj.trim(style[0]) === prop) {
            value = style[1];
        }
    });
    return value;
};

/**
 * jQuery.fn.sortElements
 * --------------
 * @param Function comparator:
 *   Exactly the same behaviour as [1,2,3].sort(comparator)
 *
 * @param Function getSortable
 *   A function that should return the element that is
 *   to be sorted. The comparator will run on the
 *   current collection, but you may want the actual
 *   resulting sort to occur on a parent or another
 *   associated element.
 *
 *   E.g. wplj('td').sortElements(comparator, function(){
     *      return this.parentNode;
     *   })
 *
 *   The <td>'s parent (<tr>) will be sorted instead
 *   of the <td> itself.
 */
wplj.fn.sortElements = (function () {

    var sort = [].sort;

    return function (comparator, getSortable) {

        getSortable = getSortable || function () {
            return this;
        };

        var placements = this.map(function () {

            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,
            // Since the element itself will change position, we have
            // to have some way of storing its original position in
            // the DOM. The easiest way is to have a 'flag' node:
                nextSibling = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                );

            return function () {

                if (parentNode === this) {
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                    );
                }

                // Insert before flag:
                parentNode.insertBefore(this, nextSibling);
                // Remove flag:
                parentNode.removeChild(nextSibling);

            };

        });

        return sort.call(this, comparator).each(function (i) {
            placements[i].call(getSortable.call(this));
        });

    };

})();

/**
 * Steve.M
 * Remove all "Space" and "Break" character from string
 * @returns {jQuery Object}
 */
wplj.fn.cleanWhitespace = function () {
    textNodes = this.contents().filter(
        function () {
            return (this.nodeType == 3 && !/\S/.test(this.nodeValue));
        })
        .remove();
    return this;
};

/**
 * Steve.M
 * Get full height - cross-browser
 * @returns {Number}
 */
wplj.fn.getDocHeight = function () {
    var D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
}
/**
 * Steve.M
 * Is element between specific elements
 * Usage:
 if(wplj("#element").isBetween("#prev","#next"));
 wplj("#element").remove();
 * @param {string} prev
 * @param {string} next
 * @returns {Boolean}
 */
wplj.fn.isBetween = function (prev, next) {
    if (this.prevAll(prev).length === 0)
        return false;
    if (this.nextAll(next).length === 0)
        return false;
    return true;
}

/**
 * Steve.M
 * Make all selected elements equal size
 * Usage:
 wplj('div.bests').equalHeight();
 */
wplj.fn.equalHeight = function (callBack, removeHeightAttr) {
    var currentTallest = 0,
        currentRowStart = 0,
        rowDivs = new Array(),
        wpljel,
        topPosition = 0,
        elCount = wplj(this).length,
        elIndex = 0,
        removeHeightAttr = removeHeightAttr || false;

    if (removeHeightAttr)
        wplj(this).css('height', '');

    wplj(this).each(function () {


        wpljel = wplj(this);
        topPostion = wpljel.position().top;

        if (currentRowStart != topPostion) {

            // we just came to a new row.  Set all the heights on the completed row
            for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                rowDivs[currentDiv].height(currentTallest);
            }

            // set the variables for the new row
            rowDivs.length = 0; // empty the array
            currentRowStart = topPostion;
            currentTallest = wpljel.height();
            rowDivs.push(wpljel);

        } else {
            // another div on the current row.  Add it to the list and check if it's taller
            rowDivs.push(wpljel);
            currentTallest = Math.max(currentTallest, wpljel.height());
        }
        // do the last row
        for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
            rowDivs[currentDiv].height(currentTallest);
        }

        elIndex++;
        if (elIndex === elCount) {
            if (typeof(callBack) !== undefined && wplj.isFunction(callBack)) {
                callBack.call();
            }
        }
    });
};

/**
 * Steve.M
 * Apply jQuery sortable plugin
 * @param {object} options
 * @param {function} update
 * @returns {undefined}
 */
wplj.fn.wplSortable = function (options, dataString, postUrl, messages, update) {
    var _options = options || {},
        _dataString = dataString || '',
        _updateFunc = wplj.noop();
    if (!wplj.isFunction(update))
        _updateFunc = function (e, ui) {
            var stringDiv = "";
            wplj(this).children("tr").each(function (i) {

                var tr = wplj(this);
                var tr_id = tr.attr("id").split("_");
                if (i != 0) {
                    stringDiv += ",";
                }
                stringDiv += tr_id[2];
            });

            wplj.ajax(
                {
                    type: "POST",
                    url: postUrl,
                    data: _dataString + stringDiv,
                    success: function () {
                    },
                    error: function () {
                        wpl_show_messages(messages.error, '.wpl_data_structure_list .wpl_show_message', 'wpl_red_msg');
                    }
                });
        };
    _options.update = _updateFunc;
    _options = wplj.extend(_options, rta.config.sortable);
    wplj(this).sortable(_options);
};
//endregion

//region + RTA framework codes
// TODO Have to remove and use Realtyna Framework
(function ($, window, document, undefined) {

    window.opt2JSON = function (str) {
        var strArray = str.split('|');
        var myObject = {};

        for(var i= 0; i < strArray.length; ++i){
            var _sp = strArray[i].split(':');
            myObject[_sp[0]] = $.isNumeric(_sp[1])? parseInt(_sp[1]): _sp[1];
        }

        return myObject;
    }

    window.rta = {
        version: '0.3.5',
        name: 'RTA',
        internal: {},
        registers: {},
        config: {},
        util: {},
        views: {},
        models: {},
        runTime: {},
        template: {}
    };

    // Config
    rta.config = {
        debug: false,
        backend: {
            pageLeftTabs: '.side-tabs-wp',
            pageLeftTabsTrigger: 'click'
        },
        //JSes: {
            //// Please insure that your file name is widthout .js extention
            //chosen: 'chosen/public/chosen.jquery.min',
            //jqueryBridget: 'jquery-bridget/jquery.bridget',
            //mCustomScrollbar: 'malihu-custom-scrollbar-plugin-bower/jquery.mCustomScrollbar.concat.min',
            //transit: 'transit/jquery.transit.min',
            //hoverintent: 'hoverintent/jquery.hoverIntent',
            //fileUpload: 'blueimp-file-upload/js/jquery.fileupload',
            //fileUploadProc: 'blueimp-file-upload/js/jquery.fileupload-process',
            //fileUploadValid: 'blueimp-file-upload/js/jquery.fileupload-validate',
            //ajaxFileUpload: 'ajaxfileupload.min'
        //},
        defaultSelectors: {
            checkboxWrap: '.access-checkbox-wp',
            slideContainerPrefix: '#wpl_slide_container_id',
            slideLabelPrefix: '#wpl_slide_label_id',
            // Fancy selectors
            fancyWrapper: '.fancybox-wrap',
            fancyInner: '.fancybox-inner',
            fancyContent: '.fanc-content'

        },
        templates: {
            delayStart: false,
            delayTime: 500,
            leftHolder: '${',
            rightHolder: '}',
            tag: 'div',
            idAttr: 'data-id',
            fileName: 'js_inline.html'
        },
        require: {
            //By default load any module IDs from js/lib
            baseUrl: _rta_urlJs + 'libs/bower_components/'
            /*,
             map: {
             // '*' means all modules will get 'jquery-private'
             // for their 'jquery' dependency.
             '*': {'jquery': 'jquery-private', '$': 'jquery-private'},
             // 'jquery-private' wants the real jQuery module
             // though. If this line was not here, there would
             // be an unresolvable cyclic dependency.
             'jquery-private': {'jquery': 'jquery'}
             }*/
        },
        chosen: {
            disable_search_threshold: 10
        },
        sortable: {
            handle: '.move-element',
            cursor: "move"
        },
        fancySpecificOptions: {},
        fancybox: {
            padding: 0,
            margin: 0,
            width: 800,
            height: 600,
            minWidth: 200,
            minHeight: 100,
            maxWidth: 9999,
            maxHeight: 9999,
            pixelRatio: 1, // Set to 2 for retina display support

            autoSize: false,
            autoHeight: false,
            autoWidth: false,
            autoResize: false,
            alwaysTop: false,
            fitToView: true,
            aspectRatio: false,
            topRatio: 0.5,
            leftRatio: 0.5,
            scrolling: 'no', // 'auto', 'yes' or 'no'
            wrapCSS: '',
            arrows: true,
            closeBtn: true,
            closeClick: false,
            nextClick: false,
            mouseWheel: true,
            autoPlay: false,
            playSpeed: 3000,
            preload: 3,
            modal: false,
            loop: true,
            ajax: {
                dataType: 'html',
                headers: {'X-fancyBox': true}
            },
            iframe: {
                scrolling: 'auto',
                preload: true
            },
            swf: {
                wmode: 'transparent',
                allowfullscreen: 'true',
                allowscriptaccess: 'always'
            },
            keys: {
                next: {
                    13: 'left', // enter
                    34: 'up', // page down
                    39: 'left', // right arrow
                    40: 'up'    // down arrow
                },
                prev: {
                    8: 'right', // backspace
                    33: 'down', // page up
                    37: 'right', // left arrow
                    38: 'down'    // up arrow
                },
                close: [27], // escape key
                play: [32], // space - start/stop slideshow
                toggle: [70]  // letter "f" - toggle fullscreen
            },
            direction: {
                next: 'left',
                prev: 'right'
            },
            scrollOutside: true,
            // Override some properties
            index: 0,
            type: null,
            href: null,
            content: null,
            title: null,
            // HTML templates
            tpl: {
                wrap: '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
                image: '<img class="fancybox-image" src="{href}" alt="" />',
                error: '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
                closeBtn: '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
                next: '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
                prev: '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
            },
            // Properties for each animation type
            // Opening fancyBox
            openEffect: 'none', // 'elastic', 'fade' or 'none'
            openSpeed: 500,
            openEasing: 'swing',
            openOpacity: false,
            openMethod: 'zoomIn',
            // Closing fancyBox
            closeEffect: 'elastic', // 'elastic', 'fade' or 'none'
            closeSpeed: 250,
            closeEasing: 'swing',
            closeOpacity: true,
            closeMethod: 'zoomOut',
            // Changing next gallery item
            nextEffect: 'elastic', // 'elastic', 'fade' or 'none'
            nextSpeed: 250,
            nextEasing: 'swing',
            nextMethod: 'changeIn',
            // Changing previous gallery item
            prevEffect: 'elastic', // 'elastic', 'fade' or 'none'
            prevSpeed: 250,
            prevEasing: 'swing',
            prevMethod: 'changeOut',
            // Enable default helpers
            helpers: {
                overlay: true,
                title: null
            },
            afterShowMore: {},
            manualResize: function (callBack) {

                var __callback = callBack || $.noop();

                $(rta.config.defaultSelectors.fancyWrapper).css({display: 'block', opacity: 0});

                setTimeout(function () {

                    var __currentHeight = $(rta.config.defaultSelectors.fancyInner).inlineStyle('height'),
                        __currentWidth = $(rta.config.defaultSelectors.fancyInner).inlineStyle('width');

                    // If box using automatic resize and not set yet do it manually
                    if (__currentHeight !== 'auto' || __currentWidth === rta.config.fancybox.minWidth + 'px') {

                        var __fancyContent = ($(rta.config.defaultSelectors.fancyContent).length > 1) ?
                                $(rta.config.defaultSelectors.fancyContent).eq($(rta.config.defaultSelectors.fancyContent).length - 1) : // If content load static get last copy as main content
                                $(rta.config.defaultSelectors.fancyContent),
                            __contentWidth = __fancyContent.outerWidth(),
                            __contentHeight = __fancyContent.outerHeight();

                        // Calculate position on screen
                        var __contentPos = {
                            left: (rta.config.defaultSize.browser.width / 2) - (__contentWidth / 2),
                            top: (rta.config.defaultSize.browser.height / 2) - (__contentHeight / 2)
                        };

                        // If __contentHeight is bigger than of (rta.config.defaultSize.browser.height / 2)
                        // set top to zero for preventing from outbound top
                        if (__contentPos.top < 0)
                            __contentPos.top = '25px';

                        if (rta.config.fancybox.alwaysTop)
                            __contentPos.top = '25px';

                        // Set fancybox size
                        $(rta.config.defaultSelectors.fancyWrapper + ',' + rta.config.defaultSelectors.fancyInner).width(__contentWidth).height('auto');

                        // Set position of fancybox
                        $(rta.config.defaultSelectors.fancyWrapper).css({
                            left: __contentPos.left,
                            top: __contentPos.top
                        });

                        // Show box
                        $(rta.config.defaultSelectors.fancyWrapper).animate({'opacity': 1});

                        rta.util.log('Fancybox size set manually by RTA.');

                        //// Call Callback function
                        __callback.call();
                    }
                }, 500);
            },
            // Callbacks
            onCancel: $.noop, // If canceling
            beforeLoad: $.noop(),
            afterLoad: $.noop(), // After loading
            beforeShow: function () {
                // Hide fancybox for apply some change to it.
                $(rta.config.defaultSelectors.fancyWrapper).hide();
            }, // Before changing in current item
            afterShow: function (e) {
                rta.config.fancybox.manualResize(function () {
                    var __callerID = $(rta.config.defaultSelectors.fancyWrapper).find('.fanc-box-wp').attr('id'),
                        __specConfig = (rta.config.fancySpecificOptions.hasOwnProperty(__callerID)) ? rta.config.fancySpecificOptions[__callerID] : null;

                    if (__specConfig !== null && typeof (__specConfig.afterShowMore) !== undefined) {
                        for (var func in __specConfig.afterShowMore) {
                            if ($.isFunction(__specConfig.afterShowMore[func])) {
                                __specConfig.afterShowMore[func].call();
                                rta.util.log(func + ' fucntion has been call after show fancy.');
                            }
                        }
                    }
                });
            }, // After opening
            beforeChange: $.noop, // Before changing gallery item
            beforeClose: $.noop, // Before closing
            reloadAfterClose: false,

            afterClose: function () { // After closing
                if (this.reloadAfterClose)
                    window.location.reload();
            }
        }
    };

    // Global Register
    rta.registers = (function () {
        var _registers = [];

        return {
            get: function (name, isLocal) {
                var isLocal = isLocal || false;

                if (rta.util.getCookie(name) && !isLocal)
                    return rta.util.getCookie(name);

                if (_registers.hasOwnProperty(name))
                    return _registers[name];

                return false;
            },
            set: function (name, value, permanent) {
                var _value = value || '',
                    _permanent = permanent || false;
                if (!name)
                    return false;
                _registers[name] = _value;

                if (_permanent)
                    rta.util.setCookie(name, _value);

                return _value;
            }
        };
    })();

    // Tools
    rta.util = (function () {

        var _pageHashes = [],
            _queryStrings = [];

        return {
            has_fancy_box: null,
            messageType: {
                error: 'error',
                warning: 'warning',
                info: 'info'
            },
            showMultiFancy: function () {
                $(document).on('click', '.multi-fancybox', function (e) {
                    e.preventDefault();
                    var __self = $(this),
                        __currentFancyID = __self.attr('data-fancy-id');
                    __currentOption = rta.config.fancybox;
                    if (rta.config.fancySpecificOptions.hasOwnProperty(__currentFancyID))
                        __currentOption.afterShowMore = rta.config.fancySpecificOptions[__currentFancyID];
                    $.fancybox.open(__self, __currentOption);
                });
            },
            showMessage: function (message, type, title, hasClose) {
                var __type = type || this.messageType.error,
                    __hasClose = hasClose || true,
                    __title = title || __type.toCamel();
                if (!message)
                    return false;

                var message = rta.template.bind({
                    type: __type,
                    title: __title,
                    message: message
                }, 'notificationTemplate');
            },
            /**
             * Steve.M
             * Get browser size
             * @returns {object}
             */
            getBrowserSize: function () {
                var __size = {};

                if (window.innerHeight) //if browser supports window.innerWidth
                {
                    __size.height = window.innerHeight;
                    __size.width = window.innerWidth;
                }
                else if (document.all) //else if browser supports document.all (IE 4+)
                {
                    __size.height = document.body.clientHeight;
                    __size.width = document.body.clientWidth;
                }

                return __size;
            },
            /**
             * Steve.M
             * Show log message if log function is availble
             * @param {string[]} message
             * @returns {bool}
             */
            log: function (msgs) {
                var _messages = arguments;
                if (rta.config.debug) {
                    try {
                        var _date = new Date();
                        for (var _i = 0; _i < _messages.length; ++_i) {
                            var _str_message = rta.name + ' - v.' + rta.version + ' [' + _date.today() + " - " + _date.timeNow() + '] >> ' + _messages[_i];
                            console.log(_str_message);
                        }
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
                return true;
            },
            /**
             * Steve.M
             * Get cookie by name
             * @param {string} name
             * @returns {string}
             */
            getCookie: function (name) {
                var start = document.cookie.indexOf(name + "=");
                var len = start + name.length + 1;
                if ((!start) && (name != document.cookie.substring(0, name.length))) {
                    return null;
                }
                if (start == -1)
                    return null;
                var end = document.cookie.indexOf(";", len);
                if (end == -1)
                    end = document.cookie.length;
                return unescape(document.cookie.substring(len, end));
            },
            /**
             * Steve.M
             * Set a cookie
             * @param {string} name
             * @param {string} value
             * @param {date} expires
             * @param {string} path
             * @param {string} domain
             * @param {bool} secure
             * @returns {null}
             */
            setCookie: function (name, value, expires, path, domain, secure) {
                var today = new Date();
                today.setTime(today.getTime());
                if (expires) {
                    expires = expires * 1000 * 60 * 60 * 24;
                }
                var expires_date = new Date(today.getTime() + (expires));
                document.cookie = name + "=" + escape(value) +
                ((expires) ? ";expires=" + expires_date.toGMTString() : "") +
                ((path) ? ";path=" + path : "") +
                ((domain) ? ";domain=" + domain : "") +
                ((secure) ? ";secure" : "");
            },
            /**
             * Steve.M
             * Delete a cookie
             * @param {string} name
             * @param {string} path
             * @param {string} domain
             * @returns {null}
             */
            deleteCookie: function (name, path, domain) {
                if (getCookie(name))
                    document.cookie = name + "=" +
                    ((path) ? ";path=" + path : "") +
                    ((domain) ? ";domain=" + domain : "") +
                    ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
            },
            /**
             * Steve.M
             * @param {string} tagType
             * @param {object} attrs
             * @returns {bool}
             */
            createElement: function (tagType, attrs) {
                //local attributes variables
                var _attrs = attrs || {};
                var _tagType = tagType || 'script'

                if (_tagType == 'script') {
                    try {

                        var _scriptEl = document.createElement('script');
                        for (atr in _attrs) {
                            _scriptEl.setAttribute(atr.toDash(), _attrs[atr]);
                        }

                        // Add element to head
                        document.head.appendChild(_scriptEl);
                        return true;
                    } catch (exception) {
                        return false;
                    }

                }
            },
            /**
             * Steve.M
             * Load script file(s) dynamiclly
             * @param {type} url
             * @param {type} callback
             * @returns {undefined}
             */
            loadScript: function (url, callback) {
                var _callback = callback || $.noop();
                if (!url)
                    return false;
                $.ajax({
                    url: url,
                    dataType: 'script',
                    success: _callback,
                    error: function (e) {
                        rta.util.log(e);
                    },
                });
            },
            /**
             * Howard.Rf, Steve.M
             * Populate url hashes
             * @returns {null}
             */
            populateHashesQueryStrings: function () {
                _pageHashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('#');

                // Extract querystirng variables
                var __qstringsTemp = _pageHashes[0].split('&');
                for (var iv = 0; iv < __qstringsTemp.length; ++iv) {
                    var __varPair = __qstringsTemp[iv].split('=');
                    _queryStrings[__varPair[0]] = __varPair[1];
                }
                rta.util.log('Hashes successfully populated.');
            },
            /**
             * Steve.M
             * get
             * @param {int=1} index
             * @returns {string}
             */
            getHash: function (index) {
                var _index = index || 1;
                return _pageHashes[_index];
            },
            /**
             * Steve.M
             * Currency class
             */
            currency: {
                /**
                 * Howard Rf
                 * Seperate currency value 3 digit
                 * @param {string} field_id
                 * @returns {null}
                 */
                digit_sep: function (field_id) {
                    var sep = ",";
                    var num = $("#" + field_id).val();
                    num = num.toString();
                    var dotpos = num.indexOf(".");
                    var endString = '';
                    if (dotpos != -1) {
                        endString = num.substring(dotpos);
                        num = num.substring(0, dotpos);
                    }

                    var num2 = num.replace(/,/g, "");
                    x = num2;
                    z = "";
                    for (i = x.length - 1; i >= 0; i--)
                        z += x.charAt(i);
                    // add seperators. but undo the trailing one, if there
                    z = z.replace(/(\d{3})/g, "$1" + sep);
                    if (z.slice(-sep.length) == sep)
                        z = z.slice(0, -sep.length);
                    //z.concat(endString);
                    x = "";
                    // reverse again to get back the number
                    for (i = z.length - 1; i >= 0; i--)
                        x += z.charAt(i);
                    x += endString;
                    $("#" + field_id).val(x);
                },
                getNumber: function (value) {
                    return val.replace(/,/g, '');
                }
            },
            /**
             * Steve.M
             * Checkboxes utilities
             */
            checkboxes: {
                /**
                 * Steve.M, Howard.Rf
                 * Toggle selections of all checkbox in selector
                 * @param {string} selector
                 * @returns {null}
                 */
                toggle: function (selector, checkboxSelector) {
                    var _sel = selector || rta.config.defaultSelectors.checkboxWrap,
                        _checkboxSel = checkboxSelector || 'input:checkbox';
                    $(_sel).find(_checkboxSel).each(function (ind, elm) {
                        if (elm.checked)
                            elm.checked = false;
                        else
                            elm.checked = true;
                    });
                },
                /**
                 * Steve.M, Howard.Rf
                 * Select selections of all checkbox in selector
                 * @param {string} selector
                 * @returns {null}
                 */
                selectAll: function (selector, checkboxSelector) {
                    var _sel = selector || rta.config.defaultSelectors.checkboxWrap,
                        _checkboxSel = checkboxSelector || 'input:checkbox';
                    $(_sel).find(_checkboxSel).each(function (ind, elm) {
                        elm.checked = true;
                    });
                },
                /**
                 * Steve.M, Howard.Rf
                 * Deselect selections of all checkbox in selector
                 * @param {string} selector
                 * @returns {null}
                 */
                deSelectAll: function (selector, checkboxSelector) {
                    var _sel = selector || rta.config.defaultSelectors.checkboxWrap,
                        _checkboxSel = checkboxSelector || 'input:checkbox';
                    $(_sel).find(_checkboxSel).each(function (ind, elm) {
                        elm.checked = false;
                    });
                }
            },

            equalPanel: function (resetHeight) {

                setTimeout(function () {

                    $('.rt-same-height').each(function(){

                        var maxHeight = 0,
                            panels = $(this).find('.panel-wp');

                        panels.each(function(){

                            if(resetHeight)
                                $(this).css({
                                    height: 'auto'
                                });

                            maxHeight = Math.max($(this).outerHeight(), maxHeight);
                        });

                        panels.css({
                            height: maxHeight
                        });

                    }).promise().done(function () {

                        var sideChangesHeight = $('.js-full-height .panel-wp').height();

                        $('.js-full-height').each(function () {

                            var minus = parseInt($(this).attr('data-minuse-size'));

                          $(this).find('.panel-body, .mCustomScrollBox').css({
                              maxHeight: sideChangesHeight - minus
                          });

                        });

                    });

                },1000);

            }

        };
    })();

    // Application Functions
    rta.internal = (function () {
        return {
            slides: {
                /**
                 * Steve.M
                 * select right slide base on selectors
                 * @param {string} slideId : ID of selected item
                 * @param {string} labelClass : Class of tab container
                 * @param {string} containerClass : Class of every content container
                 * @param {string} registerID : ID of register
                 * @param {string} labelPrefixID : Prefix id of labels
                 * @param {string} containerPrefixID : Prefix id of container
                 * @returns {Boolean}
                 */
                open: function (slideId, labelClass, containerClass, registerID, labelPrefixID, containerPrefixID) {

                    var _slideLabelID = labelPrefixID || rta.config.defaultSelectors.slideLabelPrefix,
                        _slideContainerID = containerPrefixID || rta.config.defaultSelectors.slideContainerPrefix,
                        _registerID = registerID || 'currentSlide',
                        _currentSlideID = rta.registers.get(_registerID);

                    if (!labelClass || !containerClass)
                        return false;
                    else if (_currentSlideID === slideId) {

                        // Check is current slide is active
                        if ($(_slideLabelID + slideId).parent().hasClass('active'))
                            return false;
                        _currentSlideID = rta.registers.set(_registerID, $(labelClass).find('li').eq(0).find('a').attr('id').slice(_slideLabelID.length - 1));
                    }

                    // Hide all containers
                    $(containerClass).hide();

                    // Remove active class to label li
                    if (!_currentSlideID)
                        $(labelClass).find('li').eq(0).removeClass("active");
                    else
                        $(_slideLabelID + _currentSlideID).parent().removeClass("active");

                    // Show new slide content and add active class to its label
                    $(_slideContainerID + slideId).fadeIn(700);
                    $(_slideLabelID + slideId).parent().addClass("active");


                    // Set currentSlide to currect id
                    rta.registers.set(_registerID, slideId);
                    return true;
                }
            },
            initChosen: function () {
                $("select[data-has-chosen],.prow select, .panel-body > select, .fanc-row > select, .fanc-content-body select").not('[data-chosen-opt],[data-chosen-disable], .wpl-chosen-inited').addClass('wpl-chosen-inited').chosen(rta.config.chosen);


                $('select[data-chosen-opt]').not('.wpl-chosen-inited').each(function () {

                    var _options = opt2JSON($(this).attr('data-chosen-opt'));

                    $(this).addClass('wpl-chosen-inited').chosen($.extend({},rta.config.chosen,_options));

                    if(_options.hasOwnProperty("width"))
                        $(this).next().css({minWidth: _options.width});

                    if($(this).parent().get(0).tagName == 'TD'){
                        $(this).parent().css({overflow: 'visible'});
                    }
                });

                $('.wpl-wrapper-class select').not('[data-chosen-opt], wpl-chosen-inited').each(function () {
                    $(this).parent().css({overflow: 'visible'});
                    $(this).addClass('wpl-chosen-inited').chosen(rta.config.chosen);
                });
            }
        }
    })();

    // Internal Page Function manager
    rta.runTime = (function () {
        var _functionList = {},
            _isRuned = {},
            _isRunOnce = {};
        return {
            /**
             *
             * @returns {func}
             */
            getAll: function () {
                return _functionList;
            },
            get: function (id) {
                if (!id)
                    return false;
                if (_functionList.hasOwnProperty(id))
                    return _functionList[id];
            },
            /**
             * Steve.M
             * Add new function to function list and run it with delay
             * @param {function} func
             * @param {string} id
             * @param {integer} delay
             * @returns {Boolean}
             */
            add: function (func, id, runOnce, delay) {
                var __id = id || _functionList.length;
                var __runOnce = runOnce || true;
                var __delay = (typeof delay === undefined) ? -1 : delay;

                if (!func || !$.isFunction(func))
                    return false;

                if (_functionList.hasOwnProperty(__id))
                    return false;

                _functionList[__id] = func;
                _isRunOnce[__id] = __runOnce;
                _isRuned[__id] = false;

                if (__delay >= 0)
                    this.run(__id, __delay);

                return true;

            },
            /**
             *
             * @param {type} id
             * @returns {Boolean}
             */
            run: function (id, delay, params) {
                var __delay = (typeof delay === undefined) ? -1 : delay;
                if (!id)
                    return false;
                if (_functionList.hasOwnProperty(id)) {
                    if (_isRunOnce[id] && _isRuned[id])
                        return;

                    var __runTimeOut = setTimeout(function () {
                        _functionList[id].call(params);
                        _isRuned[id] = true;
                        clearTimeout(__runTimeOut);
                    }, __delay);
                }
                return true;
            },
            /**
             *
             * @returns {undefined}
             */
            runAll: function () {
                if (_functionList.length > 0)
                    for (_ifunc in _functionList) {
                        _functionList[_ifunc].call();
                        _isRuned[_ifunc] = true;
                    }
            }
        }
    })();

    rta.template = (function () {
        var _templates = {},
            _tag = rta.config.templates.tag,
            _leftH = rta.config.templates.leftHolder,
            _rightH = rta.config.templates.rightHolder,
            _idAttr = rta.config.templates.idAttr;

        return {
            bind: function (object, templateName) {
                if (!object)
                    return false;

                if (!$.isPlainObject(object) || $.isEmptyObject(object) || $.isEmptyObject(_templates))
                    return false;

                var _temName = templateName.toCamel() || 0,
                    _temTemplate;

                if (!$.isNumeric(_temName))
                    if (!_templates.hasOwnProperty(_temName))
                        return false;

                _temTemplate = _templates[_temName];

                for (var _field in object) {
                    var _strRep = _leftH + _field + _rightH;
                    _temTemplate = _temTemplate.WPLReplaceAll(_strRep, object[_field]);
                }

                // data-src attr to src
                _temTemplate = _temTemplate.WPLReplaceAll('data-src', 'src');

                rta.util.log('A template data bind.');

                return _temTemplate;

            },
            initPage: function () {
                $.get(_rta_urlJs + rta.config.templates.fileName).done(function (data) {
                    $(data).filter(_tag).each(function () {
                        var __id = $(this).attr(_idAttr);

                        if (__id === 'undefined' || __id === false)
                            return;

                        __id = __id.toCamel();

                        _templates[__id] = $(this).html();
                        $(this).remove();
                    });
                    rta.util.log('All dynamic templates initilized.');
                    return true;
                });
            },
            init: function () {
                var __self = this;
                if (rta.config.templates.delayStart) {
                    var __timer = setTimeout(function () {
                        __self.initPage();
                        clearTimeout(__timer);
                    }, rta.config.templates.delayTime);
                }
                else {
                    __self.initPage();
                }

            }
        };
    })();

    /**
     * Steve.M
     * @returns {undefined}
     */
    rta.pageElementsStartupTriggers = function () {

        // Backend left tab system
        if (rta.util.getHash())
            $(rta.config.backend.pageLeftTabs).find("a[href='#" + rta.util.getHash() + "']").trigger(rta.config.backend.pageLeftTabsTrigger);
        else {
            var __selectIndex = 0;
            var ignoreItems = ['.wpl-listing-discard-btn','.tab-finalize'];

            for(var i=0; i < ignoreItems.length;++i){
                if ($(rta.config.backend.pageLeftTabs).find(ignoreItems[i]).length)
                    __selectIndex++;
            }

            $(rta.config.backend.pageLeftTabs).find('li:eq(' + __selectIndex + ') a').trigger(rta.config.backend.pageLeftTabsTrigger);
        }


        rta.config.defaultSize = {
            window: {
                height: $(window).height(),
                width: $(window).width()
            },
            document: {
                height: $(document).height(),
                width: $(document).getDocHeight()
            },
            browser: rta.util.getBrowserSize()
        };

        // Functional Classes
        $(".js-clear").each(function () {
            $(this).removeClass('js-clear').after('<div class="clear"></div>');
        });

        // Initialize all template in the page
        rta.template.init();

        rta.util.equalPanel(true);

        $(".wpl-scrollbar,.side-changes .panel-body,.side-announce .panel-body,.wpl-addons-wp .wpl_addon_log_info").mCustomScrollbar({
            mouseWheel: true,
            mouseWheelPixels: 200,
            scrollInertia: 300,
            scrollButtons: {
                //enable: true
            },
            advanced: {
                //updateOnContentResize: true
            },
            theme: "dark-thin"
        });

        rta.internal.initChosen();
    };

    rta.init = function () {

        // Populate page hashes in  w
        rta.util.populateHashesQueryStrings();

        // Run all startup triggers on elements
        rta.pageElementsStartupTriggers();
    };


    ///// New Codes ////////////////////////////////////////////////////////////////////////////////////////////////////

    window.realtyna = {};

    realtyna.options = {};
    // Tab System

    realtyna.options.tabs = {
        // Class selectors
        tabSystemClass: '.wpl-js-tab-system',
        tabsClass: '.wpl-gen-tab-wp',
        tabContentsClass: '.wpl-gen-tab-contents-wp',
        tabContentClass: '.wpl-payment-content',

        tabActiveClass: 'wpl-gen-tab-active', // Class Name

        activeChildIndex: 0 // Active tab index
    };

    realtyna.tabs = function () {
        var _tabOptions = realtyna.options.tabs;

        $(_tabOptions.tabSystemClass).each(function(){
            var _tabs = $(this).find(_tabOptions.tabsClass).first(),
                _tabContents = $(this).find(_tabOptions.tabContentsClass).first();

            // Tab click trigger
            _tabs.find('ul > li > a').on('click', function (e) {
                e.preventDefault();

                if ($(this).hasClass(_tabOptions.tabActiveClass))
                    return false;

                // Hide previous tab and content
                _tabs.find('ul > li > a').removeClass(_tabOptions.tabActiveClass).parent().removeClass(_tabOptions.tabParentActiveClass);
                _tabContents.find('> div').hide();

                // Show corrent tab
                $(this).addClass(_tabOptions.tabActiveClass).parent().addClass(_tabOptions.tabParentActiveClass);

                _tabContents.find($(this).attr('href')).fadeIn();

            });

            // Show first
            if(_tabs.find('ul > li > .' + _tabOptions.tabActiveClass).length === 0)
                _tabs.find('ul > li > a').eq(_tabOptions.activeChildIndex).trigger('click');
        });

    };

    //region jQuery Data Picker

    $.extend($.datepicker,{_checkOffset:function(inst,offset,isFixed){return offset}});

    //endregion

})(wplj, window, document);
//endregion

//region + Old Javascripts ///////////////////////////////////////////////////////////////////////////////////////////////////
var wplj;
var wpl_show_messages_cur_class;
var wpl_show_messages_html_element;
var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('#');

/** after show default function (don't remove it) **/
function wpl_fancybox_afterShow_callback() {
}

function wpl_ajax_save(table, key, element, id, url) {
    if (!table || !key || !id || !element || !url)
        return false;
    value = element.value;
    if (!value)
        value = '';
    request_str = 'wpl_format=c:functions:ajax&wpl_function=ajax_save&table=' + table + '&key=' + key + '&value=' + value + '&id=' + id;
    /** run ajax query **/
    ajax = wpl_run_ajax_query(url, request_str);
    return ajax;
}
function wpl_show_messages(message, html_element, msg_class,hide, focus, hideTimeout) {

    msg_class = msg_class || 'wpl_gold_msg';
    html_element = html_element || '.wpl_show_message';
    hideTimeout = hideTimeout || 5000;

    if (!message)
        return;

    wpl_show_messages_html_element = html_element;

    // Add & show message
    wplj(html_element).html(message);
    wplj(html_element).fadeIn();

    wplj(html_element).addClass(msg_class);

    // Change current class if different with the old one
    if (wpl_show_messages_cur_class && wpl_show_messages_cur_class != msg_class)
        wplj(html_element).removeClass(wpl_show_messages_cur_class);

    wpl_show_messages_cur_class = msg_class;

    // Auto hide message after a while
    if(typeof hide != "undefined" && hide == true){
        setTimeout(function () {
            wplj(html_element).fadeOut();
        }, hideTimeout);
    }

    // Focus to message
    if(typeof focus != "undefined" && focus == true){
        wplj('html, body').animate({
            scrollTop: wplj(html_element).offset().top - wplj(html_element).outerWidth()
        }, 2000);
    }


}

function wpl_remove_message(html_element) {
    if (!html_element)
        html_element = wpl_show_messages_html_element;
    if (!wpl_show_messages_cur_class)
        return;
    wplj(html_element).removeClass(wpl_show_messages_cur_class);
    wplj(html_element).html('');
    wplj(html_element).hide();
    wpl_show_messages_cur_class = '';
}

function wpl_run_ajax_query(url, request_str, ajax_loader, data_type, ajax_type) {
    if (!data_type) data_type = "JSON";
    if (!ajax_type) ajax_type = "POST";

    ajax_result = wplj.ajax(
        {
            type: ajax_type,
            dataType: data_type,
            url: url,
            data: request_str,
            success: function (data) {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (ajax_loader)
                    wplj(ajax_loader).html('');
            }
        });
    return ajax_result;
}

/** update query string **/
function wpl_update_qs(key, value, url) {
    if (!url)
        url = window.location.href;

    var re = new RegExp("([?|&|/]|^)" + key + "=.*?(&|#|$)(.*)", "gi");
    if (re.test(url)) {
        if (value)
            return url.replace(re, '$1' + key + "=" + value + '$2$3');
        else
            return url.replace(re, '$1$3').replace(/(&|\?)$/, '');
    }
    else {
        if (value) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?';
            if (url.indexOf('?') === -1 && url.indexOf('&') !== -1) separator = '&';

            var hash = url.split('#');
            url = hash[0] + separator + key + '=' + value;
            if (hash[1])
                url += '#' + hash[1];
            return url;
        }
        else
            return url;
    }
}

function wpl_thousand_sep(field_id) {
    var sep = ",";
    var num = wplj("#" + field_id).val();
    num = num.toString();
    var dotpos = num.indexOf(".");
    var endString = '';
    if (dotpos != -1) {
        endString = num.substring(dotpos);
        num = num.substring(0, dotpos);
    }

    var num2 = num.replace(/,/g, "");
    x = num2;
    z = "";
    for (i = x.length - 1; i >= 0; i--)
        z += x.charAt(i);
    // add seperators. but undo the trailing one, if there
    z = z.replace(/(\d{3})/g, "$1" + sep);
    if (z.slice(-sep.length) == sep)
        z = z.slice(0, -sep.length);
    //z.concat(endString);
    x = "";
    // reverse again to get back the number
    for (i = z.length - 1; i >= 0; i--)
        x += z.charAt(i);
    x += endString;
    wplj("#" + field_id).val(x);
}

function wpl_de_thousand_sep(val) {
    return val.replace(/,/g, "");
}

function wpl_alert(string) {
    alert(string);
}

function wpl_ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function wpl_change_field_language(field_id, lang) {
    wplj("#wpl_langs_tabs" + field_id + " li").removeClass('wpl-active-lang');
    wplj("#wpl_langs_tabs" + field_id + " li#wpl_langs_tab_" + field_id + "_" + lang).addClass('wpl-active-lang');

    wplj("#wpl_langs_cnts" + field_id + " div.wpl-lang-cnt").css('display', 'none');
    wplj("#wpl_langs_cnts" + field_id + " div#wpl_langs_cnt_" + field_id + "_" + lang).css('display', '');
}

function wpl_qs_apply(source_qs, apply_qs) {
    if(apply_qs.substring(0, 1) == '?') apply_qs = apply_qs.substring(1);
    var key_value_vars = apply_qs.split('&');

    for(var i in key_value_vars){
        var key_value_var = key_value_vars[i].split('=');
        source_qs = wpl_update_qs(key_value_var[0], key_value_var[1], source_qs);
    }

    return source_qs;
}

/*function wpl_wizard_more_details_toggle(id)
{
    wplj("#wpl_more_details"+id).toggle();
}*/

function wpl_plisting_slider(i, images_total, property_id)
{
    if ((i+1)>=images_total) j=0; else j=i+1;
    if (j==i) return;

    wplj("#wpl_gallery_image"+property_id+"_"+i).fadeTo(200,0).css("display",'none');
    wplj("#wpl_gallery_image"+property_id+"_"+j).fadeTo(400,1);
}

function wpl_date_convert(date, format_from, format_to)
{
    if(typeof format_to == "undefined") format_to = "yy/mm/dd";

    var separator = "/";
    if(date.indexOf("-") != "-1") separator = "-";
    else if(date.indexOf(".") != "-1") separator = ".";

    var date_sp = date.split(separator);
    var ff_sp = format_from.split(separator);

    var year = date_sp[ff_sp.indexOf("yy")];
    var month = date_sp[ff_sp.indexOf("mm")];
    var day = date_sp[ff_sp.indexOf("dd")];

    return format_to.replace("yy", year).replace("mm", month).replace("dd", day);
}

//endregion/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//region + Dom Ready
function initAccordion(){

    wplj('.wpl-gen-accordion-title').off('click.wpl-accordion').on('click.wpl-accordion',function(){
        var thisParent = wplj(this).parent(),
            otherAccordions = thisParent.parent().find('.wpl-gen-accordion');

        if(thisParent.hasClass('wpl-gen-accordion-active'))
            return;

        // Reset state
        otherAccordions.removeClass('wpl-gen-accordion-active');

        // Set new state
        thisParent.addClass('wpl-gen-accordion-active');
    });

    return true;

}
wplj(function(){

    //region + Old Javascript codes
    /*wplj.fn.wpl_help = function () {
        wplj('.wpl_help').hover('hover',
            function () {
                wplj(this).children(".wpl_help_description").show();
            },
            function () {
                wplj(this).children(".wpl_help_description").hide();
            }
        )
    };*/
    //endregion

    //region + Mutli-lingual
    function openCurrentMultilingBox(_self, _parent, _next, _before, _params) {

        var _nextHeight = _next.outerHeight(),
            _nextWidth = _next.outerWidth(),
            _beforeHeight = _before.outerHeight(),
            _final = (-1 * (_nextHeight / 2)) + 15,
            _parentHeight = _parent.outerHeight(),
            _parentWidth = _parent.outerWidth();


        _self.fadeOut(200);
        _before.fadeOut(200, function () {
            _parent.attr({
                'data-wpl-init-h': _parentHeight,
                'data-wpl-init-w': _parentWidth
            }).css({
                height: _parentHeight,
                width: _parentWidth,
                position: 'absolute',
                'z-index': 9999
            }).animate({
                height: _nextHeight,
                width: _nextWidth,
                top: _final
            }, 200, 'easeInCirc', function () {
                _next.fadeIn();

                if (_params) {
                    _next.find('#' + _params.attr('data-wpl-field')).focus();
                }
            });
        });

    }

    function closeAllMultilingTextBox(callback) {
        _j('.wpl-multiling-text').removeClass('wpl-multiling-opened');

        var _openCount = _j('.wpl-multiling-text').find('.wpl-multilang-field-cnt').length;

        _j('.wpl-multiling-text .wpl-multilang-field-cnt').each(function () {

            _j(this).fadeOut(100, function () {
                var _self = _j(this),
                    _parent = _self.parent(),
                    _parentHeight = _parent.attr('data-wpl-init-h'),
                    _parentWidth = _parent.attr('data-wpl-init-w');

                _parent.removeAttr('data-wpl-init-h data-wpl-init-w');

                _parent.animate({
                    height: _parentHeight,
                    width: _parentWidth,
                    top: 0
                }, 200, function () {
                    _parent.css({
                        position: 'relative',
                        zIndex: 0
                    });
                    _parent.find('.wpl-multiling-flag-cnt,.wpl-multiling-edit-btn').fadeIn();
                    _openCount--;

                    if (_openCount == 0 && typeof callback != "undefined" && _j.isFunction(callback)) {
                        callback.call();
                    }
                });
            });

        });
    }

    function closeAllMultilingTextAreaBox(callback) {
        _j('.wpl-multiling-textarea').removeClass('wpl-multiling-opened');

        var _openCount = _j('.wpl-multiling-textarea').find('.wpl-multilang-field-cnt').length;

        _j('.wpl-multiling-textarea').each(function () {
            var _slef = _j(this);

            _j(this).find('.wpl-multiling-flag').removeClass('wpl-multiling-active');

        });

    }

    // - For Text Field Only
    _j('.wpl-multiling-text').find('.wpl-multiling-edit-btn').on('click.wpl-events', function (ev, params) {
        ev.stopPropagation();

        var _self = _j(this),
            _parent = _self.parent(),
            _next = _j(this).next('.wpl-multilang-field-cnt'),
            _before = _j(this).prev('.wpl-multiling-flag-cnt'),
            _params = _j(params) || null;

        if (_next.is(":visible") == true)
            return false;


        if (_j('.wpl-multiling-opened').length > 0) {
            closeAllMultilingTextBox(function () {
                _parent.addClass('wpl-multiling-opened');
                openCurrentMultilingBox(_self, _parent, _next, _before, _params);
            });
        } else {
            _parent.addClass('wpl-multiling-opened');
            openCurrentMultilingBox(_self, _parent, _next, _before, _params);
        }

    });

    // - For Text Field Only
    _j('.wpl-multiling-text').find('.wpl-multiling-flag').on('click.wpl-events', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();

        var _parent = _j(this).parents('.wpl-multiling-flags-wp'),
            _btn = _parent.find('.wpl-multiling-edit-btn');

        _btn.trigger('click', _j(this));
    });

    _j('.wpl-lang-cnt > input').on('mouseup focus', function () {
        this.select();
    });

    _j('.wpl-lang-cnt > input').on('blur', function () {
        var _self = _j(this),
            _selfID = _self.attr('id'),
            _parent = _self.parents('.wpl-multiling-field');

        if (_self.val() == '') {
            _parent.find('.wpl-multiling-flag').filter('[data-wpl-field=' + _selfID + ']').addClass('wpl-multiling-empty');
        } else {
            _parent.find('.wpl-multiling-flag').filter('[data-wpl-field=' + _selfID + ']').removeClass('wpl-multiling-empty');
        }
    });

    _j('.wpl-lang-cnt > textarea').on('blur', function () {

        var _self = _j(this),
            _selfID = _self.attr('id'),
            _parent = _self.parents('.wpl-multiling-field');

        if (_self.val() == '') {
            _parent.find('.wpl-multiling-flag').filter('[data-wpl-field-id=' + _selfID + ']').addClass('wpl-multiling-empty');
        } else {
            _parent.find('.wpl-multiling-flag').filter('[data-wpl-field-id=' + _selfID + ']').removeClass('wpl-multiling-empty');
        }

    });

    _j('.wpl-multiling-save-pro').on('click.wpl-events', function (ev) {
        var _self = _j(this),
            _parent = _self.parents('.wpl-multiling-field'),
            _selfID = _self.parent().attr('id');

        if (tinymce.activeEditor.getContent() == '') {
            _parent.find('.wpl-multiling-flag').filter('[data-wpl-field=' + _selfID + ']').addClass('wpl-multiling-empty');
        } else {
            _parent.find('.wpl-multiling-flag').filter('[data-wpl-field=' + _selfID + ']').removeClass('wpl-multiling-empty');
        }
        _j(this).closest('.wpl-lang-cnt').hide(function () {
            _j(this).closest('div.wpl-multiling-flags-wp').removeClass('wpl-multiling-opened')
        });
    })

    _j('.wpl-multiling-label.wpl-multiling-text').on('click.wpl-events', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();

        var _self = _j(this),
            _nextBtn = _self.next('.wpl-multiling-field').find('.wpl-multiling-edit-btn');

        _nextBtn.trigger('click');
    });

    // - For TextArea Field Only
    _j('.wpl-multiling-textarea').find('.wpl-multiling-flag').on('click.wpl-events', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();

        var _self = _j(this),
            _parentSelf = _self.parent(),
            _containerParentSelf = _parentSelf.next(),
            _tabs = _parentSelf.find('.wpl-multiling-flag'),
            _containers = _containerParentSelf.find('.wpl-lang-cnt');

        if (_self.hasClass('wpl-multiling-active')) {
            return false;
        }
        else {
            // Close other tabs
            _tabs.removeClass('wpl-multiling-active');
            _containers.hide();
        }

        var _container = _j('#' + _self.attr('data-wpl-field')),
            _parent = _j(this).parents('.wpl-multiling-flags-wp');

        _self.addClass('wpl-multiling-active');
        _parent.addClass('wpl-multiling-opened');
        _container.fadeIn();

    });

    // - Close box on outside click
    _j(document).on('click.wpl-events', function (ev) {
        ev.stopPropagation();


        if (!_j(ev.target).hasClass('wpl-multilang-field-cnt') && !(_j(ev.target).parents('.wpl-multilang-field-cnt').length > 0)) {

            /**
             * Multilingual Fields
             */
            closeAllMultilingTextBox();

            closeAllMultilingTextAreaBox();
        }
    });
    //endregion

    //region + Intialize the QTips
    _j('[data-wpl-title!=""]').qtip({ // Grab all elements with a non-blank data-tooltip attr.
        content: {
            attr: 'data-wpl-title' // Tell qTip2 to look inside this attr for its content
        },
        style: {
            classes: 'qtip-tipsy qtip-shadow'
        },
        position: {
            my: 'bottom center',  // Position my top left...
            at: 'top center'
            //target: _j(this)
        },
        events: {
            render: function (event, api) {
                // Grab the tip element
                var elem = api.elements.tip;
            }
        }
    });
    //endregion

    rta.init();

    wplj('[data-realtyna-lightbox]').realtyna('lightbox');

    wplj('[data-realtyna-tagging]').realtyna('tagging');

    wplj._realtyna.lightbox.on('afterOpen',function(){
        rta.internal.initChosen();
    });

    wplj._realtyna.lightbox.on('afterShow',function(){
        initAccordion();
		//wplj('.wpl_help').wpl_help();
    });

    wplj(document).on('click','.wpl-open-lightbox-btn',function(e){
        e.preventDefault();
        wplj._realtyna.lightbox.open(wplj(this), {
            clearContent:false
        });
    });

    wplj(document).on('click','.wpl-btn-search-view-fields',function(evn){
        evn.preventDefault();
        window.location.reload();
    });

    initAccordion();
    //wplj('.wpl_help').wpl_help();

    realtyna.tabs();

    // On Lightbox Open
    /*wplj.prettyPhoto.addOpenedCallback(realtyna.tabs);
    wplj.prettyPhoto.addOpenedCallback(rta.internal.initChosen);*/

    //region - Show More Fields
    wplj('.wpl-pwizard-prow-more_details > label').on('click', function (evn) {
        evn.preventDefault();

        var elementBlock = wplj(this).next();

        wplj(this).toggleClass('wpl-pwizard-more-details-opened');
        elementBlock.slideToggle();
    });
    //endregion
    //region - dashboard : show log details
    wplj('.wpl-addons-wp .wpl-changelog-link').on('click', function (evn) {
        evn.preventDefault();

        var elementBlock = wplj(this).parents('.wpl-addon-row').children('.wpl-addon-changelog');

        wplj(this).parents('.wpl-addon-row').toggleClass('wpl-log-active');
        if (wplj('.wpl-addon-row').hasClass('wpl-log-active'))
            wplj(this).parents('.panel-wp').addClass('wpl-panel-active');
        else
            wplj(this).parents('.panel-wp').removeClass('wpl-panel-active');
        elementBlock.slideToggle();
    });
    //endregion
});
//endregion

wplj(document).ajaxComplete(function () {

    realtyna.tabs();
    rta.internal.initChosen();
});

var wpl_googlemaps_callbacks = [];

function wpl_add_googlemaps_callbacks(func)
{
    if(typeof func != 'undefined' && wplj.isFunction(func))
    {
        // Push the function to callbacks if the callbacks didn't call already
        if(!wpl_did_googlemaps_callbacks) wpl_googlemaps_callbacks.push(func);
        // Run the function if callbacks called already
        else func();

        return true;
    }

    return false;
}

function wpl_get_googlemaps_callbacks()
{
    return wpl_googlemaps_callbacks;
}

function wpl_clear_googlemaps_callbacks()
{
    wpl_googlemaps_callbacks = [];
    return true;
}

var wpl_did_googlemaps_callbacks = false;
function wpl_do_googlemaps_callbacks()
{
    wpl_did_googlemaps_callbacks = true;

    for(i in wpl_googlemaps_callbacks)
    {
        wpl_googlemaps_callbacks[i]();
    }
}