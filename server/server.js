var http 	= require('http');
var fs 		= require('fs');
var mysql 	= require('mysql');
var url 	= require('url');
var body	= require('body/form');

var activeDB = mysql.createPool({
	connectionLimit	:	10,
	host 		: 	'localhost',
	user		:	"root",
	password	:	"Doddstretch1234!",
	database 	:	"airtex"
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
		'Date'			: 'select * from tasks where '+seatCutterParts+' order by date asc;',
		'Part'			: 'select * from tasks where '+seatCutterParts+' order by part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+seatCutterParts+' order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+seatCutterParts+' order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+seatCutterParts+' order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+seatCutterParts+' order by date desc;',
		'PartDesc'		: 'select * from tasks where '+seatCutterParts+' order by part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+seatCutterParts+' order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+seatCutterParts+' order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+seatCutterParts+' order by fabricTwo desc, fabricOne asc, date asc;'
	},
	'/wallCutters'	: {
		'Date'			: 'select * from tasks where '+wallCutterParts+' order by date asc;',
		'Part'			: 'select * from tasks where '+wallCutterParts+' order by part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+wallCutterParts+' order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+wallCutterParts+' order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+wallCutterParts+' order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+wallCutterParts+' order by date desc;',
		'PartDesc'		: 'select * from tasks where '+wallCutterParts+' order by part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+wallCutterParts+' order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+wallCutterParts+' order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+wallCutterParts+' order by fabricTwo desc, fabricOne asc, date asc;'
	},
	'/seatSewers'	: {
		'Date'			: 'select * from tasks where '+seatSewerParts+' order by date asc;',
		'Part'			: 'select * from tasks where '+seatSewerParts+' order by part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+seatSewerParts+' order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+seatSewerParts+' order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+seatSewerParts+' order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+seatSewerParts+' order by date desc;',
		'PartDesc'		: 'select * from tasks where '+seatSewerParts+' order by part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+seatSewerParts+' order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+seatSewerParts+' order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+seatSewerParts+' order by fabricTwo desc, fabricOne asc, date asc;'
	},
	'/carpetSewers'	: {
		'Date'			: 'select * from tasks where '+carpetSewerParts+' order by date asc;',
		'Part'			: 'select * from tasks where '+carpetSewerParts+' order by part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+carpetSewerParts+' order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+carpetSewerParts+' order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+carpetSewerParts+' order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+carpetSewerParts+' order by date desc;',
		'PartDesc'		: 'select * from tasks where '+carpetSewerParts+' order by part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+carpetSewerParts+' order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+carpetSewerParts+' order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+carpetSewerParts+' order by fabricTwo desc, fabricOne asc, date asc;'
	},
	'/miscCutters'	: {
		'Date'			: 'select * from tasks where '+miscCutterParts+' order by date asc;',
		'Part'			: 'select * from tasks where '+miscCutterParts+' order by part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+miscCutterParts+' order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+miscCutterParts+' order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+miscCutterParts+' order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+miscCutterParts+' order by date desc;',
		'PartDesc'		: 'select * from tasks where '+miscCutterParts+' order by part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+miscCutterParts+' order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+miscCutterParts+' order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+miscCutterParts+' order by fabricTwo desc, fabricOne asc, date asc;'
	},
	'/gluers'	:{
		'Date'			: 'select * from tasks where '+gluerParts+' order by date asc;',
		'Part'			: 'select * from tasks where '+gluerParts+' order by part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+gluerParts+' order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+gluerParts+' order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+gluerParts+' order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+gluerParts+' order by date desc;',
		'PartDesc'		: 'select * from tasks where '+gluerParts+' order by part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+gluerParts+' order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+gluerParts+' order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+gluerParts+' order by fabricTwo desc, fabricOne asc, date asc;'
	},
	'/foamers'	: { 
		'Date'			: 'select * from tasks where '+foamerParts+' order by date asc;',
		'Part'			: 'select * from tasks where '+foamerParts+' order by part asc, date asc;',
		'Pattern'		: 'select * from tasks where '+foamerParts+' order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where '+foamerParts+' order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where '+foamerParts+' order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where '+foamerParts+' order by date desc;',
		'PartDesc'		: 'select * from tasks where '+foamerParts+' order by part desc, date asc;',
		'PatternDesc'		: 'select * from tasks where '+foamerParts+' order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where '+foamerParts+' order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where '+foamerParts+' order by fabricTwo desc, fabricOne asc, date asc;'
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
	
	if(q.pathname=='/login'){
		body(req,{},(err,form) => {
			if (err) console.log(form);

			activeDB.query('select * from users where user = "'+form.userName+'";',(err,result) =>{
				if(err){
					console.log(err);
					res.end();
					return;
				}
				
				if(result.length<1 && form.password == result[0].password){
					//serve page with redirect to orders
					res.writeHead(200,'{"Content-Type": "text/html"}');
					res.write('<html><head><link rel="stylesheet" type="text/css" href="material.css"/></head>'+
						'<body onload="window.history.back()"><div class="redirecting">redirecting</div></body></html>');
					res.end();
					return;
				}
				
				fs.readFile('/var/www/html/loginbad',(err,data) => {
					if(err) console.log(err);
					
					res.writeHead(200, '{"Content-Type": "text/html"}');
					res.write(data);
					res.end();	
				});

				
			});
		});
		

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
					var outputHTML = '<table class="taskTable"><tr><th class="clickable">Order ID</th>'+
						'<th class="clickable">Date Ordered</th>'+
						'<th class="clickable">First Name</th>'+
						'<th class="clickable">Last Name</th>'+
						'<th class="clickable">Installation</th></tr>';
					
					//add table row for each order record
					result.forEach((item) => {
						outputHTML += '<tr class="clickable" onclick="window.location=\'/\';"><td>'+
							item.orderId+
							'</td><td>'+'to be implemented'+//(item.date.getMonth()+1)+'/'+item.date.getDate()+
							'</td><td>'+item.firstName+
							'</td><td>'+item.lastName+
							'</td><td>'+item.installation == 1 ? "Install": "No Install"+
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
	//taskView page		
	else if(q.pathname == '/taskView'){

		//if user pressed lock button
		if(q.query.action=="lock"){
			
			//update locked column
			activeDB.query('update tasks set locked=1 where taskId='+q.query.taskId,(err,result) =>{
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
			activeDB.query('select * from tasks where taskId='+q.query.taskId,(err,result) =>{
				if(err) {
					console.log(err);
					//write error page here
				}
				var update = '';
				//headliners are only ever cut so always set all bools to true 
				if(result[0].part == "Headliner") update ='cut=1, sewn=1, finished=1';
				//everything else needs to be cut and sent to the next station
				else if(result[0].cut==0) update='cut=1';
				//each of these items are only either cut and finished or cut and sewn so set everything to true on the second completion (after being cut)
				else if(result[0].part in {'Wind Sock':'','Seat Sling':'','Baggage Compartment':'','Draft Boot':'','Shock Cord Boot':'','Wall Panel':'','Firewall Cover':''}) 
					update ='sewn=1,finished=1';
				//set sewn to true for everything else that has already been cut
				else if( result[0].sewn==0) update='sewn=1';
				//if it's already been cut and sewn set to finished
				else  update='finished=1';
				
				//perform the mysql update decided on above
				activeDB.query('update tasks set '+update+',locked=0 where taskId='+q.query.taskId,(err,result) =>{

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
					activeDB.query('select * from tasks where taskId='+q.query.taskId,(err3,result) =>{
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
						res.writeHead(200, '{"Content-Type": "text/html"}');
						res.write(data+
							outputHTML+
							data2);
						res.end();
					});
				});
			});
		}
	}

	//addOrder page
	else if(q.pathname == '/addOrder'){
		//if the submit button was pressed add a task record
		//just a preliminary implementation
		activeDB.query('insert into tasks(pattern,fabricOne,fabricTwo,part,date) values ("'+
			q.query.pattern+'","'+q.query.fabricOne+'","'+q.query.fabricTwo+'","'+q.query.part+'",localtime());',
			(err,result) => {
			if(err)console.log(err);
		});
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
	else if(q.pathname =='/seatCutters' || q.pathname =='/seatSewers' || q.pathname =='/foamers' || q.pathname =='/wallCutters' || q.pathname =='/carpetSewers' || q.pathname =='/gluers' || q.pathname =='/miscCutters'){
		
		//if the path has a sortBy in the query string but not a valid pathname serve 404
		if(responsibilities[q.pathname]==undefined){
			res.writeHead(404, '{"Content-Type": "text/html"}');
			res.write("<h1>404 not found</h1>");
			res.end();
			return;
		}
		
		//read begining and end of the html template
		fs.readFile('/var/www/html/shell',(err,data) => {
			if(err)	console.log(err);

			fs.readFile('/var/www/html/shellend',(err,data2) =>{
				activeDB.query(responsibilities[q.pathname][q.query.sortBy],
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
					
					//add table row for each reccord returned by sql query
					result.forEach((item) => {
						outputHTML += '<tr class="taskRow" onclick="window.location=\'/taskView?taskId='+item.taskId+'\';"><td>'+
							item.part+
							'</td><td>'+(item.date.getMonth()+1)+'/'+item.date.getDate()+
							'</td><td>'+item.pattern+
							'</td><td>'+item.fabricOne+
							'</td><td>'+item.fabricTwo+
							'</td></tr>';
					});
					outputHTML += '</table>';

					//serve table in the middle of the html template
					res.writeHead(200, '{"Content-Type": "text/html","Cache-Control": "no-store", "must-revalidate", "max-age=0"}');
					res.write(data +
						outputHTML+
						data2);
					res.end();
				});
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
