

/*
* Project: Bootstrap Notify = v3.1.3
* Description: Turns standard Bootstrap alerts into "Growl-like" notifications.
* Author: Mouse0270 aka Robert McIntosh
* License: MIT License
* Website: https://github.com/mouse0270/bootstrap-growl
*/
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {
	// Create the defaults once
	var defaults = {
			element: 'body',
			position: null,
			type: "info",
			allow_dismiss: true,
			newest_on_top: false,
			showProgressbar: false,
			placement: {
				from: "top",
				align: "right"
			},
			offset: 20,
			spacing: 10,
			z_index: 1031,
			delay: 5000,
			timer: 1000,
			url_target: '_blank',
			mouse_over: null,
			animate: {
				enter: 'animated slideUp2 ',
				exit: 'animated slideUp2 '
			},
			onShow: null,
			onShown: null,
			onClose: null,
			onClosed: null,
			icon_type: 'class',
			template: '<div data-notify="container" class="col-xs-11 col-sm-4 alert alert-{0}" role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss">&times;</button><span data-notify="icon"></span> <span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>'
		};

	String.format = function() {
		var str = arguments[0];
		for (var i = 1; i < arguments.length; i++) {
			str = str.replace(RegExp("\\{" + (i - 1) + "\\}", "gm"), arguments[i]);
		}
		return str;
	};

	function Notify ( element, content, options ) {
		// Setup Content of Notify
		var content = {
			content: {
				message: typeof content == 'object' ? content.message : content,
				title: content.title ? content.title : '',
				icon: content.icon ? content.icon : '',
				url: content.url ? content.url : '#',
				target: content.target ? content.target : '-'
			}
		};

		options = $.extend(true, {}, content, options);
		this.settings = $.extend(true, {}, defaults, options);
		this._defaults = defaults;
		if (this.settings.content.target == "-") {
			this.settings.content.target = this.settings.url_target;
		}
		this.animations = {
			start: 'webkitAnimationStart oanimationstart MSAnimationStart animationstart',
			end: 'webkitAnimationEnd oanimationend MSAnimationEnd animationend'
		}

		if (typeof this.settings.offset == 'number') {
		    this.settings.offset = {
		    	x: this.settings.offset,
		    	y: this.settings.offset
		    };
		}

		this.init();
	};

	$.extend(Notify.prototype, {
		init: function () {
			var self = this;

			this.buildNotify();
			if (this.settings.content.icon) {
				this.setIcon();
			}
			if (this.settings.content.url != "#") {
				this.styleURL();
			}
			this.styleDismiss();
			this.placement();
			this.bind();

			this.notify = {
				$ele: this.$ele,
				update: function(command, update) {
					var commands = {};
					if (typeof command == "string") {
						commands[command] = update;
					}else{
						commands = command;
					}
					for (var command in commands) {
						switch (command) {
							case "type":
								this.$ele.removeClass('alert-' + self.settings.type);
								this.$ele.find('[data-notify="progressbar"] > .progress-bar').removeClass('progress-bar-' + self.settings.type);
								self.settings.type = commands[command];
								this.$ele.addClass('alert-' + commands[command]).find('[data-notify="progressbar"] > .progress-bar').addClass('progress-bar-' + commands[command]);
								break;
							case "icon":
								var $icon = this.$ele.find('[data-notify="icon"]');
								if (self.settings.icon_type.toLowerCase() == 'class') {
									$icon.removeClass(self.settings.content.icon).addClass(commands[command]);
								}else{
									if (!$icon.is('img')) {
										$icon.find('img');
									}
									$icon.attr('src', commands[command]);
								}
								break;
							case "progress":
								var newDelay = self.settings.delay - (self.settings.delay * (commands[command] / 100));
								this.$ele.data('notify-delay', newDelay);
								this.$ele.find('[data-notify="progressbar"] > div').attr('aria-valuenow', commands[command]).css('width', commands[command] + '%');
								break;
							case "url":
								this.$ele.find('[data-notify="url"]').attr('href', commands[command]);
								break;
							case "target":
								this.$ele.find('[data-notify="url"]').attr('target', commands[command]);
								break;
							default:
								this.$ele.find('[data-notify="' + command +'"]').html(commands[command]);
						};
					}
					var posX = this.$ele.outerHeight() + parseInt(self.settings.spacing) + parseInt(self.settings.offset.y);
					self.reposition(posX);
				},
				close: function() {
					self.close();
				}
			};
		},
		buildNotify: function () {
			var content = this.settings.content;
			this.$ele = $(String.format(this.settings.template, this.settings.type, content.title, content.message, content.url, content.target));
			this.$ele.attr('data-notify-position', this.settings.placement.from + '-' + this.settings.placement.align);
			if (!this.settings.allow_dismiss) {
				this.$ele.find('[data-notify="dismiss"]').css('display', 'none');
			}
			if ((this.settings.delay <= 0 && !this.settings.showProgressbar) || !this.settings.showProgressbar) {
				this.$ele.find('[data-notify="progressbar"]').remove();
			}
		},
		setIcon: function() {
			if (this.settings.icon_type.toLowerCase() == 'class') {
				this.$ele.find('[data-notify="icon"]').addClass(this.settings.content.icon);
			}else{
				if (this.$ele.find('[data-notify="icon"]').is('img')) {
					this.$ele.find('[data-notify="icon"]').attr('src', this.settings.content.icon);
				}else{
					this.$ele.find('[data-notify="icon"]').append('<img src="'+this.settings.content.icon+'" alt="Notify Icon" />');
				}
			}
		},
		styleDismiss: function() {
			this.$ele.find('[data-notify="dismiss"]').css({
				position: 'absolute',
				right: '10px',
				top: '5px',
				zIndex: this.settings.z_index + 2
			});
		},
		styleURL: function() {
			this.$ele.find('[data-notify="url"]').css({
				backgroundImage: 'url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)',
				height: '100%',
				left: '0px',
				position: 'absolute',
				top: '0px',
				width: '100%',
				zIndex: this.settings.z_index + 1
			});
		},
		placement: function() {
			var self = this,
				offsetAmt = this.settings.offset.y,
				css = {
					display: 'inline-block',
					margin: '0px auto',
					position: this.settings.position ?  this.settings.position : (this.settings.element === 'body' ? 'fixed' : 'absolute'),
					transition: 'all .5s ease-in-out',
					zIndex: this.settings.z_index
				},
				hasAnimation = false,
				settings = this.settings;

			$('[data-notify-position="' + this.settings.placement.from + '-' + this.settings.placement.align + '"]:not([data-closing="true"])').each(function() {
				return offsetAmt = Math.max(offsetAmt, parseInt($(this).css(settings.placement.from)) +  parseInt($(this).outerHeight()) +  parseInt(settings.spacing));
			});
			if (this.settings.newest_on_top == true) {
				offsetAmt = this.settings.offset.y;
			}
			css[this.settings.placement.from] = offsetAmt+'px';

			switch (this.settings.placement.align) {
				case "left":
				case "right":
					css[this.settings.placement.align] = this.settings.offset.x+'px';
					break;
				case "center":
					css.left = 0;
					css.right = 0;
					break;
			}
			this.$ele.css(css).addClass(this.settings.animate.enter);
			$.each(Array('webkit-', 'moz-', 'o-', 'ms-', ''), function(index, prefix) {
				self.$ele[0].style[prefix+'AnimationIterationCount'] = 1;
			});

			$(this.settings.element).append(this.$ele);

			if (this.settings.newest_on_top == true) {
				offsetAmt = (parseInt(offsetAmt)+parseInt(this.settings.spacing)) + this.$ele.outerHeight();
				this.reposition(offsetAmt);
			}

			if ($.isFunction(self.settings.onShow)) {
				self.settings.onShow.call(this.$ele);
			}

			this.$ele.one(this.animations.start, function(event) {
				hasAnimation = true;
			}).one(this.animations.end, function(event) {
				if ($.isFunction(self.settings.onShown)) {
					self.settings.onShown.call(this);
				}
			});

			setTimeout(function() {
				if (!hasAnimation) {
					if ($.isFunction(self.settings.onShown)) {
						self.settings.onShown.call(this);
					}
				}
			}, 600);
		},
		bind: function() {
			var self = this;

			this.$ele.find('[data-notify="dismiss"]').on('click', function() {
				self.close();
			})

			this.$ele.mouseover(function(e) {
				$(this).data('data-hover', "true");
			}).mouseout(function(e) {
				$(this).data('data-hover', "false");
			});
			this.$ele.data('data-hover', "false");

			if (this.settings.delay > 0) {
				self.$ele.data('notify-delay', self.settings.delay);
				var timer = setInterval(function() {
					var delay = parseInt(self.$ele.data('notify-delay')) - self.settings.timer;
					if ((self.$ele.data('data-hover') === 'false' && self.settings.mouse_over == "pause") || self.settings.mouse_over != "pause") {
						var percent = ((self.settings.delay - delay) / self.settings.delay) * 100;
						self.$ele.data('notify-delay', delay);
						self.$ele.find('[data-notify="progressbar"] > div').attr('aria-valuenow', percent).css('width', percent + '%');
					}
					if (delay <= -(self.settings.timer)) {
						clearInterval(timer);
						self.close();
					}
				}, self.settings.timer);
			}
		},
		close: function() {
			var self = this,
				$successors = null,
				posX = parseInt(this.$ele.css(this.settings.placement.from)),
				hasAnimation = false;

			this.$ele.data('closing', 'true').addClass(this.settings.animate.exit);
			self.reposition(posX);

			if ($.isFunction(self.settings.onClose)) {
				self.settings.onClose.call(this.$ele);
			}

			this.$ele.one(this.animations.start, function(event) {
				hasAnimation = true;
			}).one(this.animations.end, function(event) {
				$(this).remove();
				if ($.isFunction(self.settings.onClosed)) {
					self.settings.onClosed.call(this);
				}
			});

			setTimeout(function() {
				if (!hasAnimation) {
					self.$ele.remove();
					if (self.settings.onClosed) {
						self.settings.onClosed(self.$ele);
					}
				}
			}, 600);
		},
		reposition: function(posX) {
			var self = this,
				notifies = '[data-notify-position="' + this.settings.placement.from + '-' + this.settings.placement.align + '"]:not([data-closing="true"])',
				$elements = this.$ele.nextAll(notifies);
			if (this.settings.newest_on_top == true) {
				$elements = this.$ele.prevAll(notifies);
			}
			$elements.each(function() {
				$(this).css(self.settings.placement.from, posX);
				posX = (parseInt(posX)+parseInt(self.settings.spacing)) + $(this).outerHeight();
			});
		}
	});

	$.notify = function ( content, options ) {
		var plugin = new Notify( this, content, options );
		return plugin.notify;
	};
	$.notifyDefaults = function( options ) {
		defaults = $.extend(true, {}, defaults, options);
		return defaults;
	};
	$.notifyClose = function( command ) {
		if (typeof command === "undefined" || command == "all") {
			$('[data-notify]').find('[data-notify="dismiss"]').trigger('click');
		}else{
			$('[data-notify-position="'+command+'"]').find('[data-notify="dismiss"]').trigger('click');
		}
	};

}));


