window.addEventListener("message", receiveMessage, false);
function receiveMessage(event){
	publish("/external/"+event.data);
}

function subscribeOnce(message,callback){
	var handler = subscribe(message,function(){
		unsubscribe(handler);
		callback();
	});
}