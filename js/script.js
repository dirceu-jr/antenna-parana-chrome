// Código em Português para incentivar o aprendizado

var 
    cidades = [
        'cidade_curitiba',
        'cidade_londrina',
        'cidade_maringa',
        'cidade_pg',
        'cidade_cascavel',
        'cidade_foz',
        'cidade_guarapuava',
        'cidade_paranagua'
    ],
    imagem,
    mapa,
    limites = [[0,0], [413, 780]]
;

function tempo_agora() {
    return Date.now();
}

function imagem_url(tipo) {
    return simepar_url + tipo + '.jpeg?' + tempo_agora();
}

function modelo_url(tipo) {
    return simepar_modelos_url + tipo + '.png?' + tempo_agora();
}

function evento_click(url, tipo) {
    // define vazia para o fundo de 'carregando' aparecer
    imagem.setUrl('');

    if (tipo == 'imagem') {
        imagem.setUrl(imagem_url(url));
    } else {
        imagem.setUrl(modelo_url(url));
    }

    mapa.setZoom(0);
    mapa.fitBounds(limites);
}

function inicializa() {
    var
        link_radar = document.getElementById('link_radar'),
        link_satelite = document.getElementById('link_satelite'),
        link_raios = document.getElementById('link_raios'),
        link_modelo_precipitacao = document.getElementById('link_modelo_precipitacao'),
        link_modelo_vento = document.getElementById('link_modelo_vento'),
        link_modelo_temperatura = document.getElementById('link_modelo_temperatura'),

        imagem_radar = 'radar_parana_1',
        imagem_satelite = 'satelite_amsul_1'
        imagem_raios = 'raios_parana_1',

        modelo_chuva = 'chuva6h_1',
        modelo_vento = 'rajada_lc_1',
        modelo_temperatura = 'temperatura_2m_1',

        simepar_url = 'http://www.simepar.br/riak/pgw-home-products/',
        simepar_modelos_url = 'http://www.simepar.br/riak/modelos_site/',
        
        pagina_radar = 'http://www.simepar.br/prognozweb/simepar/radar_msc',
        pagina_satelite = 'http://www.simepar.br/prognozweb/simepar/satelite_goes',
        pagina_raios = 'http://www.simepar.br/prognozweb/simepar/raios_simepar',
        pagina_modelos = 'http://www.simepar.br/prognozweb/simepar/modelos_numericos'
    ;

    // manda fazer requisição da condições
    xhrCondicoes();

    // Define ações dos links de tipo de conteúdo
    link_radar.addEventListener('click', function() {
        evento_click(imagem_radar, 'imagem');
    });
    
    link_satelite.addEventListener('click', function() {
        evento_click(imagem_satelite, 'imagem');
    });
    
    link_raios.addEventListener('click', function() {
        evento_click(imagem_raios, 'imagem');
    });

    link_modelo_precipitacao.addEventListener('click', function() {
        evento_click(modelo_chuva, 'modelo');
    });

    link_modelo_vento.addEventListener('click', function() {
        evento_click(modelo_vento, 'modelo');
    });

    link_modelo_temperatura.addEventListener('click', function() {
        evento_click(modelo_temperatura, 'modelo');
    });
    
    // inicializa mapa da biblioteca 'leaflet'
    mapa = L.map('mapa', {
        crs: L.CRS.Simple,
        maxZoom: 3
    });

    // adicionar target _blank no link de atribuição para o Leaflet
    mapa.attributionControl.setPrefix('<a href="http://leafletjs.com" target="_blank">Leaflet</a>');
    
    // inicializa o componente imageOverlay no leaflet
    imagem = L.imageOverlay(
        imagem_url(imagem_radar),
        limites,
        {
            attribution: '<a target="_blank" href="http://www.simepar.br/">SIMEPAR<\/a>'
        }
    );

    // adiciona a imagem 'assincronicamente'
    // para a popup abrir mais rapido e aparecer o 'carregando'
    setTimeout(function() {
        imagem.addTo(mapa);
    }, 200);

    // centraliza mapa nos limites do imageOverlay
    mapa.fitBounds(limites);

    // adiciona botões para navegação
    // próximo
    adicionaBotaoAnterior();
    adicionaBotaoProximo();
    adicionaBotaoPlay();
}

function adicionaBotaoAnterior() {
    adicionaBotao(-75, 40, '&laquo;', 'Anterior', function() {
        console.log(1);
    });
}

function adicionaBotaoProximo() {
    adicionaBotao(-119, 72, '&raquo;', 'Próxima', function() {
        console.log(2);
    });
}

function adicionaBotaoPlay() {
    adicionaBotao(-163, 104, '&rtrif;', 'Animação', function() {
        console.log(3);
    });
}

function adicionaBotao(top, left, html, title, callback) {
    var CustomControl = L.Control.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            L.DomEvent.disableClickPropagation(container);

            container.innerHTML = '<a href="#" role="button" title="' + title + '">' + html + '</a>';

            container.style.left = left + 'px';
            container.style.top = top + 'px';

            container.onclick = function(event) {
                return callback();
            }
            return container;
        }
    });

    mapa.addControl(new CustomControl());
}

function mudaParaCidade(essa) {
    var this_condicao = cidades.indexOf(essa);

    // salva na BD key/value do Chrome
    chrome.storage.sync.set({'ultima_cidade': essa});

    // itera escondendo as outras cidades
    var sliders = document.querySelectorAll('#condicoes .da-slider');
    for (slider in sliders) {
        if (typeof(sliders[slider]) == 'object') {
            sliders[slider].style.display = 'none';
        }
    }
    
    // usa o número da cidade para exibir as condições dela
    document.querySelector('#condicoes .da-slider:nth-child(' + (this_condicao + 1) + ')').style.display = 'block';
}

function analisaCondicoes(responseText) {
    document.getElementById('condicoes').innerHTML = responseText.replace('<a ', '<a target=\'_blank\'');

    for (cidade in cidades) {
        document.getElementById(cidades[cidade]).addEventListener('click', function() {
            mudaParaCidade(this.id);
        });
    }

    // 
    document.querySelector('#cond-rajada i').className = 'wi wi-sandstorm';

    chrome.storage.sync.get(['ultima_cidade'], function(result) {
        if (result.ultima_cidade) {
            mudaParaCidade(result.ultima_cidade);
        }
    });
}

// xhr é acronimo de XMLHttpRequest (conhecido como AJAX)
function xhrCondicoes() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            analisaCondicoes(xhr.responseText);
        }
    }
    xhr.open('GET', 'http://www.simepar.br/prognozweb/simepar/location_code_county?_=' + Date.now(), true);
    xhr.send();
}

inicializa();