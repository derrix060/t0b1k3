var tableid = '167nrUQCIXT_hcpHvgxJeA9ENRv2Z4yKfxFTaQMeY';
var googleid = 'AIzaSyB62D6fHbHXLn2TtQZez04o5pIsGVaCD2g';
var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService = new google.maps.DirectionsService();
var posicao_atual;
var markerPosAtual;

function initialize() {
	//Mapa
		var map = new google.maps.Map(
		document.getElementById("map_canvas"), {
			fusionTableId: tableid,
			//googleApiKey: googleid,
			center: new google.maps.LatLng(-23.555385, -46.633564),
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROADMAP, //para Terreno
			disableDefaultUI: true, //remove os botões
			//zoomControl: true, //controle de zoom
			//scaleControl: true, //escala
		});
		
	//Directions
		//directionsDisplay = new google.maps.DirectionsRenderer();
		directionsDisplay.setMap(map);
		directionsDisplay.setPanel(document.getElementById("trajeto-texto"));
		
		
	//Searchbox Menu -> Autocomplete
		var input = document.getElementById('txtEnderecoPartidaTxtBox');
		var autocomplete = new google.maps.places.Autocomplete(input);
		
		autocomplete.bindTo('bounds', map);
		var infowindow = new google.maps.InfoWindow();
		var marker = new google.maps.Marker({
			map: map,
			anchorPoint: new google.maps.Point(0, -29)
		});
		
	//Mudanca do autocomplete
		autocomplete.addListener('place_changed', function() {
		infowindow.close();
		marker.setVisible(false);
		var place = autocomplete.getPlace();
		if (!place.geometry) {
		  window.alert("Autocomplete's returned place contains no geometry");
		  return;
		}

		// If the place has a geometry, then present it on a map.
		if (place.geometry.viewport) {
		  map.fitBounds(place.geometry.viewport);
		} else {
			var novo_centro = place.geometry.location.novo_ponto(0,1);
			map.setCenter(novo_centro);
			map.setZoom(14);  //Why 14? Because it looks good.
		}
		marker.setIcon(/** @type {google.maps.Icon} */({
		  url: place.icon,
		  size: new google.maps.Size(71, 71),
		  origin: new google.maps.Point(0, 0),
		  anchor: new google.maps.Point(17, 34),
		  scaledSize: new google.maps.Size(35, 35)
		}));
		marker.setPosition(place.geometry.location);
		marker.setVisible(true);

		var address = '';
		if (place.address_components) {
		  address = [
			(place.address_components[0] && place.address_components[0].short_name || ''),
			(place.address_components[1] && place.address_components[1].short_name || ''),
			(place.address_components[2] && place.address_components[2].short_name || '')
		  ].join(' ');
		}
		var start = document.getElementById('txtEnderecoPartida').value;
		
		if (start == ""){
			infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address +
			  '</div><br><p><i><label>Rota até aqui:</label></p></i> ' +
			  '<input type="text" id="txtEnderecoPartidaInfoView">' +
			  '<input type="button" value="go" id="go">');
			
			var inputInfo = (document.getElementById('txtEnderecoPartidaInfoView'));
			var autocompleteInfo =  new google.maps.places.Autocomplete(inputInfo);
		}
		else{
			infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address +
			  '</div><br><p><i><label>Rota até aqui:</label></p></i> ' +
			  //'<input type="text" id="txtEnderecoPartidaInfoView">' +
			  '<input type="button" value="go" id="go">');
		}
		infowindow.open(map, marker);
		
		//botao Go
		google.maps.event.addDomListener(document.getElementById('go'), 'click', function() {
				document.getElementById('txtEnderecoChegada').value = place.geometry.location
				//remove marker e info antigos
					marker.setVisible(false);
					infowindow.close();
				//gera rota
				submit_form();
			});
		
		});
		
	//Fusion Tables
		var layer = new google.maps.FusionTablesLayer();
		filterMap(layer,map);
	
	//Ciclovias
		var bikeLayer = new google.maps.BicyclingLayer();
		filtrar_ciclovia(bikeLayer,map);
	
	//Comandos dos checkbox
		google.maps.event.addDomListener(document.getElementById('ciclovia'), 'click', function(){
			trocar_icone('ciclovia');
			filtrar_ciclovia(bikeLayer,map);
		});
		google.maps.event.addDomListener(document.getElementById('bicicletario'), 'click', function(){
			trocar_icone('bicicletario');
			filterMap(layer,map);
		});
		google.maps.event.addDomListener(document.getElementById('bomba'), 'click', function(){
			trocar_icone('bomba');
			filterMap(layer,map);
		});
		google.maps.event.addDomListener(document.getElementById('chuveiro'), 'click', function(){
			trocar_icone('chuveiro');
			filterMap(layer,map);
		});
		google.maps.event.addDomListener(document.getElementById('oficina'), 'click', function(){
			trocar_icone('oficina');
			filterMap(layer,map);
		});
		google.maps.event.addDomListener(document.getElementById('bikestore'), 'click', function(){
			trocar_icone('bikestore');
			filterMap(layer,map);
		});
		
	//Botões do Trajeto
		google.maps.event.addDomListener(document.getElementById('chevron_trajeto'),'click', function(){
			change_visible_direction();
			change_position_botoes_direction();
			change_icon_chevron();
		});
		google.maps.event.addDomListener(document.getElementById('times_direction'),'click', function(){
			//fechar directions
			set_visible_botoes_direction("hidden");
			set_visible_trajeto_txt("hidden");
			
			//remover directions
			directionsDisplay.setMap(null);
			
		});
		google.maps.event.addListener(directionsDisplay, "directions_changed", function(){
			//sempre que alterar o trajeto, mostrar novamente a txt
			set_visible_trajeto_txt("visible");
		});
	
	//Botôes da Esquerda
		google.maps.event.addDomListener(document.getElementById('findMe'),'click',function(){
			infowindow.close;
			map.setCenter(markerPosAtual.getPosition());
			infowindow.setContent("Estou aqui!");
			infowindow.open(map, markerPosAtual);
		});
		
	//Search Menu
		google.maps.event.addDomListener(document.getElementById('searchMenu'),'click',function(){
			document.getElementById('txtEnderecoChegada').value = document.getElementById('txtEnderecoPartidaTxtBox').value
			altera_txtTrajeto();
		});
	//Formulario
		google.maps.event.addDomListener(document.getElementById('btnEnviar'), 'click', function(){
			submit_form();
		});
		
	
	//Infoview de quando clica no ponto
		var infoWindow = new google.maps.InfoWindow();
		google.maps.event.addListener(layer, 'click', function(ponto) {	
			//centro do mapa deslocado
				//var novo_centro = e.latLng.novo_ponto(0,1);
				//map.setCenter(novo_centro);
			
			//remover marcacao e infobox do ponto anterior
				marker.setVisible(false);
				infowindow.close();
			
			var start = document.getElementById('txtEnderecoPartida').value;
			
			if (start == ""){
				infoWindow.setContent('<div class="cb-infowindow" ' +ponto.infoWindowHtml +
				  '</div><br><p><i><label>Rota até aqui:</label></p></i> ' +
				  '<input type="text" id="txtEnderecoPartidaInfoView">' +
				  '<input type="button" value="go" id="go">');
				
				
			}
			else{
				infoWindow.setContent('<div class="cb-infowindow" ' +ponto.infoWindowHtml +
				  '</div><br><p><i><label>Rota até aqui:</label></p></i> ' +
				  //'<input type="text" id="txtEnderecoPartidaInfoView">' +
				  '<input type="button" value="go" id="go">');
			}
			infoWindow.setPosition(ponto.latLng);
			infoWindow.open(map);
			
			//autocomplete no infoview
				var inputInfo = document.getElementById('txtEnderecoPartidaInfoView');
				if (inputInfo){
					var autocompleteInfo =  new google.maps.places.Autocomplete(inputInfo);
					autocompleteInfo.bindTo('bounds', map);
				}
			
			//botao Go
			google.maps.event.addDomListener(document.getElementById('go'), 'click', function() {
				//fechar info aberta
					infoWindow.close();
				
				if(inputInfo){
					document.getElementById('txtEnderecoPartida').value = inputInfo.value
				}
				document.getElementById('txtEnderecoChegada').value = ponto.latLng
				submit_form();
			});
			});
	
	//Marker com posicaoAtual
		var markerPosAtual = new google.maps.Marker({
			map: map,
			icon: 'http://maps.google.com/mapfiles/ms/micons/cycling.png'
		});
	//Localizacao atual
		currentPosition(map, infowindow, markerPosAtual);
		
	//Elevação
	
}

