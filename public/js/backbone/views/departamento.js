Tk.Views.DepartamentoView = Backbone.View.extend({
	events:{
		"show" : "show",
		"click": "click",
	},
	className:"",
	initialize : function(model){
		var self = this;
		this.model = model;
		this.template = swig.compile($("#departamento_tpl").html());
		//this.template = _.template($("#Departamento_tpl").html());
	},
	render: function(data) {
		var self = this;
		var locals ={
			post : this.model.toJSON()
		};
		this.$el.html( this.template(locals) );

		return this;
	},
	click: function(data)
	{
		data.stopPropagation();
		window.util.id = this.model.get("ide");
		window.util.name = this.model.get("name");
		window.util.avatar = "departamento.jpg";
		window.util.depto = true;

		alert(this.model.get("ide"));
	}
});