/*jslint browser: true*/
/*jslint jquery: true*/

/*
 * jQuery Hotkeys Plugin
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Based upon the plugin by Tzury Bar Yochay:
 * https://github.com/tzuryby/jquery.hotkeys
 *
 * Original idea by:
 * Binny V A, http://www.openjs.com/scripts/events/keyboard_shortcuts/
 */

/*
 * One small change is: now keys are passed by object { keys: '...' }
 * Might be useful, when you want to pass some other data to your handler
 */

(function(jQuery) {

    jQuery.hotkeys = {
      version: "0.2.0",
  
      specialKeys: {
        8: "backspace",
        9: "tab",
        10: "return",
        13: "return",
        16: "shift",
        17: "ctrl",
        18: "alt",
        19: "pause",
        20: "capslock",
        27: "esc",
        32: "space",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        45: "insert",
        46: "del",
        59: ";",
        61: "=",
        96: "0",
        97: "1",
        98: "2",
        99: "3",
        100: "4",
        101: "5",
        102: "6",
        103: "7",
        104: "8",
        105: "9",
        106: "*",
        107: "+",
        109: "-",
        110: ".",
        111: "/",
        112: "f1",
        113: "f2",
        114: "f3",
        115: "f4",
        116: "f5",
        117: "f6",
        118: "f7",
        119: "f8",
        120: "f9",
        121: "f10",
        122: "f11",
        123: "f12",
        144: "numlock",
        145: "scroll",
        173: "-",
        186: ";",
        187: "=",
        188: ",",
        189: "-",
        190: ".",
        191: "/",
        192: "`",
        219: "[",
        220: "\\",
        221: "]",
        222: "'"
      },
  
      shiftNums: {
        "`": "~",
        "1": "!",
        "2": "@",
        "3": "#",
        "4": "$",
        "5": "%",
        "6": "^",
        "7": "&",
        "8": "*",
        "9": "(",
        "0": ")",
        "-": "_",
        "=": "+",
        ";": ": ",
        "'": "\"",
        ",": "<",
        ".": ">",
        "/": "?",
        "\\": "|"
      },
  
      // excludes: button, checkbox, file, hidden, image, password, radio, reset, search, submit, url
      textAcceptingInputTypes: [
        "text", "password", "number", "email", "url", "range", "date", "month", "week", "time", "datetime",
        "datetime-local", "search", "color", "tel"],
  
      // default input types not to bind to unless bound directly
      textInputTypes: /textarea|input|select/i,
  
      options: {
        filterInputAcceptingElements: true,
        filterTextInputs: true,
        filterContentEditable: true
      }
    };
  
    function keyHandler(handleObj) {
      if (typeof handleObj.data === "string") {
        handleObj.data = {
          keys: handleObj.data
        };
      }
  
      // Only care when a possible input has been specified
      if (!handleObj.data || !handleObj.data.keys || typeof handleObj.data.keys !== "string") {
        return;
      }
  
      var origHandler = handleObj.handler,
        keys = handleObj.data.keys.toLowerCase().split(" ");
  
      handleObj.handler = function(event) {
        //      Don't fire in text-accepting inputs that we didn't directly bind to
        if (this !== event.target &&
          (jQuery.hotkeys.options.filterInputAcceptingElements &&
            jQuery.hotkeys.textInputTypes.test(event.target.nodeName) ||
            (jQuery.hotkeys.options.filterContentEditable && jQuery(event.target).attr('contenteditable')) ||
            (jQuery.hotkeys.options.filterTextInputs &&
              jQuery.inArray(event.target.type, jQuery.hotkeys.textAcceptingInputTypes) > -1))) {
          return;
        }
  
        var special = event.type !== "keypress" && jQuery.hotkeys.specialKeys[event.which],
          character = String.fromCharCode(event.which).toLowerCase(),
          modif = "",
          possible = {};
  
        jQuery.each(["alt", "ctrl", "shift"], function(index, specialKey) {
  
          if (event[specialKey + 'Key'] && special !== specialKey) {
            modif += specialKey + '+';
          }
        });
  
        // metaKey is triggered off ctrlKey erronously
        if (event.metaKey && !event.ctrlKey && special !== "meta") {
          modif += "meta+";
        }
  
        if (event.metaKey && special !== "meta" && modif.indexOf("alt+ctrl+shift+") > -1) {
          modif = modif.replace("alt+ctrl+shift+", "hyper+");
        }
  
        if (special) {
          possible[modif + special] = true;
        }
        else {
          possible[modif + character] = true;
          possible[modif + jQuery.hotkeys.shiftNums[character]] = true;
  
          // "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
          if (modif === "shift+") {
            possible[jQuery.hotkeys.shiftNums[character]] = true;
          }
        }
  
        for (var i = 0, l = keys.length; i < l; i++) {
          if (possible[keys[i]]) {
            return origHandler.apply(this, arguments);
          }
        }
      };
    }
  
    jQuery.each(["keydown", "keyup", "keypress"], function() {
      jQuery.event.special[this] = {
        add: keyHandler
      };
    });
  
  })(jQuery || this.jQuery || window.jQuery);

