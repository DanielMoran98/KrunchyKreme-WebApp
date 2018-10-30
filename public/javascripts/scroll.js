
  $(document).on('ready', () =>
  {
    $("#scrollDown").click(function()
    {
        var pageHeight = $(document).height();
        $('html, body').animate({ scrollTop: 750 }, 450)
    });

    $(document).scroll(function () {
      var y = $(this).scrollTop();
      if (y > 600) {
          $('#sidebar').fadeIn();
      } else {
          $('#sidebar').fadeOut();
      }
    });
  }); //End doc on ready
  
