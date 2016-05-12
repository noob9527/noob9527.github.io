/**
 * Created by xy on 16-5-9.
 */

$(document).ready(function() {
    var stickyNav = function(){
        var scrollTop = $(window).scrollTop();

        if (scrollTop > 240) {
            $('#site-nav').addClass('sticky');
        } else {
            $('#site-nav').removeClass('sticky');
        }
    };

    stickyNav();

    $(window).scroll(function() {
        stickyNav();
    });
});
