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
    imagem_camada,
    mapa,
    mapa_dom,
    limites = [[0,0], [413, 780]],
    contador = 1,
    limite_do_contador = 8,
    contador_dom,
    frame_dom,
    simepar_url_old = 'http://www.simepar.br/riak/pgw-home-products/',
    simepar_url = 'http://www.simepar.br/riak/',
    simepar_modelos_url = 'http://www.simepar.br/riak/modelos_site/',
    ultimo_tipo = 'imagem',

    // ultima_url = 'radar_parana_',
    ultima_url = 'pgw-radar/product',

    animacao_intervalo
;

function tempo_agora() {
    return Date.now();
}

function imagem_url(tipo) {
    return simepar_url + tipo + contador + '.jpeg?' + tempo_agora();
}

function modelo_url(tipo) {
    return simepar_modelos_url + tipo + contador + '.png?' + tempo_agora();
}

function evento_click(em_branco, url, tipo) {
    // caso tiver alguma alteração no tipo de imagem e sua url
    if (url) {
        ultima_url = url;
    }
    if (tipo) {
        ultimo_tipo = tipo;
    }

    if (em_branco) {
        contador = 1;

        paraAnimacao();

        // define vazia para o fundo de 'carregando' aparecer
        imagem_camada.setUrl('');

        document.getElementById('carregando').innerHTML = 'Carregando...';
        mapa_dom.style.display = 'block';
        frame_dom.style.display = 'none';
    }

    // pode ser 'imagem', 'modelo', 'sol_e_lua' ou 'flights'
    if (ultimo_tipo == 'imagem') {
        imagem_camada.setUrl(imagem_url(ultima_url));
        limite_do_contador = 8;
    } else if (ultimo_tipo == 'modelo') {
        imagem_camada.setUrl(modelo_url(ultima_url));
        limite_do_contador = 28;
    } else if (ultimo_tipo == 'sol_e_lua') {
        imagem_camada.setUrl(ultima_url);
        limite_do_contador = 1;
    } else if (ultimo_tipo == 'flights') {
        mapa_dom.style.display = 'none';

        frame_dom.style.display = 'block';
        frame_dom.src = 'https://www.flightradar24.com/simple?lat=-24.7574861&lon=-51.7596274&z=7#';
    }

    // altera texto do contador
    contador_dom.innerHTML = contador + "/" + limite_do_contador;

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
        link_sol_e_lua = document.getElementById('link_sol_e_lua'),
        link_flights = document.getElementById('link_flights'),

        // radar_parana_1 to radar_parana_8
        imagem_radar_old = 'radar_parana_',
        imagem_radar = 'pgw-radar/product',

        // satelite_amsul_1 to satelite_amsul_8
        imagem_satelite_old = 'satelite_amsul_'
        imagem_satelite = 'pgw-satelite/product',

        // raios_parana_1 to raios_parana_8
        imagem_raios_old = 'raios_parana_',
        imagem_raios = 'pgw-raios/product',
        
        // chuva6h_1 to chuva6h_28
        modelo_chuva = 'chuva6h_',
        // rajada_lc_1 to rajada_lc_28
        modelo_vento = 'rajada_lc_',
        // temperatura_2m_1 to temperatura_2m_28
        modelo_temperatura = 'temperatura_2m_',
        
        // https://www.timeanddate.com/scripts/sunmap.php?iso=20200404T1612
        sol_e_lua = 'https://www.timeanddate.com/scripts/sunmap.php',
        flights = 'https://www.flightradar24.com/',

        pagina_radar = 'http://www.simepar.br/prognozweb/simepar/radar_msc',
        pagina_satelite = 'http://www.simepar.br/prognozweb/simepar/satelite_goes',
        pagina_raios = 'http://www.simepar.br/prognozweb/simepar/raios_simepar',
        pagina_modelos = 'http://www.simepar.br/prognozweb/simepar/modelos_numericos'
    ;

    mapa_dom = document.getElementById('mapa');
    frame_dom = document.getElementById('frame');

    // manda fazer requisição da condições
    xhrCondicoes();

    // Define ações dos links de tipo de conteúdo
    link_radar.addEventListener('click', function() {
        evento_click(true, imagem_radar, 'imagem');
    });
    
    link_satelite.addEventListener('click', function() {
        evento_click(true, imagem_satelite, 'imagem');
    });
    
    link_raios.addEventListener('click', function() {
        evento_click(true, imagem_raios, 'imagem');
    });

    link_modelo_precipitacao.addEventListener('click', function() {
        evento_click(true, modelo_chuva, 'modelo');
    });

    link_modelo_vento.addEventListener('click', function() {
        evento_click(true, modelo_vento, 'modelo');
    });

    link_modelo_temperatura.addEventListener('click', function() {
        evento_click(true, modelo_temperatura, 'modelo');
    });

    link_sol_e_lua.addEventListener('click', function() {
        evento_click(true, sol_e_lua, 'sol_e_lua');
    });

    link_flights.addEventListener('click', function() {
        evento_click(true, flights, 'flights');
    });
    
    // inicializa mapa da biblioteca 'leaflet'
    mapa = L.map('mapa', {
        crs: L.CRS.Simple,
        maxZoom: 3,
        keyboard: false
    });

    // adicionar target _blank no link de atribuição para o Leaflet
    mapa.attributionControl.setPrefix('<a href="http://leafletjs.com" target="_blank">Leaflet</a>');
    
    // inicializa o componente imageOverlay no leaflet
    imagem_camada = L.imageOverlay(
        imagem_url(imagem_radar),
        limites,
        {
            attribution: '<a target="_blank" href="http://www.simepar.br/">SIMEPAR<\/a> ' +
                '| <a target="_blank" href="https://www.timeanddate.com/worldclock/sunearth.html">Time And Date<\/a>'
        }
    );

    imagem_camada.addEventListener('load', function() {
        document.getElementById('carregando').innerHTML = '';
    });

    // adiciona a imagem 'assincronicamente'
    // para a popup abrir mais rapido e aparecer o 'carregando'
    setTimeout(function() {
        imagem_camada.addTo(mapa);
    }, 200);

    // centraliza mapa nos limites do imageOverlay
    mapa.fitBounds(limites);

    // adiciona botões para navegação
    // próximo
    adicionaBotaoAnterior();
    adicionaContador();
    adicionaBotaoProximo();
    adicionaBotaoPlay();

    adicionaEventosDasTeclas();
}

