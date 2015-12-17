/**
 * Responsive Media Player
 *
 * @author Dani Perches
 *
 * jQuery based plugin that generates a functional responsive media player.
 * Generates the HTML structure dynamically and provides full jQuery functionality.
 */
(function ($) {

    if (!$.DaniPerches) {
        $.DaniPerches = {};
    }

    /**
     * Function called when the plugin is invoked
     * @param el: string with query value for jquery  [..]
     * @param getData
     * @param options
     * @constructor
     */
    $.DaniPerches.VideoPlayer = function (el, getData, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        // Add a reverse reference to the DOM object
        base.$el.data("DaniPerches.VideoPlayer", base);
        base.init = function () {
            base.getData = getData;
            base.options = $.extend({}, $.DaniPerches.VideoPlayer.defaultOptions, options);
            base.render();
            base.initPlayer();
            base.addListeners();
            base.renderScenes();
        };

        /**
         * Initialize player components
         */
        base.initPlayer = function () {
            base.player = base.$el.find(".myPlayer").get(0);
            base.btnPlay = base.$el.find("#btnPlay").get(0);
            base.btnStop = base.$el.find("#btnStop").get(0);
            base.btnBackward = base.$el.find("#btnBackward").get(0);
            base.btnForward = base.$el.find("#btnForward").get(0);
            base.volumeBar = base.$el.find("#volumeBar").get(0);
            base.btnFullscreen = base.$el.find("#btnFullscreen").get(0);
            base.progressBar = base.$el.find("#progressBar").get(0);
            base.videoControls = base.$el.find("#video-controls").get(0);
        };

        /**
         * Render final HTML
         */
        base.render = function () {
            if (base.options.enableControls) {
                //Progress bar structure
                var progress_control = base.format(base.options.templates.t_progressBarControl, {progressControl_content: base.options.templates.t_progressBar});
                var row_noMargin = base.format(base.options.templates.t_rowNoMargin, {rowNoMargin_content: progress_control});
                //Button group for play/pause and stop buttons
                var buttonSpan_play = base.format(base.options.templates.t_btnSpanPlay, {btnSpan_content: base.options.templates.t_hiddenPlayPauseSpan});
                var buttonSpan_stop = base.format(base.options.templates.t_btnSpanStop, {btnSpan_content: base.options.templates.t_hiddenStopSpan});
                var button_play = base.format(base.options.templates.t_btnPlay, {btnPlay_content: buttonSpan_play});
                var button_stop = base.format(base.options.templates.t_btnStop, {btnStop_content: buttonSpan_stop});
                var btnGroup_playStop = base.format(base.options.templates.t_btnGroup, {btnGroup_content: button_play + button_stop});
                //Button group for backward and forward buttons
                var buttonSpan_backward = base.format(base.options.templates.t_btnSpanBackward, {btnSpan_content: base.options.templates.t_hiddenBakwardSpan});
                var buttonSpan_forward = base.format(base.options.templates.t_btnSpanForward, {btnSpan_content: base.options.templates.t_hiddenForwardSpan});
                var button_backward = base.format(base.options.templates.t_btnBackward, {btnBackward_content: buttonSpan_backward});
                var button_forward = base.format(base.options.templates.t_btnForward, {btnForward_content: buttonSpan_forward});
                var btnGroup_backwardForward = base.format(base.options.templates.t_btnGroup, {btnGroup_content: button_backward + button_forward});
                //Button toolbar
                var button_toolbar = base.format(base.options.templates.t_btnToolBar, {btnToolbar_content: btnGroup_playStop + btnGroup_backwardForward});
                //Volume control with volume bar (input range)
                var volume_control = base.format(base.options.templates.t_volumeControl, {volumeControl_content: base.options.templates.t_volumeBar});
                //Button FullScreen
                var buttonSpan_fullscreen = base.format(base.options.templates.t_btnSpanFullscreen, {btnSpan_content: base.options.templates.t_hiddenFullscreenSpan});
                var button_fullscreen = base.format(base.options.templates.t_btnFullscreen, {btnFullscreen_content: buttonSpan_fullscreen});
                //Right toolbar
                var pull_right = base.format(base.options.templates.t_divPullRight, {pullRight_content: volume_control + button_fullscreen});
                //Video controls container
                var video_controls = base.format(base.options.templates.t_videoControls, {videoControls_content: row_noMargin + button_toolbar + pull_right});
            }
            //Video element
            var video_html = base.format(base.options.templates.t_videoHTML, {video_poster: base.options.poster, video_url: base.options.url, video_type: base.options.type, video_message: base.options.labels.videoNotSupported});
            //Video wrapper
            var video_wrapper = base.format(base.options.templates.t_videoWrapperOpen, {videoWrapperOpen_content: video_html + video_controls});
            //Plugin wrapper
            var plugin_wrapper = video_wrapper + base.options.templates.t_scenesDiv;
            //Render video template
            base.$el.html(plugin_wrapper);
        };

        /**
         * String formatter based function
         * @param str
         * @param col
         * @returns {XML|void|string}
         */
        base.format = function (str, col) {
            col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);
            return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
                if (m == "{{") {
                    return "{";
                }
                if (m == "}}") {
                    return "}";
                }
                return col[n];
            });
        };

        /**
         * Add event listeners
         */
        base.addListeners = function() {
            //Key listeners
            window.onkeydown = function(evt) {
                switch (evt.which) {
                    case 32:
                        doPlayAndPause(event);
                        break;
                    case 13:
                        doStop(event);
                        break;
                    case 37:
                        doSlowDown(event);
                        break;
                    case 39:
                        doSpeedUp(event);
                        break;
                    case 38:
                    case 40:
                        doChangeVol(event, base.volumeBar.value);
                        break;
                    case 9:
                        doFullscreen(event);
                        break;
                    case 18:
                        doSaveScene(event, base.player.currentTime);
                        break;
                    default:
                        return;
                }
                evt.preventDefault();
            };
            //onClick listeners if controls are enabled
            if (base.options.enableControls) {
                base.btnPlay.onclick = function() { doPlayAndPause(event); };
                base.btnStop.onclick = function() { doStop(event); };
                base.btnBackward.onclick = function() { doSlowDown(event); };
                base.btnForward.onclick = function() { doSpeedUp(event); };
                base.btnFullscreen.onclick = function() { doFullscreen(event); };
                //onChange listeners
                base.volumeBar.onchange = function() { doChangeVol(event, this.value); };
                //onTimeUpdate listeners
                base.player.ontimeupdate = function() { doUpdateTime(event); };
            }
        };

        /**
         * Play/Pause function (onclick event)
         * @param evt
         */
        function doPlayAndPause(evt) {
            evt.preventDefault();
            if (base.player.paused) {
                $('#spanPlayPause').attr('class', 'glyphicon glyphicon-pause');
                base.player.play();
            } else {
                $('#spanPlayPause').attr('class', 'glyphicon glyphicon-play');
                base.player.pause();
            }
        }

        /**
         * Stop function (onclick event)
         * @param evt
         */
        function doStop(evt) {
            evt.preventDefault();
            $('#spanPlayPause').attr('class', 'glyphicon glyphicon-play');
            base.player.currentTime = 0;
            progressBar.value = 0;
            base.player.pause();
        }

        /**
         * Slow down function (onclick event)
         * @param evt
         */
        function doSlowDown(evt) {
            evt.preventDefault();
            var currentRate = parseFloat(base.player.playbackRate);
            base.player.playbackRate = Math.max(0, currentRate - 0.1);
            $("#txtVideoSpeed").text(parseFloat(base.player.playbackRate));
        }

        /**
         * Speed up function (onclick event)
         * @param evt
         */
        function doSpeedUp(evt) {
            evt.preventDefault();
            var currentRate = parseFloat(base.player.playbackRate);
            base.player.playbackRate = Math.min(5, currentRate + 0.1);
            $("#txtVideoSpeed").text(parseFloat(base.player.playbackRate));
        }

        /**
         * Change volume function (oninput event)
         * @param evt
         * @param volValue
         */
        function doChangeVol(evt, volValue) {
            evt.preventDefault();
            base.player.volume = volValue / 100;
            console.log(base.player.volume);
            base.volumeBar.setAttribute('value', volValue);
            $("#txtVideoVolume").text(volValue);
        }

        /**
         * Detect fullScreen/normalScreen function (onclick event)
         * @param evt
         */
        function doFullscreen(evt) {
            evt.preventDefault();
            if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                doEnterFullscreen(event);
                base.videoControls.className = 'video-controls-lg';
            } else {
                doExitFullScreen(event);
                base.videoControls.className = 'video-controls';
            }
        }

        /**
         * Enter fullScreen mode function (onclick event)
         * @param evt
         */
        function doEnterFullscreen(evt) {
            evt.preventDefault();
            if (base.player.requestFullscreen) {
                base.player.requestFullscreen();
            } else if (base.player.mozRequestFullScreen) {
                base.player.mozRequestFullScreen();
            } else if (base.player.webkitRequestFullScreen) {
                base.player.webkitRequestFullScreen();
            } else if (base.player.msRequestFullScreen) {
                base.player.msRequestFullScreen();
            }
        }

        /**
         * Exit fullScreen mode function (onclick event)
         * @param evt
         */
        function doExitFullScreen(evt) {
            evt.preventDefault();
            if (base.player.exitFullscreen) {
                base.player.exitFullscreen();
            } else if (base.player.mozCancelFullScreen) {
                base.player.mozCancelFullScreen();
            } else if (base.player.webkitExitFullScreen) {
                base.player.webkitExitFullScreen();
            } else if (base.player.msExitFullScreen) {
                base.player.msExitFullScreen();
            }
        }

        /**
         * Update time function (ontimeupdate event)
         */
        function doUpdateTime() {
            var actualValue = Math.floor((100 / base.player.duration) * base.player.currentTime);
            base.progressBar.setAttribute('aria-valuenow', actualValue.toString());
            base.progressBar.setAttribute('style', 'width: ' + actualValue.toString() + '%');
            $("#txtVideoTime").text(Math.floor(base.player.currentTime % 60));
        }

        function doSaveScene(evt, currentTime) {
            base.player.pause();
            $("body").append('<div id="modalWindow" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" style="display: none;"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">VideoPlayer</h4></div><div class="modal-body"><label for="sceneName">Enter a name scene</label><input type="text" class="form-control" id="sceneName" value="" /><button class="btn btn-primary" id="btnSaveScene">Save</button></div></div></div></div>');
            $("#modalWindow").modal('show');
            $(document).on('click', '#btnSaveScene', function () {
                $("#modalWindows").modal('hide');
                doStoreScene(evt, currentTime, $('#sceneName').val());
            });
        }

        function doStoreScene(evt, currentTime, sceneName) {
            evt.preventDefault();
            var scenesStored = localStorage.getItem("scenes");
            var sceneNameObj = [];
            if (scenesStored) {
                sceneNameObj = JSON.parse(scenesStored);
            }
            var obj = {"name": sceneName,"time": currentTime};
            sceneNameObj.push(obj);
            localStorage.setItem("scenes", JSON.stringify(sceneNameObj));
            base.renderScenes();
        }

        base.renderScenes = function renderScenes() {
            var scenesStored = localStorage.getItem('scenes');
            var stored = [];
            if (scenesStored) {
                stored = JSON.parse(scenesStored);
            }
            $.each(stored, function (index) {
                var obj = stored[index];
                var btnScene = document.createElement("button");
                $.each(obj, function (index) {
                    if (index == "name") {
                        btnScene.innerHTML = obj[index];
                    } else if (index == "time") {
                        btnScene.value = obj[index];
                    }
                    btnScene.onclick = function(){
                      base.player.currentTime = btnScene.value;
                    };
                    $("#savedScenes").append(btnScene);
                });
            });
        };

        //Run initializer
        base.init();
    };

    /**
     * VideoPlayer default options
     * @type {{url: string, videoType: string, posterUrl: string, width: number, labels: {play: string, videoNotSupported: string}, classes: {c_col12: string, c_videoWrapper: string, c_videoClass: string, c_videoControls: string, c_rowNoMargin: string, c_progressControl: string, c_progressBar: string, c_btnToolBar: string, c_btnGroup: string, c_btnDefault: string, c_srOnly: string, c_pullRight: string, c_volumeControl: string}, templates: {t_videoWrapperOpen: string, t_videoHTML: string, t_videoControls: string, t_rowNoMargin: string, t_progressBarControl: string, t_progressBar: string, t_btnToolBar: string, t_btnGroup: string, t_button: string, t_btnSpanPlay: string, t_btnSpanStop: string, t_btnSpanBackward: string, t_btnSpanForward: string, t_btnSpanFullscreen: string, t_invisibleSpan: string, t_divPullRight: string, t_volumeControl: string, t_volumeBar: string}}}
     */
    $.DaniPerches.VideoPlayer.defaultOptions = {
        url: "http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4",
        type: "video/mp4",
        poster: "",
        width: 100,
        ids: {
            id_videoHTML: "myPlayer",
            id_videoControls: "video-controls",
            id_progressBar: "progressBar",
            id_btnPlay: "btnPlay",
            id_btnStop: "btnStop",
            id_btnBackward: "btnBackward",
            id_btnForward: "btnForward",
            id_btnFullscreen: "btnFullscreen",
            id_spanPlayPause: "spanPlayPause",
            id_volumeBar: "volumeBar"
        },
        labels: {
            play: "Play",
            videoNotSupported: "Your browser does not support the video element."
        },
        classes: {
            c_col12: 'col-xs-12',
            c_videoWrapper: 'video-wrapper',
            c_videoClass: 'myPlayer',
            c_videoControls: 'video-controls',
            c_rowNoMargin: 'row no-margin',
            c_progressControl: 'progress progress-control',
            c_progressBar: 'progress-bar custom-progressBar',
            c_btnToolBar: 'btn-toolbar inline-block',
            c_btnGroup: 'btn-group',
            c_btnDefault: 'btn btn-default',
            c_srOnly: 'sr-only',
            c_pullRight: 'pull-right',
            c_volumeControl: 'volume-control'
        },
        templates: {
            t_videoWrapperOpen: '<div class="col-xs-12 video-wrapper">{videoWrapperOpen_content}</div>',
            t_videoHTML: '<video id="myPlayer" class="myPlayer" width="100%" poster={video_poster}><source src={video_url} type={video_type}>{video_message}</video>',
            t_videoControls: '<div id="video-controls" class="video-controls">{videoControls_content}</div>',
            t_rowNoMargin: '<div class="row no-margin">{rowNoMargin_content}</div>',
            t_progressBarControl: '<div class="progress progress-control">{progressControl_content}</div>',
            t_progressBar: '<div id="progressBar" class="progress-bar custom-progressBar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0;"></div>',
            t_btnToolBar: '<div class="btn-toolbar inline-block" role="toolbar" aria-label="...">{btnToolbar_content}</div>',
            t_btnGroup: '<div class="btn-group" role="group" aria-label="...">{btnGroup_content}</div>',
            t_btnPlay: '<button type="button" id="btnPlay" class="btn btn-default">{btnPlay_content}</button>',
            t_btnStop: '<button type="button" id="btnStop" class="btn btn-default">{btnStop_content}</button>',
            t_btnBackward: '<button type="button" id="btnBackward" class="btn btn-default">{btnBackward_content}</button>',
            t_btnForward: '<button type="button" id="btnForward" class="btn btn-default">{btnForward_content}</button>',
            t_btnFullscreen: '<button type="button" id="btnFullscreen" class="btn btn-default">{btnFullscreen_content}</button>',
            t_btnSpanPlay: '<span id="spanPlayPause" class="glyphicon glyphicon-play" aria-hidden="true">{btnSpan_content}</span>',
            t_btnSpanStop: '<span class="glyphicon glyphicon-stop" aria-hidden="true">{btnSpan_content}</span>',
            t_btnSpanBackward: '<span class="glyphicon glyphicon-backward" aria-hidden="true">{btnSpan_content}</span>',
            t_btnSpanForward: '<span class="glyphicon glyphicon-forward" aria-hidden="true">{btnSpan_content}</span>',
            t_btnSpanFullscreen: '<span class="glyphicon glyphicon-fullscreen" aria-hidden="true">{btnSpan_content}</span>',
            t_hiddenPlayPauseSpan: '<span class="sr-only">Play/Pause</span>',
            t_hiddenStopSpan: '<span class="sr-only">Stop</span>',
            t_hiddenBakwardSpan: '<span class="sr-only">Backward</span>',
            t_hiddenForwardSpan: '<span class="sr-only">Forward</span>',
            t_hiddenFullscreenSpan: '<span class="sr-only">Fullscreen</span>',
            t_divPullRight: '<div class="pull-right">{pullRight_content}</div>',
            t_volumeControl: '<div class="volume-control">{volumeControl_content}</div>',
            t_volumeBar: '<input type="range" id="volumeBar" min="0" max="100" value="100" step="10">',
            t_scenesDiv: '<div id="savedScenes" class="col-xs-12 scenes-div"></div>'
        }

    };

    /**
     *
     * @param getData
     * @param options
     * @returns {*}
     * @constructor
     */
    $.fn.DaniPerches_VideoPlayer = function (getData, options) {
        return this.each(function () {
            (new $.DaniPerches.VideoPlayer(this, getData, options));
        });
    };

    /**
     *  This function breaks the chain, but returns the DaniPerches.VideoPlayer if it has been attached to the object.
     */
    $.fn.getDaniPerches_VideoPlayer = function () {
        this.data("DaniPerches.VideoPlayer");
    };

})(jQuery);
