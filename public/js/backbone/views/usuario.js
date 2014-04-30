Tk.Views.UsuarioView = Backbone.View.extend({

	events:{
		"show" : "show",
		"click" : "click",
	},
	className:"",
	initialize : function(model){
		var self = this;
		this.model = model;
		this.template = swig.compile($("#usuario_tpl").html());
		this.template2 = swig.compile($("#usuarioN_tpl").html());

		this.model.on("change",function(){
			window.app.stateUser = "change";
			self.render();
		});
	},
	render: function(data) {
		debugger;
		var self = this;
		var estado = this.model.get("online");
		var modelo = this.model.toJSON();


		var locals ={
			post : modelo
		};


		if(modelo.num == "0")
		{
			this.$el.html( this.template(locals));
		}
		else
		{
			this.$el.html( this.template2(locals) );
		}
		return this;
	},
	click : function(data)
	{
		
		data.stopPropagation();
		window.util.destino = this.model.toJSON();
		var j = this.model.toJSON();
		$(".chat_ventana").show();
		$(".chat_ventana .titulo .nombre").html(j.name);
		$(".info").html('');

		this.model.set("num",0);

		var datos = {};
		datos.uo = window.util.id;
		datos.ud = window.util.destino.id;
		window.ponyExpress._io.emit('old user', datos ,function(data)
		{
			data.forEach(function(d){
				var info = {};
				if(d.usuario == window.util.id)
				{
					info.tipo = "yo"
					info.avatar  = window.util.avatar;
				}
				else
				{
					info.tipo = "el"
					info.avatar  = window.util.destino.avatar;
				}
				info.mensaje = d.mensaje;
				info.fecha = d.creado
				window.collections.mensajes.add(info);

			});
				$('.info').slimscroll({scrollBy: '5500px'});
		});

	},
});
