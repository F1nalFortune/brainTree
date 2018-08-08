$( document ).ready(function() {
    console.log( "ready!" );
    $(document).ready(function(){
      var scrollTop = 0;
      $(window).scroll(function(){
        scrollTop = $(window).scrollTop();
        $('.counter').html(scrollTop);

        if (scrollTop >= 100) {
          $('#global-nav').addClass('scrolled-nav');
        } else if (scrollTop < 100) {
          $('#global-nav').removeClass('scrolled-nav');
        }

      });

    });

    /*
    **********************************************************
    * OPAQUE NAVBAR SCRIPT
    **********************************************************
    */

    // Toggle tranparent navbar when the user scrolls the page

    $(window).scroll(function() {
      if($(this).scrollTop() > 50)  /*height in pixels when the navbar becomes non opaque*/
      {
        $('.opaque-navbar').addClass('opaque');
      } else {
        $('.opaque-navbar').removeClass('opaque');
      }
    });
});