//XXXX Extra Functions
  var win = {
    id: "#window",
    shown: false,
    show: (title, text) => {
        $('#wt').html(title);
        $('#wc').html(text);
        $(win.id).addClass('shown');
        win.shown = true;
        console.log(win);
    },
    showGet: (title, URL, callback) => {
        $('#wt').html(title);
        axios.get(URL)
            .then((res) => {
                $('#wc').html(res.data);
                $(win.id).addClass('shown');
                win.shown = true;
                if (callback != undefined) {
                    callback();
                }
            });

        console.log(win);
    },
    showPost: (title, URL, data, callback) => {
        $('#wt').html(title);
        axios.post(URL, data)
            .then((res) => {
                $('#wc').html(res.data);
                $(win.id).addClass('shown');
                win.shown = true;
                if (callback != undefined) {
                    callback();
                }
            });

        console.log(win);
    },
    hide: () => {
        $('#wc').html("");
        $(win.id).removeClass('shown');
        win.shown = false;
        console.log(win);
    }
};

function showNotification(a,t,n,e,s,i){(null===a||""===a)&&(a="bg-black"),(null===t||""===t)&&(t="Turning standard Bootstrap alerts"),(null===s||""===s)&&(s="animated fadeInDown"),(null===i||""===i)&&(i="animated fadeOutUp"),$.notify({message:t},{type:a,allow_dismiss:!0,newest_on_top:!0,timer:500,placement:{from:n,align:e},animate:{enter:s,exit:i},template:'<div data-notify="container" class="bootstrap-notify-container alert alert-dismissible {0} " role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss">\xd7</button><span data-notify="icon"></span> <span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>'})}

  
  function errAlert($err, $msg = "") {
	hideProgress();
	$msg += " " + ($err.response ? $err.response.data.message : 'Please Try again');
	showNotification('bg-danger', $msg)
	lock=false;
}