//Localizacao atual
function currentPosition(map, infowindow, markerPosAtual){
	if (!navigator.geolocation){
		alert("Geolocation is not supported by your browser");
	}
	else{
	  function success(position) {
		var latitude  = position.coords.latitude;
		var longitude = position.coords.longitude;
		var posicao_atual = new google.maps.LatLng(latitude, longitude);
		map.setCenter(posicao_atual);
		
		
		//Adicionar um marcador na posicao atual
			markerPosAtual.setPosition(posicao_atual);
			markerPosAtual.setVisible(true);
			
			infowindow.setContent("Estou aqui!");
			infowindow.open(map, markerPosAtual);
		
		var enderecoPartida = document.getElementById('txtEnderecoPartida');
		enderecoPartida.value = posicao_atual;
	  };

	  function error() {
		alert("Unable to retrieve your location");
	  };

	  //alert("Locating…");

	  navigator.geolocation.getCurrentPosition(success, error);
	}
}


// Filter the map based on checkbox selection.
function filterMap(layer, map) {
	var where = generateWhere();
	
	if (where) {
		if (!layer.getMap()) {
			layer.setMap(map);
		}
		layer.setOptions({
			query: {
			  select: "'geometry'",
			  from: tableid,
			  where: where
			},
			suppressInfoWindows: true, //esconte a infoview padrão
			styleId: 2,
			templateId: 2 //template de quando clica em um ponto
			/*
			styles:[
				{
					where: "tipo = 'Bicicletario' AND premium = 'nao'",
					markerOptions:{
						iconName: "small_blue"
					}
				},{
					where: "tipo = 'Bicicletario' AND premium = 'sim'",
					markerOptions:{
						iconName: "large_blue"
					}
				},{
					where: "tipo = 'Bomba' AND premium = 'nao'",
					markerOptions:{
						iconName: "small_green"
					}
				},{
					where: "tipo = 'Bomba' AND premium = 'sim'",
					markerOptions:{
						iconName: "large_green"
					}
				},{
					where: "tipo = 'Oficina' AND premium = 'nao'",
					markerOptions:{
						iconName: "small_red"
					}
				},{
					where: "tipo = 'Oficina' AND premium = 'sim'",
					markerOptions:{
						iconName: "large_red"
					}
				},{
					where: "tipo = 'Chuveiro' AND premium = 'nao'",
					markerOptions:{
						iconName: "small_purple"
					}
				},{
					where: "tipo = 'Chuveiro' AND premium = 'sim'",
					markerOptions:{
						iconName: "large_purple"
					}
				},{
					where: "tipo = 'BikeStore' AND premium = 'nao'",
					markerOptions:{
						iconName: "small_yellow"
					}
				},{
					where: "tipo = 'BikeStore' AND premium = 'sim'",
					markerOptions:{
						iconName: "large_yellow"
					}
				},
			]
			*/
		});
	}
	else {
		layer.setMap(null);
	}
}

