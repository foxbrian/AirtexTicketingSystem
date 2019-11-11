var http 	= require('http');
var fs 		= require('fs');
var mysql 	= require('mysql');
var url 	= require('url');
var formidable 	= require('formidable');

var activeDB = mysql.createPool({
	connectionLimit	:	10,
	host 		: 	'localhost',
	user		:	"root",
	password	:	"Doddstretch1234!",
	database 	:	"airtex"
});

//SQL queries for each filter and sort combination
const responsibilities = {
	'/seatCutters'	: {
		'Date'			: 'select * from tasks where part="seat assembly" and cut=0 order by date asc;',
		'Pattern'		: 'select * from tasks where part="seat assembly" and cut=0 order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where part="seat assembly" and cut=0 order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where part="seat assembly" and cut=0 order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where part="seat assembly" and cut=0 order by date desc;',
		'PatternDesc'		: 'select * from tasks where part="seat assembly" and cut=0 order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where part="seat assembly" and cut=0 order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where part="seat assembly" and cut=0 order by fabricTwo desc, fabricOne asc, date asc;'
	},
	'/wallCutters'	: {
		'Date'			: 'select * from tasks where part="wall assembly" or part="carpet" and cut=0 order by date asc;',
		'Pattern'		: 'select * from tasks where part="wall assembly" or part="carpet" and cut=0 order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where part="wall assembly" or part="carpet" and cut=0 order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where part="wall assembly" or part="carpet" and cut=0 order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where part="wall assembly" or part="carpet" and cut=0 order by date desc;',
		'PatternDesc'		: 'select * from tasks where part="wall assembly" or part="carpet" and cut=0 order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where part="wall assembly" or part="carpet" and cut=0 order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where part="wall assembly" or part="carpet" and cut=0 order by fabricTwo desc, fabricOne asc, date asc;'
	},
	'/seatSewers'	: {
		'Date'			: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="seat assembly" and cut=1 and sewn=0 order by date asc;',
		'Pattern'		: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="seat assembly" and cut=1 and sewn=0 order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="seat assembly" and cut=1 and sewn=0 order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="seat assembly" and cut=1 and sewn=0 order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="seat assembly" and cut=1 and sewn=0 order by date desc;',
		'PatternDesc'		: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="seat assembly" and cut=1 and sewn=0 order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="seat assembly" and cut=1 and sewn=0 order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="seat assembly" and cut=1 and sewn=0 order by fabricTwo desc, fabricOne asc, date asc;'
	},
	'/carpetSewers'	: {
		'Date'			: 'select * from tasks where part="carpet" and cut=1 and sewn=0 order by date asc;',
		'Pattern'		: 'select * from tasks where part="carpet" and cut=1 and sewn=0 order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where part="carpet" and cut=1 and sewn=0 order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where part="carpet" and cut=1 and sewn=0 order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where part="carpet" and cut=1 and sewn=0 order by date desc;',
		'PatternDesc'		: 'select * from tasks where part="carpet" and cut=1 and sewn=0 order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where part="carpet" and cut=1 and sewn=0 order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where part="carpet" and cut=1 and sewn=0 order by fabricTwo desc, fabricOne asc, date asc;'
	},
	'/miscCutters'	: {
		'Date'			: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="headliner" and cut=0 order by date asc;',
		'Pattern'		: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="headliner" and cut=0 order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="headliner" and cut=0 order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="headliner" and cut=0 order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="headliner" and cut=0 order by date desc;',
		'PatternDesc'		: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="headliner" and cut=0 order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="headliner" and cut=0 order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where part="wind sock" or part="seat sling" or part="baggage compartment" or part="draft boot" or part="shock cord boot" or part="headliner" and cut=0 order by fabricTwo desc, fabricOne asc, date asc;'
	},
	//these queries are stand-ins and just return seat sewers
	'/gluers'	:{
		'Date'			: 'select * from tasks where part="carpet" and cut=1 and sewn=1 order by date asc;',
		'Pattern'		: 'select * from tasks where part="carpet" and cut=1 and sewn=1 order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where part="carpet" and cut=1 and sewn=1 order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where part="carpet" and cut=1 and sewn=1 order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where part="carpet" and cut=1 and sewn=1 order by date desc;',
		'PatternDesc'		: 'select * from tasks where part="carpet" and cut=1 and sewn=1 order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where part="carpet" and cut=1 and sewn=1 order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where part="carpet" and cut=1 and sewn=1 order by fabricTwo desc, fabricOne asc, date asc;'
	},
	'/foamers'	: { 
		'Date'			: 'select * from tasks where part="seat assembly" and sewn=1 and finished=0 order by date asc;',
		'Pattern'		: 'select * from tasks where part="seat assembly" and sewn=1 and finished=0 order by pattern asc, date asc;',
		'Material'		: 'select * from tasks where part="seat assembly" and sewn=1 and finished=0 order by fabricOne asc, fabricTwo asc, date asc;',
		'TrimMaterial'		: 'select * from tasks where part="seat assembly" and sewn=1 and finished=0 order by fabricTwo asc, fabricOne asc, date asc;',
		'DateDesc'		: 'select * from tasks where part="seat assembly" and sewn=1 and finished=0 order by date desc;',
		'PatternDesc'		: 'select * from tasks where part="seat assembly" and sewn=1 and finished=0 order by pattern desc, date asc;',
		'MaterialDesc'		: 'select * from tasks where part="seat assembly" and sewn=1 and finished=0 order by fabricOne desc, fabricTwo asc, date asc;',
		'TrimMaterialDesc'	: 'select * from tasks where part="seat assembly" and sewn=1 and finished=0 order by fabricTwo desc, fabricOne asc, date asc;'
	}
};

