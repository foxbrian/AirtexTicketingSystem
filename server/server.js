var http 	= require('http');
var fs 		= require('fs');
var mysql 	= require('mysql');
var url 	= require('url');
var body	= require('body/form');
var cookies	= require('cookies');
var config 	= require('./config');

var activeDB = mysql.createPool({
	connectionLimit	:	100,
	host 		: 	config.host,
	user		:	config.user,
	password	:	config.pw,
	database 	:	config.db
});


//SQL queries for each filter and sort combination
const seatCutterParts = 'part="seat assembly" and cut=0';
const wallCutterParts = '(part="wall panel" or part="carpet" or part="firewall cover") and cut=0';
const seatSewerParts = '(part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="seat assembly") and cut=1 and sewn=0';
const carpetSewerParts = 'part="carpet" and cut=1 and sewn=0';
const miscCutterParts = '(part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="headliner") and cut=0';
const gluerParts= '(part="carpet" and sewn=1 and finished = 0) or ((part="wall panel" or part="firewall cover") and cut=1 and finished=0)';
const foamerParts = 'part="seat assembly" and sewn=1 and finished=0';

const responsibilities = {
	'/seatCutters'	: {
		'Date'			: 'select * from tasks where '+seatCutterParts+' order by locked asc, date asc;',
		'Part'			: 'select * from tasks where '+seatCutterParts+' order by locked asc, part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+seatCutterParts+' order by locked asc, pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+seatCutterParts+' order by locked asc, fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+seatCutterParts+' order by locked asc, fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+seatCutterParts+' order by locked asc, date desc;',
		'PartDesc'		: 'select * from tasks where '+seatCutterParts+' order by locked asc, part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+seatCutterParts+' order by locked asc, pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+seatCutterParts+' order by locked asc, fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+seatCutterParts+' order by locked asc, fabricTwo desc, fabricOne asc, date asc;'
	},
	'/wallCutters'	: {
		'Date'			: 'select * from tasks where '+wallCutterParts+' order by locked asc, date asc;',
		'Part'			: 'select * from tasks where '+wallCutterParts+' order by locked asc, part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+wallCutterParts+' order by locked asc, pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+wallCutterParts+' order by locked asc, fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+wallCutterParts+' order by locked asc, fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+wallCutterParts+' order by locked asc, date desc;',
		'PartDesc'		: 'select * from tasks where '+wallCutterParts+' order by locked asc, part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+wallCutterParts+' order by locked asc, pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+wallCutterParts+' order by locked asc, fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+wallCutterParts+' order by locked asc, fabricTwo desc, fabricOne asc, date asc;'
	},
	'/seatSewers'	: {
		'Date'			: 'select * from tasks where '+seatSewerParts+' order by locked asc, date asc;',
		'Part'			: 'select * from tasks where '+seatSewerParts+' order by locked asc, part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+seatSewerParts+' order by locked asc, pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+seatSewerParts+' order by locked asc, fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+seatSewerParts+' order by locked asc, fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+seatSewerParts+' order by locked asc, date desc;',
		'PartDesc'		: 'select * from tasks where '+seatSewerParts+' order by locked asc, part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+seatSewerParts+' order by locked asc, pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+seatSewerParts+' order by locked asc, fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+seatSewerParts+' order by locked asc, fabricTwo desc, fabricOne asc, date asc;'
	},
	'/carpetSewers'	: {
		'Date'			: 'select * from tasks where '+carpetSewerParts+' order by locked asc, date asc;',
		'Part'			: 'select * from tasks where '+carpetSewerParts+' order by locked asc, part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+carpetSewerParts+' order by locked asc, pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+carpetSewerParts+' order by locked asc, fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+carpetSewerParts+' order by locked asc, fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+carpetSewerParts+' order by locked asc, date desc;',
		'PartDesc'		: 'select * from tasks where '+carpetSewerParts+' order by locked asc, part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+carpetSewerParts+' order by locked asc, pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+carpetSewerParts+' order by locked asc, fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+carpetSewerParts+' order by locked asc, fabricTwo desc, fabricOne asc, date asc;'
	},
	'/miscCutters'	: {
		'Date'			: 'select * from tasks where '+miscCutterParts+' order by locked asc, date asc;',
		'Part'			: 'select * from tasks where '+miscCutterParts+' order by locked asc, part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+miscCutterParts+' order by locked asc, pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+miscCutterParts+' order by locked asc, fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+miscCutterParts+' order by locked asc, fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+miscCutterParts+' order by locked asc, date desc;',
		'PartDesc'		: 'select * from tasks where '+miscCutterParts+' order by locked asc, part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+miscCutterParts+' order by locked asc, pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+miscCutterParts+' order by locked asc, fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+miscCutterParts+' order by locked asc, fabricTwo desc, fabricOne asc, date asc;'
	},
	'/gluers'	:{
		'Date'			: 'select * from tasks where '+gluerParts+' order by locked asc, date asc;',
		'Part'			: 'select * from tasks where '+gluerParts+' order by locked asc, part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+gluerParts+' order by locked asc, pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+gluerParts+' order by locked asc, fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+gluerParts+' order by locked asc, fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+gluerParts+' order by locked asc, date desc;',
		'PartDesc'		: 'select * from tasks where '+gluerParts+' order by locked asc, part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+gluerParts+' order by locked asc, pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+gluerParts+' order by locked asc, fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+gluerParts+' order by locked asc, fabricTwo desc, fabricOne asc, date asc;'
	},
	'/foamers'	: { 
		'Date'			: 'select * from tasks where '+foamerParts+' order by locked asc, date asc;',
		'Part'			: 'select * from tasks where '+foamerParts+' order by locked asc, part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+foamerParts+' order by locked asc, pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+foamerParts+' order by locked asc, fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+foamerParts+' order by locked asc, fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+foamerParts+' order by locked asc, date desc;',
		'PartDesc'		: 'select * from tasks where '+foamerParts+' order by locked asc, part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+foamerParts+' order by locked asc, pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+foamerParts+' order by locked asc, fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+foamerParts+' order by locked asc, fabricTwo desc, fabricOne asc, date asc;'
	}
};