function successAlert($msg) {
	hideProgress();
	showNotification('bg-success', $msg);
	lock=false;
}

function yes(msg = '') {
	if (msg == '') {
		msg = 'Enter yes to continue';
	}
	return prompt(msg) == 'yes';
}

//XXX table management
var tablecount=0;
    
function initTableSearch(sid,id,data=[]){
    tablecount+=1;
    elements=document.querySelectorAll("#"+id +" tr");
    console.log(elements);
    console.log(data);
    $("#"+sid).keyup(function(){
        parameter=$('#'+sid).val().toLowerCase();
        console.log(parameter);
        elements=document.querySelectorAll("#"+id +" tr");
        elements.forEach(element => {
            done=false;
            data.forEach(d => {
                s_para=(""+$(element).data(d)+"").toLowerCase();
                if(!done){
                    if(s_para.includes(parameter)){
                        $(element).show();
                        done=true;
                    }else{
                        $(element).hide();
                    }
                }
            });
        });
    });
    
}

//XXX Form Management 

const formDataToJSON = (f) => {
	var object = {};
	f.forEach(function(value, key) {
		object[key] = value;
	});
	// var json = JSON.stringify(object);
	return object;

};


//XXX language codes
const npNUM = (selectors) => {
	const replaceMap = [
		["1", '१'],
		["2", '२'],
		["3", '३'],
		["4", '४'],
		["5", '५'],
		["6", '६'],
		["7", '७'],
		["8", '८'],
		["9", '९'],
		["0", '०'],

	];

	$(selectors).each(function(index, ele) {
		replaceMap.forEach(m => {
			ele.innerHTML = ele.innerHTML.replaceAll(m[0], m[1]);
		});
	});
}

