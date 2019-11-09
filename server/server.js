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

const responsibilities = {
	'/seatCutters'	: 'part="seat assembly" and cut=0',
	'/wallCutters'	: '(part="wall assembly" or part="carpet") and cut=0',
	'/seatSewers'	: 'part="seat assembly" and cut=1 and sewn=0',
	'/carpetSewers'	: 'null',
	'/miscCutters'	: 'null',
	'/foamers'	: 'null',
	'/gluers'	: 'null'
};

const sort = {
	'Date'		: 'date asc;',
	'Pattern'	: 'pattern asc, date asc;',
	'Material'	: 'fabricOne asc, fabricTwo asc, date asc;'
};

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
							'</td><td>'+'to be implemented'//(item.date.getMonth()+1)+'/'+i;tem.date.getDate()+
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
				activeDB.query('select * from tasks where '+responsibilities[q.pathname]+' order by '+sort[q.query.sortBy],
					(err3,result) => {
					if(err3) console.log(err3);

					var outputHTML = '<table class="taskTable"><tr><th class="redClickable">Part</th>'+
						'<th class="redClickable" onclick="window.location=\''+q.pathname+'?sortBy=Date\'">Date</th>'+
						'<th class="redClickable" onclick="window.location=\''+q.pathname+'?sortBy=Pattern\'">Pattern</th>'+
						'<th class="redClickable" onclick="window.location=\''+q.pathname+'?sortBy=Material\'">Primary Material</th>'+
						'<th class="redClickable" onclick="window.location=\''+q.pathname+'?sortBy=Material\'">Trim Material</th></tr>';
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
					res.writeHead(200, '{"Content-Type": "text/html"}');
					res.write(data +
						outputHTML+
						data2);
					res.end();
				});
			});
		});
	}
			
	else if(q.query.taskId != undefined){
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
					res.writeHead(200, '{"Content-Type": "text/html"}');
					res.write(data+
						outputHTML+
						data2);
					res.end();
				});
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
}).listen(80);
