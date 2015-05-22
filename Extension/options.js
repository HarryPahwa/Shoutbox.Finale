function pushkeystolocalStorage() {
	var inputkey= document.getElementById("ck");
	localStorage.setItem("ckey", inputkey.value);
	
	var inputseckey= document.getElementById("cs");
	localStorage.setItem("csec", inputseckey.value);
	
	var inputtokkey= document.getElementById("tk");
	localStorage.setItem("tkey", inputtokkey.value);
	
	var inputtoksec= document.getElementById("ts");
	localStorage.setItem("tsec", inputtoksec.value);
}

document.getElementById("saveoptions").addEventListener("click",pushkeystolocalStorage);