const npNUM1 = (selectors) => {
	const replaceMap = [
		["1", '१'],
		["2", '२'],
		["3", '३'],
		["4", '४'],
		["5", '५'],
		["6", '६'],
		["7", '७'],
		["8", '८'],
		["9", '९'],
		["0", '०'],
	];

	const regex = new RegExp(replaceMap.map(([num]) => num).join("|"), "g");

	$(selectors).each(function(index, ele) {
		ele.innerHTML = ele.innerHTML.replace(regex, (match) => {
			const replacement = replaceMap.find(([num]) => num === match);
			return replacement ? replacement[1] : match;
		});
	});
};

const tonpNUM=(num)=>{
	num= `${num}`;
	const replaceMap = [
		["1", '१'],
		["2", '२'],
		["3", '३'],
		["4", '४'],
		["5", '५'],
		["6", '६'],
		["7", '७'],
		["8", '८'],
		["9", '९'],
		["0", '०'],
	];

	const regex = new RegExp(replaceMap.map(([num]) => num).join("|"), "g");

	return num.replace(regex, (match) => {
			const replacement = replaceMap.find(([num]) => num === match);
			return replacement ? replacement[1] : match;
	});
}

//xxx xpay js
const xpayCustomData = [];
var xpayHandle;
var expayHandle;
var xpayLoad = false;