//text used to build the header of HTTP message
var mime = {
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

	if(q.pathname =='/allOrders'){
		fs.readFile('/var/www/html/shell',(err,data) => {
			if(err)	console.log(err);

			fs.readFile('/var/www/html/shellend',(err,data2) =>{
				activeDB.query('select * from orders',
					(err3,result) => {

					if(err3) console.log(err3);
					var outputHTML = '<table class="taskTable"><tr><th class="redClickable">Order ID</th>'+
						'<th class="redClickable">Date Ordered</th>'+
						'<th class="redClickable">First Name</th>'+
						'<th class="redClickable">Last Name</th>'+
						'<th class="redClickable">Installation</th></tr>';
					result.forEach((item) => {
						outputHTML += '<tr class="redClickable" onclick="window.location=\'/\';"><td>'+
							item.orderId+
							'</td><td>'+'to be implemented'+//(item.date.getMonth()+1)+'/'+item.date.getDate()+
							'</td><td>'+item.firstName+
							'</td><td>'+item.lastName+
							'</td><td>'+item.installation == 1 ? "Install": "No Install"+
							'</td></tr>';
					});
					outputHTML += '</table>';
					res.writeHead(200, '{"Content-Type": "text/html"}');
					res.write(data+
						outputHTML+
						data2);
					res.end();
				});
			});
		});
	}

	else if(q.query.sortBy != undefined){
		fs.readFile('/var/www/html/shell',(err,data) => {
			if(err)	console.log(err);

			fs.readFile('/var/www/html/shellend',(err,data2) =>{
				activeDB.query(responsibilities[q.pathname][q.query.sortBy],
					(err3,result) => {
					if(err3) console.log(err3);

					var outputHTML = '<table class="taskTable"><tr><th class="redClickable">Part</th>'+
						'<th class="redClickable" onclick="window.location=\''+q.pathname+'?sortBy='+
							(q.query.sortBy=='Date'?'DateDesc':'Date')+'\'">Date</th>'+
						'<th class="redClickable" onclick="window.location=\''+q.pathname+'?sortBy='+
							(q.query.sortBy=='Pattern'?'PatternDesc':'Pattern')+'\'">Pattern</th>'+
						'<th class="redClickable" onclick="window.location=\''+q.pathname+'?sortBy='+
							(q.query.sortBy=='Material'?'MaterialDesc':'Material')+'\'">Primary Material</th>'+
						'<th class="redClickable" onclick="window.location=\''+q.pathname+'?sortBy='+
							(q.query.sortBy=='TrimMaterial'?'TrimMaterialDesc':'TrimMaterial')+'\'">Trim Material</th></tr>';
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
					res.writeHead(200, '{"Content-Type": "text/html","Cache-Control": "no-store", "must-revalidate", "max-age=0"}');
					res.write(data +
						outputHTML+
						data2);
					res.end();
				});
			});
		});
	}
			
	else if(q.query.taskId != undefined){
		if(q.query.action=="lock"){

			activeDB.query('update tasks set locked=1 where taskId='+q.query.taskId,(err,result) =>{
				if(err) {
					console.log(err);
					//write error page here
				}
			});
			
			res.writeHead(200,'{"Content-Type": "text/html"}');
			res.write('<html><head><link rel="stylesheet" type="text/css" href="index.css"/></head>'+
				'<body onload="window.history.back()"><div class="redirecting">redirecting</div></body></html>');
			res.end();
		}
		else if(q.query.action=="complete"){
			
			activeDB.query('select * from tasks where taskId='+q.query.taskId,(err,result) =>{
				if(err) {
					console.log(err);
					//write error page here
				}
				var update = '';
				if(result[0].cut==0) update='cut';
				else if(result[0].sewn==0) update='sewn';
				else  update='finished';

				activeDB.query('update tasks set '+update+'=1 where taskId='+q.query.taskId,(err,result) =>{

				});
			});

			res.writeHead(200,'{"Content-Type": "text/html"}');
			res.write('<html><head><link rel="stylesheet" type="text/css" href="index.css"/></head>'+
				'<body onload="window.history.go(-2)"><div class="redirecting">redirecting</div></body></html>');
			res.end();
		}
		else{
			fs.readFile('/var/www/html/shell',(err,data) => {
				if(err)	console.log(err);

				fs.readFile('/var/www/html/shellend',(err,data2) =>{
					activeDB.query('select * from tasks where taskId='+q.query.taskId,(err3,result) =>{
						var outputHTML = '<div class="taskElements"><table><tr><td>Order ID</td><td>'+result[0].orderId+
						'<tr><td>Pattern</td><td>'+result[0].pattern+
						'</td></tr><tr><td>Primary Material</td><td>'+result[0].fabricOne+
						'</td></tr><tr><td>Trim Material</td><td>'+result[0].fabricTwo+
						'</td></tr><tr><td>Date Ordered</td><td>'+(result[0].date.getMonth()+1)+'/'+result[0].date.getDate()+
						'</td></tr></table></div>';
						
						outputHTML +='<button onclick="window.location=\'/taskView?taskId='+q.query.taskId+'&action=lock\'">Lock</button>'+
							'<button onclick="window.location=\'/taskView?taskId='+q.query.taskId+'&action=complete\'">Complete</button>';
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
	else if(q.query.pattern != undefined){
		activeDB.query('insert into tasks(pattern,fabricOne,fabricTwo,part,date) values ("'+
			q.query.pattern+'","'+q.query.fabricOne+'","'+q.query.fabricTwo+'","'+q.query.part+'",curdate());',
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
}).listen(80);
