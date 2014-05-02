var express = require('express'),
swig    = require('swig'),
cons    = require('consolidate'),
fs      = require('fs'),
uuid    = require('node-uuid');

var env = "dev";

var app      = express(),
baseData = fs.readFileSync('./base-data.json').toString(),
server   = require('http').createServer(app),
io       = require('socket.io').listen(server),
mongoose = require('mongoose');

var departamentos =
[
{ ide: "DA", name:'Departamento Administracion'},
{ ide: "DC", name:'Departamento Comercial'},
{ ide: "DG", name:'Departamento Gerencia'},
{ ide: "DT", name:'Departamento Tecnologias'}, 
];
var usuarios = 
[
{id: "aiwoking", name : "Aiwoking",avatar:"avatar7.jpg", depto : "DA",nuevo:true,num: 0,online: false},
{id: "anita", name : "Ana Molina",avatar:"avatar5.jpg", depto : "DA",nuevo:true,num: 0,online: false},
{id: "arodriguez",name : "Alejandro Rodriguez", avatar:"avatar.jpg", depto : "DT",nuevo:true,num: 0,online: false},
{id: "cencina", name : "Christian Encina", avatar:"avatar2.jpg", depto : "DT",nuevo:true,num: 0,online: false},
{id: "cgamerre", name : "Cristian Gamarre",avatar:"avatar3.jpg", depto : "DC",nuevo:true,num: 0,online: false},
{id: "krodriguez", name : "Karen Rodriguez",avatar:"avatar4.jpg", depto : "DC",nuevo:true,num: 0,online: false},
{id: "rsoto", name : "Raul Soto",avatar:"rsoto.jpg", depto : "DT",nuevo:true,num: 0,online: false},
];
var data = JSON.parse(baseData);
var NickName = [];

swig.init({
	cache : false
});

// View engine
app.engine('.html', cons.swig);
app.set('view engine', 'html');
app.set('views', './app/views');

// Add POST, PUT, DELETE methods to the app
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());

// Static files
app.use( express.static('./public') );

// Routes
app.get('/departamentos/all', function(req, res){
	res.send(departamentos);
});
app.get('/usuarios/all', function(req, res){
	res.send(usuarios);
});
app.post('/usuarios', function (req, res){
	req.body.id = uuid.v1();

	usuarios.push(req.body);

	console.log('usuarios::create', req.body);

	io.sockets.emit('usuarios::create', req.body);

	res.send(200, {status:"Ok", id: req.body.id});
});

app.put('/usuarios/:id', function (req, res){
	var usuario;

	for (var i = usuarios.length - 1; i >= 0; i--) {
		usuario = usuarios[i];
		console.log(usuario);
		if(usuario.id === req.params.id){
			usuarios[i] = req.body;
			console.log(req.body);
		}
	}

	console.log('usuarios::update', req.body);

	io.sockets.emit('usuarios::update', req.body);

	res.send(200, {status:"Ok"});
});

var home = function (req, res) {
	res.render('index',{
		posts : data,
		env   : env
	});
};

app.get('/', home);
app.get('/usuarios/:id', home);


server.listen(3000);

//**************** MONGO DB **************************
mongoose.connect('mongodb://localhost/tkconnect',function(err){
	if (err) {
		console.log(err);
	}else {
		console.log("MongoDB OK");
	}
});
var chatSchema = mongoose.Schema({
	usuario:String,
	mensaje:String,
	departamento: String,
	usuarioDestino:String,
	usuarioDestino2:String,
	creado: {type: Date, default: Date.now},
	recibido: {type: Boolean}

});
var Chat = mongoose.model('Mensajes',chatSchema);
// ****************************************************
// ********************** SOCKET IO *******************
io.sockets.on('connection', function(socket){

	socket.on('old user', function(data, callback)
	{
		//update creados

		
		Chat.find( { "usuarioDestino" : { $in: [ data.ud + "<>" +data.uo, data.uo + "<>" +data.ud] } } 
			,function(err,docs)
			{
				
			//	socket.emit('old msn',docs);		
			callback(docs);
		});
	});

	socket.on('adduser', function(data,callback){
		if (NickName.indexOf(data)!= -1) 
		{
			callback(false);
			console.log("FALLO FALLO " + NickName);
		}
		else
		{
			callback(true);
			
			socket.nickname = data;
			NickName.push(data);
			console.log("Los Usarios son " + NickName);

			for (var i = usuarios.length - 1; i >= 0; i--) {
				if(usuarios[i].id == data)
				{
					usuarios[i].online =true;
					io.sockets.emit('usuarios::update', usuarios[i]);
				}
			}
			var usuariosP = usuarios;

			for (var i = usuariosP.length - 1; i >= 0; i--) 
			{
				var num = Chat.find({'usuarioDestino': data + "<>" + usuariosP[i].id},
					function(err,ddd){
						
						if(ddd.length>0)
						{
							console.log('*******************************************************************');
							console.log(ddd.length);
							console.log('************************************ *******************************');

							for (var z = usuariosP.length - 1; z >= 0; z--) 
							{
								if(ddd[0].usuario ==usuariosP[z].id)
								{
									usuariosP[z].num =ddd.length;
									//	usuarios[data].emit('usuarios::update', usuariosP[z]);
								}
							}

						}
						//
					});


			}
		}

	});

socket.on('disconnect', function () {
	var a = socket.nickname
	if (!socket.nickname) return;
	if (NickName.indexOf(socket.nickname) > -1) {
		NickName.splice(NickName.indexOf(socket.nickname), 1);
	}

	console.log('NickName are ' + NickName);  


	for (var i = usuarios.length - 1; i >= 0; i--) {
		if(usuarios[i].id == a)
		{
			usuarios[i].online =false;
			io.sockets.emit('usuarios::update', usuarios[i]);
		}
	}
});


socket.on('send message', function(data, callback)
{
	var newMsn = new Chat({
		usuario:data.user,
		mensaje:data.msn,
		departamento: "0",
		usuarioDestino:  data.user_d + "<>" + data.user,
		usuarioDestino2:  data.user + "<>" + data.user_d,
		recibido : false
	});
	newMsn.save(function(err){});
	console.log(data.user + " " +data.msn);
		//usernames[socket.nickname]
		socket.broadcast.emit('nuevo_mensaje', {user: data.user , dest: data.user_d, tipo: data.tipo, msn: data.msn , fecha: data.fecha});

	});

socket.on('send grupo', function(data, callback)
{
	var newMsn = new Chat({
		usuario:data.user,
		mensaje:data.msn,
		departamento: data.Id

	});
	newMsn.save(function(err){});
	console.log(data.user + " " +data.msn);
		//usernames[socket.nickname]
		socket.broadcast.emit('nuevo_mensaje_grupo', {user: data.user ,tipo: "el", msn: data.msn , fecha: data.fecha});
	});


socket.on('old user depto', function (data){

	console.log("DATA ID " + data.id );
	Chat.find( { "departamento" : data.id } 
		,function(err,docs)
		{
			console.log(docs);
			socket.emit('old msn depto',docs);		
		});
});


});


// ****************************************************