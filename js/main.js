
	function TemplateEngine(template, options) {
		
		let re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0, match;
		let add = function(line, js) {
			js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
				(code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
			return add;
		}
		while(match = re.exec(template)) {
			add(template.slice(cursor, match.index))(match[1], true);
			cursor = match.index + match[0].length;
		}
		add(template.substr(cursor, template.length - cursor));
		code += 'return r.join("");';
		return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
	}
	
	function generateResultCard(result){
		return TemplateEngine(resultCard,result)
	}
	
	function getCardUrl(cards,cardImg){
		try{
			let u = new URL(cardImg);
			return cardImg
		}catch(err){
			let cardId = cards.find((e)=>{return e.n==cardImg;})?.id;
			cardId = cardId ? cardId : 3433;
			return `https://www.duelingbook.com/images/low-res/${cardId}.jpg`;
		}
	}
	
	const resultCard = `<div class="resultCard">
		<span class="resultPlacing"><%this.placing%></span>
		<img class="resultImg" src="<%this.cardUrl%>"/>
		<%if(this.subCardUrl){%>
		<div class="resultSubImgBefore"></div>
		<img class="resultSubImg" src="<%this.subCardUrl%>"/>
		
		<%}%>
		<span class="resultName"><span class="resultNameInner"><%this.name%></span></span>
	
	</div>`;
	
	window.onload = function(){
		
		var results = [];
		
		if(window.location.hash) {
			let array = decodeURIComponent(window.location.hash).substr(1).split("|");
			let chunkSize = 11;
			
			let topPlayers = 8;
			
			let i = 0;
			for (i = 0; i < (topPlayers * chunkSize); i += chunkSize) {
				let chunk = array.slice(i, i + chunkSize);
				results.push({
					cardId : chunk[9],
					subCardId : chunk[10],
					name : chunk[1],
				})
			}
			
			document.body.style = `
				--background-image-url : url(${array[i]});
				--main-bg-color : ${array[i+1]};
				--main-tx-color : ${array[i+2]};
			`
			
		}
		
		results = results.map(function(e,i,a){e.placing = i+1;return e});
	
			
			let x = new XMLHttpRequest();
			x.open("GET", "https://www.duelingbook.com/static/cards.json");
			x.onload = function() {
				let cards = JSON.parse(x.responseText).cards
			
				for(let i in results){
					
					results[i].cardUrl = getCardUrl(cards,results[i].cardId);
					results[i].subCardUrl = getCardUrl(cards,results[i].subCardId);

				}
			
				document.getElementById("winnerContainer").innerHTML = generateResultCard(results[0]);
			
				document.getElementById("top4Container").innerHTML = results.slice(1,4).map(generateResultCard).join("");
				
				document.getElementById("top8Container").innerHTML = results.slice(4,8).map(generateResultCard).join("");
				
			};
			x.send();
		
		
		
		
	}