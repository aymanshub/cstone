/**
 * Yousold - content slider
 * @version		1.0.0
 * @MooTools version 1.3+
 * @Copyright Youjoomla LLC
 * @author	Constantin Boiangiu <info [at] constantinb.com>
 */
var Yousold = new Class({
    Implements: [Options],
    options: {
        outerContainer: null,
        innerContainer: null,
        elements: null,
        navigation: {
            forward: null,
            back: null,
            container: null,
            elements: null,
            outer: null,
            visibleItems: 0
        },
        slideType: 0,
        orientation: 1,
        slideTime: 3000,
        duration: 600,
        tooltips: 0,
        autoslide: 1,
        navInfo: null,
        navLinks: null,
        startElem: 0
    },
    initialize: function (options) {
        this.setOptions(options);
        this.navElements = $(this.options.navigation.container).getElements(this.options.navigation.elements);
        this.navScroll = new Fx.Scroll(this.options.navigation.outer, {
            link: 'cancel',
            duration: 800,
            transition: Fx.Transitions.Quad.easeInOut
        });
        this.correction = Math.round(this.options.navigation.visibleItems / 2.00001);
        this.start()
    },
    start: function () {
        this.currentElement = this.options.startElem;
        this.slideTypes = this.options.slideType;
        this.autoSlides = this.options.autoslide;
        this.direction = 1; // -1: back; 1:forward
        this.elements = $(this.options.innerContainer).getElements(this.options.elements);
        this.showEffect = {};
        this.hideEffect = {};
        this.firstRun = {};
        var getlink = this.elements[this.currentElement].getElement('.yousold_image_link').getProperty('href');
        var gettitle = this.elements[this.currentElement].getElement('.yousold_image').getProperty('alt');
        $('title_container').set('html', '<a href=" ' + getlink + ' "> ' + gettitle + '</a>');
        var zoomimage = this.elements[this.currentElement].getElement('.yousold_image').set('morph', {
            duration: 80000,
            transition: Fx.Transitions.Sine.easeOut,
            link: 'cancel'
        });
        if (this.slideTypes == 4) {
            zoomimage.morph({
                'width': [this.elements[this.currentElement].getSize().x, this.elements[this.currentElement].getSize().x + 300]
            });
        }
        var getel = this.elements[this.currentElement].getElement('.loadbar_in');
        var loadbar = new Fx.Morph(getel, {
            duration: this.options.slideTime,
            transition: Fx.Transitions.Sine.easeOut,
            link: 'cancel'
        });
        if (this.autoSlides == 1) {
            loadbar.start({
                'width': [0, this.elements[this.currentElement].getSize().x]
            });
        }
        var getwidth = this.elements[this.currentElement].getElement('.yousold_image');
        if (this.slideTypes == 4) {
            this.elements[this.currentElement].addEvents({
                mouseenter: function (event) {
                    zoomimage.morph({
                        'width': this.getSize().x
                    });
                },
                mouseleave: function (event) {
                    zoomimage.morph({
                        'width': [getwidth.getSize().x, getwidth.getSize().x + 300]
                    });
                }
            });
        }
        if (this.autoSlides == 1) {
            this.elements[this.currentElement].addEvents({
                mouseenter: function (event) {
                    loadbar.cancel();
                },
                mouseleave: function (event) {
                    loadbar.start({
                        'width': [0, getwidth.getSize().x]
                    });
                }
            });
        }
        if (this.options.slideType == 1 || this.options.slideType == 2 || this.options.slideType == 3) {
            if (this.options.orientation == 1) {
                this.showEffect.left = [1200, 0];
                this.hideEffect.left = [0, 1200];
                this.firstRun.left = 1200;
            } else {
                this.showEffect.top = [400, 0];
                this.hideEffect.top = [0, 400];
                this.firstRun.top = 400;
            }
        }
        if (this.options.slideType !== 1 || this.options.slideType == 4) {
            this.showEffect.opacity = [0, 1];
            this.hideEffect.opacity = [1, 0];
            this.firstRun.opacity = 0;
        }
        /* slides */
        this.elements.each(function (el, i) {
            el.setStyles({
                'display': 'block',
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'z-index': (100 - i)
            });
            if (this.options.slideType !== 1 && i !== this.currentElement) {
                el.setStyle('opacity', 0);
            }
            this.elements[i]['fx'] = new Fx.Morph(el, {
                link: 'cancel',
                duration: this.options.duration
            });
            this.elements[i]['fx'].start(this.startZoom);
            if (i !== this.currentElement) this.elements[i]['fx'].set(this.firstRun);
            el.addEvent('mouseenter', function (event) {
                $clear(this.period);
                //this.elements[i]['fx2'].cancel();
            }.bind(this));
            el.addEvent('mouseleave', function (event) {
                //this.elements[i]['fx2'].start(this.continueZoom);
                if (this.options.autoslide == 1) {
                    this.resetAutoslide();
                }
            }.bind(this));
        }.bind(this));
        /* autoslide on command */
        if (this.options.autoslide == 1) {
            this.period = this.rotateSlides.periodical(this.options.slideTime, this);
        }
        /* add navigation */
        this.setNavigation();
        if (this.options.navLinks) {
            this.secondNavigation();
            $(this.options.navigation.container).addEvent('mousewheel', function (event) {
                event = new Event(event);
                event.stop();
                var dir = event.wheel > 0 ? 1 : -1;
                var el = this.currentElement - dir;
                //var el = this.currentElement-event.wheel;
                if (event.wheel > 0 && el < 0) el = this.navElements.length - 1;
                if (event.wheel < 0 && el > this.navElements.length - 1) el = 0;
                if (this.options.autoslide == 1) {
                    $clear(this.period);
                    this.resetAutoslide();
                }
                this.nextSlide(el);
                if (this.options.slideType == 4) {
                    this.doZoom(el);
                }
                if (this.options.autoslide == 1) {
                    this.Loadbar(el);
                }
            }.bind(this));
        }
    },
    rotateSlides: function () {
        var next = this.currentElement + this.direction;
        if (next < 0) next = this.elements.length - 1;
        if (next > this.elements.length - 1) next = 0;
        this.nextSlide(next);
        if (this.options.slideType == 4) {
            this.doZoom(next);
        }
        if (this.options.autoslide == 1) {
            this.Loadbar(next);
        }
    },
    placeLink: function () {
        var getlink = this.elements[this.currentElement].getElement('.yousold_image_link').getProperty('href');
        var gettitle = this.elements[this.currentElement].getElement('.yousold_image').getProperty('alt');
        $('title_container').set('html', '<a href=" ' + getlink + ' "> ' + gettitle + '</a>');
    },
    nextSlide: function (slide) {
        if (slide == this.currentElement) return;
        this.elements[this.currentElement].setStyle('z-index', '50');
        this.elements[this.currentElement]['fx'].start(this.hideEffect);
        this.elements[slide].setStyle('z-index', '100');
        this.elements[slide]['fx'].start(this.showEffect);
        this.currentElement = slide;
        this.placeLink();
        if ($(this.options.navInfo)) {
            $(this.options.navInfo).setHTML('Link ' + (slide + 1) + ' of ' + this.elements.length);
        }
        if ($defined(this.navElements)) {
            this.navElements.removeClass('selected');
            this.navElements[slide].addClass('selected');
            /* slide to element */
            var navTo = slide - this.correction < 0 ? 0 : slide - this.correction;
            if (navTo + this.correction >= this.navElements.length - this.correction) navTo = (this.navElements.length - 1) - this.correction * 2;
        }
    },
    doZoom: function (zoomin) {
        var getwidth = this.elements[this.currentElement].getElement('.yousold_image');
        var zoomimage = this.elements[this.currentElement].getElement('.yousold_image').set('morph', {
            duration: 80000,
            transition: Fx.Transitions.Sine.easeOut,
            link: 'cancel'
        });
        if (zoomin == this.currentElement) {
            zoomimage.morph({
                'width': [this.elements[this.currentElement].getSize().x, this.elements[this.currentElement].getSize().x + 300]
            });
        }
        this.elements[this.currentElement].addEvents({
            mouseenter: function (event) {
                zoomimage.morph({
                    'width': this.getSize().x
                });
            },
            mouseleave: function (event) {
                zoomimage.morph({
                    'width': [getwidth.getSize().x, getwidth.getSize().x + 300]
                });
            }
        });
    },
    Loadbar: function (loadit) {
        var getwidth = this.elements[this.currentElement];
        var getel = this.elements[this.currentElement].getElement('.loadbar_in');
        //var loadbar = this.elements[this.currentElement].getElement('.loadbar_in').set('morph', {
        var loadbar = new Fx.Morph(getel, {
            duration: this.options.slideTime,
            transition: Fx.Transitions.Sine.easeOut,
            link: 'cancel'
        });
        if (loadit == this.currentElement) {
            loadbar.start({
                'width': [0, this.elements[this.currentElement].getSize().x]
            });
        }
        this.elements[this.currentElement].addEvents({
            mouseenter: function (event) {
                loadbar.cancel();
            },
            mouseleave: function (event) {
                loadbar.start({
                    'width': [0, this.getSize().x]
                });
            }
        });
        this.navElements.each(function (el, i) {
            el.addEvent('click', function (event) {
                loadbar.start({
                    'width': [0, getwidth.getSize().x]
                });
            });
        });
    },
    setNavigation: function () {
        if (!$(this.options.navigation.forward)) return;
        $(this.options.navigation.forward).addEvent('click', function (event) {
            new Event(event).stop();
            this.direction = 1;
            if (this.options.autoslide == 1) {
                this.resetAutoslide();
                this.resetZoom();
            }
        }.bind(this));
        $(this.options.navigation.back).addEvent('click', function (event) {
            new Event(event).stop();
            this.direction = -1;
            if (this.options.autoslide == 1) {
                this.resetAutoslide();
                this.resetZoom();
            }
        }.bind(this));
    },
    resetAutoslide: function () {
        $clear(this.period);
        this.period = this.rotateSlides.periodical(this.options.slideTime, this);
    },
    secondNavigation: function () {
        this.navElements = $$(this.options.navLinks);
        this.navElements.each(function (el, i) {
            if (i == this.currentElement) {
                el.addClass('selected');
            }
            el.addEvent('click', function (event) {
                new Event(event).stop();
                if (this.options.autoslide == 1) {
                    this.resetAutoslide();
                }
                this.nextSlide(i);
                if (this.options.slideType == 4) {
                    this.doZoom(i);
                }
                if (this.options.autoslide == 1) {
                    this.Loadbar(i);
                }
            }.bind(this));
        }.bind(this));
    }
});