 // Permission values
    var PERMISSION_ALLOWED = 0;
    var PERMISSION_NOT_ALLOWED = 1;
    var PERMISSION_DENIED = 2;

    function mostrarNotificacion(title, msg, icon){
      if (window.webkitNotifications)
      {
          var wkn = window.webkitNotifications;
          var notif;
          if (wkn.checkPermission() == PERMISSION_ALLOWED) {
              notif = wkn.createNotification(icon, title, msg);
            /*  notif.ondisplay = function () { document.getElementById("msgs").innerHTML += "<br/>Notificación mostrada en: " + new Date(); };
              notif.onclose = function () { document.getElementById("msgs").innerHTML += "<br/>Notificación cerrada en: " + new Date(); };
              notif.onclick = function () { document.getElementById("msgs").innerHTML += "<br/>Se pulsó la notificación en: " + new Date(); };
              */
              notif.show();
          }
      }
    }

    function ActivarPermiso()
    {
        if (window.webkitNotifications)
            window.webkitNotifications.requestPermission();
        else
            alert("Tu navegador no soporta notificaciones Web de escritorio");
    }