function adicionaEventosDasTeclas() {
    // adicionar eventos as setas
    document.addEventListener('keyup', function(e) {
        if (e.key == 'ArrowLeft') {
            anterior();
        } else if (e.key == 'ArrowRight') {
            proximo();
        } else if (e.key == '-') {
            mapa.zoomOut();
        } else if (e.key == '=' || e.key == '+') {
            mapa.zoomIn();
        }
    });
}

// acoes dos extremos do contator 'contador' (carrossel)
function verificaInicioEFim() {
    if (contador < 1) {
        contador = limite_do_contador;
    }

    if (contador > limite_do_contador) {
        contador = 1;
    }
}

// na verdade aumenta o diminui (anterior ou proximo)
// dependendo do tipo de conteudo (ultimo_tipo == 'imagem')
function anterior() {
    if (ultimo_tipo == 'imagem') {
        contador++;
    } else {
        contador--;
    }
    
    verificaInicioEFim();

    evento_click(false);
}

// na verdade aumenta o diminui (anterior ou proximo)
// dependendo do tipo de conteudo (ultimo_tipo == 'imagem')
function proximo() {
    if (ultimo_tipo == 'imagem') {
        contador--;
    } else {
        contador++;
    }

    verificaInicioEFim();

    evento_click(false);
}

function adicionaBotaoAnterior() {
    adicionaBotao('&lang;', 'Anterior', function() {
        paraAnimacao();
        anterior();
    });
}

function adicionaBotaoProximo() {
    adicionaBotao('&rang;', 'Próxima', function() {
        paraAnimacao();
        proximo();
    });
}

function adicionaContador() {
    adicionaBotao('<div id="contador">1/8</div>', 'Contador');
    contador_dom = document.getElementById('contador');
}

function adicionaBotaoPlay() {
    adicionaBotao('&rtrif;', 'Animação', function() {
        var
            botao = document.getElementById('animacao'),
            botao_filho = botao.childNodes[0]
        ;

        if (botao_filho.innerHTML == '▸') {
            animacao_intervalo = setInterval(function() {
                proximo();
            }, 800);
            botao_filho.innerHTML = '&#9632;';
        } else {
            paraAnimacao();
        }
    });
}

function paraAnimacao() {
    var
        botao = document.getElementById('animacao'),
        botao_filho = botao.childNodes[0]
    ;
    
    clearInterval(animacao_intervalo);
    botao_filho.innerHTML = '&rtrif;';
}

function adicionaBotao(html, title, callback) {
    var CustomControl = L.Control.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function() {

            var classes = ['leaflet-bar', 'leaflet-control', 'leaflet-control-custom'];
            if (title == 'Contador') {
                classes.push('contador');
            }
            var container = L.DomUtil.create('div', classes.join(' '));

            if (title == 'Animação') {
                container.id = 'animacao';
            }

            L.DomEvent.disableClickPropagation(container);

            container.innerHTML = '<a href="#" role="button" title="' + title + '">' + html + '</a>';

            if (callback) {
                container.onclick = function(event) {
                    return callback();
                }
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