function xpayMethodChange(ele) {
    if (ele.value == 2) {
        $('#xpay_bank_holder').show();
        $('#xpay_custom_holder').hide();
    } else if (ele.value == 3) {
        $('#xpay_bank_holder').hide();
        $('#xpay_custom_holder').show();
    } else {
        $('#xpay_bank_holder').hide();
        $('#xpay_custom_holder').hide();
    }
}

function addXpayData() {

}

function xpayCustomBank(ele, id) {
    const amount = parseFloat(ele.value);

    if (isNaN(amount) || amount == 0) {
        if (exists('#xpay_custom_bank_' + id)) {
            $('#xpay_custom_bank_amount_' + id).remove();
            $('#xpay_custom_bank_' + id).remove();
        }
    } else {
        if (!exists('#xpay_custom_bank_' + id)) {
            const ele = `<input type="hidden" class="xpay_custom_bank" name="xpay_custom_bank[]" id="xpay_custom_bank_${id}" value="${id}">
                <input type="hidden" class="xpay_custom_bank_amount" name="xpay_custom_bank_amount_${id}" id="xpay_custom_bank_amount_${id}" value="${id}" value="${amount}">
                 `;
            $('#xpay_custom_banks_holder').append(ele);
        } else {
            $('#xpay_custom_bank_amount_' + id).val(amount).change();
        }
    }
}


function resetXPayment() {
    $('#xpay_amount').val(0);
    $('.xpay_custom_input').val('').change();
    $('#xpay_custom_banks_holder').html('');
    $('#xpay_method').val(1).change();
    // xpayMethodChange( $('#xpay_method')[0]);
}

function xpayHandleChange() {
    // console.log(xpayHandle.value);
    $('#xpay_amount').val(xpayHandle.value);

}

function expayHandleChange() {
    // console.log(expayHandle.value);
    $('#expay_amount').val(expayHandle.value);
    if ($('.expay_ledger_amount').length == 1) {
        $('.expay_ledger_amount').val(expayHandle.value);
    }
}

function addEXPayHandle() {
    if (exists('.expay_handle')) {
        // console.log('epayhadle loaded');
        expayHandle = $('.expay_handle')[0];
        $('#expay_amount').val(expayHandle.value);

        expayHandle.addEventListener('change', expayHandleChange, true);
        expayHandle.addEventListener('input', expayHandleChange, true);
    }
}