function generateWhere() {
	var filter = [];
	//ate aqui ta funcionando
	inputs_obj = document.getElementsByName('opcoes');
	var i = 0;
	
	for (i = 0; i < inputs_obj.length; i++) {
		if (inputs_obj[i].className == "fa fa-check-square") {
			var storeName = inputs_obj[i].title.replace(/'/g, '\\\'');
			filter.push("'" + storeName + "'");
		}
	}
	
	var where = '';
	if (filter.length) {
		where = "'tipo' IN (" + filter.join(',') + ')';
	}
return where;
}

function filtrar_ciclovia(ciclovia, map){
	if(!ciclovia.getMap()){
		ciclovia.setMap(map);
	}
	else{
		ciclovia.setMap(null);
	}
}

function trocar_icone(procura){
	obj = document.getElementById(procura);
	if (obj.className == 'fa fa-check-square'){
		obj.className = 'fa fa-square';
	}
	
	else{
		obj.className = 'fa fa-check-square';
	}
	
}

//novo centro (quando clica em um ponto)
google.maps.LatLng.prototype.novo_ponto = function(brng, dist) {
	dist = dist/6371;
	brng = brng.toRad();
	
	var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();

   var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) + 
                        Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));

   var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
                                Math.cos(lat1), 
                                Math.cos(dist) - Math.sin(lat1) *
                                Math.sin(lat2));

   if (isNaN(lat2) || isNaN(lon2)) return null;

   return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());

}

