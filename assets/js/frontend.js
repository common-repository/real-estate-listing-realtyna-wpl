/**
 * @preserve RTA Framework v.0.1.0
 * @Copyright Realtyna Inc. Co 2015
 * @Author Steve M. | UI Department
 */

// Declare custom jQuery handler
var _j = wplj = jQuery.noConflict();

// Global variables
var _rta_app_dirs = {js: 'js/', libs: 'libs/'},
    _rta_baseUrl = wpl_baseUrl,
    _rta_urlAssets = 'wp-content/plugins/' + wpl_baseName + '/assets/',
    _rta_urlJs = _rta_baseUrl + _rta_urlAssets + _rta_app_dirs.js,
    _rta_urlJsLibs = _rta_baseUrl + _rta_urlAssets + _rta_app_dirs.js + ((_rta_app_dirs.js == _rta_app_dirs.libs) ? '' : _rta_app_dirs.libs),
    _rta_frontViews = {},
    _rta_backViews = {};

/**
 * Add some functions to String
 * @returns {String.prototype@call;replace}
 */


/**
 * Steve.M
 * Escape unwanted characters
 * @param {string} str
 * @returns {string}
 */
function escapeRegExp(str) {
    return typeof str === 'string' ? str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") : str;
}
;
// Trim String
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
// To Camel Case
String.prototype.toCamel = function () {
    return this.replace(/(\-[a-z])/g, function ($1) {
        return $1.toUpperCase().replace('-', '');
    });
};
// To Dashed from Camel Case
String.prototype.toDash = function () {
    return this.replace(/([A-Z])/g, function ($1) {
        return "-" + $1.toLowerCase();
    });
};
// To Underscore from Camel Case
String.prototype.toUnderscore = function () {
    return this.replace(/([A-Z])/g, function ($1) {
        return "_" + $1.toLowerCase();
    });
};

// Replace all string that match
String.prototype.WPLReplaceAll = function (find, replace) {
    return this.replace(new RegExp(escapeRegExp(find), 'g'), replace);
};

/**
 * Steve.M
 * Add some functions to Date
 * @returns {String}
 */
//For todays date;
Date.prototype.today = function () {
    return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "/" + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "/" + this.getFullYear()
};
//For the time now
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
};

function isWPL() {
    _j('html').attr('data-wpl-plugin', '');
}

/**
 * RTA Framework
 */
