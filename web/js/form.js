function valida(){ 
	if (document.form.nome.value==""){
		alert("Por favor, preencha o campo Nome Completo.");
		form.nome.focus();
	}
	else if (document.form.email.value==""){
		alert("Por favor, preencha o campo E-mail.");
		form.email.focus();
	}
	else if (document.form.estado.value == "" || document.form.estado.value == "- -"){
		alert("Por favor, preencha o campo Estado.");
		form.estado.focus();
	}
	else if (document.form.assunto.value==""){
		alert("Por favor, preencha o campo Assunto.");
		form.assunto.focus();
	}
	else if (document.form.comentarios.value==""){
		alert("Por favor, escreva uma mensagem.");
		form.comentarios.focus();
	}
	else
		document.form.submit();
}