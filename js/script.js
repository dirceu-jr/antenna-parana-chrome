var 
    imagem,
    mapa
;

function imagem_url(tipo) {
    var tempo_agora = Date.now();
    return simepar_url + tipo + '.jpeg?' + tempo_agora;
}

function evento_click_imagem(tipo, pagina) {
    imagem.setUrl(imagem_url(tipo));
    mapa.setZoom(0);
}

function evento_click_modelo() {
    
}

function inicializa() {
    var
        link_radar = document.getElementById('link_radar'),
        link_satelite = document.getElementById('link_satelite'),
        link_raios = document.getElementById('link_raios'),
        // link_raios = document.getElementById('link_modelo'),
        imagem_radar = 'radar_parana_1',
        imagem_satelite = 'satelite_amsul_1'
        imagem_raios = 'raios_parana_1',
        simepar_url = 'http://www.simepar.br/riak/pgw-home-products/',
        pagina_radar = 'http://www.simepar.br/prognozweb/simepar/radar_msc',
        pagina_satelite = 'http://www.simepar.br/prognozweb/simepar/satelite_goes',
        pagina_raios = 'http://www.simepar.br/prognozweb/simepar/raios_simepar'
    ;

    getCondicoes();

    link_radar.addEventListener('click', function() {
        evento_click_imagem(imagem_radar, pagina_radar);
    });
    
    link_satelite.addEventListener('click', function() {
        evento_click_imagem(imagem_satelite, pagina_satelite);
    });
    
    link_raios.addEventListener('click', function() {
        evento_click_imagem(imagem_raios, pagina_raios);
    });

    // link_modelo.addEventListener('click', function() {
    //     evento_click_modelo();
    // });
    
    mapa = L.map('mapa', {
        crs: L.CRS.Simple,
        attributionControl: false
    });
    
    var limites = [[0,0], [413, 780]];
    imagem = L.imageOverlay(imagem_url(imagem_radar), limites).addTo(mapa);
    
    mapa.fitBounds(limites);
}

function parseCondicoes(responseText) {
    document.getElementById('condicoes').innerHTML = responseText.replace("<a ", "<a target='_blank'");
            
    var cidades = ['cidade_curitiba', 'cidade_londrina', 'cidade_maringa', 'cidade_pg', 'cidade_cascavel', 'cidade_foz', 'cidade_guarapuava', 'cidade_paranagua'];
    for (cidade in cidades) {
        document.getElementById(cidades[cidade]).addEventListener('click', function() {
            var sliders = document.querySelectorAll('#condicoes .da-slider');
            for (slider in sliders) {
                if (typeof(sliders[slider]) == 'object') {
                    sliders[slider].style.display = 'none';
                }
            }
            
            var this_condicao = cidades.indexOf(this.getAttribute('id'));
            document.querySelector('#condicoes .da-slider:nth-child(' + (this_condicao + 1) + ')').style.display = 'block';
        });
    }

    document.querySelector('#cond-rajada i').className = "wi wi-sandstorm";

    // var
    //     minimas_rotulos = document.querySelectorAll('#ww-temp-2 > span.txt_mm'),
    //     minimas = document.querySelectorAll('#ww-temp-2 > span.de-prox-tem-min'),
    //     rotulos = document.querySelectorAll('#day')
    // ;

    // for (rotulo in rotulos) {
    //     var
    //         minima = minimas[rotulo].innerHTML,
    //         minima_rotulo = minimas_rotulos[rotulo].innerHTML
    //     ;

    //     if (minimas_rotulos[rotulo].parentNode) {
    //         minimas_rotulos[rotulo].parentNode.removeChild(minimas_rotulos[rotulo]);
    //     }

    //     if (minimas[rotulo].parentNode) {
    //         minimas[rotulo].parentNode.removeChild(minimas[rotulo]);
    //     }

    //     rotulos[rotulo].innerHTML += '<span>' + minima_rotulo + '</span><b>' + minima + '</b>';
    // }
}

function getCondicoes() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            parseCondicoes(xhr.responseText);
        }
    }
    xhr.open('GET', 'http://www.simepar.br/prognozweb/simepar/location_code_county?_=' + Date.now(), true);
    xhr.send();
}

inicializa();