function addXPayHandle() {
    if (exists('#xpay')) {
        // console.log('xpay loaded');
        if (exists('.xpay_handle')) {
            // console.log('xpay handle loaded');

            xpayHandle = $('.xpay_handle')[0];
            $('#xpay_amount').val(xpayHandle.value);
            xpayHandle.addEventListener('change', xpayHandleChange, true);
            xpayHandle.addEventListener('input', xpayHandleChange, true);
        }

    }

    if (exists('.expay_handle')) {
        expayHandle = $('.expay_handle')[0];
        $('#expay_amount').val(expayHandle.value);
        expayHandle.addEventListener('change', expayHandleChange, true);
        expayHandle.addEventListener('input', expayHandleChange, true);
    }
}

function xpayVerifyData() {
    if (exists('#xpay')) {
        const method = $('#xpay_method').val();
        const amount = $('#xpay_amount').val();
        let totalamt = 0;
        const cashamt = parseFloat($('#xpay_custom_cash').val());
        if (!isNaN(cashamt)) {
            totalamt += cashamt;
        }

        if (method == 3) {
            $('.xpay_custom_bank_amount').each(function (index, element) {
                const localamt = parseFloat(element.value);
                if (!isNaN(localamt)) {
                    totalamt += localamt;
                }
            });
            if (amount == totalamt) {
                return true;
            } else {
                alert('Amount not matching');
                return false;
            }
        }

        return true;

    } else {
        return true;
    }
}

function expayVerifyData() {
    if (exists('#expay_method')) {
        const amount = $('#expay_amount').val();
        let totalamt = 0;
        const cashamt = parseFloat($('#expay_custom_cash').val());
        $('.expay_ledger_amount').each(function (index, element) {
            const localamt = parseFloat(element.value);
            if (!isNaN(localamt)) {
                totalamt += localamt;
            }
        });

        if (amount == totalamt) {
            return true;
        } else {
            alert('Amount not matching');
            return false;
        }


    } else {
        return true;
    }
}

function loadXPay(data) {
    if (exists('#xpay_amount')) {

        data.xpay_amount = $('#xpay_amount').val();
        data.xpay_method = $('#xpay_method').val();
        data.xpay = $('#xpay').val();
        data.xpay_bank = $('#xpay_bank').val();
        if (data.xpay_method == 3) {
            data.xpay_custom_bank = [];
            $('.xpay_custom_bank').each(function (index, element) {
                const bank_id = $(element).val();
                data.xpay_custom_bank.push(bank_id);
                data['xpay_custom_bank_amount_' + bank_id] = $('#xpay_custom_bank_amount_' + bank_id).val();
                data.xpay_custom_cash = $('#xpay_custom_cash').val();
            });
        }
    }
    return data;
}

function loadEXPay(data) {
    data.xpay_ledger_ids = [];
    $('input[name="xpay_ledger_ids[]"]').each(function (index, element) {
        const id = parseInt(element.value) || -1;
        if (id != -1) {
            data.xpay_ledger_ids.push(id);
            const amount = parseFloat($('#xpay_ledger_' + id).val()) || 0;
            data['xpay_ledger_' + id] = amount;
        }
    });
    return data;
}


function loadXPayEdit(id, identifire) {
    $('#expay_edit').html("No Payment Info");
    let url = xpayEditURL.replace('xxx_id', id);
    url = url.replace('xxx_identifire', identifire);
    axios.get(url)
        .then((res) => {
            $('#expay_edit').html(res.data);
        })
        .catch((err) => {

        });
}
window.addEventListener('load', addXPayHandle, true);
//end xpayjs
window.onload = function () {
	const winSTR=`<div class="window " id="window">
        <div class="inner-window">
            <div class="top-bar">
                <span id="wt">

                </span>
                <span id="wcc" onclick="win.hide()">
                    close
                </span>
            </div>
            <div class="content" id="wc">

            </div>
        </div>
    </div>`;
	document.querySelector('#placeholder').appendChild(winSTR);
};