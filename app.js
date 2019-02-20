const request = require('sync-request');
const fs = require('fs');
const readline = require('readline');

var next = undefined;
var data = '';
var smi = '<SAMI>\n'+
'<HEAD>\n'+
'<STYLE TYPE="text/css">\n'+
'<!--\n'+
'P { margin-left:8pt; margin-right:8pt; margin-bottom:2pt;\n'+
    'margin-top:2pt; font-size:20pt; text-align:center;\n'+
    'font-family:굴림, Arial; font-weight:bold; color:white;\n'+
    'background-color:black; }\n'+
'.KRCC { Name:한국어; lang:ko-KR; SAMIType:CC; }\n'+
'-->\n'+
'</STYLE>\n'+
'</HEAD>\n'+
'<BODY>\n';


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('video id : ', (answer) => {
	var id = answer;
	var smi_arr = [];  
  
	var res = request('GET','https://api.twitch.tv/v5/videos/' + id + '/comments?content_offset_seconds=0&client_id=2gw2reattwb1cj79nyi7uypplw9zey');

	var json = JSON.parse(res.getBody());
	var comments = json['comments'];
	next = json['_next'];
	console.log(next);
	for(var i = 0;i<comments.length;i++)
	{
		data += comments[i].commenter.display_name+'('+comments[i].commenter.name+')['+comments[i].content_offset_seconds+'] : ' + comments[i].message.body + '\n';
		smi_arr.push([comments[i].content_offset_seconds,comments[i].commenter.display_name+'('+comments[i].commenter.name+') : ' + comments[i].message.body+'\n']);
		//smi += '<SYNC Start=' + (comments[i].content_offset_seconds)*100 +'><P Class=KRCC>\n'+comments[i].commenter.display_name+'('+comments[i].commenter.name+')['+comments[i].content_offset_seconds+'] : ' + comments[i].message.body+'\n';
	}    

	while(next)
	{	
		var res = request('GET','https://api.twitch.tv/v5/videos/' + id + '/comments?content_offset_seconds=0&client_id=2gw2reattwb1cj79nyi7uypplw9zey&cursor=' + next);
		var json = JSON.parse(res.getBody());
		var comments = json['comments'];
		next = json['_next']
		console.log(next);
		for(var i = 0;i<comments.length;i++)
		{
			data += comments[i].commenter.display_name+'('+comments[i].commenter.name+')['+comments[i].content_offset_seconds+'] : ' + comments[i].message.body + '\n';
			smi_arr.push([comments[i].content_offset_seconds,comments[i].commenter.display_name+'('+comments[i].commenter.name+') : ' + comments[i].message.body+'\n']);
			//smi += '<SYNC Start=' + (comments[i].content_offset_seconds)*100 +'><P Class=KRCC>\n'+comments[i].commenter.display_name+'('+comments[i].commenter.name+')['+comments[i].content_offset_seconds+'] : ' + comments[i].message.body+'\n';
		}  
	}
//'<SYNC Start=' + (comments[i].content_offset_seconds)*100 +'><P Class=KRCC>\n'+
	for(var i = 0 ; i < smi_arr.length ; i++)
	{
		var tmp = '';
		for(var j=i;j>=0;j--)
		{
			if(smi_arr[i][0]-smi_arr[j][0] > 5) break;
			else
			{
				if(i!=j) tmp = '<br>' + tmp;
				tmp = smi_arr[j][1] + tmp;
			}
		}
		smi += '<SYNC Start=' + (smi_arr[i][0])*1000 +'><P Class=KRCC>\n' + tmp;
	}
	
	smi += '</BODY>\n</SAMI>';
		
	fs.writeFileSync('chat.txt',data,err=>console.log(err));
	fs.writeFileSync('chat.smi',smi,err=>console.log(err));
  
  
	rl.close();
});