//text used to build the header of HTTP message
const mime = {
	html: 'text/html',
	txt: 'text/plain',
	css: 'text/css',
	gif: 'image/gif',
	jpg: 'image/jpeg',
	png: 'image/png',
	svg: 'image/svg+xml',
	js: 'application/javascript',
	ico: 'image/ico'
};

http.createServer(function (req,res){
	var q = url.parse(req.url, true);
	var filename = q.pathname == '/' ? '/var/www/html/index.html' : '/var/www/html' + q.pathname; 
	var cookieJar = new cookies(req,res,{keys:[config.key]}); 
	var timeout= 43200000;

	//login timeout
	if(cookieJar.get('lastAuthed',{signed:true})==undefined){
		cookieJar.set('authed',false,{signed:true});
		cookieJar.set('lastAuthed',Date.now(),{signed:true});
	}
	else if( Number(Date.now()) > Number(cookieJar.get('lastAuthed',{signed:true}))+timeout){
		cookieJar.set('authed',false,{signed:true});
	}

	//login page
	if(q.pathname=='/login'||!(q.pathname.split('.')[q.pathname.split('.').length-1]=='css' || cookieJar.get('authed',{signed:true}))){
		if (req.method != 'POST'){
			if(cookieJar.get('authed',{signed:true})){
				
				//if the user has already authed redirect to allOrders
				res.writeHead(200,'{"Content-Type": "text/html"}');
				res.write('<html><head><link rel="stylesheet" type="text/css" href="material.css"/></head>'+
					'<body onload="window.location=\'/allOrders\'">'+
					'<div class="redirecting">redirecting</div></body></html>');
				res.end();
			}
			else{
				fs.readFile('/var/www/html/login',(err,data) => {
					if(err) console.log(err);
					
					res.writeHead(200, '{"Content-Type": "text/html"}');
					res.write(data);
					res.end();	
				});
			}
		}

		else {
			body(req,{},(err,form) => {
				if (err) console.log(form);

				activeDB.query('select * from users where user = ?;',[form.userName],(err,result) =>{
					if(err){
						console.log(err);
						res.end();
						return;
					}

					if(result.length>0 && form.password == result[0].password){

						//set cookies for username, authed boolean, and date/time authed
						cookieJar.set('username',form.userName,{signed:true});
						cookieJar.set('authed',true,{signed:true});
						cookieJar.set('lastAuthed',Date.now(),{signed:true});

						//serve page with redirect to orders
						res.writeHead(200,'{"Content-Type": "text/html"}');
						res.write('<html><head><link rel="stylesheet" type="text/css" href="material.css"/></head>'+
							'<body onload="window.location=\'/allOrders\'">'+
							'<div class="redirecting">redirecting</div></body></html>');
						res.end();
					}
					
					else{
						fs.readFile('/var/www/html/loginbad',(err,data) => {
							if(err) console.log(err);
							
							res.writeHead(200, '{"Content-Type": "text/html"}');
							res.write(data);
							res.end();	
						});
					}
					
				});
			});
		}	

	}
	//allOrders page
	else if(q.pathname =='/allOrders'){

		//read begining and end of html template
		fs.readFile('/var/www/html/shell',(err,data) => {
			if(err)	console.log(err);

			fs.readFile('/var/www/html/shellend',(err,data2) =>{
				//query all orders
				activeDB.query('select * from orders',(err3,result) => {

					if(err3) console.log(err3);
					
					//table headers
					var outputHTML = '<div class="addOrder"><button class="addOrderButton" onclick="window.location=\'/addOrder\'">Add New Order</button></div>'+
						'<table class="taskTable"><tr><th class="clickable">Order ID</th>'+
						'<th class="clickable">Date Ordered</th>'+
						'<th class="clickable">First Name</th>'+
						'<th class="clickable">Last Name</th>'+
						'<th class="clickable">Ship To</th></tr>';
					
					//add table row for each order record
					result.forEach((item) => {
						outputHTML += '<tr class="clickable" onclick="window.location=\'/orderView?orderId='+item.orderId+'\';"><td>'+
							item.orderId+
							'</td><td>'+(item.date.getMonth()+1)+'/'+item.date.getDate()+
							'</td><td>'+item.firstName+
							'</td><td>'+item.lastName+
							'</td><td>'+item.shippingAddress+
							'</td></tr>';
					});
					outputHTML += '</table>';

					//serve html template with table in the midddle
					res.writeHead(200, '{"Content-Type": "text/html"}');
					res.write(data+
						outputHTML+
						data2);
					res.end();
				});
			});
		});
	}
	//orderView page
	else if(q.pathname == '/orderView'){

		cookieJar.set('orderToEdit',q.query.orderId,{signed:true});

		body(req,{},(err,form) =>{
			if(err) console.log(err);
			
			if(form.delete){
				activeDB.query('delete from tasks where taskId=?;',[form.delete],(err,result)=>{
					if(err) console.log(err);
				});
			}

			activeDB.query('select * from orders where orderId = ?;',[q.query.orderId],(err,order)=>{
				activeDB.query('select * from tasks where orderId = ?;',[q.query.orderId],(err,tasks) =>{
					var outputHTML = '<div class="taskElements"><table><tr><th>First Name</th><th>Last Name</th>'+
						'<th>Address</th><th>Date Ordered</th></tr>'+
						'<tr><td>'+order[0].firstName+'</td><td>'+order[0].lastName+'</td><td>'+order[0].shippingAddress+
						'</td><td>'+(order[0].date.getMonth()+1)+'/'+order[0].date.getDate()+'</td></tr></table></div>';
						
					if(tasks[0]){
						outputHTML += '<div class="taskElements"><table><tr><th></th><th>Part</th><th>Plane</th>'+
						'<th>Primary Material</th><th>Secondary Material</th></tr>';

						tasks.forEach( (item,i,array) =>{
							outputHTML += '<tr><td><form onsubmit="return confirm(\'Delete Item?\');" method="post" action="/orderView?orderId='+q.query.orderId+
							'"><input type="submit" class="deleteButton" value="Delete">'+
							'<input type="hidden" name="delete" value="'+item.taskId+'"></form>'+
							'</td><td>'+item.part+'</td><td>'+item.pattern+'</td><td>'+item.fabricOne+'</td><td>'+item.fabricTwo+'</td></tr>';

							if(i==array.length-1){
								outputHTML +='</table></div>'+
								'<button class=searchButton onclick="window.location=\'/addTask\'">Add New Item</button>';
								
								fs.readFile('/var/www/html/shell',(err,data) => {
									if(err)	console.log(err);

									fs.readFile('/var/www/html/shellend',(err,data2) =>{

										res.writeHead(200, '{"Content-Type": "text/html"}');
										res.write(data+
											outputHTML+
											data2);
										res.end();
									});
								});
							}
						});
					}
					else{

						outputHTML+='<div class="noTasks">There are no tasks associated with this order</div>'+
								'<button class=searchButton onclick="window.location=\'/addTask\'">Add New Item</button>';

						fs.readFile('/var/www/html/shell',(err,data) => {
							if(err)	console.log(err);

							fs.readFile('/var/www/html/shellend',(err,data2) =>{

								res.writeHead(200, '{"Content-Type": "text/html"}');
								res.write(data+
									outputHTML+
									data2);
								res.end();
							});
						});
					}


				});
			});
		});
	}
	//taskView page		
	else if(q.pathname == '/taskView'){

		//if user pressed lock button
		if(q.query.action=="lock"){
			
			//update locked column
			activeDB.query('update tasks set locked=1 where taskId = ?;',[q.query.taskId],(err,result) =>{
				if(err) {
					console.log(err);
					//write error page here
				}
			});
			
			//serve page with redirect back to original task
			res.writeHead(200,'{"Content-Type": "text/html"}');
			res.write('<html><head><link rel="stylesheet" type="text/css" href="material.css"/></head>'+
				'<body onload="window.history.back()"><div class="redirecting">redirecting</div></body></html>');
			res.end();
		}

		//if user pressed complete button
		else if(q.query.action=="complete"){
			
			//select task to perform logic
			activeDB.query('select * from tasks where taskId= ?;',[q.query.taskId],(err,result) =>{
				if(err) {
					console.log(err);
					//write error page here
				}
				var update = '';
				
				//headliners are only ever cut so always set all bools to true 
				if(result[0].part == "Headliner") update ='cut=1, sewn=1, finished=1';
				
				//everything else needs to be cut and sent to the next station
				else if(result[0].cut==0) update='cut=1';
				
				//each of these items are only either cut and finished or cut and sewn 
				//so set everything to true on the second completion (after being cut)
				else if(result[0].part in {'Wind Sock':'','Seat Sling':'','Baggage Compartment':'',
					'Draft Boot':'','Shock Cord Boot':'','Wall Panel':'','Firewall Cover':''}) 
					update ='sewn=1,finished=1';
				
				//set sewn to true for everything else that has already been cut
				else if( result[0].sewn==0) update='sewn=1';
				
				//if it's already been cut and sewn set to finished
				else  update='finished=1';
				//
				//perform the mysql update decided on above
				activeDB.query('update tasks set '+update+' ,locked=0 where taskId= ?;', [q.query.taskId],(err,result) =>{
					if(err){
						console.log(err);
						return;
					}
					//update the tracking table
					activeDB.query('insert into tracking values(?,?,localtime());',[q.query.taskId,cookieJar.get('username',{signed:true})],(err,result)=>{
						if(err) console.log(err);
					});


				});
			});

			//serve page that redirects back to task table
			res.writeHead(200,'{"Content-Type": "text/html"}');
			res.write('<html><head><link rel="stylesheet" type="text/css" href="material.css"/></head>'+
				'<body onload="window.history.go(-2)"><div class="redirecting">redirecting</div></body></html>');
			res.end();
		}
		
		//if no button has been pressed just show the task info
		else{
			fs.readFile('/var/www/html/shell',(err,data) => {
				if(err)	console.log(err);

				fs.readFile('/var/www/html/shellend',(err,data2) =>{
					activeDB.query('select * from tasks where taskId=?;',[q.query.taskId],(err3,result) =>{
						var outputHTML = '<div class="taskElements">'+
						'<table><tr><th>Order ID</th><th>Pattern</th><th>Primary Material</th><th>Trim Material</th><th>Date Ordered</th></tr>'+
						'<tr><td>'+result[0].orderId+
						'</td><td>'+result[0].pattern+
						'</td><td>'+result[0].fabricOne+
						'</td><td>'+result[0].fabricTwo+
						'</td><td>'+(result[0].date.getMonth()+1)+'/'+result[0].date.getDate()+
						'</td></tr></table></div>';
						
						outputHTML +='<button class="lock" onclick="window.location=\'/taskView?taskId='+q.query.taskId+'&action=lock\'">Lock</button>'+
							'<button class="complete" onclick="window.location=\'/taskView?taskId='+q.query.taskId+'&action=complete\'">Complete</button>';
						activeDB.query('select * from tracking where taskId=? order by date asc',[q.query.taskId],(err,result) => {
							outputHTML += '<div class="taskElements"><table><tr><th>Employee</th><th>Date</th></tr>'
							if(!result[0]){

								res.writeHead(200, '{"Content-Type": "text/html"}');
								res.write(data+
									outputHTML+
									'</table></div>'+
									data2);
								res.end();
								return;
							}
							result.foreach((item,i,array) => {
								outputHTML+='<tr><td>'+item.user+'</td><td>'+(result[0].date.getMonth()+1)+'/'+result[0].date.getDate()+'</td></tr>'
								
								if(i==array.length-1){
									res.writeHead(200, '{"Content-Type": "text/html"}');
									res.write(data+
										outputHTML+
										'</table></div>'+
										data2);
									res.end();
									return;

								}
							});
						});
					});
				});
			});
		}
	}
	//addOrder page
	else if(q.pathname == '/addOrder'){
		if(req.method == 'POST'){
			body(req,{},(err,form) =>{
				if(err) console.log(err);

				activeDB.query('insert into orders(firstName,lastName,shippingAddress,date) values(?,?,?,localtime());',
					[form.firstName,form.lastName,form.address],(err,result) =>{

					cookieJar.set('orderToEdit',result.insertId,{signed:true});

					res.writeHead(200,'{"Content-Type": "text/html"}');
					res.write('<html><head><link rel="stylesheet" type="text/css" href="material.css"/></head>'+
						'<body onload="window.location=\'/addTask\'"><div class="redirecting">redirecting</div></body></html>');
					res.end();

				});
			});
		}
		else{
			fs.readFile(filename,(err,data) => {
				if(err) {
					res.writeHead(404, '{"Content-Type": "text/html"}');
					res.write("<h1>404 not found</h1>");
					res.end();
					return;
				}
				res.writeHead(200, '{"Content-Type": "'+mime[q.pathname.split('.')[q.pathname.split('.').length-1]]+'"}');
				res.write(data);
				res.end();
			});
		}
	}
	//addTask page
	else if(q.pathname == '/addTask'){
		if(req.method=='POST'){
			body(req,{},(err,form) => {
				activeDB.query('insert into tasks(orderId,pattern,fabricOne,fabricTwo,part,date) values (?,?,?,?,?,localtime());',
					[cookieJar.get('orderToEdit',{signed:true}),form.pattern,form.fabricOne,form.fabricTwo,form.part],
					(err,result) => {
					
					if(err)console.log(err);
				});
			});
		}
		fs.readFile(filename,(err,data) => {
			if(err) {
				res.writeHead(404, '{"Content-Type": "text/html"}');
				res.write("<h1>404 not found</h1>");
				res.end();
				return;
			}
			res.writeHead(200, '{"Content-Type": "'+mime[q.pathname.split('.')[q.pathname.split('.').length-1]]+'"}');
			res.write(data);
			res.end();
		});
	}

	//task table pages
	else if(q.pathname =='/seatCutters' || q.pathname =='/seatSewers' || q.pathname =='/foamers' || q.pathname =='/wallCutters' ||
		q.pathname =='/carpetSewers' || q.pathname =='/gluers' || q.pathname =='/miscCutters'){
		
		//read begining and end of the html template
		fs.readFile('/var/www/html/shell',(err,data) => {
			if(err)	console.log(err);

			fs.readFile('/var/www/html/shellend',(err,data2) =>{

				//query db
				activeDB.query(responsibilities[q.pathname][ (responsibilities[q.pathname][q.query.sortBy]) ? q.query.sortBy : 'Date'],
					(err3,result) => {
					if(err3)console.log(err3);

					//headers for the task table
					var outputHTML = '<table class="taskTable"><tr><th class="clickable" onclick="window.location=\''+q.pathname+'?sortBy='+
							(q.query.sortBy=='Part'?'PartDesc':'Part')+'\'">Part</th>'+
						'<th class="clickable" onclick="window.location=\''+q.pathname+'?sortBy='+
							(q.query.sortBy=='Date'?'DateDesc':'Date')+'\'">Date</th>'+
						'<th class="clickable" onclick="window.location=\''+q.pathname+'?sortBy='+
							(q.query.sortBy=='Pattern'?'PatternDesc':'Pattern')+'\'">Pattern</th>'+
						'<th class="clickable" onclick="window.location=\''+q.pathname+'?sortBy='+
							(q.query.sortBy=='Material'?'MaterialDesc':'Material')+'\'">Primary Material</th>'+
						'<th class="clickable" onclick="window.location=\''+q.pathname+'?sortBy='+
							(q.query.sortBy=='TrimMaterial'?'TrimMaterialDesc':'TrimMaterial')+'\'">Trim Material</th></tr>';
					

					res.writeHead(200, '{"Content-Type": "text/html","Cache-Control": "no-store", "must-revalidate", "max-age=0"}');
					res.write(data);res.write(outputHTML);
					//end response if no results
					if(! result[0]){
						res.write('</table>'+
							data2);
						res.end();
						return;
					}
					//add table row for each record returned by sql query
					result.forEach((item, i ,array) => {
						activeDB.query('select * from orders where orderId=?;',[item.orderId], (err,order)=>{
							outputHTML = '<tr class="taskRow '+(item.locked?"locked":"")+'" onclick="window.location=\'/taskView?taskId='+item.taskId+'\';"><td>'+
								item.part+
								'</td><td>'+(order[0].date.getMonth()+1)+'/'+order[0].date.getDate()+
								'</td><td>'+item.pattern+
								'</td><td>'+item.fabricOne+
								'</td><td>'+item.fabricTwo+
								'</td></tr>';
							//instead of building table and sending it all at once send it as it's being generated
							res.write(outputHTML)
							
							//finish writing response in last iteration of for loop
							if(i==array.length-1){
								res.write('</table>'+
									data2);
								res.end();
							}
						});
					});

				});
			});
		});
	}
	//search
	else if(q.pathname=='/search'){
		fs.readFile('/var/www/html/shell',(err,data)=>{	
			fs.readFile('/var/www/html/shellend',(err,data2)=>{
				if(q.query.search){
					activeDB.query('select * from orders where orderId=?;',[q.query.search],(err,result)=>{
						if(result[0]){
							//redirect to order page
							res.writeHead(200,'{"Content-Type": "text/html"}');
							res.write('<html><head><link rel="stylesheet" type="text/css" href="material.css"/></head>'+
								'<body onload="window.location=\'/orderView?orderId='+q.query.search+'\'"><div class="redirecting">redirecting</div></body></html>');
							res.end();
							
						}
						else{
							activeDB.query('select * from tasks where taskId=?;',[q.query.search],(err,result)=>{
								if(result[0]){
									//redirect to task page
									res.writeHead(200,'{"Content-Type": "text/html"}');
									res.write('<html><head><link rel="stylesheet" type="text/css" href="material.css"/></head>'+
										'<body onload="window.location=\'/taskView?taskId='+q.query.search+'\'"><div class="redirecting">redirecting</div></body></html>');
									res.end();

								}
								else{

									res.writeHead(200, '{"Content-Type": "text/html"}');
									res.write(data+'<div class="noResults">No Results</div>'+data2);
									res.end();
								}
							});
						}
					});
				}
				else{
					res.writeHead(200, '{"Content-Type": "text/html"}');
					res.write(data+'<div class="noResults">No Results</div>'+data2);
					res.end();
				}
			});
		});
	}
	//serve file in html folder or 404 page
	else{
		fs.readFile(filename,(err,data) => {
			//if the file doesn't exist serve 404 page
			if(err) {
				res.writeHead(404, '{"Content-Type": "text/html"}');
				res.write("<h1>404 not found</h1>");
				res.end();
				return;
			}

			//serve whatever file was requested by url
			res.writeHead(200, '{"Content-Type": "'+mime[q.pathname.split('.')[q.pathname.split('.').length-1]]+'"}');
			res.write(data);
			res.end();
		});
	}
}).listen(80);
