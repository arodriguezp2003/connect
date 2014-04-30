Tk.Views.MensajeView = Backbone.View.extend({
	events:{
		"show" : "show"
	},
	className:"",
	initialize : function(model){
		var self = this;
		this.model = model;
		this.template = swig.compile($("#msn_tpl").html());;
	},
	render: function(data) {
		var self = this;	
		var modelo = this.model.toJSON();
		var locals ={
			datos : modelo
		};

		this.$el.html( this.template(locals));
	

		return this;
	}
});