(function (window, document, $, undefined) {

    window.opt2JSON = function (str) {
        var strArray = str.split('|');
        var myObject = {};

        for(var i= 0; i < strArray.length; ++i){
            var _sp = strArray[i].split(':');
            myObject[_sp[0]] = $.isNumeric(_sp[1])? parseInt(_sp[1]): _sp[1];
        }

        return myObject;
    }

    /* Unconditions functions - Start */
    function wpl_fancybox_afterShow_callback() {
    }

    /* END */


    /* RTA Plugins
     * ************************************************************************/

    /**
     * Steve.M
     * Get inline style value
     * Usage:
     $("#someElem").inlineStyle("width");
     * @param {string} prop
     * @returns {string}
     */
    $.fn.inlineStyle = function (prop) {
        var styles = this.attr("style"),
            value;
        styles && styles.split(";").forEach(function (e) {
            var style = e.split(":");
            if ($.trim(style[0]) === prop) {
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
     *   E.g. $('td').sortElements(comparator, function(){
     *      return this.parentNode;
     *   })
     *
     *   The <td>'s parent (<tr>) will be sorted instead
     *   of the <td> itself.
     */
    $.fn.sortElements = (function () {

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
    $.fn.cleanWhitespace = function () {
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
    $.fn.getDocHeight = function () {
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
     if($("#element").isBetween("#prev","#next"));
     $("#element").remove();
     * @param {string} prev
     * @param {string} next
     * @returns {Boolean}
     */
    $.fn.isBetween = function (prev, next) {
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
     $('div.bests').equalHeight();
     */
    $.fn.equalHeight = function (callBack, removeHeightAttr) {
        var currentTallest = 0,
            currentRowStart = 0,
            rowDivs = new Array(),
            $el,
            topPosition = 0,
            elCount = $(this).length,
            elIndex = 0,
            removeHeightAttr = removeHeightAttr || false;

        if (removeHeightAttr)
            $(this).css('height', '');

        $(this).each(function () {


            $el = $(this);
            topPostion = $el.position().top;

            if (currentRowStart != topPostion) {

                // we just came to a new row.  Set all the heights on the completed row
                for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                    rowDivs[currentDiv].height(currentTallest);
                }

                // set the variables for the new row
                rowDivs.length = 0; // empty the array
                currentRowStart = topPostion;
                currentTallest = $el.height();
                rowDivs.push($el);

            } else {
                // another div on the current row.  Add it to the list and check if it's taller
                rowDivs.push($el);
                currentTallest = Math.max(currentTallest, $el.height());
            }
            // do the last row
            for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                rowDivs[currentDiv].height(currentTallest);
            }

            elIndex++;
            if (elIndex === elCount) {
                if (typeof(callBack) !== undefined && $.isFunction(callBack)) {
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
    $.fn.wplSortable = function (options, dataString, postUrl, messages, update) {
        var _options = options || {},
            _dataString = dataString || '',
            _updateFunc = $.noop();
        if (!$.isFunction(update))
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
        _options = $.extend(_options, rta.config.sortable);
        $(this).sortable(_options);
    };

    /**
     * End
     */

        // RTA declaration Declarations
    rta = {
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
        /*JSes: {
            //// Please insure that your file name is widthout .js extention
            chosen: 'chosen/public/chosen.jquery.min',
            jqueryBridget: 'jquery-bridget/jquery.bridget',
            mCustomScrollbar: 'malihu-custom-scrollbar-plugin-bower/jquery.mCustomScrollbar.concat.min',
            transit: 'transit/jquery.transit.min',
            hoverintent: 'hoverintent/jquery.hoverIntent',
            fileUpload: 'blueimp-file-upload/js/jquery.fileupload',
            fileUploadProc: 'blueimp-file-upload/js/jquery.fileupload-process',
            fileUploadValid: 'blueimp-file-upload/js/jquery.fileupload-validate',
            ajaxFileUpload: 'ajaxfileupload.min'
        },*/

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
        chosen: {
            disable_search_threshold: 10
        },
        sortable: {
            handle: '.move-element',
            cursor: "move"
        },
        fancySpecificOptions: {}
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
                            //console.log(_str_message);
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
                    return typeof value === 'string' ? value.replace(/,/g, '') : value;
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
                var __resetHeight = resetHeight || false;
                $('.rt-same-height .panel-wp').equalHeight(function () {
                    $('.rt-same-height .js-full-height').each(function () {
                        var __height = $(this).find('.panel-wp').height();
                        if ($(this).attr('data-minuse-size'))
                            __height -= parseInt($(this).attr('data-minuse-size'));
                        $(this).find('.panel-body').css('max-height', __height);
                    });
                }, __resetHeight);
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
                $("select[data-has-chosen],.prow select, .panel-body > select, .fanc-row > select, .fanc-content-body select, .wpl-addon-market-reports-search-form-wp select").not('[data-chosen-opt],[data-chosen-disable], .wpl-chosen-inited').addClass('wpl-chosen-inited').chosen(rta.config.chosen);


                $('select[data-chosen-opt]').not('.wpl-chosen-inited').each(function () {

                    var _options = opt2JSON($(this).attr('data-chosen-opt'));

                    $(this).addClass('wpl-chosen-inited').chosen($.extend({},rta.config.chosen,_options));

                    if(_options.hasOwnProperty("width"))
                        $(this).next().css({minWidth: _options.width});

                    if($(this).parent().get(0).tagName == 'TD'){
                        $(this).parent().css({overflow: 'visible'});
                    }
                });

                /*$('td > select').not('[data-chosen-opt], wpl-chosen-inited').each(function () {
                    $(this).parent().css({overflow: 'visible'});
                    $(this).addClass('wpl-chosen-inited').chosen(rta.config.chosen);
                });*/
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
     * Load all framework dependencies
     * @returns {bool}
     */
    rta.fwLoader = function () {
        /*requirejs.config(rta.config.require);*/

        rta.util.log('Framework completely loaded.');
        return true;
    };

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


        $('.rt-same-height .panel-wp').equalHeight(function () {
            $('.rt-same-height .js-full-height').each(function () {
                var __height = $(this).find('.panel-wp').height();
                if ($(this).attr('data-minuse-size'))
                    __height -= parseInt($(this).attr('data-minuse-size'));
                $(this).find('.panel-body').css('max-height', __height);
            });
        });

        /*$(".side-changes .panel-body,.side-announce .panel-body").mCustomScrollbar({
            mouseWheel: true,
            mouseWheelPixels: 200,
            scrollInertia: 300,
            scrollButtons: {
                //enable: true
            },
            advanced: {
                updateOnContentResize: true
            },
            theme: "dark-thin"
        });*/

        rta.internal.initChosen();
    };

    rta.init = function () {

        rta.util.log('RTA framework started ...');
        // Load Framework Prerequests
        rta.fwLoader();

        // Populate page hashes in  w
        rta.util.populateHashesQueryStrings();

        // Run all startup triggers on elements
        rta.pageElementsStartupTriggers();
    };

    $(function () {
        // Initialized
        rta.init();
    });


    ///// New Codes

    var realtyna = {};

    realtyna.options = {};
    // Tab System

    realtyna.options.tabs = {
        // Class selectors
        tabSystemClass: '.wpl-js-tab-system',
        tabsClass: '.wpl-gen-tab-wp',
        tabContentsClass: '.wpl-gen-tab-contents-wp',
        tabContentClass: '.wpl-gen-tab-content',

        tabActiveClass      : 'wpl-gen-tab-active', // Class Name
        tabParentActiveClass: 'wpl-gen-tab-active-parent', // Class Name

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

    // On document loaded
    $(function () {

        realtyna.tabs();

        $('.wpl_memberships_container .wpl_memberships').equalHeight();

        $('.properties_link').click(function(){

            $(this).toggleClass('open').find('ul').slideToggle();
        });

        wplj('[data-realtyna-lightbox]').realtyna('lightbox');

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
                _j(this).find('.wpl-lang-cnt').hide(function () {
                    _slef.find('.wpl-multiling-flags-wp').removeClass('wpl-multiling-opened')
                });

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
    });
    //region jQuery Data Picker

    $.extend($.datepicker,{_checkOffset:function(inst,offset,isFixed){return offset}});

    //endregion

    $(document).ajaxComplete(function () {

        realtyna.tabs();

        rta.internal.initChosen();

        $('.wpl_memberships_container .wpl_memberships').equalHeight();

        wplj('[data-realtyna-lightbox]').realtyna('lightbox');

    });

})(window, document, jQuery);

// WPL unit switcher
(function($)
{
    $.fn.wpl_unit_switcher = function(options)
    {
        // Default Options
        settings = $.extend(
        {
            // These are the defaults.
            type: 'select',
            unit_type: 4
        }, options);
        
        // Set Listeners
        if(settings.type === 'select') set_select_listeners(settings);
    }
    
    function set_select_listeners(settings)
    {
        $(settings.selector).on('change', function()
        {
            var unit = $(settings.selector).val();

            var URLlast = new URL(window.location.href);
            var search_params = URLlast.searchParams;

            // loop to get all query parameters
            var searchstr = '?';
            search_params.forEach(function(value, key) {
                searchstr += key+"="+value+"&";
                n = wpl_update_qs(key, value, settings.url);
            });
            searchstr = wpl_update_qs('wpl_unit_switcher', unit, settings.url);
            history.pushState({search: 'WPL'}, "Search Results", searchstr);
            window.location = searchstr;
        });
    }
    
}(jQuery));

wplj(function(){

    //region - Show More Fields

    wplj('.wpl-pwizard-prow-more_details > label').on('click', function (evn) {
        evn.preventDefault();

        var elementBlock = wplj(this).next();

        wplj(this).toggleClass('wpl-pwizard-more-details-opened');
        elementBlock.slideToggle();
    });

    //endregion

    var paginationDisabled = wplj('.pagination').find('.disabled').children('a');
    paginationDisabled.on('click', function(e){
        e.preventDefault();
    })

});


/***************************** Old JS *****************************************/
var wplj;
var wpl_show_messages_cur_class;
var wpl_show_messages_html_element;
var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('#');

wplj(document).ready(function () {
    wplj.fn.wpl_help = function () {
        wplj('.wpl_help').hover(
            function () {
                wplj(this).children(".wpl_help_description").show();
            }
            ,
            function () {
                wplj(this).children(".wpl_help_description").hide();
            }
        )
    };
    wplj('.wpl_help').wpl_help();
    wpl_fix_no_image_size();

    /**/
    wplj(".wpl_unit_switcher_activity select").chosen({ width: 'initial' });
    wpl_prp_show_layout2();
    wpl_map_buttons_toggle();

    wplj('.wpl-tooltip-top').each(function() {
        wplj(this).qtip({
            prerender: true,
            content: {
                text: wplj(this).next('div') // Use the "div" element next to this for the content
            },
            style: {
                classes: 'qtip-dark'
            },
            position: {
                my: 'bottom center',
                at: 'top center',
                target: wplj(this)
            }
        });
    });
    wplj('.wpl-tooltip-right').each(function() {
        wplj(this).qtip({
            prerender: true,
            content: {
                text: wplj(this).next('div') // Use the "div" element next to this for the content
            },
            style: {
                classes: 'qtip-dark'
            },
            position: {
                my: 'left center',
                at: 'right center',
                target: wplj(this)
            }
        });
    });
    wplj('.wpl-tooltip-bottom').each(function() {
        wplj(this).qtip({
            prerender: true,
            content: {
                text: wplj(this).next('div') // Use the "div" element next to this for the content
            },
            style: {
                classes: 'qtip-dark'
            },
            position: {
                my: 'top center',
                at: 'bottom center',
                target: wplj(this)
            }
        });
    });
    wplj('.wpl-tooltip-left').each(function() {
        wplj(this).qtip({
            prerender: true,
            content: {
                text: wplj(this).next('div') // Use the "div" element next to this for the content
            },
            style: {
                classes: 'qtip-dark'
            },
            position: {
                my: 'right center',
                at: 'left center',
                target: wplj(this)
            }
        });
    });

    if(wplj(window).width() < 992){
        wplj('.wpl-tooltip-top').qtip('disable');
    };

    wplj('.wpl-property-analytics-title').on('click',function(){
        if(wplj(this).parents('li').hasClass('expand'))
            wplj(this).parents('li').removeClass('expand').find('.wpl-property-analytics-content').toggle();
        else
            wplj(this).parents('li').addClass('expand').find('.wpl-property-analytics-content').toggle();
    });

    /*Image lazy loading*/
    if(wplj('.wpl_property_listing_container').hasClass('wpl-property-listing-mapview')){
        wplj(".wpl-property-listing-mapview .wpl_property_listing_listings_container .lazyimg").Lazy({
            appendScroll: wplj('.wpl-property-listing-mapview .wpl_property_listing_listings_container')
        });
    } else {
        wplj(".lazyimg").Lazy();
    }
});
wplj(window).on("load", function(){
    wpl_fix_no_image_size();
    wpl_map_buttons_toggle();
});
wplj(window).resize(function(){
    wpl_fix_no_image_size();
    wpl_prp_show_layout2()
});
/** after show default function (don't remove it) **/
function wpl_fancybox_afterShow_callback() {
}

function wpl_fix_no_image_size(){

    var baseImageSize = null;
    wplj(".wpl_prp_cont .wpl_prp_top_boxes.front .wpl_gallery_container img").promise().done(function () {
        if(!baseImageSize)
            baseImageSize = [wplj(this).width(), wplj(this).height()];
    });
    if(baseImageSize)
    {
        wplj(".no_image_box").css({
            width: baseImageSize[0],
            height: baseImageSize[1]
        });
    }
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

function wpl_show_messages(message, html_element, msg_class) {
    if (!msg_class)
        msg_class = 'wpl_gold_msg';
    if (!html_element)
        html_element = '.wpl_show_message';
    if (!message)
        return;
    wpl_show_messages_html_element = html_element;
    wplj(html_element).html(message);
    wplj(html_element).show();
    wplj(html_element).addClass(msg_class);
    if (wpl_show_messages_cur_class && wpl_show_messages_cur_class != msg_class)
        wplj(html_element).removeClass(wpl_show_messages_cur_class);
    wpl_show_messages_cur_class = msg_class;
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
    var inputElement = wplj("#" + field_id)[0];

    // Get the current cursor position
    var cursorPos = inputElement.selectionStart || 0;

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
    
    // Set the formatted value back to the input
    wplj("#" + field_id).val(x);

    // Set the cursor position back to the original position
    if (inputElement.setSelectionRange) {
        inputElement.setSelectionRange(cursorPos, cursorPos);
    } else if (inputElement.createTextRange) {
        var range = inputElement.createTextRange();
        range.collapse(true);
        range.moveEnd('character', cursorPos);
        range.moveStart('character', cursorPos);
        range.select();
    }
}

function wpl_de_thousand_sep(val) {
    return typeof val === 'string' ? val.replace(/,/g, "") : val;
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

function wpl_qs_apply(source_qs, apply_qs)
{
    if(apply_qs.substring(0, 1) == '?') apply_qs = apply_qs.substring(1);
    var key_value_vars = apply_qs.split('&');
    
    for(var i in key_value_vars){
        var key_value_var = key_value_vars[i].split('=');
        source_qs = wpl_update_qs(key_value_var[0], key_value_var[1], source_qs);
    }
    
    return source_qs;
}

function wpl_wizard_more_details_toggle(id)
{
    wplj("#wpl_more_details"+id).toggle();
}

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
    if(!wpl_did_googlemaps_callbacks)
    {
        // Load RichMarker into the page
        wplj('<script />', {type: 'text/javascript', src: _rta_baseUrl + 'wp-content/plugins/' + wpl_baseName + '/assets/js/libraries/wpl.richmarker.min.js'}).appendTo('head');
    }

    wpl_did_googlemaps_callbacks = true;
    if(typeof RichMarker === 'function')
    {
        for(i in wpl_googlemaps_callbacks)
        {
            wpl_googlemaps_callbacks[i]();
        }
    }
    else
    {
        setTimeout(function()
        {
            wpl_do_googlemaps_callbacks();
        }, 200);
    }
}

/**/
function wpl_prp_show_layout2()
{
    if((wplj(window).width() < "640"))
    {
        if(!wplj(".wpl_prp_show_layout2_container .wpl_prp_container_content_left").find(".wpl-prp-basic-info").length)
        {
            wplj(".wpl_prp_show_layout2_container .wpl_prp_container_content_left .wpl_prp_gallery").after(wplj(".wpl_prp_show_layout2_container .wpl-prp-basic-info"));
        }
    }
    else
    {
        if(wplj(".wpl_prp_show_layout2_container .wpl_prp_container_content_left").find(".wpl-prp-basic-info").length)
        {
            wplj(".wpl_prp_show_layout2_container .wpl_prp_container_content_right").prepend(wplj(".wpl_prp_show_layout2_container .wpl-prp-basic-info"));
        }
    }
}

function wpl_map_buttons_toggle() {
    if(wplj('.wpl_googlemap_container .wpl-map-add-ons div').length){
        wplj('.wpl_googlemap_container .wpl_map_canvas').append('<div class="wpl_map_addons_toggle"></div>');
        wplj('.wpl_map_addons_toggle').click(function () {
            wplj('.wpl_googlemap_container .wpl-map-add-ons').fadeToggle();
        });
    }
}