//Graus em radianos
Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}
//Radianos em graus
Number.prototype.toDeg = function() {
   return this * 180 / Math.PI;
}

//criar novo marcador
function teste(){
	
}

//Clique go InfoView
function go_click(){
	//esconder o marcador antigo
		marker.setVisible(false);
	var start = document.getElementById('txtEnderecoPartida').value;
	var destino = document.getElementById('txtEnderecoChegada').value;
	
	
	var request = {
	  origin: start,
	  destination: destino,
	  travelMode: google.maps.DirectionsTravelMode.BICYCLING
	};
	directionsService.route(request, function(response, status) {
	  if (status == google.maps.DirectionsStatus.OK) {
		directionsDisplay.setDirections(response);
	  } 
	  else {
		window.alert('Erro ao gerar as direcoes: ' + status);
	  }
	});
}

//Enviar directions pelo formulario
function submit_form(){
	var enderecoPartida = document.getElementById('txtEnderecoPartida').value;
	var enderecoChegada = document.getElementById('txtEnderecoChegada').value;
	
	
	var request = {
		//origin: enderecoPartida,
		//destination: enderecoChegada,
		origin: 'av nazare sao paulo',
		destination: 'rua da consolacao sao paulo',
		travelMode: google.maps.TravelMode.BICYCLING //por bike
	};
	
	//alert ('Partida: ' + enderecoPartida);
	//alert ('Chegada: ' + enderecoChegada);
	
	directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			//directionsDisplay.setMap(map);
			directionsDisplay.setDirections(result);
			
			//mostrar menu Direction
			set_visible_botoes_direction("visible");
			set_visible_trajeto_txt("visible");
			set_position_botoes_direction("calc(85%)")
			set_icon_chevron("fa fa-chevron-right");
		}
		else{
			alert ('não foi possivel obter as direçõs. Erro: ' + status);
			
		}
	});
}

function geoFindMe() {
  var output = document.getElementById("out");
  var map = document.getElementById("map_canvas");

  if (!navigator.geolocation){
    output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
    return;
  }

  function success(position) {
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;

    output.innerHTML = '<p>Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°</p><br>LatLng: ' + position.latLng;

    var img = new Image();
    img.src = "https://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=13&size=300x300&sensor=false";

    output.appendChild(img);	
  };

  function error() {
    output.innerHTML = "Unable to retrieve your location";
  };

  output.innerHTML = "<p>Locating…</p>";

  navigator.geolocation.getCurrentPosition(success, error);
}

//Visual Direction
function change_visible_direction(){
	var trajeto = document.getElementById('trajeto-texto');
	
	if (trajeto.style.visibility == "visible"){
		set_visible_trajeto_txt("hidden");
	}
	else{
		set_visible_trajeto_txt("visible");
	}
}
function set_visible_botoes_direction(visibilidade){
	var botoes_direction = document.getElementById('botoes_direction');
	botoes_direction.style.visibility = visibilidade;
}
function set_position_botoes_direction(posicao){
	var botoes_direction = document.getElementById('botoes_direction');
	botoes_direction.style.right = posicao;
}
function change_position_botoes_direction(){
	var botoes_direction = document.getElementById('botoes_direction');
	if (botoes_direction.style.right != "0px"){
		botoes_direction.style.right = "0px";
	}
	else{
		botoes_direction.style.right = "calc(85%)";
	}
}
function change_icon_chevron(){
	var chevron = document.getElementById('chevron_trajeto');
	
	if (chevron.className == 'fa fa-chevron-right'){
		chevron.className = 'fa fa-chevron-left';
	}
	
	else{
		chevron.className = 'fa fa-chevron-right';
	}
}
function set_icon_chevron(icone){
	var chevron = document.getElementById('chevron_trajeto');
	chevron.className = icone;
}

//altera a visibilidade do Trajeto
function set_visible_trajeto_txt(visibilidade){
	var trajeto = document.getElementById('trajeto-texto');
	var mapa = document.getElementById('map_canvas');
	var botoes_direction = document.getElementById('botoes_direction');
	
	trajeto.style.visibility = visibilidade;
	if (visibilidade == "visible"){
		mapa.style.width = "55%";
		//botoes_direction
		botoes_direction.style.visibility = "visible";
		
	}
	else{
		mapa.style.width = "100%";
	}

}

//Iniciar
google.maps.event.addDomListener(window, 'load', initialize);
