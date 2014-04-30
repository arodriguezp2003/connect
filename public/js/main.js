$(document).ready(function(){
	console.log('Starting app');
	$('<audio id="chatAudio"><source src="mp3/noty.mp3" type="audio/mpeg"></audio>').appendTo('body');
	ActivarPermiso();
	$(".chat_ventana").hide();
	
	window.ponyExpress = new PonyExpress({
		io: window.location.origin
	});
	window.util = new Object();
	window.util.destino  =  {id: ""};
	window.collections.usuarios = new Tk.Collections.UsuariosCollection();
	window.collections.departamentos = new Tk.Collections.DepartamentosCollection();
	window.collections.mensajes = new Tk.Collections.MensajesCollection();

	window.ponyExpress.bind('connect', function(){
		window.util.id = prompt("Ingrese Usuario","arodriguez");
		window.ponyExpress._io.emit('adduser', window.util.id , function(data)
		{
			if (data)
			{
				var xhr_u = $.get('/usuarios/all');
				xhr_u.done(function(data){
					data.forEach(function(usuario){
						window.collections.usuarios.add(usuario);
						if (window.util.id == usuario.id)
						{
							window.util.name = usuario.name;
							window.util.avatar = usuario.avatar;
						}
					});
				});
			}
			else 
			{
				alert("ERROR EN EL USUARIO, YA EXISTE");
				return;
			}
		});
		/*
		window.plugs.usuario = new PonyExpress.BackbonePlug({
			collection : window.collections.usuarios 
		});
	*/
});

	window.collections.departamentos.on("add",function(model){
		var view = new Tk.Views.DepartamentoView(model);
		view.render();
		view.$el.insertBefore('.setup');
	});

	window.collections.mensajes.on("add",function(model){

		var view = new Tk.Views.MensajeView(model);
		view.render();
		//view.$el.append('.info');
		$(".info").append(view.el);
	});
/*
	var xhr = $.get('/departamentos/all');
	xhr.done(function(data){

		data.forEach(function(departamento){
			window.collections.departamentos.add(departamento);
		});
	});
*/
	window.collections.usuarios.on("add",function(model){
		var view = new Tk.Views.UsuarioView(model);
		
		if (model.toJSON().id != window.util.id) {
			view.render();
			view.$el.insertAfter('.limite');
		}
	});


	$('.info').slimscroll({ height: '280px'});
	$("#xEnviar").on("keydown",function(e){
		
		if(e.which != 13) return;
		if ($("#xEnviar").val()=="") { return;}

		var info = {};
		info.tipo = "yo"
		info.avatar  = window.util.avatar;
		info.mensaje = $("#xEnviar").val();
		info.fecha =Date.now();

		var  a = new Tk.Models.Mensaje(info);
		window.collections.mensajes.add(a);


		var m = {};
		m.user =window.util.id;
		m.user_d = window.util.destino.id;
		m.tipo = "el"
		m.msn = $("#xEnviar").val();
		m.fecha = Date.now();

		window.ponyExpress._io.emit('send message', m);

		$("#xEnviar").val("");
		$('.info').slimscroll({scrollBy: '5500px'});
	});

	window.ponyExpress._io.on('nuevo_mensaje', function(data){
		if (data.dest != window.util.id) return;
		debugger;
		if (window.util.destino.id===undefined) {
			window.util.destino = {};
			window.util.destino.id="";
		 }
		if (data.user == window.util.destino.id) 
		{
			var info = {};
			info.tipo = "el"
			info.avatar  = window.util.destino.avatar;
			info.mensaje =data.msn;
			info.fecha =data.fecha;
			var  a = new Tk.Models.Mensaje(info);
			window.collections.mensajes.add(a);
		}
		else
		{
			var ava ="";
			var nam ="";
			window.collections.usuarios.forEach(function(d){
				var use =d;
				var num = d.get("num");
				if (data.user == d.id)
				{
					debugger;
					ava = d.toJSON().avatar;
					nam = d.toJSON().name;
					if (num==null) 
					{
						num = 1;
					}
					else
					{
						num += 1; 
					}
					d.set("num",num) 
					mostrarNotificacion(nam,data.msn, "img/" + ava);
				}

			});
			
		}
		
		$('#chatAudio')[0].play();
		$('.info').slimscroll({scrollBy: '5500px'});

	});
	window.ponyExpress._io.on('usuarios::update', function(data){
		window.collections.usuarios.forEach(function(d){
	
			var us = d.toJSON();
			var use =d;
			if (data.id ==  us.id) 
			{
				d.set("online",data.online) 
			}
		});
	});
});
